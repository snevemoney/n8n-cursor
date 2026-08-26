# Factory git hygiene

One concern = one worktree. Daily show and other `origin/main` work run on the Mac from a clean tree.

## Rules
- **Dirty pile stays local.** The researcher checkout at `/Users/evenslouis/n8n-cursor` on `cursor/youtube-watch-later-researcher-d933` is not the write target. Do not stash, reset, checkout-overwrite, or scoop it.
- **Writes go through worktrees.** Example: `/Users/evenslouis/n8n-cursor-worktrees/<concern>` branched from `origin/main`.
- **Daily show home is `origin/main`.** Fetch, then work from that SHA (or a worktree of it). Do not rebase the dirty pile onto main.
- **One PR per concern.** Do not mega-commit hive vault atoms, CURSOR_CHATS, extra `.cursor/skills`, watch-later dumps, remotion `out/*.mp4`, or `node_modules`.
- **Merge ≠ ship.** Publish / YouTube / Enable Cloud cron / force-push stay Evens.

## Remotion
Engine is on `origin/main`. Render only on the Mac. Cloud aborts: `Remotion is on origin/main but this host cannot render.` Gitignore already covers `out/`, `*.mp4`, `*.wav`, `node_modules`.
