# Handoffs — how each platform asks another
**First ask yourself:** can I do it here, my own way? Check the [ATLAS](ATLAS.md) matrix. Hand off only when the other platform is genuinely better (Mac GUI, ArtCraft, a model, a connector you lack) or owns the live surface.

## The handoff card (use everywhere)
```
HANDOFF <from> → <to> · job <JOB-ID> · <ET time>
Goal: <one line outcome>
Context: <paths/PR/packet — no secrets>
Do: <steps>   Don't: <locks: no send/merge/spend/deploy; Face owner?>
Done when: <evidence: file path + hash / PR # / screenshot>
Return to: <where to write the receipt>
```
Record the row in `ACTIVE_TASKS.md` (one owner per live surface, max 3 streams) and drop the card in the Obsidian inbox `~/Documents/My_Billion_Dollar_Vault/00_Outer_Heaven/shared/inbox/`.

## Routes
| From → To | How |
|---|---|
| Grok desk → Claude Code / Codex / Cursor | Write the card to the inbox + ACTIVE_TASKS (via brain-sync PR or Mac machineId write). For a run now: box Shell on the Mac `claude -p "<card>"` / `codex exec "<card>"` / `cursor-agent -p "<card>"` **only when Evens asked for that run**; otherwise Evens pastes the card. |
| Grok desk → Jarvis | Add to `JARVIS_CONTEXT.md` / ACTIVE_TASKS via brain-sync; never restart Face unless named owner. |
| Claude / Codex / Cursor → Grok desk | Note in the Obsidian inbox or a GitHub issue/PR comment on snevemoney/n8n-cursor mentioning the desk; Evens relays in the desk chat. Box work: `docs/hive/outer-heaven/CONTENT/os/shared/` notes sync both ways. |
| Mac platform ↔ Mac platform | Same card in the inbox; or run the other CLI from your shell (`codex exec`, `claude -p`, `cursor-agent -p`) in an isolated worktree; read their transcript (`~/.codex/sessions`, `~/.claude/projects`, `~/.cursor/projects/*/agent-transcripts`) instead of re-asking. Refresh digest: `python3 ~/brain/bin/platform-digest.py`. |
| Anyone → Jarvis | Speak/type to the Orb only if you are Face owner; otherwise ACTIVE_TASKS row for the owner. |
| Anyone → Evens (approval) | One line: action, target, exact text/diff, cost quote. Wait. |

## Who to pick
- Needs Mac GUI or ArtCraft desktop proof → **Codex** (computer-use) or Claude Code.
- Long coding/refactor with tests → **Claude Code** (or Cursor in-editor).
- Quick edit in an open repo / rules → **Cursor**.
- Web research, connectors (Gmail/Drive/Calendar/Slack/X), Hostinger, always-on loops → **Grok desk**.
- Talk to Evens / mission front door → **Jarvis**.
