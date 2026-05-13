import { Job, Worker } from 'bullmq';

import { redisConnection } from '../config/redis.js';
import { EmailJobData } from '../queues/email.queue.js';
import { sendEmail } from '../shared/utils/email.service.js';
import { logger } from '../shared/utils/logger.js';

const worker = new Worker(
  'email',
  async (job: Job<EmailJobData>) => {
    logger.info(
      {
        jobId: job.id,
        to: job.data.to,
        subject: job.data.subject,
      },
      'Email job received',
    );

    await sendEmail({
      from: process.env.EMAIL_FROM,
      to: job.data.to,
      subject: job.data.subject,
      html: job.data.html,
    });

    return {
      sent: true,
      to: job.data.to,
    };
  },
  {
    connection: redisConnection,
  },
);

worker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Email job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Email job failed');
});
