import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../errors/AppError.js';

type AnySchema = z.ZodTypeAny;

export const validateBody = (schema: AnySchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(new ValidationError(result.error.issues[0]?.message ?? 'Validation failed', 'VALIDATION_ERROR', result.error.issues));
    }

    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: AnySchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return next(new ValidationError(result.error.issues[0]?.message ?? 'Validation failed', 'VALIDATION_ERROR', result.error.issues));
    }
    res.locals.query = result.data;
    next();
  };
};

export const validateParams = (schema: AnySchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return next(new ValidationError(result.error.issues[0]?.message ?? 'Validation failed', 'VALIDATION_ERROR', result.error.issues));
    }
    res.locals.params = result.data;
    next();
  };
};