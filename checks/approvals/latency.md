# Approval: latency
- by: Consultant (delegated by Evens)
- at: 2026-10-13T03:48:29-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval ('approve each round's checks yourself and keep building'); 3:36/3:39 AM ET: Consultant builds remaining rounds itself. Consultant approved the latency drafts.
- checks:
  1. Logging a turn to a large daily Face log (20 MB) takes under 0.3 s: the log is appended, not re-read and rewritten every turn (this was the seconds of delay after On it).
  2. The Face log keeps every old line, adds the new turn at the end, and a new day still starts with its header.
  3. The latency findings are written down with measured numbers: where the 10-27 s after On it went, what was fixed, what is left.
  4. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  5. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  6. Every other locked feature still passes its own checks (shared suite, eval and cross-feature checks are run once, not again; probe_eval/06-ci-wired is excused: it needs the workflows permission only Evens can grant).
