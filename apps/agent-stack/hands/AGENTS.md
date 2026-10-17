# hands/ — Jarvis's tools (operator loop)

- `operator.py`: `Task` (durable files under `.hive/operator-tasks/<id>/`: request, messages, trace.jsonl, state.json),
  `Tools` (shell with true exit codes and background jobs, files, Safari DOM, Accessibility, screen, MCP, signal,
  artifact, say, done, ask_owner), `step_once` (one model turn, one gate), `run` (loop with step/time caps),
  `resume`/`recover` (relaunch a dead worker; 30-minute window), `_done_gate` (sends `done` back up to twice:
  research must cite opened pages, open plan steps must close, actions need evidence; after that the finish is unverified).
- Model choice: per-task pools/tiers (`best_in_pool`), 402 → local `local_model.py` (qwen3:4b, light mode).
- Don't add a second browser engine or computer runner; extend the Safari and Accessibility tools.
- A tool returns `{"text": ...}` (+ optional image). Errors are returned as text, never raised past the loop.
- Every live misread becomes a regression test in `test_operator.py` (see `CompletionTruth`, `LivingArtifacts`).
