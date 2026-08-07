# Context engineering

The only primitive is the context window. Put the **right** tokens in — not more tokens.

## Rules for this hive

1. **Filesystem first** — ADRs, external facts, hive canon, program-design docs live on disk.
2. **Load index** — use [AGENT_LOAD_INDEX.md](./AGENT_LOAD_INDEX.md); don't dump all of `docs/`.
3. **Deterministic preload** beats MCP scavenger hunts for static facts.
4. **Dumb zone** — when results degrade, compact into a handoff doc and start a fresh session.
5. **Steering vs openness** — specify how when you care; leave room when exploration is valuable.
6. **Human reads logic** — do not run a light factory that stops understanding the product.
