FROM node:22.18-bookworm-slim AS builder

WORKDIR /app

ENV CI=true

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ARG VITE_API_BASE_URL=https://localhost:7025
ARG VITE_GOOGLE_CLIENT_ID=

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

RUN npm run typecheck
RUN npm run build:app

FROM cgr.dev/chainguard/nginx:latest AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
