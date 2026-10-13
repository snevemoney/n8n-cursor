# Approval: probe_eval
- by: Consultant (delegated by Evens)
- at: 2026-10-13T02:32:59-0400
- words: Evens at 2:01 AM ET Oct 13 delegated check approval to Consultant ('approve each round's checks yourself and keep building'), restated 2:10 AM ET ('approval stays delegated to Consultant'). Consultant approved these 9 probe_eval checks.
- checks:
  1. The eval holds exactly the 17 test asks from the live probe, each with the hand it should go to.
  2. The eval replays all 17 asks offline in under 15 s, with no network or model, and prints a score out of 17.
  3. A baseline is stored in the repo and today's routing passes at least the 9 hands that exist (files, repo, Downloads, web, browser, screen, VPS, say).
  4. If a probe that passes in the baseline stops passing, the eval exits non-zero (this is what fails the PR).
  5. A probe that newly passes does not fail the eval; it is reported as an improvement to add to the baseline.
  6. CI runs the eval on every PR that touches apps/agent-stack.
  7. The eval scores the real routing: the turn code and the eval both call model_free_route.
  8. There is one model-free route decision: model_free_route is defined once, and the eval has no copy of the routing rules.
  9. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
