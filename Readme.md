# Async Export Job

A Node.js API with async export processing using BullMQ, PostgreSQL, and Redis — fully containerized with Docker.

## Quick Start (3 commands)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start full stack (API + Worker + DB + Redis)
docker compose up --build -d

# 3. Run database migrations
docker compose exec server npm run migrate
```

The API will be available at **http://localhost:3000**

## Verify

```bash
curl localhost:3000/health
# → { "status": "ok" }
```

## Services

| Service | Description | Port |
|---|---|---|
| `server` | HTTP API | 3000 |
| `worker-export` | Export queue worker | - |
| `worker-email` | Email notification worker | - |
| `queue-event` | Queue event listener | - |
| `postgres` | PostgreSQL database | 5432 |
| `redis` | Redis (BullMQ broker) | 6379 |

## Useful Commands

```bash
# View logs
docker compose logs -f server

# Stop all services and remove volumes
docker compose down -v

# Rebuild and restart
docker compose up --build -d
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `SMTP_HOST` | SMTP server host |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `EMAIL_FROM` | Sender email address |
| `MOCK_USER_ID` | Mock user ID for development |
