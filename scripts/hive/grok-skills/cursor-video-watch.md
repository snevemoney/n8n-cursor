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

# Cursor video watch

**Stack:** Cursor + Grok Bot. Two hosts. Same `watch.json`. Do not rip out Grok computer watch.

**Browser path (where the desk is running):**

```
IF Cursor (this IDE / parent chat — not a Task subagent)
→ cursor-video-watch → cursor-ide-browser on a living YouTube tab
  (navigate, lock, snapshot, click, take_screenshot; CDP `video.currentTime`).
  After play: verify-after-browser.
  Write docs/hive/outer-heaven/CONTENT/watch-later/packets/{id}/watch.json
  Not Chrome. Not Playwright. Not browser-use.

IF Grok Bot
→ do **not** use this skill. Grok computer **watch** stays the Grok path.
  Do not call Cursor MCP. Do not rip this path out.
```

THEN `analyze-video-watch-output` / `analyze-video-watch.py` (beats). Same card either way.

**Owner:** Researcher  
**Cursor copy:** `.cursor/skills/cursor-video-watch/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/cursor-video-watch/SKILL.md`  
**Schema:** `scripts/hive/os/analyze-video-watch.py` + `scripts/hive/os/fixtures/video-watch-sample.json`  
**Wired job:** one named `video_id` when Evens says watch / frames+transcript.

## When

Operator says watch this video / cursor-video-watch / frames+transcript, or Researcher needs L3–L4 visuals for a packet that is still caption-only.

Caption-only packets stay caption-only **until this capture runs**. Do not invent clicks between frames. Do not redo Watch Later ingest.

## Checkable-stop (required before capture)

```
DONE-CHECK: packets/{video_id}/watch.json on disk with frames[] + transcript[] (timestamps) that analyze-video-watch.py --validate accepts
CAP: ONE video_id · sample interval 5–10s (default 5) · max frames 36 or first 3 min + chapter hits
COST: no billed vision vendor (Cursor screenshots + on-disk captions only)
STOP-KIND: cap + done-check
```

Until-satisfied is a weak stop. Not 600 shots of a 50m tape unless Evens raises the cap.

## assume-it-will-touch (this job)

```
ALLOW: cursor-ide-browser (navigate, lock, snapshot, click, take_screenshot, CDP currentTime) · write packets/{video_id}/watch.json
DENY: send / pay / deploy / book / publish · Playwright / Chrome / browser-use · Cursor MCP from Grok · Watch Later ingest rewrite · other video_ids
TERRITORY: docs/hive/outer-heaven/CONTENT/watch-later/packets/{video_id}/watch.json
MAX-TURNS: one video
BYPASS: none
```

Parent chat only. Subagent / Task browser tabs vanish — do not spawn 17 or a watch Task.

## watch.json shape (do not change)

Same fields `analyze-video-watch.py` already validates / consumes:

```json
{
  "video_id": "<id>",
  "video_url": "https://www.youtube.com/watch?v=<id>",
  "sampling_interval_sec": 5,
  "frames": [
    {"timestamp": "00:00", "description": "<what is on screen — OBSERVED>"}
  ],
  "transcript": [
    {"start": "00:00", "end": "00:07", "text": "<from packet captions / full.txt — not invented>"}
  ]
}
```

`validate_watch_input` requires `frames` and/or `transcript`. Frame `timestamp` and transcript `start` / `end`. Do not add a required field. Do not break Grok’s existing watch.json.

## Steps (Cursor host)

1. Write the checkable-stop card. Name ONE `video_id`. If you cannot name the stop, do not start.
2. Open a **living** YouTube tab in the **parent** chat: `cursor-ide-browser` `browser_navigate` → `https://www.youtube.com/watch?v={id}` → `browser_lock`. Do not use a Task/subagent (tabs vanish).
3. `browser_snapshot`. Click play once. Then `verify-after-browser`:

```
ACT: clicked play on living YouTube tab
EXPECTED: video playing; video.currentTime advancing
OBSERVED: <url + CDP currentTime + snapshot>
COMPARE: match | miss
NEXT: sample | retry (cap 2) | escalate
```

4. Sample on the interval. Seek with CDP `Runtime.evaluate` on `document.querySelector('video').currentTime` (read and set). At each sample: `browser_take_screenshot` + one `frames[]` row (`timestamp` MM:SS, `description` = OBSERVED on-screen only).
5. Chapter marks on the player count toward the cap — they do not raise it.
6. Transcript: copy from the packet (`full.txt` / caption json) already on disk. Do not invent lines. Do not re-ingest Watch Later. If no captions on disk, `transcript` may be `[]` (frames-only is valid) — speech stays caption-only.
7. Stop at the cap. Write `watch.json`. Unlock the tab.
8. THEN `analyze-video-watch-output` / `python3 scripts/hive/os/analyze-video-watch.py --input …/watch.json --validate`.

## Grok Bot host

Do not run these steps. Load Grok computer **watch**. Write the same `watch.json` path/schema. Then the same analyze skill. Never call Cursor MCP.

## Related

- `analyze-video-watch-output` — beats after either host writes watch.json
- `verify-after-browser` — after play / seek
- `checkable-stop` — card before the sample loop
- `assume-it-will-touch` — parent-tab only; no Task
- `api-macro-vision` — headed watch is vision-last; this skill is the named YouTube capture
- `multimodal-youtube-learning` — after watch.json exists, visual/click may be OBSERVED
- `researcher-video-to-system` — L3/L4

## Never

Playwright / Chrome / puppeteer / browser-use · spawn a Task to watch (tabs vanish) · invent clicks between frames · 600 shots of a long tape · until-satisfied · billed vision vendor · redo Watch Later ingest · tell a Grok desk to call Cursor MCP · rip out Grok computer watch · headed send/pay/publish/book/deploy · change the watch.json schema · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
