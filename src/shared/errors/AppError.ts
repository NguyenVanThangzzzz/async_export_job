export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
  details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST', details?: unknown) {
    super(message, 400, code, details);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED', details?: unknown) {
    super(message, 401, code, details);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN', details?: unknown) {
    super(message, 403, code, details);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND', details?: unknown) {
    super(message, 404, code, details);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', code = 'CONFLICT', details?: unknown) {
    super(message, 409, code, details);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', code = 'VALIDATION_ERROR', details?: unknown) {
    super(message, 400, code, details);
    this.name = 'ValidationError';
  }
}
