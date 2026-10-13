# Approval: plan_budget
- by: Consultant (delegated by Evens)
- at: 2026-10-13T04:24:13-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval ('approve each round's checks yourself and keep building'); 3:36/3:39 AM ET: Consultant builds remaining rounds itself. Consultant approved the plan_budget drafts.
- checks:
  1. A plan ask returns numbered steps and fires no tools, even if the model's text contains a tool call.
  2. Without a model, Jarvis says it cannot draft the plan right now instead of inventing one.
  3. Asks like plan how to... / make a plan for... go to the plan verb; small talk, what is the plan, and file reads do not.
  4. Turn context is capped: the brief sent to the model never exceeds the byte budget, short briefs pass unchanged, and the turn applies the cap.
  5. Every turn log row carries a cost bucket: free for model-free turns, cheap for small models, frontier for big ones.
  6. A failed or UNKNOWN turn adds a roadblock entry (verb + outcome only, no text) to its log row; a good turn has none.
  7. plan is wired: in the model tool list, the HANDS list, the turn code runs it with a no-tools talk call, and the Jev router knows it.
  8. There is one budget function and one cost-bucket rule: fit_budget and cost_bucket are defined once.
  9. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  10. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  11. Every other locked feature still passes its own checks (shared suite, eval and cross-feature checks are run once, not again; probe_eval/06-ci-wired is excused: it needs the workflows permission only Evens can grant).
