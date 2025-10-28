# Production Dockerfile for NestJS with Bun
FROM oven/bun:1.1-alpine AS builder
WORKDIR /usr/src/app
COPY package.json bun.lockb* ./
RUN bun install
COPY tsconfig*.json ./
COPY drizzle.config.ts ./drizzle.config.ts
COPY src ./src
RUN bun run build

FROM oven/bun:1.1-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/drizzle.config.ts ./drizzle.config.ts
EXPOSE 3000
CMD ["bun", "run", "dist/main.js"]
