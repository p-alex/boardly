# STAGE 1: BASE (common setup)
FROM node:25-alpine AS base

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app/apps/client

COPY package*.json ./

RUN chown -R app:app /app

USER app

RUN npm install

COPY . .

# STAGE 2: development
FROM base AS dev

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

# STAGE 3: build
FROM base AS builder

RUN npm run build

# STAGE 4: production
FROM nginx:alpine AS prod

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]