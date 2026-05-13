import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const reqId = req.reqId;

  const isInvalidJsonPayload =
    err instanceof SyntaxError &&
    typeof err === 'object' &&
    err !== null &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).type === 'entity.parse.failed';

  if (isInvalidJsonPayload) {
    req.log.error({ reqId, err }, 'error');
    return res.status(400).json({
      success: false,
      statusCode: 400,
      code: 'INVALID_JSON',
      message: 'Invalid JSON payload',
      reqId,
    });
  }

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? 'Validation failed';

    req.log.error({ reqId, statusCode: 400, code: 'VALIDATION_ERROR', message, issues: err.issues }, 'error');

    return res.status(400).json({
      success: false,
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message,
      reqId,
    });
  }

  if (err instanceof AppError) {
    req.log.error({ reqId, statusCode: err.statusCode, code: err.code, message: err.message }, 'error');

    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      reqId,
    });
  }

  req.log.error({ reqId, err }, 'error');

  return res.status(500).json({
    success: false,
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
    reqId,
  });
};
