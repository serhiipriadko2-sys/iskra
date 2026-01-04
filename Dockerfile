# ISKRA Production Dockerfile
# Multi-stage build for optimal size

# Stage 1: Build @iskra/runtime
FROM node:20-alpine AS runtime-builder

WORKDIR /app

# Copy runtime package files
COPY runtime/package*.json ./runtime/
RUN cd runtime && npm ci

# Copy runtime source
COPY runtime/src ./runtime/src
COPY runtime/tsconfig.json ./runtime/
COPY runtime/vitest.config.ts ./runtime/
COPY runtime/eslint.config.js ./runtime/
COPY runtime/.prettierrc ./runtime/

# Build runtime
RUN cd runtime && npm run build

# Stage 2: Build iskraSpace
FROM node:20-alpine AS iskraspace-builder

WORKDIR /app

# Copy built runtime from previous stage
COPY --from=runtime-builder /app/runtime ./runtime

# Copy iskraSpace package files
COPY runtime/iskraSpace/package*.json ./runtime/iskraSpace/
RUN cd runtime/iskraSpace && npm ci

# Copy iskraSpace source
COPY runtime/iskraSpace ./runtime/iskraSpace

# Build iskraSpace
RUN cd runtime/iskraSpace && npm run build

# Stage 3: Production image with nginx
FROM nginx:alpine

# Copy built static files
COPY --from=iskraspace-builder /app/runtime/iskraSpace/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
