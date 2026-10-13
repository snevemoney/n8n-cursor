---
name: Summarize audio/video (Demkinn #50)
description: >-
  Use when: Tape/L2 ingest
merged_from: [whisper-caption-gap]
---
# Summarize audio/video (Demkinn #50)

**Owner desk:** Researcher  
**Lane:** hive-os  
**Sources:** demkinn skills/50, youtube-daily L2s, wl-delta-p1-caps

## When
Tape/L2 ingest

## Do
1. Caption or spoken recovery
2. FACT/INFERENCE labels
3. Steal vs never
4. Skill close

## Don't
- Invent spoken lines
- Treat UNVERIFIED $ as FACT

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## Tools
| Need | Path |
|---|---|
| Captions | yt timedtext when available — **PROVE** |
| Whisper CAPTION_GAP | `/workspace/.venvs/whisper/bin/whisper` — **PROVE** (document; don't re-transcribe all) |
| Skill close | research-signal-to-skills — **PROVE** |

## Prompts
**Tape L2**
```
Tape: [id/path]
1) Caption or Whisper if CAPTION_GAP
2) FACT/INFERENCE/UNVERIFIED
3) Steal vs never
4) Skill close (create/enrich/NO-SKILL)
```

---

## Merged from `whisper-caption-gap` (2026-10-11)

- Original description: Use when YouTube captions fail CAPTION_GAP or 429 — local Whisper on the box for Researcher L2.
- Unique content carried: CAPTION_GAP/429 → local Whisper fallback steps

# Whisper CAPTION_GAP

Host: box (Grok computer), not VPS.  
CLI: `/workspace/.venvs/whisper/bin/whisper` — **PROVE** (binary present 2026-08-22 live-P0 close).

When Researcher hits CAPTION_GAP / timedtext 429:
1. Plan windows with [goal-directed-watch](sand-workflow:goal-directed-watch). Do not land a whole 2h file “just in case.”
2. Land **only** those windows (`ffmpeg -ss t0 -to t1`). Audio slice is enough for speech.
3. Run `/workspace/.venvs/whisper/bin/whisper <slice> --model small` (or `base` if slow).
4. Save the slice transcript beside the research packet; continue L2.
Whole-file Whisper only if the goal is a full transcript and no timedtext exists.

**Known gaps (do not re-Whisper unless audio newly landed):** `5CSXUsljJ_E` CAPTION_GAP noted; page WebFetch recovered enough for skill close 2026-08-22.

Never install Whisper on the VPS. Never open Comfy/Eden as a second desktop.  
This is **not** the Wispr Flow replacement — see [local-push-to-talk-dictation](sand-workflow:local-push-to-talk-dictation).

## Tools
| Need | Path |
|---|---|
| Whisper CLI | `/workspace/.venvs/whisper/bin/whisper` — **PROVE** |
| VPS Whisper | **BLOCKED** — box only |
| Comfy/Eden | **BLOCKED** second desktop |
| Operator dictation | local-push-to-talk-dictation — different job |

## Prompts
**CAPTION_GAP**
```
File: …
/workspace/.venvs/whisper/bin/whisper <file> --model small
Save transcript beside packet; continue L2. Do not re-transcribe everything.
```

## Recovered without Whisper (2026-08-26)
`dQ841Pd6YvQ` Jeff Geerling — timedtext + watch page **PROVE**. Whisper not required. Extract: `/workspace/research/packets/signals-20260826/GEERLING-dQ841Pd6YvQ.md`. TTS tape; not STT.

## X bookmark 20260924-1623 (`x:2102775666366435450` NVIDIAAI)
FACT-as-stated: Nemotron 3 Diarization (≤8 speakers, overlap-aware, ~100M params, HF) for messy multi-talker transcripts.
- Atom: when L2 needs **who-spoke-when**, diarization is a RESEARCH-OK upgrade path above plain Whisper ASR.
- Label: **RESEARCH-OK** — do not install Nemotron as hive face this fire. Box Whisper remains **PROVE** for CAPTION_GAP slices.
- Would work if we had: evaluated Nemotron/pyannote diarization on box for multi-speaker tapes.

## LIVE enrich 2026-09-25 — Cap≤1 CAPTION_GAP slices (`yt:b9_kJn0zm5U`)
Packet: `/workspace/research/youtube-daily/l2-20260925/b9_kJn0zm5U/` (A–E PASS · signals-close Phase1).

FACT: yt-dlp timedtext **429** → CAPTION_GAP. Windows planned via goal-directed-watch (≤5). Landed `clips/w1..w5.mp4`; Whisper small on slices → `transcripts/w*.vtt` (+ json/srt/tsv/txt). Absolute captions TSV + ASR_CORRECTIONS beside packet. Continue L2 without whole-file Whisper.

- Cap ≤1 prove-one reused this fire — do **not** re-Whisper unless audio newly landed.
- Pair [goal-directed-watch](sand-workflow:goal-directed-watch) then this skill; never 1fps whole tape.
- **PROVE:** box Whisper CLI + packet transcripts. **BLOCKED:** VPS Whisper / Comfy-Eden second desktop. **RESEARCH-OK:** Nemotron diarization still watch-only (prior stamp).



## X bookmarks 20260930-1616-desktop — faster-whisper / VAD catalog note

Packet: `/workspace/research/packets/x-bookmarks/20260930-1616-desktop/` · voice-apps list `x:2105353229991293360`.
- **FACT:** Catalog names `SYSTRAN/faster-whisper` + `snakers4/silero-vad` beside openai/whisper.
- **Map:** Box default remains openai-whisper CLI in `.venvs/whisper` (**PROVE**). faster-whisper / Silero VAD = **RESEARCH-OK** speed/VAD upgrade path — evaluate before swap; do not change default this fire.
- Pair dialbot-bland-outbound catalog row. Install: **none**.

## Box IP block ladder 2026-10-06 (hive-smarter-loop Phase1)
Source: `/workspace/research/packets/web-intel-youtube-20261005/` (STATUS + FINDINGS). FACT: on 2026-10-05 the box hit yt-dlp **429** + bot wall and youtube-transcript-api **IpBlocked**; Kashef `uvIopT_2sY0` transcript failed ×4 (chapters/description only).
When the block is the **box IP** (not a missing caption track), timedtext retries will not help. Go in this order and stop at the first that works:
1. Signed-in box Chrome via computerUse, **read-only** (transcript panel / chapters / description). Label evidence "condensed transcript" when it is not verbatim.
2. If audio for the needed windows is already on the box, Whisper slices per steps 1–4 above. Do not try to land new audio through the blocked downloader in a loop.
3. Otherwise mark **CAPTION_GAP (IP_BLOCKED)** in the packet with what was captured (chapters, description links) and keep the result PARTIAL. Never call it COMPLETE (Progress Truth).
4. Ask for a paste only after 1–3.
- **Route traffic (resolved 2026-10-07 ~9:20 PM ET):** Evens made "route traffic through this computer" a standing egress-only exception to the local-machine rule. He turns it on himself; when it is on and his Mac is online, try the YouTube read through it before step 1. Mac offline → steps 1–4 and say so. No other Mac use; never flip the toggle for him.
- No proxy/VPN installs, cookie scraping, or IP-rotation tricks to get around the block.
- Install: none.


## 2026-10-09 L2 fire — ASR path moved + downloader ladder (Researcher, packets `l2-20261009/MgvwZaDPCs4`, `SWEThyRHMgQ`)
- **FACT:** `/workspace/.venvs/whisper/bin/whisper` (openai-whisper) was gone; the venv was rebuilt with **faster-whisper** (CPU int8). CLI: `/workspace/.venvs/whisper/bin/fw-transcribe <media> <outdir> [--model small] [--offset SEC]` → json/srt/vtt/tsv/txt + full_timestamped.txt. Decodes via ffmpeg (PyAV in this venv rejects `metadata_errors`). Small model ~4 min for 9 min audio. **PROVE**.
- **Gap check is mandatory:** VAD pass dropped speech over screen audio (24–59 s, 133–167 s); a no-VAD pass skipped 0–210 s and 670–702 s on another tape. After any pass, list gaps >6 s between segments and re-run just those slices in the other mode, then merge.
- **yt-dlp ladder (box IP walled):** full path `/home/box/.local/bin/yt-dlp`. Install a JS runtime first: `deno` at `/home/box/.local/bin/deno` (GitHub release zip) — with it the default client lists full formats again. Without it: `player_client=android_vr` (360p only) or `visionos` (720p) worked on tape 1 then got walled on tape 2; `ios`/`mweb` pass the wall but return storyboards only. Pick English-original audio explicitly (`140-16`/`140-20` style ids; plain `bestaudio` can be a dubbed track).
- Timedtext still 429 all day → ASR is the default for L2.

## 2026-10-10 full-study lessons (X video batch, 27 clips)
- `faster_whisper` in `/workspace/.venvs/whisper` + this box's PyAV: `transcribe(path)` crashes (`open() got an unexpected keyword argument 'metadata_errors'`). Fix: decode with ffmpeg to a float32 array and pass the array: `ffmpeg -i f -af highpass=f=100,lowpass=f=7000,dynaudnorm -f f32le -ac 1 -ar 16000 -` → `np.frombuffer(..., np.float32)`.
- **Auto language detection fails on X clips with a music intro** (an English 6.5-min talk came back as "es", 1 garbage line; int8 too). Force `language=` from the post text, `compute_type="float32"`, `beam_size=5` → clean transcript. Always eyeball the first lines + a contact sheet before trusting "no speech".
