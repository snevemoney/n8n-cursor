---
name: Raw data into a story (Demkinn #49)
description: >-
  Use when: Spreadsheet/metrics in. Demkinn #49. Owner Publishing Engine.
---
# Raw data into a story (Demkinn #49)

**Owner desk:** Publishing Engine  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/49  
**Status:** owned  
**HITL:** ASK public publish


## Tools
| Need | Path |
|---|---|
| Spreadsheet / CSV | operator file — **PROVE** |
| Analysis scratch | Shell/Python on box — **PROVE** |
| Story draft | Publishing artifact — **PROVE** |
| Public publish | **BLOCKED** without ASK + #53 critic |
| $ / % as FACT | claim-verifier (#47) — **PROVE** |

## Prompts
**Data → story**
```
Run Demkinn #49 raw-data-to-story.
Dataset: [path or paste]
Find surprises/anomalies/inflections/growth/drops/segments FIRST.
Then draft a short story/report. claim-verifier on every $/%. ASK before public publish; route through #53 critic.
```

**Anomaly list only**
```
List anomalies + one-line why-it-matters from this table (no prose essay yet):
[paste]
```

## When
Spreadsheet/metrics in

## Do
1. Find: surprises · anomalies · inflection · growth · drops · segments
2. Then draft report/article
3. claim-verifier before $ FACT; ASK public publish

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.
