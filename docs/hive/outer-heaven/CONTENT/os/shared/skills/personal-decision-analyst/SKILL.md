---
name: Personal decision analyst (Demkinn #39)
description: >-
  Use when a consequential call needs a written frame, or when asking a cloned
  public-expert board (YouTube/disk transcripts) before the operator decides.
  Triggers: "grill the board", "ask the board", "what would X say", Demkinn #39.
  Anti-triggers: leisure hypotheticals, farms, NSFW, minting advisor desks,
  quoting educator raises as FACT.
---
# Personal decision analyst (Demkinn #39)

**Owner desk:** Consultant  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/39  
**Status:** owned  
**HITL:** ASK if Tier 3


## Tools
| Need | Path |
|---|---|
| Decision frame write | decision-ledger-md / packet — **PROVE** |
| Fact inputs | WebSearch + claim-verifier — **PROVE** |
| Execute money/legal action | **BLOCKED** without ASK (Tier 3) |

## Prompts
**Decision analysis**
```
Run Demkinn #39 personal-decision-analyst.
Decision: […]
Constraints: […]
Map: upside · downside · reversibility · cost · time · opportunity cost · unknowns · best/worst case.
Recommend frame only — operator decides. ASK if Tier 3. claim-verifier on $ inputs.
```

**Reversibility check**
```
Is this decision reversible? Score 1–5 with unwind cost:
[paste]
```

## When
Consequential decision

## Do
1. Map: upside · downside · reversibility · cost · time · opportunity · unknowns · best/worst
2. Operator decides; ASK if Tier 3
3. Log to decision ledger

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## Austin board-of-advisors 2026-09-01 (`yt:IiZ5HRaeX4s`) Whisper FACT

Steal: clone 2+ **public** experts who already have a body of work (YouTube first), ingest their corpus, then one skill loops every member into a single memo. Operator decides.

### Sequence
1. Interview the operator (goals 1y / 5y / 10y). Voice dump OK — [voice-ramble-session-context](sand-workflow:voice-ramble-session-context). Wispr Flow cloud **BLOCKED**; [local-push-to-talk-dictation](sand-workflow:local-push-to-talk-dictation) **WORKAROUND**.
2. Name 2+ board members with **public** training data. Prefer creators already on disk under `/workspace/research/youtube-daily/transcripts/<id>/full.txt`. Do not require Composio YouTube.
3. Ingest FACT quotes into a packet / Outer Heaven topic (state vs event via [wiki-ingest](sand-workflow:wiki-ingest)). Label INFERENCE.
4. Skill `ask-the-board`: loop every member, then one combined memo with disagreements called out. Write the frame to [decision-ledger-md](sand-workflow:decision-ledger-md).
5. Remap Claude Code project / `/ask-the-board` → Cursor CloudAgent + this skill. No second desktop.

### Tools
| Need | Path |
|---|---|
| Disk transcripts | `/workspace/research/youtube-daily/transcripts/<id>/full.txt` — **PROVE** |
| Decision ledger | decision-ledger-md — **PROVE** |
| Cursor CloudAgent | **PROVE** (Claude Code **WORKAROUND**) |
| Composio YouTube | **WORKAROUND** disk transcripts |
| ClickUp | **WORKAROUND** ACTION_LOG.jsonl |
| Wispr Flow | **BLOCKED** — local dictation **WORKAROUND** |
| Mint advisor desks / Claude Cowork board | **BLOCKED** |

### Prompt
```
Interview me until shared understanding (1y/5y/10y).
Propose 2+ public experts with disk-transcript or public URL corpus.
Ingest FACT quotes only. Skill: ask-the-board → one memo + disagreements.
Operator decides. ASK if Tier 3. No new desk. $ / raise claims UNVERIFIED.
```

$18M raise / Hostinger promo / 10x swagger on tape = **UNVERIFIED**. Do not quote.

