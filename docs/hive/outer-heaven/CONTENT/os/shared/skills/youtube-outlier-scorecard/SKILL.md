---
name: YouTube outlier scorecard
description: Use when scoring tapes or competitor channels — find videos far above a channel baseline and say what they did differently.
---
# YouTube outlier scorecard

**Owner:** Researcher. No new `icp_id`. No new Monday routine. No new desk.

Public YouTube only. Named channel required. Score views vs that channel's own pack — not vs the internet.

## When
Operator names a channel (or a tracked niche with a named handle). After L2 if a tape looks off-pack. Never for leisure-only, hacking, or OFM — those are **NO-SKILL**.

## Recipe
1. Open the channel's public uploads (WebFetch the channel/videos page, or box Chrome if the fetch is thin). Take the last **8–12 public uploads**. Skip Shorts-only if the ask is longform, and vice versa — do not mix packs.
2. For each upload record: title, video id, channel, public view count, published time. Views are **FACT** (cite the page). `$` / RPM / revenue on the card = **UNVERIFIED** — never treat as FACT.
3. **Baseline** = median views of the pack **after skipping anything published in the last 48h** (too green to score). If fewer than 5 aged videos remain, write **BLOCKED**: would work with a longer public upload history — do not invent a baseline.
4. **Outlier** = views ≥ **3×** baseline, or clearly off the pack (next-best is a different order of magnitude). Mark the rest as in-pack.
5. For each outlier, write one card:

   | field | rule |
   |---|---|
   | title · id · channel | FACT from the page |
   | views · baseline · ratio | FACT (ratio = views / baseline) |
   | what changed | **INFERENCE** only — hook / title form / length / topic. Say so. Do not upgrade inference to FACT. |

6. Append the card to the hunt log and/or watch-later sheet **if those files are already open this pass**. Do not mint a second catalog. Do not create a new `icp_id` from a hot title.

## Tooling (label every run)

| Need | Path | Label |
|---|---|---|
| Public channel / watch pages | WebFetch and/or box Chrome | **PROVE** |
| View counts on the public page | same | **PROVE** (FACT) |
| Timedtext / captions | existing summarize-audio-video or page chapters | **WORKAROUND** — do **not** install TranscriptAPI |
| TranscriptAPI / paid YT analytics / RPM | not installed, not ours | **BLOCKED** — would work if we had YouTube Analytics or a revenue connector. Leave `$` UNVERIFIED. |
| Private / unlisted / members-only | not public | **BLOCKED** — public uploads only |

## NO-SKILL
Leisure-only watches. Hacking / exploit tapes. OFM / NSFW farms. Quarantine and stop — no card, no icp, no skill enrich.

## Never
- Install TranscriptAPI or a second YT scraper
- Quote RPM / sponsor `$` as FACT
- Mint a new `icp_id` or desk from a viral title
- Stand up a content farm / SEO writer from an outlier hook
- Auto-post the card

## Prompts
**Score a channel**
```
Channel: [handle or URL]
Window: last 8–12 public uploads
Baseline = median views, skip last 48h
Outlier ≥ 3× baseline (or off-pack)
Cards: title, id, channel, views, baseline, ratio, what changed
FACT views. INFERENCE on what changed. $ / RPM UNVERIFIED.
No TranscriptAPI. No new icp_id.
NO-SKILL if leisure / hacking / OFM.
```
