# Multi-stage Dockerfile for Beauty Salon Backend (Node.js 20 Alpine)

# Stage 1: Build & Dependencies verification
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src ./src

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code with non-root ownership
COPY --chown=node:node src ./src

# Use non-privileged user for security
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health/live || exit 1

CMD ["node", "src/server.js"]
