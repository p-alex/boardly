FROM node:25-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./

COPY apps/server/package.json ./apps/server/

RUN npm ci

COPY . .

FROM base AS dev

WORKDIR /app/apps/server

EXPOSE 5000

CMD ["npm", "run", "dev"]

FROM base AS builder

WORKDIR /app/apps/server

CMD ["npm", "run", "build"]

FROM node:25-alpine AS prod

WORKDIR /app

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

COPY apps/server/package.json ./

# Copy only what's needed from base
COPY --from=builder /app/apps/server/dist ./dist

RUN npm install --omit=dev

# Make non-root user owner
RUN chown -R app:app /app

# Switch to non-root
USER app

EXPOSE 5000

CMD ["node", "dist/index.js"]
