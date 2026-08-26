# Voice packs

Default product is Higgsfield **Juno** on the full DailyShow cut.

```
public/voice/{episodeId}/full-higgs-juno/*.wav + cues.json
```

Proven: `2026-08-25/full-higgs-juno/` → `out/daily-2026-08-25-vo-juno.mp4`.  
Voice id: `a3ce02fe-4d3e-55bc-b4d4-a4801b9acdb4`. The desk calls Higgsfield MCP (`get_cost` first, `use_unlim` false). After wavs land:

```bash
cd apps/portfolio-brief-remotion
bash scripts/render-juno-day.sh YYYY-MM-DD
```

That script does **not** call Higgsfield. This Grok desktop (computer + shell) renders Remotion. Evens Mac is optional. Cursor Cloud `/workspace` is not a host.

## Local fallback (session expired)

Do not loop `mcp_auth`. Reed / Samantha via macOS `say`:

```bash
bash scripts/render-voice.sh YYYY-MM-DD
# public/voice/{episodeId}/{full|morning60}/{sceneId}.wav + cues.json
```

If `say` fails, stop. Do not call a second paid TTS.

Morning Nora / `morning60-higgs*` are optional second-cut samples, not the default.

Publish / YouTube stays HITL.
