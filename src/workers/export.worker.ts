import { Job, Worker } from 'bullmq';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { prisma } from '../config/prisma.js';
import { redisConnection } from '../config/redis.js';
import { emailQueue } from '../queues/email.queue.js';
import { ExportJobData } from '../queues/export.queue.js';
import { logger } from '../shared/utils/logger.js';

type TodoRow = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const buildCsv = (data: TodoRow[]) => {
  const header = 'id,title,completed,createdAt,updatedAt';
  const rows = data.map(
    (todo) =>
      `${todo.id},"${todo.title.replace(/"/g, '""')}",${todo.completed},${todo.createdAt.toISOString()},${todo.updatedAt.toISOString()}`,
  );
  return [header, ...rows].join('\n');
};

const buildJson = (data: TodoRow[]) => {
  return JSON.stringify(data, null, 2);
};

const saveFile = async (filePath: string, content: string) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf-8');
};

const worker = new Worker(
  'export',
  async (job: Job<ExportJobData>) => {
    const { filters, format, notifyEmail } = job.data;

    await job.updateProgress(0);
    logger.info({ jobId: job.id, progress: 0 }, 'Export job started: validating job data');

    if (!notifyEmail) {
      throw new Error('notifyEmail is required');
    }

    await job.updateProgress(25);
    logger.info({ jobId: job.id, progress: 25 }, 'Export job: querying todos from DB');

    const data = await prisma.todo.findMany({
      where: {
        ...(filters.done !== undefined ? { completed: filters.done } : {}),
      },
      select: {
        id: true,
        title: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    await job.updateProgress(50);
    logger.info({ jobId: job.id, progress: 50, rowCount: data.length, format }, 'Export job: building file content');

    const content = format === 'json' ? buildJson(data) : buildCsv(data);

    await job.updateProgress(75);
    logger.info({ jobId: job.id, progress: 75 }, 'Export job: writing file to disk');

    const ext = format === 'json' ? 'json' : 'csv';
    const filePath = path.resolve(process.cwd(), 'exports', `${job.id}.${ext}`);
    await saveFile(filePath, content);

    await emailQueue.add(
      'export-completed',
      {
        to: notifyEmail,
        subject: 'Export completed',
        html: `
          <p>Your export file is ready.</p>
          <p>Format: <strong>${ext.toUpperCase()}</strong></p>
          <p>Total rows: <strong>${data.length}</strong></p>
        `,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );

    await job.updateProgress(100);
    logger.info({ jobId: job.id, progress: 100, filePath, rowCount: data.length }, 'Export job: done, email job queued');

    return { filePath, rowCount: data.length };
  },
  { connection: redisConnection },
);

worker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Export job done');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Export job failed');
});
