# Evens Louis Hive — start here

Plain-English map of every project, how they talk to each other, and how agents must work.

If you are confused, read this file, then [USER_INTENT.md](./USER_INTENT.md), then the product you care about in [PRODUCT_ENCYCLOPEDIA.md](./PRODUCT_ENCYCLOPEDIA.md).

## One sentence

**Telegram / OpenClaw** = remote control · **n8n** = automation bus · **Client Engine `/pro`** = money desk · **Scorpion** = ops cockpit · **`/` + `/work`** = only public face.

## Who is trusted

| Audience | Sees |
|----------|------|
| Visitor | `/` and `/work` only |
| Client | portals / links Evens creates — not dashboards |
| Operator (Evens only) | `/pro`, `/n8n`, `/scorpion`, `/claw`, parked tools |
| Machines | n8n webhooks + `/claw/hooks*` (no basic_auth) |

## Hard rules (never break)

See [../wip-program/HARD_RULES.md](../wip-program/HARD_RULES.md). Short version:

1. One money OS — Client Engine  
2. One agent face — OpenClaw / Telegram  
3. One ops cockpit — Scorpion  
4. HITL for spend, client send, prod deploy, delete data, secrets, `openclaw.json`  
5. Never wipe OpenClaw souls/topics or `n8n_data`  
6. Products must not be confused with each other  

## How agents must work (Dexter method)

Before medium/large features: **Product → Architecture → Program design → Vertical slices**.  
Details: [../program-design/README.md](../program-design/README.md).

## Solo vs hive

Every repo has two modes:

- **Solo** — open that repo alone; it still makes sense and can run.
- **Hive** — it talks to others via Telegram topics, n8n, hive APIs, or portfolio catalog — without owning their jobs.

## Index

| Doc | Purpose |
|-----|---------|
| [USER_INTENT.md](./USER_INTENT.md) | Who Evens is + success criteria (from chats) |
| [PRODUCT_ENCYCLOPEDIA.md](./PRODUCT_ENCYCLOPEDIA.md) | Every product: solo + hive + unfinished |
| [INTEROP_CONTRACTS.md](./INTEROP_CONTRACTS.md) | How systems call each other |
| [DAY_IN_THE_LIFE.md](./DAY_IN_THE_LIFE.md) | Where Evens goes for each need |
| [CONFUSION_LOG.md](./CONFUSION_LOG.md) | Repeated clarifications — stop re-asking |
| [CHAT_SOURCES.md](./CHAT_SOURCES.md) | Which local Cursor chats were mined |
| [ACQUIRE_DELIVER_IMPROVE.md](./ACQUIRE_DELIVER_IMPROVE.md) | Knowledge / learning loop |
| [PROPAGATION_STATUS.md](./PROPAGATION_STATUS.md) | Sibling repo pack roll-out |

Path map: [../guides/deployment/EVENSLOUIS_PRODUCT_MAP.md](../guides/deployment/EVENSLOUIS_PRODUCT_MAP.md)  
Repo registry (code): `packages/shared-config/src/repo-registry.ts`
