# ---------------- Base Stage ----------------
FROM node:20-slim AS base
WORKDIR /app

# Enable Corepack for correct npm/yarn/pnpm usage
RUN corepack enable

# Install required packages for node-gyp (bcrypt support)
RUN apt-get update && apt-get install -y \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# ---------------- Builder Stage ----------------
FROM base AS builder

# Install Turbo globally
RUN npm install -g turbo

# Copy all files for pruning
COPY . .

# Prune monorepo for the websocket app and its dependencies
RUN turbo prune websocket --docker

# ---------------- Installer Stage ----------------
FROM base AS installer

# Copy pruned package.json + lockfile
COPY --from=builder /app/out/json/ .

# Install production deps + esbuild for build
RUN npm ci --omit=dev && npm install esbuild

# Copy pruned source
COPY --from=builder /app/out/full/ .

# Build websocket server
RUN npx turbo run build --filter=websocket...


# ---------------- Runner Stage ----------------
FROM node:20-slim AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 wsuser

# Copy built files and dependencies
COPY --from=installer --chown=wsuser:nodejs /app/apps/websocket/dist ./apps/websocket/dist
COPY --from=installer --chown=wsuser:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=wsuser:nodejs /app/packages ./packages

USER wsuser

# Expose websocket server port
EXPOSE 8080

# Runtime environment variables will be populated by Kubernetes
ENV NODE_ENV=production
ENV PORT=8080

# Ensure we log environment for debugging
CMD ["sh", "-c", "echo 'Starting with env:' && env && node apps/websocket/dist/index.js"]


