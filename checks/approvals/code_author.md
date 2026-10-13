# Approval: code_author
- by: Consultant (delegated by Evens)
- at: 2026-10-13T09:42:08-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval; 8:18 AM ET 'Fix Jarvis until all 30 are done.' Consultant approved the code_author drafts (scorecard caps 7, 20). Running model-written code stays behind confirm.
- checks:
  1. "Run this python and tell me the output: print(sum(range(10)))" runs exactly that code in the sandbox and says 45.
  2. "Write a python function that ... and run its test" makes the builder model write code and a test, a critic from a different model family reviews it, nothing runs yet, and Jarvis asks for "confirm"; "confirm" then runs it in the sandbox.
  3. The critic is always from a different model family than the builder (deepseek -> mistral, mistral/other -> deepseek).
  4. If the model can't write the code (no key, timeout, no code block), Jarvis says so, runs nothing and arms no confirm.
  5. The code_run turn path calls hands/code_author for authoring asks, and the critic model is written into the code_run log meta.
  6. One builder/critic rule: critic_for and family are defined once, in hands/code_author.py.
  7. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  8. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  9. Every other locked feature still passes its own checks, with no exclusions (shared suite, eval and cross-feature checks run once).
