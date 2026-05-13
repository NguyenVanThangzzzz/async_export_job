import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';
import { auditLog } from '../../shared/middleware/auditLog.middleware.js';
import { loginLimiter } from '../../shared/middleware/rateLimit.middleware.js';
import { validateBody, validateParams } from '../../shared/middleware/validate.middleware.js';
import type { UserController } from './user.controller.js';
import { loginSchema, registerSchema, userIdParamSchema } from './user.schema.js';

export function createUserRouter(ctrl: UserController): Router {
  const router = Router();

  router.post(
    '/register',
    validateBody(registerSchema),
    auditLog('user.register'),
    asyncHandler((req, res) => ctrl.register(req, res)),
  );

  router.post(
    '/login',
    loginLimiter,
    validateBody(loginSchema),
    auditLog('user.login'),
    asyncHandler((req, res) => ctrl.login(req, res)),
  );

  router.get(
    '/:id',
    validateParams(userIdParamSchema),
    asyncHandler((req, res) => ctrl.getById(req, res)),
  );

  return router;
}
