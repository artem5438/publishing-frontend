# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG VITE_API_BASE=/api
ARG VITE_MEDIA_BASE_URL=/publishing-media
ARG VITE_APP_PROFILE=local-api
ARG VITE_DISABLE_PWA=true
ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_MEDIA_BASE_URL=${VITE_MEDIA_BASE_URL}
ENV VITE_APP_PROFILE=${VITE_APP_PROFILE}
ENV VITE_DISABLE_PWA=${VITE_DISABLE_PWA}
RUN npm run build

FROM nginx:alpine AS runtime
ARG NGINX_CONF=nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf
EXPOSE 80
