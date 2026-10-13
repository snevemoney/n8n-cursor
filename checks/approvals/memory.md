# Approval: memory
- by: Consultant (delegated by Evens)
- at: 2026-10-13T03:01:40-0400
- words: Evens at 2:01 AM ET Oct 13 delegated check approval to Consultant: 'approve each round's checks yourself and keep building'. Consultant approved the memory drafts (cowork round, 2026-10-13).
- checks:
  1. Something Jarvis is told to remember is still there after a restart (a fresh process reads it back).
  2. Forget really deletes: after forget, recall does not return it and the text is gone from the file.
  3. The default memory file lives outside the repo (private), and is readable only by Evens (mode 600).
  4. The log line for a memory turn has metadata only (op, ok, count), never the remembered text.
  5. Asks like remember that..., what do you remember, forget ... go to memory; small talk and file reads do not.
  6. memory is actually wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
  7. There is one durable memory path: wants_memory is defined once and no second remember store exists.
  8. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  9. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  10. Every other feature already locked on this branch still passes its locked checks (its shared test-suite check is covered by check 8).
