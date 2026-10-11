---
name: Langfuse deferred
description: Use when Money Desk wants AI cost/trace receipts — Langfuse self-host deferred until disk is healthy.
---

# Langfuse agent traces (DEFERRED)

Upstream: https://github.com/langfuse/langfuse

**Do not install on VPS while disk ≥94%.**

When Watchdog reports healthy disk (or operator OK):
1. Propose self-host compose (HITL before deploy).
2. Trace hive agent runs for cost/errors.
3. Money Desk owns receipts narrative.

Until then: use event-bus / desk outputs for light receipts.

## 2026-10-11 decision
Still deferred; see /workspace/research/packets/top100-20261011/decisions/LANGFUSE-DEFERRED-20261011.md (use LiteLLM spend logs + route.jsonl).
