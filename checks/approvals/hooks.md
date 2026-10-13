# Approval: hooks
- by: Consultant (delegated by Evens)
- at: 2026-10-13T03:43:58-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval ('approve each round's checks yourself and keep building'); 3:36/3:39 AM ET: Consultant builds remaining rounds itself. Consultant approved the hooks drafts.
- checks:
  1. A hard-step tool (send, pay, deploy, book, publish) is blocked before it runs, even when the model picks it for an innocent-sounding ask.
  2. Secret-looking strings (API keys, GitHub tokens, bearer tokens) are redacted from any tool output before Jarvis speaks or logs it.
  3. The real run_tool path applies the redaction: a hand that returns a key never gets it to the spoken line.
  4. A reply that claims work was done (checked, ran, sent, done) with no tool evidence is not passed as verified; with a real tool wire it is.
  5. The hooks run in-process with no network, shell or file writes.
  6. The hooks are wired: run_tool goes through pre_tool, and every tool result passes post_tool and stop_check.
  7. There is one hard-step tool gate: the old inline tool set check in run_tool is gone and the hard tool list lives in hooks.
  8. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  9. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  10. Every other locked feature still passes its own checks (shared suite, eval and cross-feature checks are run once, not again; probe_eval/06-ci-wired is excused: it needs the workflows permission only Evens can grant).
