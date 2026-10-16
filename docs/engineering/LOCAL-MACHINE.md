# Working copies on Evens's Mac

All of these are copies of the same GitHub repository. GitHub is the source of truth.

| Folder | Purpose | Rule |
|---|---|---|
| `~/jarvis-main` | The copy **live Jarvis (4018) runs from** | Only deploys change it. No hand edits. |
| `~/n8n-cursor` | The original copy; other agents may have unfinished work here | Never reset or clean it. |
| `~/brain/n8n-cursor` | Read by brain-sync for the shared hive files | Managed by brain-sync. |
| `~/jarvis-cowork/<agent>/<task>` | Scratch copies, one per agent task | See below. |

## Scratch copies (git worktrees)
- One folder per task, grouped by agent: `~/jarvis-cowork/claude/…`, `…/codex/…`, `…/cursor/…`, `…/grok/…`.
- **Slim by default** (sparse checkout): only the folders the task needs. A full copy is about 2.4 GB because of
  vendored `node_modules`; a slim copy for Jarvis work (`apps/agent-stack`, `docs/hive`) is a few MB to a few hundred MB.

  ```bash
  git -C ~/jarvis-main worktree add --no-checkout ~/jarvis-cowork/<agent>/<task> -b <agent>/<type>/<topic>-<date> origin/main
  git -C ~/jarvis-cowork/<agent>/<task> sparse-checkout set --cone apps/agent-stack docs/hive
  git -C ~/jarvis-cowork/<agent>/<task> checkout
  ```
- When the task's PR is merged, its unsaved leftovers go to an `archive/...` branch on GitHub, and the folder is slimmed
  or retired. Nothing is lost.
- Disk: keep at least 15 GB free. Jarvis's signal engine refuses downloads below 4 GB.
