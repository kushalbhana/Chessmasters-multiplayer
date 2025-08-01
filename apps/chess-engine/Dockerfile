# ---------------- Base Stage ----------------
FROM node:20-slim AS base
WORKDIR /app

# Enable Corepack (Yarn/NPM version management)
RUN corepack enable

# Install required system packages for node-gyp, bcrypt, etc.
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    bash \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# ---------------- Builder Stage ----------------
FROM base AS builder

# Install turbo globally
RUN npm install -g turbo

# Copy entire monorepo for pruning
COPY . .

# Prune monorepo for only "chess-engine" and its dependencies
RUN turbo prune chess-engine --docker

# ---------------- Installer Stage ----------------
FROM base AS installer

# Copy pruned package.json and lockfile
COPY --from=builder /app/out/json/ .

# Install production dependencies
RUN npm ci

# Copy pruned workspace files
COPY --from=builder /app/out/full/ .

# Build only chess-engine and its dependencies
RUN npx turbo run build --filter=chess-engine...

# ---------------- Runner Stage ----------------
FROM node:20-slim AS runner
WORKDIR /app

# Install Stockfish
RUN apt-get update && \
    apt-get install -y stockfish && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 chess

# Create uploads folder and set correct permissions
RUN mkdir -p /app/uploads && chown -R chess:nodejs /app/uploads

# Copy built artifacts and node_modules
COPY --from=installer --chown=chess:nodejs /app/apps/chess-engine/dist ./apps/chess-engine/dist
COPY --from=installer --chown=chess:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=chess:nodejs /app/packages ./packages

# Switch to non-root user
USER chess

# Expose chess-engine port
EXPOSE 4000

# Start chess-engine
CMD ["node", "apps/chess-engine/dist/index.js"]

