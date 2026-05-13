import { Queue } from 'bullmq';

import { redisConnection } from '../config/redis.js';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
}

export const emailQueue = new Queue<EmailJobData>('email', {
  connection: redisConnection,
});