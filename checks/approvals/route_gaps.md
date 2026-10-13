# Approval: route_gaps
- by: Consultant (delegated by Evens)
- at: 2026-10-13T08:57:11-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval ('approve each round's checks yourself and keep building'); 8:18 AM ET: 'Fix Jarvis until all 30 are done. Routed and capable.' Consultant approved the route_gaps drafts (scorecard caps 2, 13, 17, 22, 25, 30).
- checks:
  1. "What does git status say?" goes to the file-read hand and reports clean vs. changed from real git, not a guess.
  2. Asking to read .env, an SSH key or ~/.grok-private goes to the file-read hand, which refuses it without a model call and never shows the contents.
  3. Restart, reboot or shut down a server/VPS is a hard step (needs Evens's OK); a VPS status ask is still a read.
  4. "List the tools on your read-only MCP server" goes to mcp_call (tool list), not the server inventory.
  5. "Cancel the disk space loop" cancels the loop that checks disk space (its full subject), but a fragment like "disk" still cancels nothing.
  6. "Read the file X.txt in my Downloads" reads Downloads/X.txt (not the repo).
  7. The new routes are live in the one model-free router the turn and the probe eval both use.
  8. One router and one secret rule: model_free_route and is_hard_step are defined once; the secret-name rule lives only in workspace_read.
  9. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  10. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  11. Every other locked feature still passes its own checks, with no exclusions (shared suite, eval and cross-feature checks run once).
