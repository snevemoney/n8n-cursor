# Researcher — n8n legacy one-pager
**Labels:** FACT = estate inventory names · UNVERIFIED nodes · script-first

## Role in estate
Research/RAG/summarize. **Prefer** `web-learning-cycle.py` / `hive-web-research.py` over n8n. Catalog `hive-web-learning-cycle` is script path, not a hive JSON webhook.

## Workflows you own (table)

| Live name | JSON file | Trigger | HITL | When to use | Status |
|-----------|-----------|---------|------|-------------|--------|
| *(script)* hive-web-learning-cycle | — | VPS/Mac cron script | no | Prefer Python cycle | Catalog note **FACT**; no hive webhook JSON |
| Company research | *(no hive JSON)* | UNVERIFIED | no | Company packets | ACTIVE **FACT** name |
| Market research | *(no hive JSON)* | UNVERIFIED | no | Market packets | ACTIVE **FACT** name |
| Summarize site | *(no hive JSON)* | UNVERIFIED | no | Page summarize | ACTIVE **FACT** name |
| Website scraper | *(no hive JSON)* | UNVERIFIED | no | Scrape | ACTIVE **FACT** name |
| Build a PDF Document RAG System… | *(no hive JSON)* | UNVERIFIED | no | Pick **one** RAG (3 active dupes — hygiene) | ACTIVE **FACT** names (dupes) |
| Demo: RAG in n8n 4 | *(no hive JSON)* | UNVERIFIED | no | Demo only — prefer not prod | ACTIVE **FACT** name |

Inactive library (**FACT** names): Research anything, AI Research Agent*, paper collection — do not fire.

Secondary: founder-signal / market-signal research packets with Big Boss / Lead Hunter — never spam webhooks.

## How they work (nodes — from JSON)
**No hive-owned research workflow JSON in `workflows/hive/`.** All ACTIVE research rows above are **UNVERIFIED nodes** — learn via Visual SOP screenshots before calling.

## Call recipe
```bash
# Prefer scripts (paths under Mac repo scripts/hive/)
python3 scripts/hive/web-learning-cycle.py   # if present
python3 scripts/hive/hive-web-research.py    # if present
```
Do **not** blind POST research scrapers. If operator scopes a named ACTIVE flow, screenshot first, pass correlationId, rate-limit.

## Failures → visual SOP
**FACT (estate ritual):** On fail/off/drift — open https://evenslouis.ca/n8n (read-only) → screenshot (a) full canvas, (b) failing node params+error, (c) Executions detail → attach to operator / Forge. Login/2FA → `request_box_help`. Never wipe `n8n_data`, never n8ncloud, no activate without Tier 3.

## Do NOT
- Spam research webhooks / duplicate RAG runs.
- Treat Demo RAG as production.
## Do NOT
- Invent nodes/paths not in JSON or estate map (**FACT** estate: 177 / 69 active / 108 inactive).
- Paste `X-Hive-Secret` / Telegram / bearer values in chat.
- Auto-approve money, client send, merge main, activate inactive, wipe volumes.
- Treat archived rows as callable even if `active=true`.
