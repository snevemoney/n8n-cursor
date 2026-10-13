# Approval: code_run
- by: Consultant (delegated by Evens)
- at: 2026-10-13T04:01:01-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval ('approve each round's checks yourself and keep building'); 3:36/3:39 AM ET: Consultant builds remaining rounds itself. Consultant approved the code_run drafts.
- checks:
  1. Jarvis runs a small Python snippet with its test and reports pass or fail truthfully.
  2. Code run by Jarvis cannot reach the network: a web request or socket connect fails.
  3. A run is cut off at 10 seconds and says it timed out.
  4. Code runs in a throwaway temp folder: files it writes land there, it cannot write into the repo or home, and the repo is unchanged.
  5. Asks to write and run Python code or its tests go to code_run; small talk, file reads and web searches do not.
  6. When the ask has no code in it, Jarvis says plainly what it needs instead of pretending it ran something.
  7. code_run is wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
  8. There is one code execution path: wants_code_run is defined once and only hands/code_run.py runs user code.
  9. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  10. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  11. Every other locked feature still passes its own checks (shared suite, eval and cross-feature checks are run once, not again; probe_eval/06-ci-wired is excused: it needs the workflows permission only Evens can grant).
