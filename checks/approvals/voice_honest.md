# Approval: voice_honest
- by: Consultant (delegated by Evens)
- at: 2026-10-13T04:12:07-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval ('approve each round's checks yourself and keep building'); 3:36/3:39 AM ET: Consultant builds remaining rounds itself. Consultant approved the voice_honest drafts.
- checks:
  1. With the Kokoro model installed and no ElevenLabs key, text-to-speech returns real Kokoro WAV audio (bytes > 0) and the report says kokoro.
  2. With no engine installed, the report says dark and Jarvis says it has no voice engine, instead of claiming voice is on.
  3. Asked which voice engine it uses, Jarvis names exactly the engine the voice report names.
  4. Asks like what voice engine are you using go to the voice engine answer; 'say hello out loud' still speaks; small talk does not.
  5. The existing voice tests still pass (product voice is Kokoro/ElevenLabs, never the macOS say voice).
  6. voice_engine is wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
  7. There is one engine decision: voice_report is the only place that picks the engine, and both the voice_engine hand and voice_status_line read it.
  8. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  9. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  10. Every other locked feature still passes its own checks (shared suite, eval and cross-feature checks are run once, not again; probe_eval/06-ci-wired is excused: it needs the workflows permission only Evens can grant).
