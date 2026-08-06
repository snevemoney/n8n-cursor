# Build stage (monorepo context required for @lightning-platform/core)
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /workspace
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/lightningflow/ops/package.json ./apps/lightningflow/ops/package.json
COPY packages/lightning-core/package.json ./packages/lightning-core/package.json
RUN pnpm install --frozen-lockfile --filter lfai-ops...
COPY apps/lightningflow/ops ./apps/lightningflow/ops
COPY packages/lightning-core ./packages/lightning-core
RUN pnpm --filter lfai-ops build

# Production stage
FROM node:20-alpine
RUN corepack enable
WORKDIR /workspace
ENV NODE_ENV=production
ENV PORT=3002
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
COPY --from=build /workspace ./
EXPOSE 3002
CMD ["pnpm", "--filter", "lfai-ops", "start"]
