# Librarian — 3QclAjmu5Tw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/3QclAjmu5Tw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/3QclAjmu5Tw/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Claude Just Solved Session Limits
**Channel:** Nate Herk | AI Automation
**Kind:** video (~2483 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Anthropic × SpaceX partnership: more compute → higher Claude Code + API usage limits. First 2026 Code with Claude (SF / London / Tokyo); extra day from demand.
2. Last quarter: outages; he blames demand > compute (testing, Opus, Mythos as side reasons).
3. Immediate: **double** Claude Code 5-hour rate limits (Pro/Max/Team). **Remove** peak-hours limit reduction on Pro/Max. Earlier they had also blocked new Pro from Claude Code (Max-only) and banned using the sub for Open Claude / Hermes (ToS; he wonders if also anti-abuse). Unused bought compute is also waste — hard projection problem.
4. API Opus rate limits up “considerably”: he says input was 30K/min; output 8k→80k/min (also says “upgraded by like 16% on the output side” then 8k→80k — keep both phrasings, do not flatten). Lowest tiers biggest multiples (16× / 10× on a table). Input cheaper than output. Tier-1: ~370 pages/min vs ~20–22 before. Parallel agents were hard under old Opus API limits.
5. Broader compute shopping: Amazon, Google, Broadcom, Microsoft, Nvidia, FluidStack; day-before: Goldman Sachs JV + Blackstone. Enterprise + international. Managed agents (webhooks, auto-dreaming, multi-agent) mentioned — **not covered** this tape.
6. SpaceX deal numbers he reads: 300 MW, >220k Nvidia GPUs. Closed vs open: closed feels better because of compute behind it; local needs RAM/VRAM; VPS same. Footer: interest in **multiple gigawatts of orbital AI compute** — not this year; terrestrial power/water/cooling/community has a long-term ceiling.
7. Five builder points: (1) retest workflows that died on rate limits — LinkedIn infographic client: not confident 3 months ago, new image model, called him, built; (2) if you were `/opus plan` or dumping to Haiku/Sonnet to save session, you can use more Opus — context management still matters; (3) 1M context usable in production (API); Claude Code can sit behind prod because routines + daily knowledge work used to eat one session; (4) multi-agent viable (e.g. five subs × 50k); (5) wrap: Anthropic playing 5+ years of compute; Claude Code is flagship (no Co-work announce); consumer electricity-hike cover = community trust so they can build faster than towns that push them out. Next: token-under-the-hood video.
Gap: rate-limit table, orbital line. Timestamp UNKNOWN. Claude/SpaceX/Hermes on-tape.

## B. Atomic Knowledge

### Limits were a compute ceiling; retest what died
- **Claim:** Doubled 5-hour windows + no peak throttle + higher Opus API RPM make old “I gave up” builds worth a second try; unused compute is also waste so vendors throttle then unthrottle.
- **Reasoning:** Outages = demand > supply; they had already cut Pro/peak/Open-Claude paths.
- **Mechanism:** SpaceX + other capacity; lowest API tiers get the biggest multiples.
- **Evidence:** Infographic client 3-month retry; 8k→80k output (his read).
- **Conditions:** Promos/limits can move again. Orbital is interest, not a ship date.
- **Exceptions:** Context management still required; he will not cover managed agents here.
- **Action:** File retest-old-walls. $20 Pro / MW / GPU counts UNVERIFIED. Do not operate Hermes/Open-Claude ToS dodge.
- **Confidence:** high as a “retest” rule; table numbers UNVERIFIED
- **Source:** `3QclAjmu5Tw` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** client image job failed, later passed
- **Speech ≠ behavior:** “16% on the output side” vs 8k→80k — keep both

## C. Mental Models
Compute is the scarce input. Flagship = Claude Code. Community electricity cover is a permit-to-build. Closed > open because of someone else’s GPUs. Things move fast — revisit.

## D. Procedures
1. Note which of the three changes hit you (5-hour double / peak off / API RPM).
2. Pull the graveyard of rate-limit deaths; retest one.
3. Do not blindly abandon routing to cheaper models — context still bites.
4. If you want routines + daily work on one sub, re-check whether the double window is enough before putting Claude Code in prod.
5. Treat orbital/gigawatt as future-use, not a plan.
Avoid: ToS abuse; quoting 300MW/220k GPUs as hive FACT; managed-agents FOMO this tape.

## E. Examples
**Infographic retry:** Situation — LinkedIn AI graphics not postable. Action — wait for a new image model, call the client. Outcome — built. Lesson — walls expire.

## F. Decision Rules
- IF a build died on RPM/session → retest after a capacity announce.
- IF you only routed down to save limits → you may route up a notch; still manage context.
- IF unused GPUs sit idle → expect vendors to throttle again later.
- Refuse: Hermes/Open-Claude on a consumer sub; hive = Claude; orbital as a 2026 deliverable.

## G. Contrarian
Against “Claude is dying” as the only read of outages — he reads it as compute. Against covering managed agents in the same tape as limits.

## H. Assumptions
Deal numbers and 8k→80k are his read of a slide. 16% vs 10× conflict stays labeled. Caption-only. Complements `6cEQEba0i2A` (cache) and `-nG-9vlSkho` (cheap window).

## I. Questions
What is “auto dreaming”? Exact API table? Does doubling apply to all products or Code-first?

## J. Connections
SYSTEM SYNTHESIS → `6cEQEba0i2A`; `-nG-9vlSkho`; `dYrrEKXtttk`.

## K. Future-Use
Retest-old-walls + orbital-ceiling as atoms.

## Steal / Operate-never

### Machine: capacity announce → retest the graveyard
- **Epistemic:** SOURCE
- **Workflow / loop:** vendor raises limits → list builds that died on RPM/session → retest one with the same brief → checkable stop = it now completes without the old wall, or the wall remains
- **Questions / signals:** Which of the three changes? Was the death rate-limit or quality?
- **Qualify / frame / objections:** Unused compute is also waste — limits will move again.
- **Procedure:** D above.
- **Example that proves it:** Infographic 3-month retry.
- **Why it works:** Walls were supply, not always skill.
- **Conditions / exceptions:** Context still matters; numbers UNVERIFIED.
- **Operate-never payload:** ToS dodge; 300MW/220k as FACT; Claude as hive; SpaceX as a hive vendor.
- **Hive run:** Cursor + Grok. Retest on our stack, not theirs.
- **Source:** `3QclAjmu5Tw` @ UNKNOWN

### Operate-never
- Quote deal/RPM as FACT. Hermes/Open-Claude ToS dodge. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File “retest the graveyard” next to cheap-window tapes. Keep the 16% vs 8k→80k mismatch labeled. No SpaceX wiki.
