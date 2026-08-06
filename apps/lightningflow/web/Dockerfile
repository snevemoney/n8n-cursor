# Build stage (monorepo context required for @lf/shared-helpers)
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate
WORKDIR /workspace
ARG NEXT_PUBLIC_BASE_PATH=""
ARG NEXT_PUBLIC_APP_URL=""
ARG NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/lightningflow/web/package.json ./apps/lightningflow/web/package.json
COPY packages/shared-helpers/package.json ./packages/shared-helpers/package.json
RUN pnpm install --frozen-lockfile --filter lightning-platform-web...
COPY apps/lightningflow/web ./apps/lightningflow/web
COPY packages/shared-helpers ./packages/shared-helpers
RUN pnpm --filter lightning-platform-web build

# Production stage
FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate
WORKDIR /workspace
ENV NODE_ENV=production
ENV PORT=3001
ARG NEXT_PUBLIC_BASE_PATH=""
ARG NEXT_PUBLIC_APP_URL=""
ARG NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=build /workspace ./
EXPOSE 3001
CMD ["pnpm", "--filter", "lightning-platform-web", "start"]
