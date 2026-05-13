import { NextFunction, Request, Response } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1_000_000;

    req.log.info({
      reqId: req.reqId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms: Math.round(ms),
    });
  });

  next();
};
