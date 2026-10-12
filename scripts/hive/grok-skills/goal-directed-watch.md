---
name: goal-directed-watch
description: >-
  Hunt slide / site / UI beats in one YouTube or X signal, screenshot
  those moments, pair each still with the spoken caption window. Not
  a fixed-fps dump. Not video-to-website. Use when Evens says hunt
  presentation beats, screenshot the slides, or pair captions with
  frames. Cursor plus Grok Bot.
---

# Goal-directed watch

**Owner:** Researcher (hunt + captions) · Creative Studio (use stills as refs). **Stack:** Cursor + Grok Bot.  
**Cursor copy:** `.cursor/skills/goal-directed-watch/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/goal-directed-watch/SKILL.md`  
**Status:** WIRED 2026-09-02 from Consultant sitting (sand-workflow `goal-directed-watch`). Not accepted forever.

**Source:** Evens: find key moments in the actual signals (YouTube / X). Screenshot presentations. More stills per tape. Pair captions with screenshots.

**Dissent (do not flatten):**
- `video-to-website` / `seedance-site` = dense frames so a page can scrub a film. Wrong loop for signals.
- `cursor-video-watch` = living-tab interval sample (5–10s, max 36) when there is no steal yet. This skill **writes the steal first**, then seeks only those beats.
- `tape-intake.py frames` = ffmpeg scene-change floor. Use it when you have a local file and no named beats. Goal-directed beats override even spacing.
- Talking-head interview with no board → skip (Consultant skipped Karpathy No Priors).
- Claude / Fable / Skool as stack = operate-never.

## When

A tape or bookmark pile has **slides, sites, diagrams, or product UI** on screen, and captions (or a LEARNED D) already name when those appear. Evens wants refs, not a thesis.

## Card

```
STEAL: what we are hunting (sites / slides / UI / install boards)
MODALITY: captions first · ffmpeg still if a local file exists · living tab last
BEATS: named timestamps from captions (look at / here / this site / diagram / copy prompt)
PAIR: each still + spoken window (±4s)
CAP: ONE video_id · ≤24 stills (raise only if Evens asks denser)
COST: local yt-dlp + ffmpeg · no billed vision
DONE-CHECK: packets/{id}/frames/*.jpg + CAPTIONS.md + watch.json
```

## Steps

1. Write the steal in one line. If you cannot name what is on screen, do not start.
2. Hunt beats from `full.txt` / LEARNED D. Keep a row only if speech points at a living object (site, board, component, hard cut). Skip “I think / anyways” talking-head.
3. Get a local file **if** `ffmpeg` is on PATH: `yt-dlp` 720p into `/tmp` (do not commit the mp4). If download 403s, try another player client. If still blocked → Cursor living tab seek (`cursor-video-watch` path) for those timestamps only.
4. One ffmpeg still per beat (`-ss` then `-frames:v 1`). Recut when the first seek is still the previous tab or a talking-head. OBSERVED only.
5. Pair: write `CAPTIONS.md` — image + cue + spoken window from on-disk captions. Do not invent lines.
6. Write `watch.json` (`frames[]` + `transcript[]`, numeric `sampling_interval_sec`) and `frames.json`. THEN `analyze-video-watch.py --validate`.
7. Stop at the cap. Token $ on a usage pane = UNVERIFIED. Do not quote as FACT.

## Stop

Stills + captions on disk. Publish / send = Evens. One-shot HTML is not this skill.

## Never

Fixed-fps dump of the whole tape · video-to-website wrap · invent clicks from stills · commit the mp4 · billed vision vendor · join Skool to “get the skill” · Claude/Fable as our stack · spawn 17 · send / pay / deploy / book / publish
