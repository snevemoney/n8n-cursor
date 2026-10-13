---
name: Connect existing software (Demkinn #51)
description: >-
  Use when: Integration ask
---
# Connect existing software (Demkinn #51)

**Owner desk:** Big Boss  
**Lane:** hive-os  
**Sources:** demkinn skills/51, mcp demo thesis

## When
Integration ask

## Do
1. Prefer existing connectors
2. Thin glue
3. No second OS

## Don't
- Rebuild Claude inside Grok

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## Tools
| Need | Path |
|---|---|
| MCP/auth | GetMcpServerStatus — **PROVE** |
| Composio | **BLOCKED** needsAuth |

## Prompts
**Connect map**
```
Systems we have vs need.
PROVE connected · BLOCKED would-work-if · no new SaaS without ASK.
```
