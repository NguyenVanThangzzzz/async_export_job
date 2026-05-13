# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src/

RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy compiled output and generated Prisma client into dist/ where imports resolve
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/src/generated ./dist/generated/

COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN mkdir -p exports && chown -R node:node /app

EXPOSE 3000

USER node

CMD ["node", "dist/server.js"]
