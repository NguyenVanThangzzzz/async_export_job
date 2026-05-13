import { QueueEvents } from 'bullmq';

import { redisConnection } from '../config/redis.js';
import { logger } from '../shared/utils/logger.js';

const queueEvents = new QueueEvents('export', {
  connection: redisConnection,
});

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  logger.info({ jobId, returnvalue }, 'Export queue: job completed');
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, failedReason }, 'Export queue: job failed');
});

queueEvents.on('progress', ({ jobId, data }) => {
  logger.info({ jobId, progress: data }, 'Export queue: job progress');
});
