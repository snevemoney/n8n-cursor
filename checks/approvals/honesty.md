# Approval: honesty
- by: Consultant (delegated by Evens)
- at: 2026-10-13T02:11:42-0400
- words: Evens at 2:01 AM ET Oct 13 delegated check approval to Consultant ('approve each round's checks yourself and keep building'), restated 2:10 AM ET ('approval stays delegated to Consultant'). Consultant approved these 9 honesty checks.
- checks:
  1. A reply that only promises an action ('I'll check your Downloads folder') with no tool run becomes an honest 'I can't do that yet' line.
  2. Replaying the 6 promise-style replies from the 17-ask probe (test asks only) leaves 0 'I'll…/Let me…' promises that no tool backed.
  3. Real answers are left alone: a joke, a file line, or a past-tense 'I checked' result is not changed.
  4. A repeated hand reply never opens 'Sir. Again, sir. Done.'; hands without their own line get plain 'Sir.' plus the answer.
  5. A turn answered by a deterministic hand that worked (file read) reports ok=true, not ok=false.
  6. A hand that failed (file not found) still reports ok=false: the fix does not paint failures green.
  7. The promise guard is actually wired: the turn code in brain/pipeline.py calls it before the reply is committed.
  8. There is one promise guard: no second promise regex or guard elsewhere in brain/, mouth/ or hands/.
  9. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
