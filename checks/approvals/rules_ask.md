# Approval: rules_ask
- by: Consultant (delegated by Evens)
- at: 2026-10-13T09:44:35-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval; 8:18 AM ET 'Fix Jarvis until all 30 are done.' Consultant approved the rules_ask drafts (scorecard cap 11).
- checks:
  1. "What are your operating rules?" is answered from JARVIS.md itself (every rule, no model), so the answer always matches the file.
  2. Asks about other rules (client sends, who can merge, PASS) still go to their existing answers, not the rules list.
  3. rules is wired: in the HANDS list, the model-free router, and the turn code runs it.
  4. JARVIS.md is read in one place (jarvis_rules), and wants_rules is defined once.
  5. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  6. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  7. Every other locked feature still passes its own checks, with no exclusions (shared suite, eval and cross-feature checks run once).
