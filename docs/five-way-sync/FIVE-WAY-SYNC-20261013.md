# Five-way sync notes (rebuilt 2026-10-13)

Shared by all five platforms: **Grok Bot, Cursor, Claude Code, Codex, Jarvis**.
I rebuilt this after the box reset on 2026-10-13. If an item needs more detail than this page gives, follow the source rule and don't guess.

## 1. Jev first
Jev comes first: handle Jev's request before any other queued work.

## 2. ArtCraft quick facts
- Save files to `~/ArtCraft Studio`, in one of these tiers: `00 Private`, `01 Internal`, `02 Public`.
- After you save a file, run `artcraft-recents-sync.py --add <file>` so it shows up in Recents.
- Open files with `open <file>` (macOS).
- The openers are in `~/Applications/ArtCraft Openers`.
- **ArtCraft MCP is the default** way to work with ArtCraft. Use other routes only as a fallback.
- Skill: `artcraft-assist`.

## 3. Approvals (D1 / D2)
- Every platform uses the same D1/D2 approval levels. Act on a D1/D2 item only after Evens has approved that exact action.
- "Fix everything" and similar general instructions do **not** approve force-pushes, deletes on the Mac, spending, or key/secret changes.
- A merge needs Evens's explicit OK for that PR.

## 4. Loops rules
- No idle or 24/7 loops. Every loop needs a clear stop condition and a time cap.
- Long-running box jobs go through the box scheduler (`/workspace/backups/scheduler`, `ensure.sh` / `ctl.sh`). Don't start ad-hoc daemons.
- Check in at set intervals, not in a tight polling loop.

## 5. No full clones
- Never make a full repo clone on the box (disk is tight).
- Use `git -C /home/box/n8n-cursor worktree add /tmp/<name> <branch>`. Prefer a sparse checkout, and remove the worktree when you're done.

## 6. Always
- Never print secrets. Run a secret scan before every push. Pushes need `EVENS_OK=yes`.
- Other desks (Forge, Creative Studio, Researcher) can be active at the same time. Don't touch work another desk owns.
