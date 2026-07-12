# ISKRA Production Dockerfile
# Multi-stage build for optimal size

# Stage 1: Build workspace assets with the canonical pnpm lockfile.
FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS iskraspace-builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY runtime/package*.json ./runtime/

COPY packages ./packages
COPY runtime ./runtime
COPY ledger/baselines.json ./ledger/baselines.json

RUN pnpm install --frozen-lockfile
RUN cd runtime && npm ci --ignore-scripts
RUN cd runtime && npm run build
RUN pnpm --filter iskra-space build

# Stage 2: Production image with nginx
FROM nginx:alpine@sha256:54f2a904c251d5a34adf545a72d32515a15e08418dae0266e23be2e18c66fefa

# Copy built static files
COPY --from=iskraspace-builder /app/runtime/iskraSpace/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/iskraspace-runtime-config.sh /docker-entrypoint.d/40-iskraspace-runtime-config.sh
RUN chmod 0555 /docker-entrypoint.d/40-iskraspace-runtime-config.sh

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
