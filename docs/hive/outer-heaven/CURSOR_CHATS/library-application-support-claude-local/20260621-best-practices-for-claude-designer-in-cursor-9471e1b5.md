---
chatId: 9471e1b5-bf70-42cb-ba89-ceaa3a08c7cb
workspace: Library-Application-Support-Claude-local-agent-mode-sessions
source: cursor
title: "Best practices for Claude Designer in Cursor"
updated: 1782018669223
messageCount: 19
archived: false
projects: []
themes: ["[[THEMES/creative-personal]]", "[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [theme/creative]
---

# Best practices for Claude Designer in Cursor

**Workspace:** `Library-Application-Support-Claude-local-agent-mode-sessions`  
**Chat ID:** `9471e1b5-bf70-42cb-ba89-ceaa3a08c7cb`  
**Messages:** 19  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-Library-Application-Support-Claude-local-agent-mode-sessions-98fd4766-5e22-4e33-b3a0-c2e8fcbbde90-b55cf7c6-fcac-477a-8450-546556e7d243-local-65fa84f9-07d3-49c5-ad17-6148d2690056-outputs-hub-game-starter/agent-transcripts/9471e1b5-bf70-42cb-ba89-ceaa3a08c7cb/9471e1b5-bf70-42cb-ba89-ceaa3a08c7cb.jsonl`

## What you asked

- whats the best way to use claude designer in cursor?

---

- im Designing in Claude Design, i Pointed it at my files and all i need is a prompt that let claude read every frame and assets so it can generate what we need

---

- claude designer response: I have enough to produce the Phase 1–2 inventory. Let me clear the completed Aria-animation work from context first.

Phase 1–2 complete. Here's the inventory summary.

Phase 1 — Docs read (status)
Required file	Status
CLAUDE.md, STYLE_GUIDE.md, ART_DIRECTION.md, CHARACTER_ASSET_MATRIX.md	✅ read
POSE_REFERENCE_LIBRARY.md, scenes/README.md, palette.gd, asset_manifest.json	✅ read
docs/MOTION_SEED_LIBRARY.md	❌ does not exist in repo — flagged as gap
Two notes that change how I'd do Phase 4:

asset_manifest.json lives at assets/ui/asset_manifest.json (you wrote assets/ui/

## Assistant (excerpts)

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- Good inventory overall — but **don’t confirm it as-is**. Claude Design missed several things that would skew Phase 4. Here’s what to send back, what to pick, and a ready-to-paste reply.

## Corrections before you confirm

| Claude Design claim | Actual repo state |
|---|---|
| `docs/MOTION_SEED_LIBRARY.md` missing | **Wrong** — it exists at `docs/MOTION_SEED_LIBRARY.md` (12 motion seeds: 8 station loops + 4 hero CGs) |
| `kai_first_date` has no seed still | **Wrong** — `assets/art/production/media/hero_scenes/kai/kai_first_date.png` exists |
| Rig sheets empty | **Wrong** — `assets/art/product

<!-- link-cursor-chats:managed -->
## Related themes

- [[THEMES/creative-personal]]
- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260616-github-repository-access-0f6fff96|GitHub repository access]]
- [[20260616-image-generation-for-hug-animation-423fd56d|Image generation for hug animation]]
- [[20260704-adobe-after-effects-skills-development-3b471e0e|Adobe After Effects skills development]]
- [[20260624-macos-game-app-issue-78a2a4e4|macOS game app issue]]
- [[20260704-higgsfield-activation-in-after-effects-7897fefb|Higgsfield activation in After Effects]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
<!-- /link-cursor-chats:managed -->
