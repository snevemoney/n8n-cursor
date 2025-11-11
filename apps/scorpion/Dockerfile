# Build stage - Build from workspace root to handle monorepo dependencies
FROM node:20-alpine AS build

# Install pnpm (use specific version to match lockfile)
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /workspace

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy workspace tsconfig (required for Scorpion build)
COPY tsconfig.base.json ./tsconfig.base.json

# Copy package.json files for workspace dependencies
# Copy each package directory structure properly
COPY packages/scorpion-core/package.json ./packages/scorpion-core/
COPY packages/lightning-core/package.json ./packages/lightning-core/
COPY packages/agent-factory/package.json ./packages/agent-factory/
COPY packages/shared-config/package.json ./packages/shared-config/

# Copy Scorpion app files
COPY apps/scorpion/package.json ./apps/scorpion/package.json

# Install all dependencies (workspace-aware)
RUN pnpm install --frozen-lockfile

# Copy source code for all packages
COPY packages/scorpion-core ./packages/scorpion-core
COPY packages/lightning-core ./packages/lightning-core
COPY packages/agent-factory ./packages/agent-factory
COPY packages/shared-config ./packages/shared-config

# Copy Scorpion source (includes all config files)
COPY apps/scorpion ./apps/scorpion

# Build Scorpion
WORKDIR /workspace/apps/scorpion
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy built application
COPY --from=build /workspace/apps/scorpion/.next ./.next
COPY --from=build /workspace/apps/scorpion/public ./public
COPY --from=build /workspace/apps/scorpion/package.json ./package.json
COPY --from=build /workspace/apps/scorpion/next.config.js ./next.config.js
COPY --from=build /workspace/apps/scorpion/instrumentation.ts ./instrumentation.ts
COPY --from=build /workspace/apps/scorpion/middleware.ts ./middleware.ts
COPY --from=build /workspace/apps/scorpion/tsconfig.json ./tsconfig.json

# Copy workspace dependencies (runtime)
COPY --from=build /workspace/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=build /workspace/apps/scorpion/node_modules ./node_modules
COPY --from=build /workspace/packages ./packages

# Create data directory for Scorpion storage
RUN mkdir -p /app/data/scorpion && chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 3003

HEALTHCHECK --interval=15s --timeout=3s --retries=10 --start-period=40s \
  CMD curl -f http://localhost:3003/healthz || exit 1

CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3003"]

