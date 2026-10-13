# Approval: loop_hand
- by: Consultant (delegated by Evens)
- at: 2026-10-13T04:06:31-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval ('approve each round's checks yourself and keep building'); 3:36/3:39 AM ET: Consultant builds remaining rounds itself. Consultant approved the loop_hand drafts.
- checks:
  1. Starting a loop records what it checks, how often, and checkable stop fields (stop_when, max_runs, expires), marked read-only.
  2. No more than 6 loops can be started per day; the 7th is refused in code.
  3. Jarvis lists active loops, and cancel really stops one: it no longer shows as active.
  4. A loop that would send, pay, delete, deploy, post or write anything is refused; loops can only check things.
  5. Asks to start, list or cancel a loop go to the loop hand; small talk, loop me in and web searches do not.
  6. loop is wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
  7. There is one loop registry: wants_loop is defined once and only the loop hand uses JARVIS_LOOPS_FILE.
  8. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  9. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  10. Every other locked feature still passes its own checks (shared suite, eval and cross-feature checks are run once, not again; probe_eval/06-ci-wired is excused: it needs the workflows permission only Evens can grant).
