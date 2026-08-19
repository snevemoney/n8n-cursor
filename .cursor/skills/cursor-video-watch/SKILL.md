---
name: cursor-video-watch
description: >-
  Capture frames+transcript watch.json for one YouTube video on the
  Cursor host. Use when the operator says watch this video,
  cursor-video-watch, or frames+transcript. IF Cursor →
  cursor-ide-browser on a living tab. IF Grok Bot → do not use this
  skill; Grok computer watch stays the Grok path. Same watch.json
  either way. Then analyze-video-watch-output.
---

# Cursor video watch (Cursor)

Load `scripts/hive/grok-skills/cursor-video-watch.md` and follow it.

**Browser path:** IF Cursor (this IDE / parent chat — not a Task) → `cursor-ide-browser` on a **living** YouTube tab (navigate, lock, snapshot, click, take_screenshot; CDP `video.currentTime`). After play: `verify-after-browser`. Write `docs/hive/outer-heaven/CONTENT/watch-later/packets/{id}/watch.json`. Not Chrome / Playwright / browser-use. IF Grok Bot → do **not** use this skill; Grok computer **watch** stays the Grok path. Do not call Cursor MCP.

**Out:** same `watch.json` schema `analyze-video-watch.py` already validates (`frames[]` + `transcript[]`, timestamps). THEN `analyze-video-watch-output`. Same card either way.

**Checkable-stop:** ONE `video_id` · sample 5–10s · max frames 36 or first 3 min + chapter hits. Not until-satisfied. Not 600 shots of a 50m tape unless Evens raises the cap.

Caption-only packets stay caption-only until this capture runs. Do not invent clicks between frames. Subagent tabs vanish — parent chat only.

Hard step: send / pay / deploy / book / publish stay Evens.

Grok `/` copy: `~/.grokbot/skills/cursor-video-watch/SKILL.md`.
