import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger.js';

export const correlationId = (req: Request, res: Response, next: NextFunction) => {
  const existing = req.header('X-Request-Id');
  const reqId = existing && existing.trim().length > 0 ? existing : crypto.randomUUID();

  req.reqId = reqId;
  res.setHeader('X-Request-Id', reqId);

  req.log = logger.child({ reqId });

  next();
};
