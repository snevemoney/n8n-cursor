# Approval: screen_see
- by: Consultant (delegated by Evens)
- at: 2026-10-13T04:21:34-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval ('approve each round's checks yourself and keep building'); 3:36/3:39 AM ET: Consultant builds remaining rounds itself. Consultant approved the screen_see drafts.
- checks:
  1. Describe my screen / take a screenshot of my screen are answered by the screen hand (the whole display), not the Safari tab; page asks still go to Safari.
  2. The screen hand grabs the whole display (no tab bounds), sends that image to the vision model, and answers from what the model saw.
  3. If the vision model is not available, Jarvis says it grabbed the screen but cannot describe it, and does not make a description up.
  4. If the screen cannot be grabbed (no Screen Recording permission), Jarvis says so plainly.
  5. Without Watch armed, a mac_act click is refused: nothing is clicked.
  6. The turn log for a screen turn keeps metadata only: no image data or file path.
  7. Even when the model picks a Safari grab for a my-screen ask, run_tool answers from the whole screen, not the tab.
  8. screen_see is wired: in the model tool list, the HANDS list, the turn code runs it with the hive and vision, and the Jev router knows it.
  9. There is one screen-describe path: the hand reuses see.grab_screen and wants_screen_see is defined once.
  10. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  11. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  12. Every other locked feature still passes its own checks (shared suite, eval and cross-feature checks are run once, not again; probe_eval/06-ci-wired is excused: it needs the workflows permission only Evens can grant).
