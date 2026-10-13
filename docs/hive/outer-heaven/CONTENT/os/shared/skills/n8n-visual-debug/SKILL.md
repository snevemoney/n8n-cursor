---
name: n8n visual debug
description: >-
  use this when an owned n8n workflow fails — browser canvas + screenshots
  before guessing
---
# n8n visual debug

When an owned https://evenslouis.ca/n8n workflow is off, failing, or drift-suspect.

## Steps
1. Prefer Grok plugins/scripts first; only then open n8n UI (read-only).
2. Browser-navigate to the workflow **canvas** (not only Executions list).
3. Screenshot: (a) full node graph, (b) failing node parameters + error, (c) Executions detail for the bad run.
4. Attach screenshots in operator chat; ping Forge if a fix/PR is needed.
5. Do not guess the graph from memory — pixels beat prose.
6. Login/2FA → hand box to operator; never ask for passwords in chat.
7. Zero-loss: no credential edits, activate toggles, or volume wipes without Tier 3.

## Owners
Watchdog (health/failures), Forge (fix loops); other agents when their map row misbehaves.

See CONTENT/n8n-learning/agent-workflow-map.md
