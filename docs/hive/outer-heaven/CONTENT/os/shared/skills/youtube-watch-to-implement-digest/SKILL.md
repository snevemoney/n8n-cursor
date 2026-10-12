---
name: YouTube watch → implement digest
description: >-
  Use when: Weekly History/Liked/WL AI titles — train hive skills from videos
  (Jotform YT→KB pattern without installing Jotform).
---
# YouTube watch → implement digest

**Owner desk:** Researcher  
**Lane:** hive-os  
**Sources:** youtube-ai-implement P1#8; watchlater FINDINGS; youtube-daily/*.md; Jotform `yt:Mdo-z2Josdc`.

## When
Weekly History/Liked/WL AI titles; or “train agent from these YouTube urls.”

## Do
1. FACT title list
2. ≤3 ranked implementables
3. Skill close each via [research-signal-to-skills](sand-workflow:research-signal-to-skills) + [research-signal-to-skills](sand-workflow:research-signal-to-skills)
4. Skip leisure productization
5. **YT → knowledge** (Jotform pattern): paste video urls → extract bullets into skill body / prompt-pack / SIGNAL_INDEX — do **not** install Jotform AI Agents

## Don't
- Report 80 as 1851
- New icp_id from topic picker
- Install Jotform / Eden / Comfy as the knowledge store

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only. Weekday close may reuse morning SoT + Cap≤1 without re-scrape when NEW_SINCE_MORNING unproven.

## CAPTION_GAP (2026-08-22)
When YouTube timedtext returns 429 / CAPTION_GAP: run `oh-transcribe <url>` first ([owned-tools](sand-workflow:owned-tools)). If it fails (YouTube is bot-blocked on the VPS as of 2026-10-11), run [summarize-audio-video](sand-workflow:summarize-audio-video) on the box (`/workspace/.venvs/whisper/bin/whisper --model small`). Save transcript beside the packet. Never install Whisper on VPS. **PROVE:** CLI installed on box. If another worker owns Whisper for that id, note CAPTION_GAP and continue with page recovery / chapters.

## Tools
| Need | Path |
|---|---|
| History JSON | /workspace/youtube-history-*.json + youtube-daily scrapes — **PROVE** |
| L2 md | youtube-daily/ — **PROVE** |
| Whisper | summarize-audio-video — **PROVE** |
| Jotform Agents | **NO-SKILL** — do not install |
| X bookmarks | user-X MCP; spend-cap 403 → fail-closed quiet (credits ≠ unlock) |
| Morning SoT | youtube-daily scrape / history.md — prefer over SQLite |

## Prompts
**Implement digest**
```
Window: [date]
Watches → clustered steals → implement | park | NO-SKILL
Link workflow ids. Prefer Grok+Cursor.
```

**Train from YouTube urls**
```
Urls/ids: …
Extract knowledge → skill enrich/create + prompt-pack.
No Jotform install. CAPTION_GAP → whisper worker or page recovery.
```

## Connector preference (2026-08-22)
Prefer **logged-in box YouTube** + history JSON + summarize-audio-video. Composio YouTube toolkit is optional (playlist proxy only; no true watch history; caption download only for owned videos). Do not require Composio for daily digests.

## Geerling dQ841Pd6YvQ (2026-08-26)
**PROVE** timedtext + watch page. Packet: `/workspace/research/packets/signals-20260826/GEERLING-dQ841Pd6YvQ.md`. Steal = published-voice clone risk (OSS Qwen3-TTS / ElevenLabs). **No TTS SKU.** Not STT — do not route to local-push-to-talk-dictation.

## Geerling dQ841Pd6YvQ (2026-08-26)
PROVE timedtext. Packet: signals-20260826/GEERLING-dQ841Pd6YvQ.md. Opsec awareness only. No TTS SKU.

## Weekday signals-close (2026-09-08 ~10:21 ET) FACT
Packet: `/workspace/research/packets/signals-close-20260908-1021/`

