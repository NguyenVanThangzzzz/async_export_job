import { NextFunction, Request, Response } from 'express';

export const auditLog = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      if (res.statusCode >= 400) return;

      req.log.info(
        {
          reqId: req.reqId,
          time: Date.now(),
          userId: req.user?.userId,
          action,
          resource: res.locals.resource,
          ip: req.ip,
        },
        'audit',
      );
    });

    next();
  };
};
