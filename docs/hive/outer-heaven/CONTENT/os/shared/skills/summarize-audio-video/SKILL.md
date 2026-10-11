---
name: Summarize audio/video (Demkinn #50)
description: >-
  Use when: Tape/L2 ingest
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
