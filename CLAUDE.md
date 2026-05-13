# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (hot-reload via nodemon + tsx)
npm run dev

# Run workers in separate terminals
npm run worker:export     # BullMQ export worker
npm run worker:email      # BullMQ email worker
npm run queue:event       # Queue event listener (logging)

# Build & production
npm run build             # tsc → dist/
npm start                 # node dist/server.js

# Database
npm run prisma:migrate    # Run migrations (dev)
npm run prisma:generate   # Regenerate Prisma client
npm run prisma:studio     # Open Prisma Studio

# Tests (Node built-in test runner via tsx)
npm test                  # run all test files
npm test -- src/path/to/file.test.ts  # run a single test file

# Code quality
npm run lint
npm run format
```

## Required Environment Variables

Copy `.env.example` and fill in:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string (used by BullMQ and ioredis)
- `SMTP_*` — Nodemailer config for the email worker
- `MOCK_USER_ID` (optional) — overrides the default mock user (`mock-user-001`)

The server, workers, and queue-event listener all need `.env` to be present.

## Architecture Overview

This is an **Express 5 + TypeScript ESM** project with an async export pipeline. There is **no auth system**; all requests are stamped with a mock user via `mockUser` middleware.

### API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/todos` | List all todos (cached) |
| POST | `/todos` | Create todo |
| PUT | `/todos/:id` | Update todo |
| DELETE | `/todos/:id` | Delete todo |
| GET | `/stats` | Todo stats (cached) |
| POST | `/users/register` | Register user (bcrypt password) |
| POST | `/users/login` | Login (rate-limited) |
| GET | `/users/:id` | Get user by ID |
| POST | `/export` | Enqueue export job → `{ jobId }` |
| GET | `/jobs/:id` | Poll job state |
| GET | `/jobs/:id/download` | Stream completed export file |

### Module Pattern (todos, users, export)

Each feature module under `src/modules/<name>/` exports from `index.ts` and follows the layers:

```
route → controller → service → repo (interface + implementation)
```

- **Repo** owns the Prisma queries and implements a typed interface (`ITodoRepo`, etc.).
- **Service** holds business logic and talks only to the repo interface — never to Prisma directly.
- **Controller** calls the service and shapes HTTP responses.
- **Route factory** wires controller methods into an Express router (e.g., `createTodoRouter(ctrl)`).

The `export` module is an exception: it has no repo layer since it doesn't own Prisma models. Its service enqueues to BullMQ and reads job state from the queue; file I/O happens inside `export.worker.ts`.

Dependency injection happens at the **composition root** in `src/app.ts`. All `new` calls for repos, services, and controllers live there.

### Async Export Pipeline

The export flow is deliberately decoupled from the HTTP layer:

1. `POST /export` enqueues a BullMQ job (via `exportQueue`) and immediately returns `{ jobId }`.
2. `src/workers/export.worker.ts` runs as a **separate process** (`npm run worker:export`). It queries Prisma, writes a file to `exports/<jobId>.<ext>`, and enqueues an email notification job.
3. `src/workers/email.worker.ts` runs as another **separate process** and sends the notification via Nodemailer.
4. `GET /jobs/:id` — polls job state. `GET /jobs/:id/download` — streams the completed file.

Progress is reported in four steps (0 → 25 → 50 → 75 → 100) using `job.updateProgress()`.

The `src/events/export.queue-event.ts` module (started with `npm run queue:event`) is a passive BullMQ `QueueEvents` listener that logs job lifecycle events — it does not process jobs.

### Shared Infrastructure (`src/shared/`)

| Path | Purpose |
|---|---|
| `errors/AppError.ts` | Typed error hierarchy (`BadRequestError`, `NotFoundError`, etc.) with `statusCode` + `code` |
| `middleware/error.middleware.ts` | Global error handler — converts `AppError` subclasses to JSON responses |
| `middleware/asyncHandler.ts` | Wraps async route handlers to forward errors to Express error handler |
| `middleware/validate.middleware.ts` | Zod-based request validation (`validateBody`, `validateParams`) |
| `middleware/cache.middleware.ts` | In-process TTL cache using `memCache.ts`; sets `X-Cache: HIT/MISS` header |
| `middleware/correlationId.middleware.ts` | Attaches `reqId` to every request for log correlation |
| `middleware/auditLog.middleware.ts` | Logs successful mutations with `userId`, `action`, and `resource` |
| `middleware/mockUser.middleware.ts` | Injects `req.user.userId` from `X-Mock-User-Id` header or env default |
| `middleware/rateLimit.middleware.ts` | `globalLimiter` for all routes; `loginLimiter` for `/users/login` |
| `middleware/requestLogger.middleware.ts` | Morgan-style per-request logging via Pino |
| `utils/logger.ts` | Pino logger (pretty-printed in dev) |
| `utils/email.service.ts` | Nodemailer transport wrapper used by the email worker |

### Prisma Client Location

The generated client lives at `src/generated/prisma/` (not `node_modules`). The singleton is exported from `src/config/prisma.ts`. Always import from there — never instantiate `PrismaClient` directly.

### Export Output Directory

The export worker writes files to `exports/<jobId>.<ext>` at the project root (created automatically). The download endpoint streams directly from this directory.

### Express Request Augmentation

`src/types/express.d.ts` extends `Express.Request` with `reqId: string`, `log: Logger` (Pino), and `user?: { userId?: string }`. These are populated by the correlation-ID, request-logger, and mock-user middleware respectively.

### Import Convention

All internal imports use the `.js` extension even for `.ts` source files (required for ESM + `tsc`).
