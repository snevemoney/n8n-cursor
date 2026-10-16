# Cleanups that need Evens's decision

Nothing below has been done. Each one changes or removes something, so it waits for a specific yes.
**Nothing in this PR deletes anything.**

| # | Proposal | Why | Risk | What is kept |
|---|---|---|---|---|
| 1 | Stop tracking `node_modules/` (156,321 files) with `git rm -r --cached`, in its own PR | Every checkout drops from about 2.4 GB to a fraction. Installs come from `pnpm install`. | Legacy apps need `pnpm install` before running | Full history; files stay on disk |
| 2 | Limit the 8 always-failing legacy CI jobs to their own folders, or move them to `.github/workflows-archive/` | Every PR stays red for reasons unrelated to it, and failure emails fire | Lower legacy coverage, which is already 0 passing | The workflow files |
| 3 | Add a Jarvis CI job (agent-stack pytest, about 22 min) and make it required for `apps/agent-stack/**` | Tests run on every PR, not only when an agent remembers | GitHub Actions minutes | — |
| 4 | Move the 180 loose `docs/*.md` into `docs/legacy/<topic>/` per DOCS-INDEX | A readable docs tree | Old links break (moved, not deleted) | Every file |
| 5 | Move the 6 root `test-*.sh/js` scripts and `cloudflare-tunnel.sh` to `scripts/legacy/` | A clean root | Old commands need the new path | Every file |
| 6 | Stop tracking `apps/scorpion/.env.local.backup` (it holds what look like real keys) after Evens rotates them | Public repo | — | The file stays on his disk; rotation is the real fix |
| 7 | Mark the 501 `cursor/*` and other stale branches: tag each tip as `archive/<name>` and keep the branch | Easier to find active work | None | Every branch and commit |
| 8 | Triage the 148 open PRs: label each `active`, `superseded` or `parked`; close only on Evens's list | A readable PR queue | None until something is closed | Every PR |
| 9 | Update CODEOWNERS for `apps/agent-stack/**` and `docs/hive/**`, and confirm the reviewer handle (`@evenslouis` vs `@snevemoney`) | Reviews go to the right person | — | — |
| 10 | Rotate the keys found in item 6 (Evens, later) | Public exposure since 2025-11-25 | — | — |
