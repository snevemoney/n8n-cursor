# Approval: workspace_read
- by: Evens
- at: 2026-10-13T01:52:10-0400
- words: Evens approved at 1:51 AM ET Oct 13: build Jarvis to frontier level, lock the 11 draft checks in PR #628
- checks:
  1. Jarvis can read a real file inside an allowed folder and gives back its actual first line, not a made-up one.
  2. Jarvis refuses to read secrets (.env, keys, ~/.grok-private, ssh) and anything outside the allowed folders, including ../ and symlink escapes.
  3. A big file comes back cut to a fixed size with a clear 'truncated' note, so a read can't flood the answer.
  4. Asked which repo/branch it is on, Jarvis reports the real branch and HEAD from git (and says 'detached' when it is), never a guess.
  5. Listing a folder (like Downloads) returns file names only, at most 50, and never file contents.
  6. The reader can never change anything: no file writes, no deletes, and git is only asked read-only questions.
  7. Asks like "read the first line of README.md", "what branch are you on", "list my Downloads" and "which repos do you have" go to the reader; small talk does not.
  8. The turn log keeps metadata only for reader turns: no file text and no absolute home paths.
  9. workspace_read is actually wired: the model can call it (it is in the tool list) and the turn code runs it.
  10. There is only one file reader for answers: no second ad-hoc reader elsewhere in brain/ or mouth/.
  11. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
