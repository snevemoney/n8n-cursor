# Approval: mcp_inventory
- by: Consultant (delegated by Evens)
- at: 2026-10-13T03:51:10-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval ('approve each round's checks yourself and keep building'); 3:36/3:39 AM ET: Consultant builds remaining rounds itself. Consultant approved the mcp_inventory drafts.
- checks:
  1. Asked which MCP servers it has, Jarvis lists the server names found in the Claude, Cursor and Codex configs (including per-project ones).
  2. The inventory holds names and which platform only: no env values, commands, args, URLs or tokens appear anywhere in the output.
  3. A missing or broken config file is skipped without crashing, and the reply says how many were skipped.
  4. Asks like which MCP servers do you have / list your MCP tools go to the inventory; small talk, skills and file reads do not.
  5. The inventory only reads config files: no starting servers, no shell, no network, no writes.
  6. mcp_inventory is wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
  7. There is one MCP inventory path: wants_mcp_inventory is defined once and only the inventory hand parses MCP configs.
  8. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  9. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  10. Every other locked feature still passes its own checks (shared suite, eval and cross-feature checks are run once, not again; probe_eval/06-ci-wired is excused: it needs the workflows permission only Evens can grant).
