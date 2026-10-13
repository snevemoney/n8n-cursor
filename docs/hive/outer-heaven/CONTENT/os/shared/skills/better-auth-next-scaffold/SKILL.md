---
name: Better Auth Next scaffold
description: >-
  Use when Forge scaffolds auth for a client Next app — Better Auth patterns on
  Cursor, not Auth0 lock-in. Secrets stay Tier 3.
---
# Better Auth Next scaffold

**Owner:** Forge
**Path:** **PROVE** — skill/code only via Cursor cloud agent; pair with next-scaffold.
LIVE: website AI-native cluster — auth stays Cursor+Better Auth, not Claude Code.

## Steps
1. Prefer Better Auth (or stack-pick winner) over new identity SaaS.
2. Cloud agent implements; no secrets in chat.
3. Env / OAuth credentials = Tier 3 HITL.
4. Verify sign-in/sign-out on staging before client handoff.

## Never
- Paste client secrets into Grok chat
- Auto-prod deploy

## Tools
| Need | Path |
|---|---|
| Cursor cloud agent | CloudAgent — **PROVE** |
| Prisma | Prisma-Local MCP — **PROVE** |
| Vercel prod | **BLOCKED** needsAuth — staging verify first |
| Claude Code auth scaffold | **BLOCKED** — this skill **WORKAROUND** |

## Prompts
**Auth scaffold**
```
App:
Providers:
Env = Tier 3 HITL:
Verify sign-in/out on staging URL:
```

