---
name: Osmani API boundaries
description: >-
  Use when designing or changing APIs/interfaces — clear contracts and ownership; remaps Osmani api-and-interface-design.
---
# Osmani API boundaries

Source: addyosmani/agent-skills `api-and-interface-design` (MIT).

## When
New HTTP/tool/MCP surface or changing an existing contract.

## Do
1. Name inputs, outputs, errors, auth, and owner desk.
2. Prefer narrow write tools + HITL for money/send/deploy.
3. Document in the CapEx/plan note before clients depend on it.

## Don't
Silent breaking changes. Secrets in ordinary repo docs.
