# Program design (Dexter method)

Spend a little time up front so the agent does not invent choices you will hate later.

## When to use

| Situation | Use full 4 stages? |
|-----------|--------------------|
| Money path, hive APIs, multi-repo, HITL surfaces | **Yes** |
| Team / maintain-for-6-months work | **Yes** |
| Tiny UI tweak you already trust | Light touch OK |
| Pure pre-PMF throwaway experiment | Vibe OK — still keep lane/HITL |

## The four stages

1. [Product](./01-product.md) — problem, measurable success, working-backwards post, HTML mocks (no schema)
2. [Architecture](./02-architecture.md) — services, endpoints, tables, flows
3. [Program design](./03-program-design.md) — files, types/signatures, call stack, tests, uncertain choices
4. [Vertical slices](./04-vertical-slices.md) — thin end-to-end first; ban horizontal dumps

Also: [CONTEXT_ENGINEERING.md](./CONTEXT_ENGINEERING.md) · [AGENT_LOAD_INDEX.md](./AGENT_LOAD_INDEX.md)

Templates: [`templates/program-design/`](../../templates/program-design/)
