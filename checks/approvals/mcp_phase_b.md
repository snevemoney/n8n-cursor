# Approval: mcp_phase_b
- by: Consultant (delegated by Evens)
- at: 2026-10-13T04:26:22-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval ('approve each round's checks yourself and keep building'); 3:36/3:39 AM ET: Consultant builds remaining rounds itself. Consultant approved the mcp_phase_b drafts.
- checks:
  1. Jarvis can start the one allowlisted stdio MCP server and list its tool names.
  2. A server that is not on the allowlist is refused and never started.
  3. Tokens and env values never appear in what Jarvis returns or says, even if the server echoes them.
  4. Only the read-only handshake and tools/list are sent: Jarvis never calls a tool on the server in this phase.
  5. A hung server is stopped within 6 seconds and Jarvis says it did not answer.
  6. Asks like list the tools on the X MCP server go to the MCP call hand; which MCP servers still goes to the inventory.
  7. mcp_call is wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
  8. There is one MCP client: only hands/mcp_call.py speaks JSON-RPC to MCP servers, and it reuses the inventory for server names.
  9. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  10. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  11. Every other locked feature still passes its own checks (shared suite, eval and cross-feature checks are run once, not again; probe_eval/06-ci-wired is excused: it needs the workflows permission only Evens can grant).
