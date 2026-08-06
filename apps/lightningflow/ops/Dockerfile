# Build stage (monorepo context required for @lightning-platform/core)
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate \
  && apk add --no-cache rsync
WORKDIR /workspace
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/lightningflow/ops/package.json ./apps/lightningflow/ops/package.json
COPY packages/lightning-core/package.json ./packages/lightning-core/package.json
RUN pnpm install --frozen-lockfile --filter lfai-ops...
COPY apps/lightningflow/ops ./apps/lightningflow/ops
COPY packages/lightning-core ./packages/lightning-core
RUN pnpm --filter lfai-ops build \
  && rsync -aL apps/lightningflow/ops/.next/standalone/ /standalone-fixed/

# Production stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
COPY --from=build /standalone-fixed/ ./
COPY --from=build /workspace/apps/lightningflow/ops/.next/static ./.next/static
EXPOSE 3002
# lfai-ops standalone output is flat (server.js at image root), unlike web.
CMD ["node", "server.js"]
