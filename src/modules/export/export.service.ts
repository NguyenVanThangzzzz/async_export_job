import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';

import { exportQueue, type ExportJobData } from '../../queues/export.queue.js';

export const createExportJob = async (data: ExportJobData) => {
  const job = await exportQueue.add('csv-export', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 100,
  });

  return { jobId: job.id };
};

export const getExportJobStatus = async (jobId: string) => {
  const job = await exportQueue.getJob(jobId);

  if (!job) return null;

  const state = await job.getState();

  return {
    jobId: job.id,
    state,
    progress: job.progress,
    result: job.returnvalue,
    failReason: state === 'failed' ? job.failedReason : undefined,
    createdAt: job.timestamp,
  };
};

export const getExportFileStream = async (jobId: string) => {
  const job = await exportQueue.getJob(jobId);

  if (!job) return null;

  const state = await job.getState();

  if (state !== 'completed') return { notCompleted: true };

  const result = job.returnvalue as { filePath?: string };
  const filePath = result.filePath;

  if (!filePath || !existsSync(filePath)) return null;

  return {
    fileName: path.basename(filePath),
    stream: createReadStream(filePath),
  };
};