Close rules (PROVE on this fire):
- **Morning `youtube-daily-YYYYMMDD` is SoT** until NEW_SINCE_MORNING is proven. Do not re-triage the same Today list at 9:43 if morning already wrote SKILL_DELTA.
- **Account History ≠ local Chrome `History` SQLite.** Box profile SQLite may return 0 `youtube.com/watch` rows even when signed-in Premium History page has watches. Prefer morning scrape JSON / `youtube.com/feed/history` over inventing empty-queue from SQLite.
- **X live first:** `user-X` get_users_me → get_users_bookmarks. Write Shared Memory Plane. **0 new IDs = quiet** (no operator ping, no skill mint). Stale dump ≠ live — still pull.
- **Repo extract:** only append `github.com/owner/name` when the string is present in today's signal text. Title-only "3 OSS repos" / "5 open source tools" without owner/name → L2 queue, **not** invent QUEUE rows.
- Leisure titles stay **NO-SKILL**. No browser fan-out when prior driver blocks; one skill pass; max-3 streams.

## Video training DoD (operator audit 2026-09-09) — HARD
Daily/History fires are **not done** at titles + enrich. For each ranked implementable tape, all five must hold (SSOT `CONTENT/topics/video-training-dod-20260909.md`):
1. Source understood (chapters/demos + gaps)
2. Evidence preserved (stills + spoken caption at t; motion if needed) via [goal-directed-watch](sand-workflow:goal-directed-watch)
3. Method extracted (prompts/tools/resources/settings/steps/mistakes)
4. Recreation demonstrated (PROVE or WORKAROUND/BLOCKED "would work if X") — do not equate "we have Remotion" with mastering the shown technique
5. Knowledge usable by another desk (recipe in skill body they can run) — Librarian pointer alone ≠ done

