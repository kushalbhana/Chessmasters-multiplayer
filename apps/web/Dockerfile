FROM node:18-alpine AS base

# ---------------- Builder Stage ----------------
FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# Install Turbo CLI globally
RUN npm install -g turbo

# Copy entire monorepo
COPY . .

# Generate a partial monorepo with a pruned lockfile for "web"
RUN turbo prune web --docker

# ---------------- Installer Stage ----------------
FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat python3 make g++ \
    && ln -sf python3 /usr/bin/python
WORKDIR /app

# Install dependencies
COPY --from=builder /app/out/json/ .
RUN npm ci

# Copy Prisma schema from db package
COPY packages/db/prisma ./packages/db/prisma

# Generate Prisma Client
RUN npx prisma generate --schema=./packages/db/prisma/schema.prisma

# Copy full pruned source
COPY --from=builder /app/out/full/ .
RUN npx turbo run build --filter=web...


# ---------------- Runner Stage ----------------
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy built files and Prisma client
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=installer --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=installer --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Use JSON form for CMD to avoid signal issues
CMD ["node", "apps/web/server.js"]
