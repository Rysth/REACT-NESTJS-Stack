# NestJS API (server/)

Minimal NestJS + Prisma + Postgres API with a health check.

## Endpoints

- GET /health -> { "status": "ok" }

## Local development (Docker)

- Ensure docker-compose.dev.yml uses the Nest server.
- Start services:

```
docker compose -f docker-compose.dev.yml up --build
```

API: http://localhost:3000
Client: http://localhost:5173

## Environment

See `.env.example` for required variables.

- FRONTEND_URL: CORS origin (default http://localhost:5173)
- DATABASE_URL: postgres connection string
- REDIS_URL: redis connection string
- PORT: default 3000

## Database (Drizzle ORM)

- Edit schema in `src/db/schema.ts`.
- Generate migrations:
```
bun run db:generate
```
- Apply migrations:
```
bun run db:migrate
```

## Build & Run (prod image)

```
docker build -t nest-api:latest -f server/Dockerfile server
```

Then run with env vars for DB and CORS.