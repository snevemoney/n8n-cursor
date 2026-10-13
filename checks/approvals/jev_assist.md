# Approval: jev_assist
- by: Consultant (delegated by Evens)
- at: 2026-10-13T04:14:31-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval ('approve each round's checks yourself and keep building'); 3:36/3:39 AM ET: Consultant builds remaining rounds itself. Consultant approved the jev_assist drafts.
- checks:
  1. There are at least 100 labelled turns for calibrating Jev, every label is a real Jev handler, and each row says where it came from.
  2. Calibration computes a Brier score and accuracy over the labelled set, stores them, and the ASSIST log row carries the Brier score.
  3. If Jev is slow, the router does not wait: assist gives up within 800 ms and the normal path runs.
  4. Jev assist only ever suggests a safe routing hand (status); it never picks a hard step or an action, and it is off when calibration failed.
  5. The turn uses Jev assist only on the model path (when no model-free route matched), and Jev advice stays ADVISORY.
  6. There is one assist path: assist is defined once and calibration lives in eval/jev_calibrate.py only.
  7. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  8. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  9. Every other locked feature still passes its own checks (shared suite, eval and cross-feature checks are run once, not again; probe_eval/06-ci-wired is excused: it needs the workflows permission only Evens can grant).
