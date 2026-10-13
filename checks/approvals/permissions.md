# Approval: permissions
- by: Consultant (delegated by Evens)
- at: 2026-10-13T12:03:50-0400
- words: Evens 12:00 permission-mode order; Consultant review
- checks:
  1. Edits in scratch, sandbox runs, branches/commits off main, read-only MCP and web reads are allowed with no confirm.
  2. Sends, spend, deletes outside scratch, merges to main, pushes, deploys/VPS, secrets and global rule edits always need a confirm, even with auto-accept on.
  3. Outside scratch, edits in an allowed workspace wait for confirm until Evens turns auto-accept edits on; turning it off gates them again.
  4. A scratch-repo task makes a new branch, writes code + test, runs the test in the sandbox and commits on that branch only; main is untouched and nothing is pushed; every step is logged.
  5. If the test fails in the sandbox, Jarvis says so and does not commit.
  6. Code run by the workbench still cannot read files in $HOME (secrets stay out of the sandbox).
  7. The pipeline routes scratch-repo asks and the auto-accept toggle to the workbench hand.
  8. The existing agent-stack test suite still passes (known pre-existing serve.py TURN_WALL failure excepted).
