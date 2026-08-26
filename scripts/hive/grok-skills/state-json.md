---
name: state-json
description: >-
  Durable facts and run logs live in a typed hive state.json the next
  run can read — not only the chat. Filter one key into the model.
  Do not dump the store. Use when a desk wakes more than once, writes
  last-run, or is about to paste a table into context. Cursor plus Grok Bot.
---

# State.json

**Stack:** Cursor + Grok Bot. Typed store, not a chat memory dump.

**Upgrade:** `UPG-nate82-state-json`  
**Sources:** `tDGiWn0flK8` · `QCjMBOEhpLE` · `lcNN3X9gXls` · `gb5TlGw6Uks` · `27Y44JYXZJ8` (timestamps UNKNOWN, caption-only)  
**Cursor copy:** `.cursor/skills/state-json/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/state-json/SKILL.md`  
**Store:** `docs/hive/outer-heaven/.hive/state.json`  
**CLI:** `python3 scripts/hive/hive-state.py get --key <last_run|jobs|profile|ids|product_factory>`

**Contradiction (keep labeled):** Native table lost to Sheets at ~400 rows. Stale `memory.md` was named #1 weird. Hosted managed agents were stateless except the system prompt. Do not flatten. Do not migrate hive SSOT to n8n Data tables.

## When

A desk wakes more than once. Coverage-loop / spawn / observe-pane / token-receipt. About to paste a store or table into the model.

## Card (required before a model sees state)

```
STORE: docs/hive/outer-heaven/.hive/state.json
FILTER: last_run | jobs | profile | ids | product_factory | one job id
ROWS: 1 slice
```

No filter → do not pass the store. `cat state.json` into the model is a fail.

## Steps

1. Write durable facts with the CLI, not only in chat.
2. Next run: `get --key last_run` (or `jobs --status yellow`). One key.
3. IDs are monotonic. Deleting a job row does not reset `next_run_id`.
4. Pair with `filter-then-llm`. Pair jobs with `observe-pane`.
5. Soft-done still needs Evens on send / pay / deploy / book / publish.

## Coverage-loop job (the wired instance)

After a scored iteration:

```
python3 scripts/hive/hive-state.py log-run --job coverage-loop --desk parent \
  --done-check "score fields written; one system wired or dry-ran" --stop-kind metric
```

Do not dump `log[]` into the prompt.

## Stop

Send / pay / deploy / book / publish = operator. This skill never closes a hard step.

## Never

Dump the store · n8n Data tables as hive SSOT · keys in state.json · reset IDs on delete · treat chat as the next-run memory · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
