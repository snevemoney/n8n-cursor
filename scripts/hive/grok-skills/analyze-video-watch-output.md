# Skill: analyze-video-watch-output

**Shared skill** — Researcher (owner), Creative Studio, Forge, Product GTM, Career Strategist, Wealth Manager.

**System implementation:** After analysis, Researcher runs `researcher-video-to-system` skill — chapters for operator + repo updates for all agents.

## When to use

After Grok computer **watch** produces JSON with `frames[]` and `transcript[]` for the same video. Use for L3–L4 analysis when transcripts alone are insufficient.

## Steps

1. **Validate** input has timestamps on frames and/or transcript segments.
2. **Merge** into chronological beats (do not analyze streams independently).
3. For each beat record:
   - ON SCREEN (visible text, UI, people, cuts)
   - SPOKEN (concise transcript)
   - CHANGED (visual/subject/pacing/claim shifts)
4. **Structure pass:** OPEN → HOLD → TURN(s) → CLOSE (cite beat timestamps).
5. **Label** every claim OBSERVED, INFERENCE, or GAP.
6. **Procedural videos:** reconstruct GOAL → PREREQUISITES → STEPS → VALIDATION → RESULT.
7. **UI videos:** capture interface state per beat; do not claim success without visual proof.
8. **Finish** with exactly **3** highest-signal, decision-relevant observations (with timestamps).

## Optional CLI validation

```bash
python3 scripts/hive/os/analyze-video-watch.py --input /path/to/watch.json --output /tmp/analysis.json --validate
```

## Sampling limitations (always state)

- Frame interval (e.g. every 5s) may miss rapid cuts
- Transcript timing may drift from visuals
- Mark SYNC UNCERTAINTY when alignment is approximate

## Do not

- Invent actions between sparse frames
- Present inference as observation
- Merge raw evidence across videos before per-video analysis completes

**Spec:** `docs/os/VIDEO_ANALYSIS.md` · **Schema:** `schemas/os/video_analysis.schema.json`
