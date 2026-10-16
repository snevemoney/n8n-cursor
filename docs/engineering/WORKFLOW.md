# How work flows

## The rule in one line
Every change goes **branch → pull request → checks → Evens's review → merge to main → deploy from main**.
Nothing runs live unless it is on GitHub.

## Branches
- `main` is the official, deployable version. Nobody commits to it directly; it is protected and needs a review.
- Working branches are named `<agent>/<type>/<topic>-<yyyymmdd>`:
  - agent: `claude`, `codex`, `cursor`, `grok`, `evens`
  - type: `feat`, `fix`, `docs`, `chore`, `signals`, `loop`, `archive`
  - example: `claude/docs/repo-structure-20261016`
- `archive/...` branches keep work that is paused or retired. They are never deleted without Evens's OK.
- Older branches (`cursor/...`, `jarvis/...`, `forge/...`, and so on) keep their names. New work uses the pattern above.

## Commits
Conventional commits: `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`, `test: ...`. Say **why** in the body. Agents add
their co-author line.

## Pull requests
- One topic per PR. Draft while in progress, ready when checks pass.
- The description says what changed, why, how it was tested, and what was proven live (Jarvis: a live run on the Orb).
- Required checks: see [CI.md](CI.md). A red required check blocks the merge.
- **Merges are Evens's call** (he reviews, or he names a reviewer). Agents never merge their own PR without his OK.

## Deploying Jarvis
1. Merge to `main`.
2. On the Mac: `~/jarvis-main` checks out `main` and pulls.
3. `~/jarvis-proof/safe_restart.sh <owner>` restarts the Face (4018). Idle agent sessions pick up the new code by
   themselves.
4. Health: `curl 127.0.0.1:4018/healthz`.

Until PR #644 merges, live Jarvis runs from `jarvis/live-4018-20261013`. After the merge it runs from `main`.

## Secrets and private data
- Keys live in environment variables or the keychain, never in files in this repo.
- No `.env` files, no `credentials` with values, no absolute home paths (`/Users/...`).
- If a secret is found: report its type and location only, and Evens rotates it.
