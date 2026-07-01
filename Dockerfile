# ISKRA Production Dockerfile
# Multi-stage build for optimal size

# Stage 1: Build workspace assets with the canonical pnpm lockfile.
FROM node:22-alpine AS iskraspace-builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY runtime/package*.json ./runtime/
RUN cd runtime && npm ci

COPY packages ./packages
COPY runtime ./runtime
COPY ledger/baselines.json ./ledger/baselines.json

RUN pnpm install --frozen-lockfile
RUN cd runtime && npm run build
RUN pnpm --filter iskra-space build

# Stage 2: Production image with nginx
FROM nginx:alpine

# Copy built static files
COPY --from=iskraspace-builder /app/runtime/iskraSpace/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
