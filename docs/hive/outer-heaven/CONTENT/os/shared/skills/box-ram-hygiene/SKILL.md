---
name: Box RAM hygiene
description: >-
  Use when the shared Grok computer is tight on RAM (~16 GB), after many desks
  leave Chrome open, or when the operator asks to keep the box smooth without
  killing important work.
---
# Box RAM hygiene

Shared box: one ~16 GB Linux machine for all desks. Desktops are per-agent; **RAM is contested, not sliced.** No swap. Idle Chrome is the usual leak.

## Never kill
- `exec-daemon` / per-desk `index.js serve` (desk shells + computer-use)
- `sand-host` / `host-main.cjs`
- Xvfb, x11vnc, novnc, window managers (`xfwm4`, `picom`, `plank`)
- MCP helpers the operator is mid-using
- Anything with sustained CPU that is clearly an active job

## Safe to reclaim
- Idle **Google Chrome** / `box-chrome` processes (all `--type=` children included)
- Prefer closing browsers whose main process has near-zero CPU and multi-day `etime`
- Profile dirs under `/home/box/chrome-profile*` stay on disk — logins survive; next `box-chrome` / computerUse relaunches clean

## Do (checklist)
1. Snapshot: `free -h` and note `MemAvailable`
2. Inventory: Chrome mains (no `--type=`), per-`chrome-profile-N` RSS, top RSS processes
3. Confirm no active computerUse / user-watched browser job on those profiles
4. Kill Chrome mains first, wait ~2s, then remaining chrome PIDs; use `SIGKILL` only on stragglers
5. Re-check: chrome count ≈ 0; daemons + sand-host still up; report Δ available MiB
6. If Available still under ~2 GiB after Chrome reclaim, report top non-Chrome consumers — do **not** kill daemons; offer [Update Grok Bot's Computer](grokbot://app/v1/settings?id=update-computer) only if wedged

## Desk behaviour (standing)
- Do not leave long browser sessions overnight “just in case”
- Prefer one short computerUse slice; close Chrome when the slice is done if no follow-up is queued
- Prefer Big Boss + subagents over waking many desks that each open Chrome
- Token-meter still applies: max-3 streams; no fan-out to “check RAM”

## Report shape (operator)
One short line: freed ≈X GiB; chrome closed N; daemons OK; available now Y GiB. Stay quiet on routine runs when Available ≥ 3 GiB and chrome idle count is zero.

## Fleet rule: repo clones and disk (added 2026-10-11)
- Never clone a repo into /tmp (or anywhere) when a checkout already exists on the box. Prefer `git -C <existing repo> worktree add <path> <branch>`; worktrees share objects and cost only the working tree.
- If a throwaway clone is truly needed, use `--depth 1` and delete it the moment the task is done (`rm -rf` the clone, or `git worktree remove` + `git worktree prune` for worktrees). Do not leave clones for the next desk.
- Large render outputs (`out/`, `*.mp4`) are archived to restic (/workspace/backups) with a hash-verified test restore before local deletion; never delete unarchived renders.
- Before ending a session, `df -h /`; if free < 15 GB, clean up what you created.
