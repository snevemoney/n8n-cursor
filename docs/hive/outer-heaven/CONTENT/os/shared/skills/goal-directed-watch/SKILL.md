---
name: Goal-directed watch
description: >-
  Use when an agent desktop must watch video or audio: pick windows, speed, and
  modality (transcript, audio slice, frames, clip) from a goal instead of ingesting
  the whole file at a fixed frame rate.
---
# Goal-directed watch

**Owner:** Consultant (bar) · Researcher (run on signals) · any desk with a box desktop.
**Platform:** Grok Bot (box ffmpeg + watchVideo + browser). Cursor only if a repo clip is the job.
**Install:** `none (process-only)` — `ffmpeg`/`ffprobe` already on the box. Do not install Comfy, a second video agent, Jotform, or a new SKU. Named clip/RAG repos go through [awesome-skill-import-gate](sand-workflow:awesome-skill-import-gate).

## When

- A tape, demo, or screen recording is input and the job is a steal, UI path, or claim check
- CAPTION_GAP would otherwise Whisper a whole file
- Someone is about to ffmpeg at a fixed fps, or pass a long mp4 into watchVideo “describe everything”
- Operator asks for active / goal-directed / adaptive watch vs static ingest

## Anti-triggers

- [video-to-website](sand-workflow:video-to-website) needs dense frames for a scroll site — different job
- Leisure GTA/anime/sports — NO-SKILL, do not watch
- Auto-like / credential / farm demos — stop
- No goal written — write the goal first, then watch
- Operator’s Mac — never; box only unless they asked for local

## Inputs

- `{goal}` one sentence (steal for which platform, UI path, claim to verify)
- `{source}` YouTube id, file path, or `transcripts/<id>/full.txt`
- `{budget}` max windows (default 5) and max seconds of pixels (default 90)

## Loop (do not skip)

1. **Index (cheap).** Title, duration, chapters, timedtext with timestamps, existing `full.txt`. No download yet.
2. **Plan.** From the goal, name at most 5 windows `{t0,t1,why,modality,speed}`. Skip the rest.
3. **Fetch only those windows.** One modality per window (see table). Never whole-file 1fps.
4. **Stop** when the goal is answered or `{budget}` is spent. Log what was skipped.

### Modality (cheap to expensive)

| Need | Modality | How |
|---|---|---|
| Spoken steal, captions exist | **transcript** | Read the timestamped slice. Speed = instant. |
| Spoken steal, CAPTION_GAP | **audio slice** | ffmpeg `-ss t0 -to t1 -vn` then [whisper-caption-gap](sand-workflow:whisper-caption-gap) on the slice only |
| UI / diagram / cursor | **frames** | ffmpeg `-ss t -frames:v 1` or scene-cut in the window. Not 1fps of the whole tape |
| Motion / click path still unclear after frames | **clip** | Cut `t0–t1` mp4 (at most 30s). Dispatch watchVideo on the **clip**, with the goal in the prompt. Never the 2h source |
| Live player chrome (speed control, captions toggle) | **desktop** | browserUse then computerUse seek + playback speed. Last resort |

### Speed

- Talk / lecture: transcript, not 1x video. 1.5–2x player only if you must hear and captions are missing.
- UI tutorial: 1x on the 10–40s window; skip intro/outro.
- Motion/craft: scene-detect inside the window, not a global fps.

## Commands (box)

Clip audio for Whisper:

```
ffmpeg -y -ss {t0} -to {t1} -i "{src}" -vn -ac 1 -ar 16000 /tmp/watch-slice.wav
```

One frame at a moment:

```
ffmpeg -y -ss {t} -i "{src}" -frames:v 1 /tmp/watch-frame.jpg
```

Cut a watchVideo clip:

```
ffmpeg -y -ss {t0} -to {t1} -i "{src}" -c copy /tmp/watch-clip.mp4
```

Scene cuts inside a window (optional):

```
ffmpeg -ss {t0} -to {t1} -i "{src}" -vf "select=gt(scene\,0.3),showinfo" -f null -
```

