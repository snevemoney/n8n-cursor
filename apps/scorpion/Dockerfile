# Multi-stage build for Scorpion
FROM node:20-alpine AS base

# lockfileVersion 6.0 was written by pnpm 8.15.9. pnpm 12 rejects that format.
RUN corepack enable && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack prepare pnpm@8.15.9 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/scorpion/package.json ./apps/scorpion/
# A wildcard destination collapses every manifest into packages/*/package.json.
COPY packages/agent-factory/package.json packages/agent-factory/
COPY packages/contracts/package.json packages/contracts/
COPY packages/lf-sdk/package.json packages/lf-sdk/
COPY packages/lightning-core/package.json packages/lightning-core/
COPY packages/scorpion-core/package.json packages/scorpion-core/
COPY packages/shared-config/package.json packages/shared-config/
COPY packages/shared-helpers/package.json packages/shared-helpers/
COPY packages/shared-types/package.json packages/shared-types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build

# Copy source code
COPY . .

# Build the application
RUN pnpm --filter scorpion build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# lockfileVersion 6.0 was written by pnpm 8.15.9. pnpm 12 rejects that format.
RUN corepack enable && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack prepare pnpm@8.15.9 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/scorpion/package.json ./apps/scorpion/
# A wildcard destination collapses every manifest into packages/*/package.json.
COPY packages/agent-factory/package.json packages/agent-factory/
COPY packages/contracts/package.json packages/contracts/
COPY packages/lf-sdk/package.json packages/lf-sdk/
COPY packages/lightning-core/package.json packages/lightning-core/
COPY packages/scorpion-core/package.json packages/scorpion-core/
COPY packages/shared-config/package.json packages/shared-config/
COPY packages/shared-helpers/package.json packages/shared-helpers/
COPY packages/shared-types/package.json packages/shared-types/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=build /app/apps/scorpion/.next ./apps/scorpion/.next
COPY --from=build /app/apps/scorpion/public ./apps/scorpion/public
COPY --from=build /app/apps/scorpion/next.config.js ./apps/scorpion/
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/scorpion ./apps/scorpion

# Set environment
ENV NODE_ENV=production
ENV PORT=3003
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD ["node", "-e", "require('http').get('http://localhost:3003/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]

# Start the application
CMD ["pnpm", "--filter", "scorpion", "start"]
