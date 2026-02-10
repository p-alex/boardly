FROM node:25-alpine3.23 AS base

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/client/package.json ./apps/client/

RUN npm ci

COPY apps/client ./apps/client/

FROM base AS builder

WORKDIR /app/packages/shared
RUN npm run build

FROM base AS dev

WORKDIR /app

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist/

WORKDIR /app/apps/client

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]