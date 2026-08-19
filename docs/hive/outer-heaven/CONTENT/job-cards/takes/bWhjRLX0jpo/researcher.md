# Researcher — bWhjRLX0jpo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/bWhjRLX0jpo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/bWhjRLX0jpo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Lodavo** Montreal fintech vlog EP1 (not Nate). Beats: (1) Recurring gag: teammate remembers a 20-digit card, not a 4-day conversation. (2) Weekly draws Sunday–Sunday; Sunday 20:00 restart; compute last week’s winner; issue next week’s tickets. (3) First 20:00 test: call Luke 19:55, simulator + timer — not enough time; slip a week. (4) Animation pack (earn / winner / payout); “free?”; new-email to dodge platform limits; they say they’ll respect copyright. (5) PostHog: download→use→signup→weekly return; A/B; missed startup discount (inc. 2y+10d); emailed, still got it + credits/merch. (6) Waitlist: Wealthsimple exec; after first email blast, LinkedIn “thanks for being on radar”; he had researched the concept; meeting set; editor watches his podcasts. (7) Origin: McGill poker; Ben pitches waitlist; editor wanted a startup, lost ~$150 that night, started as dev, moved to growth/camera. Shoutouts Rob/Phillip/Shamir/Emile. (8) Security tried to kick them despite “24/7 deal.” (9) Face ID: skip sign-in → should re-prompt Face ID — fails → “let’s go fix that.” (10) API keys almost on camera. (11) 20:00 launch-test: hide code; two prizes — weekly $100 most-matches (tie random); $10k all-seven. (12) Test: delete old users; waitlist code; leap-day birthday; number revealed early; screen “busting”; API load flip; “no winner this week” (no users last week); tickets show 0 vs expected 100; no logs. (13) Postmortem: front door worked (download, account, Plaid, home) with **bad data**; know what to fix; check DB after supper. (14) Dilution talk; tired; “beep partner” secret; cut. Timestamp UNKNOWN. $100/$10k/150 UNVERIFIED. Plaid/PostHog/Wealthsimple on-tape. **Do not hunt Wealthsimple or unpark Montreal.**

## B. Atomic Knowledge

### Timed ritual + gold-path test + honest bad data
- **Claim:** A Sunday 20:00 snapshot needs a rehearsal with a clock; the first live test can still “work” as a path (install→account→link→home) while data/UI are wrong — write the fail list, don’t spin it.
- **Reasoning:** 19:55 was too late; they slipped a week; second try they deleted users and still got early reveal / 0 tickets / no logs.
- **Mechanism:** Timer + simulator; PostHog funnel; Face ID negative test; hide keys; postmortem “small vs big.”
- **Evidence:** “front end everything basically worked… just with bad data.”
- **Conditions:** Consumer app with a weekly freeze. Three-person film-and-build.
- **Exceptions:** Lottery/Plaid product is operate-never. LinkedIn to a waitlist exec is their hunt, not ours.
- **Action:** Steal clocked rehearsal + path-vs-data split + Face ID fail as a test. No Lodavo ICP.
- **Confidence:** high as a vlog of a messy test.
- **Source:** `bWhjRLX0jpo` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Growth hire from a poker table. Waitlist names are warm LinkedIn, not a blast to the exec. Analytics late (2 weeks past discount). They will film the disappointment. Copyright vs platform-limit dodge is spoken — hive: do not create accounts to bypass limits.

## D. Procedures
1. If a job is time-frozen: rehearse with a countdown, not T-minus-5.
2. Gold path: install → account → auth → home; separately assert numbers.
3. Negative auth test (Face ID after a skip).
4. Never show API keys.
5. After a messy run: list what worked vs bad data; check logs/DB; do not declare launch.
6. Hive: no Plaid, no lottery, no Wealthsimple outreach.

## E. Examples
- **Situation:** First 20:00. **Action:** 19:55 call. **Outcome:** Slip a week. **Lesson:** Ritual needs prep time.
- **Situation:** Second 20:00. **Action:** New accounts, waitlist code, leap-day. **Outcome:** Early number, jitter, 0 tickets, no logs; path OK. **Lesson:** Path ≠ correctness.
- **Situation:** Face ID skip. **Action:** Continue with Face ID. **Outcome:** No prompt. **Lesson:** Film the fail, then fix.

## F. Decision Rules
- If the clock is the product → rehearse the clock.
- If home renders with zeros → fail data, not “it launched.”
- Refuse: Lodavo/Wealthsimple hunt; quote $10k; new-email to bypass limits; keys on tape as a habit to copy.

## G. Contrarian
They air the glitch and the dilution talk. Field would cut to merch.

## H. Assumptions
Wealthsimple person is real (named only as “someone pretty high up”). $100/$10k rules as spoken. “24/7 deal” disputed by the guard.
**Desk dissent:** none yet. Not a Nate tape — do not fold into Nate OS.

## I. Questions
- Did tickets exist in DB?
- What is “beep partner”?

## J. Connections
- **SYSTEM SYNTHESIS:** `golden-test-loop` (Face ID, gold path). `5IM27lbCwjM` (inbound from being around — different). Montreal default city in icp-runbook is **not** permission to hunt Lodavo. Clients parked.

## K. Future-Use
Path-vs-data postmortem language; clocked rehearsal.

## Steal / Operate-never

### Machine: clocked-rehearsal-then-path-vs-data
- **Epistemic:** SOURCE
- **Workflow / loop:** name the freeze time → rehearse with a timer early → gold path + numeric asserts + negative auth → hide secrets → postmortem (worked / bad data / logs) → no launch declare
- **Questions / signals:** Do we have logs? Do tickets match promo? Did auth fail closed?
- **Qualify / frame / objections:** “Someone completed signup” ≠ correct snapshot.
- **Procedure:** D.
- **Example that proves it:** 19:55 miss; later 20:00 path-OK / data-bad / no logs.
- **Why it works:** Separates funnel completion from correctness.
- **Conditions / exceptions:** Lottery app. Operate-never payload is the whole product.
- **Operate-never payload:** Lodavo; Plaid; Wealthsimple; $10k prize; limit-bypass accounts; new `icp_id`; unpark Montreal client.
- **Hive run:** `golden-test-loop` · `ask-principal`
- **Source:** `bWhjRLX0jpo` @ UNKNOWN

**Operate-never**
- Hunt Wealthsimple/Lodavo. Lottery SKU. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Ugly tape stays. Steal the test ritual only. Do not add fintech ICP. Do not mention the exec as a lead.
