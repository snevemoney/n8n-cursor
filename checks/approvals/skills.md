# Approval: skills
- by: Consultant (delegated by Evens)
- at: 2026-10-13T03:01:11-0400
- words: Evens at 2:01 AM ET Oct 13 delegated check approval to Consultant: 'approve each round's checks yourself and keep building'. Consultant approved the skills drafts (cowork round, 2026-10-13).
- checks:
  1. Asked which skills it has, Jarvis lists the real names from SKILL.md files on disk, nothing invented.
  2. Jarvis can read one named skill's text; an unknown name or a path like ../ is refused, and long skills are capped at 16 KB.
  3. A short JARVIS.md rules file exists (2 KB or less) and the turn prompt loads it.
  4. Asks like which skills do you have / read the feature-loop skill go to the skills hand; small talk and file reads do not.
  5. The skills hand only reads: no writes, no shell, no network.
  6. skills is actually wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
  7. There is one skills path: wants_skills and the skills hand are defined once.
  8. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  9. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  10. Every other feature already locked on this branch still passes its locked checks (its shared test-suite check is covered by check 8).
