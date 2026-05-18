# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG VITE_API_BASE=/api
ARG VITE_MEDIA_BASE_URL=http://localhost:9000/publishing-media
ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_MEDIA_BASE_URL=${VITE_MEDIA_BASE_URL}
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
