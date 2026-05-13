import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';

import { prisma } from './config/prisma.js';

// Modules
import { TodoController, TodoRepo, TodoService, createStatsRouter, createTodoRouter } from './modules/todos/index.js';
import { UserController, UserRepo, UserService, createUserRouter } from './modules/users/index.js';
import { exportRouter } from './modules/export/index.js';

// Shared middleware
import { NotFoundError } from './shared/errors/AppError.js';
import { correlationId } from './shared/middleware/correlationId.middleware.js';
import { errorHandler } from './shared/middleware/error.middleware.js';
import { mockUser } from './shared/middleware/mockUser.middleware.js';
import { globalLimiter } from './shared/middleware/rateLimit.middleware.js';
import { requestLogger } from './shared/middleware/requestLogger.middleware.js';

// --- Dependency Wiring (Composition Root) ---
const todoRepo = new TodoRepo(prisma);
const todoService = new TodoService(todoRepo);
const todoController = new TodoController(todoService);

const userRepo = new UserRepo(prisma);
const userService = new UserService(userRepo);
const userController = new UserController(userService);

// --- Express App ---
const app = express();

app.use(helmet());
app.use(globalLimiter);
app.use(correlationId);
app.use(mockUser);
app.use(requestLogger);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/stats', createStatsRouter(todoController));
app.use('/todos', createTodoRouter(todoController));
app.use('/users', createUserRouter(userController));
app.use('/', exportRouter);

app.use((_req, _res, next) => next(new NotFoundError('Route not found', 'ROUTE_NOT_FOUND')));
app.use(errorHandler);

export default app;
