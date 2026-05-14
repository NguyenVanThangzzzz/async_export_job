import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { AppError, NotFoundError, ValidationError } from './shared/errors/AppError.js';

describe('sanity: AppError hierarchy', () => {
  it('AppError carries statusCode, code, and message', () => {
    const err = new AppError('boom', 500, 'INTERNAL_ERROR');
    assert.equal(err.message, 'boom');
    assert.equal(err.statusCode, 500);
    assert.equal(err.code, 'INTERNAL_ERROR');
    assert.equal(err.isOperational, true);
  });

  it('NotFoundError defaults to 404 / NOT_FOUND', () => {
    const err = new NotFoundError();
    assert.ok(err instanceof AppError);
    assert.equal(err.statusCode, 404);
    assert.equal(err.code, 'NOT_FOUND');
  });

  it('ValidationError defaults to 400 / VALIDATION_ERROR', () => {
    const err = new ValidationError();
    assert.ok(err instanceof AppError);
    assert.equal(err.statusCode, 400);
    assert.equal(err.code, 'VALIDATION_ERROR');
  });
});