YouTube: prefer timedtext + chapters before any download. If a file is required, land **only** the planned windows. Do not land a 2h mp4 to “have it.”

## watchVideo contract

Pass the **cut clip**, not the source. Prompt must include `{goal}` and “answer only what the goal needs; do not narrate skipped time.” First line may still ask for a description of **this clip**.

videoReview is for artifacts we generated. watchVideo is for operator/signal tapes.

## Done when

- Goal answered, or explicit “need window X next”
- Artifact on disk: windows table + FACT lines + skipped time
- Every screenshot ships with the **spoken caption at that timestamp** (VTT/Whisper slice). A frame without a caption is incomplete.
- Skill close still goes through [research-signal-to-skills](sand-workflow:research-signal-to-skills) (Platform + Install)
- ACTION_LOG card if this was a scheduled/extract job

## Never

- Ingest media at a fixed frame rate “just in case”
- Whisper a whole file when a 90s slice would do
- watchVideo a 30+ min file
- Invent spoken lines or UI from a title
- New desk / Comfy / Claude desktop as the watcher
- Treat this as a product SKU

## Tools

| Need | Path |
|---|---|
| Index | timedtext / chapters / `transcripts/<id>/full.txt` — **PROVE** |
| Cut / frames | box `ffmpeg` `ffprobe` — **PROVE** |
| ASR on a slice | whisper-caption-gap — **PROVE** |
| Clip understand | Task watchVideo on the cut file — **PROVE** |
| Live player | browserUse then computerUse — **WORKAROUND** |
| Mac / Comfy / second video agent | **BLOCKED** — box only |
| video-to-website dense dump | **other skill** — do not merge |

## Hive video-training bar
After windows/stills/captions, close through research-signal-to-skills under `CONTENT/topics/video-training-dod-20260909.md` (A–E). Do not report L2 done on index+plan alone.

## File-based study loop (operator 2026-09-09) — HARD
**Do not require human-speed YouTube playback.** Prefer video **file** + transcript. Stalled browser players must not own the job.

1. **Parallel streams:** timestamped transcript/speech **and** visual storyboard from the file (`ffmpeg` fps≈1/10 overview + `select=gt(scene\,0.25)` for cuts). Extra frames on screen changes catch demos never spoken.
2. **Find moments from either stream:** “paste this prompt”, settings, failures, new diagrams/code/results → mark timestamps.
3. **Densify:** more frames before/during/after; crop/OCR small text at original resolution; compare to narration; request more frames if unclear. Label reconstructions vs verbatim.
4. **Motion when motion teaches:** ordered frame sequences or ≤30s clips → watchVideo on the **cut**. Timing/easing die in one still.
5. **Lesson with linked evidence:** method, purpose, prerequisites, prompts, resources, mistakes, corrections, expected result — each claim → timestamp + frames. Unreadable text = missing, not invented.
6. **Transfer test:** another desk reproduces a small result, then applies technique to a different example (A–E letter E).

### Adaptive density (do not 30fps the whole tape)
| Content | Evidence |
|---|---|
| Spoken explanation | Transcript, occasional frames, diagrams |
| Software tutorial | Screen changes, readable text, before/action/after |
| Coding/prompting | Full-res text captures, corrections, output |
| Motion/design | Dense sequences, short clips, timing notes |
| Silent demo | Visual coverage + densify on changes |

Overview every ~10s is a **starting map**, not complete coverage. Full 1h@30fps = 108k frames — never default.

Optional: Gemini-class video understanding APIs if connected (verify first) — still keep evidence on disk. Coordinate via this skill + [grokbot-signal-training](sand-workflow:grokbot-signal-training).

## 2026-10-09 — Shell-only screen control (`yt:SWEThyRHMgQ`)
Executors without computerUse can drive box windows via [screen-drive-cli](sand-workflow:screen-drive-cli) (xdotool/xclip/maim + screenctl, PROVE). Still last resort: file+transcript first; YouTube player chrome stays browserUse/computerUse.
