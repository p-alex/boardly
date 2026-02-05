FROM node:25-alpine3.23 AS base

WORKDIR /app

COPY package.json package-lock.json ./

COPY apps/client/package.json apps/client/package-lock.json ./apps/client/

RUN npm ci

COPY . .

FROM base AS dev

WORKDIR /app/apps/client

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

FROM base AS builder

WORKDIR /app/apps/client

RUN npm run build

FROM nginx:alpine AS prod

COPY ./apps/client/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]