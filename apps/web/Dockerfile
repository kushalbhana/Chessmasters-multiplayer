# ---------------- Base Stage ----------------
FROM node:18-alpine AS base
WORKDIR /app

# Enable Corepack for correct Yarn/NPM version
RUN corepack enable

# Install required system packages for bcrypt & node-gyp
RUN apk add --no-cache libc6-compat python3 make g++ bash

# ---------------- Builder Stage ----------------
FROM base AS builder

# Install turbo globally (using latest)
RUN npm install -g turbo

# Copy everything for pruning
COPY . .

# Prune monorepo for the "web" app
RUN turbo prune web --docker

# ---------------- Installer Stage ----------------
FROM base AS installer

# Copy pruned package.json + lockfile
COPY --from=builder /app/out/json/ .

# Install only production deps
RUN npm ci

# Copy full pruned workspace
COPY --from=builder /app/out/full/ .

# ---------------- Prisma Generation ----------------
# Copy Prisma schema from your db package
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma

# Generate Prisma Client
RUN npx prisma generate --schema=./packages/db/prisma/schema.prisma

# Build the Next.js standalone app
ENV NEXT_TELEMETRY_DISABLED=1

# Default environment variables for build
# These will be embedded into the client-side code
ARG NEXT_PUBLIC_HTTP_SERVER=https://chessmasters.kushalbhana.dev
ARG NEXT_PUBLIC_WEBSOCKET_SERVER=wss://chessmasters.kushalbhana.dev/websocket
ARG NEXT_PUBLIC_CHESS_ENGINE=https://chessmasters.kushalbhana.dev/engine/

ENV NEXT_PUBLIC_HTTP_SERVER=$NEXT_PUBLIC_HTTP_SERVER
ENV NEXT_PUBLIC_WEBSOCKET_SERVER=$NEXT_PUBLIC_WEBSOCKET_SERVER
ENV NEXT_PUBLIC_CHESS_ENGINE=$NEXT_PUBLIC_CHESS_ENGINE

RUN npx turbo run build --filter=web...

# ---------------- Runner Stage ----------------
FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
USER nextjs

# Copy standalone output
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy Prisma client
COPY --from=installer --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=installer --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# ---------------- Default Runtime Env ----------------
# These are used for SSR / API routes at runtime
ENV NEXT_PUBLIC_HTTP_SERVER=chessmasters.kushalbhana.dev
ENV NEXT_PUBLIC_WEBSOCKET_SERVER=chessmasters.kushalbhana.dev/websocket
ENV NEXT_PUBLIC_CHESS_ENGINE=chessmasters.kushalbhana.dev/engine/

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