Metadata-only triage may list the shelf, but must **not** claim skill-close success or routine Succeeded for tapes that skipped A–E.
Restrictions (don't install/sell) must not swallow the lesson — research the method; label install separately.

## Fail-closed missing SoT (2026-09-17 smarter-loop)
- If this routine **fails** or `youtube-daily/YYYY-MM-DD.md` is absent for today → label **SoT MISSING**. Do **not** invent Today/Yesterday counts from SQLite 0, signed-out UI, or memory.
- Downstream (signals-close / research-signal-to-skills) must reuse last **proven** SoT path on disk or stay quiet. Watchdog owns the silent miss — do not clone the digest job.
- Video training DoD A–E still binds when a prove-one runs; metadata-only days must not claim Succeeded for skipped tapes.

## Weekday signals-close 2026-09-23 ~10:25 ET FACT
Packet: `/workspace/research/packets/signals-close-20260923-1025/`

**FACT — Morning SoT reuse:** Today **21** / Yesterday **63** (`/workspace/research/youtube-daily/scrape-20260923-history.md`, signed-in Premium Snevemoney). **NEW_SINCE_MORNING not re-scraped** (prefer connectors; morning scrape + Cap≤1 already held). Watch Later not opened.

**Builder ranked from Today (implement | park | NO-SKILL):**
1. **CLOSED morning:** `yt:Vok_nReMFaU` JS Mastery Engineering System for AI Agents — Cap≤1 spent · pack `youtube-daily/l2-20260923/Vok_nReMFaU/`
2. **SHELF title-only HOLD:** `8DfvwZ812dM` JSM Build Full Stack Learning Platform — next Cap sitting; do not invent chapters
3. **SHELF title-only HOLD:** `D5v4UuvtUXc` JARVIS+Jev upgrade — Jarvis upgrade/wire OK per GO; **no** new Jarvis/Vapi face/SKU; title-only until Cap opens
4. **PARK/title:** `9eJvqI2MJts` Open Models ban — policy watch, not skill mint
5. **PARK/title:** `OWu2kjKrRTA` Anthropic Opus — news; claim-verifier if $
6. **NO-SKILL leisure:** games/comics/music/Mark Rober/Mac unboxings unless local-AI Mac tape maps existing `local-private-agent-lab`

**X spend-cap fail-closed:** `get_users_me` PROVE (@snevemoney / 514498939) + `get_users_bookmarks` 403 spend-cap-reached = **quiet**. Credits display (free≈91.33 prepaid≈2.4 total≈93.73) ≠ bookmark unlock. Never Mac xurl primary. Stale dump `~/.grokbot/x-bookmarks.json` synced 2026-09-18T17:38:51Z count=96 — **not** live; do not invent IDs.

**Account History ≠ Chrome History SQLite** (keep prior rule).

**Repo extract:** only concrete `owner/name` from signal text → QUEUE. Today's FACT from Vok packet: `jsmastery-pro/skills` → QUEUE (Big Boss+Watchdog gate; do not install).

## Weekday signals-close 2026-09-24 ~10:14 ET FACT
Packet: `/workspace/research/packets/signals-close-20260924-1014/`

**FACT — Morning SoT reuse:** Today **7** / Yesterday **94** (`/workspace/research/youtube-daily/scrape-20260924-history.md`, signed-in Snevemoney / snevemoney12). **NEW_SINCE_MORNING not re-scraped** (prefer connectors; morning scrape + Cap≤1 already held). Watch Later not opened.

**Builder ranked (implement | park | NO-SKILL):**
1. **CLOSED morning:** `yt:qkCHiEFEZQg` Web Dev Cody — 562 Jev demos — Cap≤1 spent · A–E PASS · pack `youtube-daily/l2-20260924/qkCHiEFEZQg/` · EXTERNAL_SIGNAL (pattern distill only; ≠ 562 ADOPTED)
2. **SHELF title-only HOLD:** `NZq88JAJSag` Cole Medin rate-limits — next Cap sitting; do not invent chapters
3. **SHELF title-only HOLD:** `D5v4UuvtUXc` JARVIS+Jev upgrade — upgrade/wire OK; **no** new Jarvis/Vapi face/SKU
4. **SHELF title-only HOLD:** `8DfvwZ812dM` JSM Full Stack Learning Platform — windows-only shelf
5. **NO-SKILL leisure (Today):** Monster Hunter / Wilds · Green Lantern / Sinestro · Ninja Gaiden 2 · Mac shorts (unless local-AI Mac → `local-private-agent-lab`)

**X spend-cap fail-closed:** `get_users_me` PROVE (@snevemoney / 514498939) + `get_users_bookmarks` 403 spend-cap-reached = **quiet**. Credits (free≈91.33 prepaid≈2.4 total≈93.73) ≠ bookmark unlock. Never Mac xurl primary. Dump `~/.grokbot/x-bookmarks.json` synced 2026-09-23T21:06:58Z count=707 — **not** live this fire; do not invent IDs / do not restamp as live pull.

**Repo extract:** no new concrete `owner/name` in this fire. Prior QUEUE `jsmastery-pro/skills` unchanged (do not install).

## Enrich 2026-10-12: caption fallback chain, box-proven (packet `/workspace/research/packets/codex-yt12-20261012/`)
PROVE on box, 12 videos, 2026-10-12 ~19:00 ET:
1. Parallel `yt-dlp --skip-download --write-auto-subs --sub-format json3` → 7/12 OK, rest HTTP 429.
2. **Retry one at a time with `sleep 20` between ids** → 3 more recovered (429 is rate limit, not a block).
3. Still blocked ("Sign in to confirm you're not a bot") → `yt-dlp -f 'ba[ext=m4a]/ba'` audio download often still works a minute later → `/workspace/.venvs/whisper/bin/fw-transcribe <audio> <outdir> --model small` (CPU int8, ~2 min per 13-min video). **The `whisper` binary named above does not exist; `fw-transcribe` is the real CLI.**
4. `oh-transcribe` returned HTTP 202 "YouTube bot-check from VPS IP; queued for box fallback worker" — treat as not-done, continue with step 3.
5. fw-transcribe uses VAD: check for >20 s gaps between segments and re-run that slice (`ffmpeg -ss A -to B` + `--offset A`); one 13-min video lost 90 s until sliced.
Count a video done only when a transcript file exists, not when the packet folder exists.
