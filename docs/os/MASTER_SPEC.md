# Evens AI Operating System — Master Spec

In-repo control-plane rules. Durable operator memory still lives in
`docs/hive/outer-heaven/OPERATOR_MEMORY.md`.

**Stack:** Cursor + Grok Bot. **Daily notify:** Grok Watchdog / Grok chat.
Telegram and Scorpion are **legacy**, not the sink. n8n = webhooks / cron / gap-fill only.

The n8n × Grok inventory matrix (PR #83) lives on a separate branch
(`docs/hive/N8N_GROK_MATRIX.md`). This file stands alone.

---

## Pre-gate / post-log

Operator rule 2026-08-27: every workflow, tool, and skill pairs a **PRE-GATE** with a **POST-LOG**.

**How-to:** pre before tool, post after.

| Side | Can block? | Hook names | Hive CLI | Exit |
|------|------------|------------|----------|------|
| **PRE** | Yes | PreToolUse, UserPromptSubmit, Stop | `python3 scripts/hive/os/pre-gate.py --can-act AGENT PROJECT` | **2** when `decision != RUN`; **0** on RUN |
| **POST** | No | PostToolUse, Notification, SessionStart | `python3 scripts/hive/os/post-log.py --agent A --action X --outcome Y --correlation-id ID` | **Always 0** |

PRE wraps `product-state.py --can-act` / `should-run.py`. Not RUN = block. Local product-state only; no network.

POST logs one JSON line (`agent`, `action`, `outcome`, `correlationId`) via `event-bus.py` if present, else `~/.grokbot/os-audit.jsonl`. A failed write prints a warning to stderr and still exits 0. SessionStart cannot prevent the session.

**Owner:** Watchdog. **Skill:** `scripts/hive/grok-skills/pre-gate-post-log.md`. **Notify:** Grok. Do not wire Telegram or Scorpion as the sink.

Self-test: `python3 scripts/hive/os/pre-gate.py --self-test` · `python3 scripts/hive/os/post-log.py --self-test`.

Repo-local Claude/Cursor hook wiring only if a `.claude` / `.cursor` hooks settings pattern already exists. Do not create a Claude product install. Do not overwrite operator `~/.claude`.
