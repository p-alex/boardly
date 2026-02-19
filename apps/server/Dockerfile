FROM node:25-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci

COPY apps/server ./apps/server
COPY packages/shared ./packages/shared

FROM base AS builder

WORKDIR /app/packages/shared

RUN npm run build

FROM base AS dev

WORKDIR /app

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

WORKDIR /app/apps/server

EXPOSE 5000

CMD ["npm", "run", "docker:dev"]
