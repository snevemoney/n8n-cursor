# Build stage (monorepo context required for @lightning-platform/core)
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate
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

# Production stage: next start (pnpm standalone symlinks are broken for this app)
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
COPY --from=build /workspace/apps/lightningflow/ops/next.config.js ./next.config.js
COPY --from=build /workspace/apps/lightningflow/ops/.next ./.next
# Install only runtime packages needed by next start (no workspace: protocol).
RUN npm init -y >/dev/null \
  && npm install --omit=dev next@14.0.0 react@18.3.1 react-dom@18.3.1
EXPOSE 3002
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3002"]
