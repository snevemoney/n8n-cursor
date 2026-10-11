---
name: Owned tools (self-hosted search, transcribe, fetch, Jev, ntfy)
description: >-
  Use before paid or public tools: bulk search (oh-search), video/audio with no
  captions (oh-transcribe), page fetch (oh-fetch), cheap route/score before an
  expensive step (oh-jev), and human-must-act alerts (oh-notify). Box CLIs on
  Evens' VPS (evenslouis.ca), HTTPS + auth.
---

# Owned tools: use ours first

Box CLIs in `/home/box/.local/bin` (add it to PATH or call by full path). They read keys from `/home/box/.config/owned-tools/env` (mode 600). Never print or copy that file. Endpoints: `/workspace/research/packets/owned-tools-20261010/deploy/ENDPOINTS.md`.

## When to use which
| Need | Use | Instead of | Rule |
|---|---|---|---|
| Search: bulk (more than 3 queries), fan-out, lead or vendor sweeps | `oh-search "query" [n]` | WebSearch | Search here first. Use WebSearch for one-off fresh-news questions, or if oh-search fails or comes back empty. |
| Transcript for an X or YouTube video (or any audio/video URL) without captions | `oh-transcribe <url>` | paid ASR, a full-file box Whisper run | Use timedtext or existing captions first. Run this on CAPTION_GAP. |
| Read a page as markdown | `oh-fetch <url> [max_len]` | WebFetch when blocked | Good fallback when WebFetch gets a 403. Public pages only. |
| Classify, route, score, or flag before an expensive step | `oh-jev "task" choiceA choiceB ...` | a frontier model call | See [jev-preflight](sand-workflow:jev-preflight). Decisions only: it needs ≥2 choices. |
| Something a human must act on (a blocker, an approval, a failed money or prod path) | `oh-notify "title" "msg" [1-5]` | email or Slack | Never use it for FYI, progress, or success pings. Use priority 4–5 only for urgent items. |

## Exact commands
```bash
export PATH=/home/box/.local/bin:$PATH
oh-search "n8n data tables dedupe" 5          # title / url / snippet
oh-transcribe "https://x.com/user/status/123"   # prints the transcript; cache: /workspace/transcripts/<id>.txt (+ .json with segments)
oh-fetch https://example.com 8000
oh-jev "fix a failing CI test" engineering research ops comms finance   # → {"answer":{"choice":...,"confidence":...}}
oh-notify "BLOCKED: Stripe key expired" "Researcher can't pull payouts; rotate the key in Hostinger" 4
```
- Cache: `oh-transcribe` reuses `/workspace/transcripts/<id>.txt` (id = the YouTube/X id, otherwise a sha1 of the URL). Delete the file to force a re-run.
- `NTFY_TOPIC` in the env file sets the alert topic (default `evens-alerts`).
- Timeouts: transcribe defaults to 900 s (`OH_TRANSCRIBE_TIMEOUT`). It runs CPU Whisper "small" on the VPS, so keep clips short; long videos are slow.

## Known limits (2026-10-11)
- **YouTube on oh-transcribe: BLOCKED.** YouTube asks the VPS IP to "Sign in to confirm you're not a bot" (it needs cookies, and that is a VPS-side change). Until it's fixed, use box [whisper-caption-gap](sand-workflow:whisper-caption-gap) on a slice for YouTube. X, Wikimedia, and direct media URLs work.
- An X post with no video returns `HTTP 400: No video could be found`. That is expected; stop there.
- MCP git/fs (vault) are PENDING. Crawl4AI and mem0 are OFF.

## Receipt (append to the work receipt)
`owned: tool=<search|transcribe|fetch|jev|notify> cmd="<cli + args, no secrets>" rc=<0|n> out=<path or count> fallback=<none|WebSearch|box-whisper|...>`
