---
name: AI ideas from pain (Demkinn #10)
description: >-
  Use when: After pain list exists. Demkinn #10. Owner Consultant.
merged_from: [paid-pain-points]
---
# AI ideas from pain (Demkinn #10)

**Owner desk:** Consultant  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/10  
**Status:** owned  
**HITL:** ASK before build


## Tools
| Need | Path |
|---|---|
| Pain list input | artifact from #9 — **PROVE** |
| Market / competitor skim | WebSearch — **PROVE** |
| SKU / margin sketch | Consultant brief on disk — **PROVE** |
| Build / deploy | **BLOCKED** without operator ASK — draft only |

## Prompts
**Ideas from pain list**
```
Run Demkinn #10 ai-ideas-from-pain.
Pain list (from #9):
[paste]
Stack assumption: Grok+Cursor; no new agents.
For each viable pain: AI fit (partial/full) · rank (severity/pay/reach/difficulty/competition/recurring) · four-blank SKU · margin sketch.
Reject chatbot-without-clog. ASK before any build. No new icp_id/lane.
```

**Four-blank SKU only**
```
Turn this ranked pain into one four-blank SKU (who · what · when · outcome) + margin sketch:
[paste pain]
HITL: ASK before build.
```

## When
After pain list exists

## Do
1. Which pains AI can partially/fully solve (Grok+Cursor stack)
2. Rank: severity · pay · reach · difficulty · competition · recurring
3. Four-blank SKU + margin sketch
4. Reject chatbot-without-clog; ASK before build

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

---

## Merged from `paid-pain-points` (2026-10-11)

- Original description: Use when: ICP hunt / offer discovery. Demkinn #9. Owner Lead Hunter.
- Unique content carried: ICP hunt pain sourcing steps (Lead Hunter owner)

# Find paid pain points (Demkinn #9)

**Owner desk:** Lead Hunter  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/09  
**Status:** owned  
**HITL:** none


## Tools
| Need | Path |
|---|---|
| Public web / Reddit / forums | WebSearch/WebFetch — **PROVE** |
| Job boards / G2 / review sites | WebFetch public pages — **PROVE** |
| X live search | **BLOCKED** until X re-auth — web + paste **WORKAROUND** |
| Pain artifact write | packet / vault brief — **PROVE** |

## Prompts
**Pain hunt**
```
Run Demkinn #9 ai-ideas-from-pain for ICP: [describe]
Lane: [ai-partner-websites|amazon-own-store|hive-os]
Sources to scan: reviews/forums/jobs/Reddit (quarantine farms/NSFW).
Output table: Pain quote · Source URL · Frequency signal · Who pays · Severity.
Exact sigh language. No brainstorm without evidence.
Hand top pains to #10. claim-verifier before any $ market-size FACT.
```

**Sigh-language extract**
```
From these raw snippets, extract ONLY repeated paid pains (exact quotes):
[paste]
Drop one-offs and NSFW/farm noise.
```

## When
ICP hunt / offer discovery

## Do
1. Search reviews · forums · jobs · Reddit for repeated complaints
2. Capture exact sigh language (quotes)
3. Prefer evidenced pain over brainstorm
4. Feed Consultant (#10 constraint-position); quarantine farms/NSFW sources

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.
