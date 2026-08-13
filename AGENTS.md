# AGENTS.md

## Cursor Cloud specific instructions

This is a `pnpm` monorepo (`lightning-meta-workspace`). Standard per-project commands live in `CLAUDE.md` (workspace + Scorpion commands) and each app's `README.md`. Only the non-obvious, durable caveats are captured here.

### Package manager / install
- The committed `pnpm-lock.yaml` is lockfile **v6** (pnpm 8), but the VM ships pnpm 10. `pnpm install` fails on a TTY prompt unless `CI=true` is set; with `CI=true pnpm install` it regenerates the lockfile in place and installs fine. The update script already runs this.
- Do **not** commit the regenerated `pnpm-lock.yaml` (it would churn the lockfile from v6→v9).
- `node_modules` is (unusually) force-committed into git in several apps despite `.gitignore`. After `pnpm install`, `git status` shows thousands of `node_modules/...` deletions/changes — **do not stage these**. Only `git add` the specific files you intend to change.
- pnpm reports "Ignored build scripts" (esbuild, sharp, tesseract.js, unrs-resolver). This is fine for dev — vitest/tsx/Next dev all work without approving them.

### Scorpion OS (main app, `apps/scorpion`) — the primary product
- Run: `cd apps/scorpion && pnpm dev` → http://localhost:3003. Runs fully on local disk; Ollama/OpenAI/Redis/Postgres are all optional. `GET /api/health` reports those services as `down` when unconfigured — that is expected and does not mean the app is broken (`GET /healthz` returns 200).
- **Critical gotcha:** any request that touches the RAG/Ontology store (e.g. `POST/GET /api/ontology`, the `/knowledge` and `/ontology` pages, chat) will **hang indefinitely** if `apps/scorpion/backups/` does not exist. The storage-config code (`lib/storage/storage-config.ts` → `ensureDirWithFallback`) re-enters `initializeStorageConfig()` when `cwd/backups` is missing, causing infinite async recursion. `apps/scorpion/backups/` is gitignored and absent on fresh checkouts, so it must be created before running. The update script creates `apps/scorpion/backups` and `apps/scorpion/data/scorpion`. If you ever see store-backed endpoints hang with no handler logs, check that these dirs exist.
- The stores are module-level singletons that memoize an init promise. If an init hangs once (e.g. missing `backups` dir), you must **restart** the dev server after fixing it — the poisoned promise won't recover in-process.

### Lint / test / build status (pre-existing, not environment issues)
- `pnpm lint` (Scorpion) currently fails: the ESLint config enables the type-aware rule `@typescript-eslint/no-floating-promises` without setting `parserOptions.project`. This fails for any developer; it is a repo config bug, not an environment problem.
- `pnpm test` (Scorpion, vitest) runs correctly; a subset of tests fail on pre-existing assertion mismatches (e.g. planner-prompt expectations). The harness itself works.
- `next build` (production) currently fails on a pre-existing broken import: `lib/learning/pattern-learning.ts` imports `../knowledge-base`, which does not exist in the repo. It also runs ESLint + full typecheck (no ignore flags in `next.config.js`), so it would additionally trip on the lint config issue above. Dev mode (`pnpm dev`) compiles routes lazily and is the supported way to run the app.
