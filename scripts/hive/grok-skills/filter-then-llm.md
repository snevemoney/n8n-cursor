---
name: filter-then-llm
description: >-
  Deterministic narrow (email = from, workflow = name, state = one key)
  then LLM. Dumping hundreds of rows is tokens + hallucination.
  Use before a table, inbox, or state.json hits the model.
  Cursor plus Grok Bot.
---

# Filter, then LLM

**Stack:** Cursor + Grok Bot. Types/formats are the tool contract.

**Upgrade:** `UPG-nate82-filter-then-llm`  
**Sources:** `QCjMBOEhpLE` · `lcNN3X9gXls` · `HN0oWxbF2bM` (timestamps UNKNOWN, caption-only) · **merged `RDytbVDzMF4`** research-before-chart (Firecrawl on-tape; hive = existing CLI) · **merged `lRUpu2-KtGQ`** scrape after YouTube block — filter HTML first, no new vendor this pass  
**Cursor copy:** `.cursor/skills/filter-then-llm/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/filter-then-llm/SKILL.md`

**Contradiction (keep labeled):** Table faster vs 400-row lose. Do not crown native tables. Do not stand up n8n tables as hive SSOT.

## When

Retrieval-into-prompt. Inbox classify. Librarian store. `state.json`. Any “here is the table.”

## Card (required before the model)

```
STORE: state.json | inbox | file | table
FILTER: <key or query>
ROWS: <n after filter — must be small>
```

No FILTER → do not pass the store.

## Steps

1. Deterministic get-where first: `from:`, unread, name=, `--key last_run`, one job id.
2. Allow-list keys. Do not dump columns the model does not need.
3. Then LLM on the narrow slice.
4. Inbox: `inbox-to-task-routing` must filter before classify.
5. State: `hive-state.py get --key …` — never `cat state.json` into the model.

## Inbox + state (the wired instance)

```
STORE: inbox
FILTER: unread OR from:<known> OR HITL label
ROWS: ≤ a handful this session
```

```
STORE: state.json
FILTER: last_run
ROWS: 1
```

## Stop

Send / pay / deploy / book / publish = operator.

## Never

Dump hundreds of rows · n8n Data tables as SSOT · vector-first when a key exists · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
