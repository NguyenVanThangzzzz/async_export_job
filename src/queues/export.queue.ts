import { Queue } from 'bullmq';

import { redisConnection } from '../config/redis.js';

export interface ExportJobData {
  userId: string;
  format: 'csv' | 'json';
  filters: {
    done?: boolean;
    tag?: string;
  };
  notifyEmail: string;
}

export const exportQueue = new Queue<ExportJobData>('export', {
  connection: redisConnection,
});