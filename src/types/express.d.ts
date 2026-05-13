import type { Logger } from 'pino';

declare global {
  namespace Express {
    interface Request {
      reqId: string;
      log: Logger;
      user?: {
        userId?: string;
      };
    }
  }
}

export {};
