---
chatId: f497bf33-6b6a-4796-9602-9e9d21f86645
workspace: n8n-cursor
source: cursor
title: "You are working in /Users/evenslouis/n8n-cursor for Evens.  **Job:** Add a Cursor host for video watch. Same `watch.json"
updated: 2026-08-15T01:09:03.052136+00:00
messageCount: 4
archived: false
projects: ["[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# You are working in /Users/evenslouis/n8n-cursor for Evens.  **Job:** Add a Cursor host for video watch. Same `watch.json

**Workspace:** `n8n-cursor`  
**Chat ID:** `f497bf33-6b6a-4796-9602-9e9d21f86645`  
**Messages:** 4  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/c7f2f99c-2f1e-4dff-b245-29e61bad49df/subagents/f497bf33-6b6a-4796-9602-9e9d21f86645.jsonl`

## What you asked

- You are working in /Users/evenslouis/n8n-cursor for Evens.

**Job:** Add a Cursor host for video watch. Same `watch.json`. Two hosts. Do **not** redo the Watch Later ingest (sibling [Ingest WL AI tapes to skills](b38ec5e7-a16d-4a04-935c-5bb4fc93f698) owns that). Do not rip out Grok Bot watch.

## Do exactly this
1. **`cursor-video-watch` skill** — capture path for Cursor:
   - IF Cursor → `cursor-ide-browser` on a **living** YouTube tab (parent chat; subagent tabs vanish). navigate/lock/snapshot/click/take_screenshot/CDP `video.currentTime`. verify-after-browser after play.
   - IF Grok Bot → 

## Assistant (excerpts)

- I'll add the Cursor video-watch host without touching Watch Later ingest or the Grok Bot path. First I'm reading the existing watch schema, skills, and hive-funnels rows so the new skill matches what's already validated.

---

- I have the schema and the two-host pattern. Next I’ll add the skill copies, the analyze-video-watch-output block, and the hive-funnels rows without touching Watch Later ingest or the Grok watch path.

---

- Cursor now has a video-watch host next to Grok. Same `watch.json`. Grok computer watch is still the Grok path. Watch Later ingest was not touched. Schema fixture still validates.

**Hive-funnels row (table):**

| Watch this video / cursor-video-watch / frames+transcript | `cursor-video-watch` | IF Cursor → `cursor-ide-browser` on a living YouTube tab (parent chat) → `packets/{id}/watch.json`. IF Grok Bot → Grok computer watch (do not call Cursor MCP). THEN `analyze-video-watch-output`. Same card either way. |

**Hive-funnels row (stack bullet):**

- **Video watch:** IF Cursor → `cursor-video-w

## Files touched

- `docs/hive/outer-heaven/CONTENT/watch-later/packets/`
- `scripts/hive/grok-skills/cursor-video-watch.md`
- `scripts/hive/grok-skills/analyze-video-watch-output.md`
- `scripts/hive/os/analyze-video-watch.py`
- `scripts/hive/os/fixtures/video-watch-sample.json`
- `scripts/hive/grok-skills/hive-funnels`
- `scripts/hive/grok-skills/verify-after-browser.md`
- `scripts/hive/grok-skills/multimodal-youtube-learning.md`
- `scripts/hive/grok-skills/checkable-stop.md`
- `scripts/hive/agent-tool-inventory.py`
- `docs/hive/outer-heaven/CONTENT/AGENT_TOOL_INVENTORY.json`
- `scripts/hive/grok-skills/`
- `scripts/hive/grokbot-tool-cookbook.py`
- `scripts/hive/grok-skills`
- `docs/hive/outer-heaven/CONTENT/job-cards`
- `scripts/hive/grok-skills/api-macro-vision.md`
- `docs/hive/outer-heaven/CONTENT/watch-later`
- `scripts/hive/grok-skills/researcher-video-to-system.md`
- `scripts/hive/grok-skills/deep-video-learning.md`
- `docs/hive/outer-heaven/CONTENT/job-cards/researcher.md`
- `scripts/hive/grok-skills/hive-funnels.md`
- `scripts/hive/grok-skills/assume-it-will-touch.md`

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260815-you-are-working-in-users-evenslouis-n8n-cursor-f-18abc709|You are working in /Users/evenslouis/n8n-cursor fo]]
- [[20260815-you-are-working-in-users-evenslouis-n8n-cursor-f-dea68a50|You are working in /Users/evenslouis/n8n-cursor fo]]
- [[20260815-evens-asked-do-our-system-and-agents-work-this-w-49b662c5|Evens asked: do our system and agents work this wa]]
- [[20260814-evens-said-continue.-last-wired-slice-was-checka-36e4b549|Evens said \u201ccontinue.\u201d Last wired slice ]]
- [[20260814-evens-pasted-a-deep-video-learning-protocol-.-in-a1f01faf|Evens pasted a **Deep Video Learning Protocol**. I]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
