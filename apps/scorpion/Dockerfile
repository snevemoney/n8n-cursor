# Multi-stage build for Scorpion
FROM node:25-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/scorpion/package.json ./apps/scorpion/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build

# Copy source code
COPY . .

# Build the application
RUN pnpm --filter scorpion build

# Production stage
FROM node:25-alpine AS production

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/scorpion/package.json ./apps/scorpion/
COPY packages/*/package.json ./packages/*/

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
  CMD node -e "require('http').get('http://localhost:3003/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["pnpm", "--filter", "scorpion", "start"]
