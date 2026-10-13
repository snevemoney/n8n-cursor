# Approval: voice_local
- by: Consultant (delegated by Evens)
- at: 2026-10-13T09:39:04-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval; 8:18 AM ET 'Fix Jarvis until all 30 are done. Routed and capable.' Consultant approved the voice_local drafts (scorecard cap 18).
- checks:
  1. With no env set and no in-tree cache, the voice finds the shared Kokoro model and voice Python in ~/.jarvis-voice, so any checkout of the Face can speak; env settings still win.
  2. When Kokoro is ready, "which voice engine" says Kokoro and its voice; when nothing is ready it says text only, never a made-up engine.
  3. The shared-cache lookup is the one CACHE / VENV_PY definition in mouth/voice.py that the TTS worker and voice_engine both read.
  4. No other file defines its own Kokoro path: AGENT_STACK_KOKORO_DIR is read only in mouth/voice.py.
  5. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  6. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  7. Every other locked feature still passes its own checks, with no exclusions (shared suite, eval and cross-feature checks run once).
