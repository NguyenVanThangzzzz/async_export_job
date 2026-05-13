import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';
import { cacheMiddleware } from '../../shared/middleware/cache.middleware.js';
import { validateBody, validateParams } from '../../shared/middleware/validate.middleware.js';
import type { TodoController } from './todo.controller.js';
import { createTodoSchema, todoIdParamSchema, updateTodoSchema } from './todo.schema.js';

export function createTodoRouter(ctrl: TodoController): Router {
  const router = Router();

  router.get(
    '/',
    cacheMiddleware('todos', 60),
    asyncHandler((req, res) => ctrl.getAll(req, res)),
  );

  router.post(
    '/',
    validateBody(createTodoSchema),
    asyncHandler((req, res) => ctrl.create(req, res)),
  );

  router.put(
    '/:id',
    validateParams(todoIdParamSchema),
    validateBody(updateTodoSchema),
    asyncHandler((req, res) => ctrl.update(req, res)),
  );

  router.delete(
    '/:id',
    validateParams(todoIdParamSchema),
    asyncHandler((req, res) => ctrl.delete(req, res)),
  );

  return router;
}

export function createStatsRouter(ctrl: TodoController): Router {
  const router = Router();

  router.get(
    '/',
    cacheMiddleware('stats', 60),
    asyncHandler((req, res) => ctrl.getStats(req, res)),
  );

  return router;
}
