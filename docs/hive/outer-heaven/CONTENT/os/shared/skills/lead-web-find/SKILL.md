---
name: Lead web find
description: >-
  Use for web-only prospect hunts that must return URL, constraint sentence, and
  contact path.
---
# Lead web find

1. Pick ICP slice. 2. Find book/apply/contact friction. 3. Capture URL + constraint + contact. 4. Note leakage. 5. Hand Researcher — do not draft send.

Anti-patterns: CE ingest; imply send.


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.

## HITL lookalike → score → contacts 2026-09-01 (`yt:ESIxitOLYoQ`) FACT timedtext

Remap Claude Code / DiscoLite / AI Arc / Clay CLI → Grok + Cursor + public web. No send. ClickUp → ACTION_LOG.jsonl.

Pipeline (HITL, not YOLO until the market is annealed):
1. Seed: a closed-won URL or a live site we actually like.
2. Find lookalike accounts on the public web. Score each: strong / marginal / noise / reseller / agency-leak / broken domain.
3. Contacts **only after** score. Still return URL + constraint sentence + contact path.
4. Exclusion nuance lives in a **reference file**, not a one-shot prompt. Software ICP will leak agencies — do not nuke the word "marketing" if we want marketing **software**. Prefer homepage tells: docs / API / integrations / free-trial CTA vs brochure.
5. After the sitting: session-review the log → patch the exclusion file ([improve-system-writeback](sand-workflow:improve-system-writeback)).

YOLO only after a campaign we already ran by hand. Building mode: catalog only, no outreach, no new icp_id.

## Tools add
| Need | Path |
|---|---|
| Public web / company-web-leak-pass | **PROVE** |
| ACTION_LOG.jsonl | **PROVE** |
| DiscoLite / AI Arc / ClayGen / Clay CLI | **BLOCKED** — would work if we had those CLIs + paid seats |
| Auto-send | NEVER |

## Enrich 2026-10-10: X-bookmark backlog study (signals-2mo-backlog-20261010)
- **Fetch-and-clean stack.** crawl4ai (LLM-ready markdown, no key) and markitdown cover most needs. Stealth scrapers (Scrapling, curl-impersonate) raise ToS risk and must pass the import gate (x:2068300454275224045; repos gated in this packet).
- **Outreach with the prospect's own improved asset.** Show them their own asset, redrafted on-brand. Any send or scrape step needs consent/ToS review and operator approval (x:2050670006388834309).
