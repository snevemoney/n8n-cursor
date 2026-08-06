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
RUN pnpm --filter lfai-ops build \
  && node <<'NODE'
// pnpm leaves symlinks into the store; materialize them so the slim image works.
const fs = require('fs');
const path = require('path');
const root = 'apps/lightningflow/ops/.next/standalone/node_modules';
function deref(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isSymbolicLink()) {
      const target = fs.realpathSync(p);
      fs.rmSync(p, { force: true });
      fs.cpSync(target, p, { recursive: true });
    } else if (ent.isDirectory()) {
      deref(p);
    }
  }
}
deref(root);
NODE

# Production stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
COPY --from=build /workspace/apps/lightningflow/ops/.next/standalone ./
COPY --from=build /workspace/apps/lightningflow/ops/.next/static ./.next/static
EXPOSE 3002
# lfai-ops standalone output is flat (server.js at image root), unlike web.
CMD ["node", "server.js"]
