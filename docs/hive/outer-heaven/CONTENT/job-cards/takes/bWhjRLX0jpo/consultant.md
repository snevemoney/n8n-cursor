# Consultant — bWhjRLX0jpo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/bWhjRLX0jpo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/bWhjRLX0jpo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Lodavo Montreal fintech vlog EP1 (not Nate). Beats: weekly Sunday 20:00 draw restart; tickets issued; they try to test at 19:55, not enough time, slip a week. Animation pack for tickets/winner/payout — “free,” copyright talk, maybe new-email to dodge a platform limit (they say they’ll respect copyright). PostHog: download→use→signup→weekly return; missed startup discount by 10 days, emailed, still got it; merch. Wealthsimple-senior on waitlist; LinkedIn thanks; meeting planned; editor watches his podcasts. Origin: McGill poker → pitch waitlist → editor joined as dev then growth/camera; lost $150 that night. Security almost kicks them out of a 24/7 space. Face ID sign-in bug (should prompt, doesn’t). Almost shows API keys on camera. 8pm first official test: hide code; two prizes ($100 weekly most-matches, $10k all-seven) — **betting/lottery product**. Waitlist promo code; leap-day birthday; winning number reveals early; screen “busting around”; API load fail; “no winner this week” because last week no users; frontend shows 0 tickets vs expected 100; no logs on Luke’s machine. Postmortem: not bad, we know what to fix; someone could download, create, link Plaid, see home with bad data. Dilution talk if people don’t invest. Tired, food, secret “beep partner.” Ugly tape. No VTT. UNKNOWN. ~2318 words. Visual-heavy, overlapping speakers.

## B. Atomic Knowledge

### A clocked test with a named fail is still a test
- **Claim:** They missed the 19:55 rehearsal, ran the 20:00 snapshot anyway, and left with a written pile: early reveal, flicker, zero tickets, no logs, no winner because no prior users.
- **Reasoning:** A launch clock that you actually hit teaches more than a slide.
- **Mechanism:** Name the Sunday 20:00 behavior → try it → list what broke → fix before the real launch.
- **Evidence:** “Honestly, not bad. We know what needs to be fixed.”
- **Conditions:** Two weeks from a hoped launch on tape. Plaid/waitlist/promo.
- **Exceptions:** The product is a lottery — operate-never as a hive business. $100 / $10k UNVERIFIED.
- **Action:** Steal the clocked test + fail list. Do not build Lodavo. Do not hunt Wealthsimple.
- **Confidence:** high as a test habit; high never on the payload
- **Source:** `bWhjRLX0jpo` @ UNKNOWN — “at 8:00 p.m. on Sunday… tickets are going to be frozen”
- **Epistemic:** SOURCE
### Do not show API keys; do not dodge platform limits with new emails
- **Claim:** On camera someone says they should not be showing API keys; earlier they float a new-email account to dodge an animation-pack limit while claiming copyright is fine.
- **Reasoning:** Vlog honesty includes the sloppy ops.
- **Mechanism:** Hide secrets. Do not create throwaway accounts to beat a quota.
- **Evidence:** “Oh, I should not be showing our API keys.” / “create a new account under a different email.”
- **Conditions:** Student-startup vlog.
- **Exceptions:** They also say they’ll respect copyright — mixed.
- **Action:** Steal the flinch on keys. Do not operate the extra-email dodge.
- **Confidence:** high
- **Source:** `bWhjRLX0jpo` @ UNKNOWN — “I should not be showing our API keys”
- **Epistemic:** SOURCE
### Funnel metrics they actually named
- **Claim:** PostHog is for % who download then use, sign up, come back weekly, and whether a change helps those metrics.
- **Reasoning:** Even a lottery app is thinking in a conversion spine.
- **Mechanism:** Instrument download→use→signup→return before arguing features.
- **Evidence:** On-tape PostHog setup + missed two-year discount.
- **Conditions:** They were two weeks late to the discount window.
- **Exceptions:** Metrics on a betting app are not our SKU.
- **Action:** Steal the spine. Do not install PostHog for this product.
- **Confidence:** medium
- **Source:** `bWhjRLX0jpo` @ UNKNOWN — “what percentage of users who download the app then actually use it”
- **Epistemic:** SOURCE


## C. Mental Models

Three students building in public: jokes, merch, poker origin, almost-kicked-out, Face ID bug, draw-night stress. They are not teaching n8n. They are showing a messy launch test. Wealthsimple name-drop is a hope, not a deal. The editor breaks the fourth wall. This is an ugly tape that stays in the room.

## D. Procedures

On-tape: set a Sunday 20:00 test → miss the dress rehearsal → run it → write fails → eat → check DB. Ours: steal the test habit; never the lottery, never the extra-email quota dodge, never the Wealthsimple hunt.

## E. Examples

**Situation:** First official 20:00 weekly-draw test. **Action:** Create accounts, promo code, Plaid link, watch reveal. **Outcome:** Early number, flicker, 0 tickets, no winner, no logs; they still call it progress. **Lesson:** Hit the clock, list the breaks. Implicit rule: “bad data” can still mean the path existed.

## F. Decision Rules

If the product is a draw/lottery, do not operate it. If a key is on camera, stop filming. If logs are missing, that is a fail of its own. If a name-brand is on a waitlist, that is not a meeting we book.

## G. Contrarian

Field default: polish the vlog. They show the glitch. Field default: skip the dress rehearsal forever. They admit they need to be more prepared next Sunday.

## H. Assumptions

Betting/lottery is steal-sheet kill. $100/$10k/$150 poker UNVERIFIED. Plaid/PostHog/Wealthsimple on-tape. Montreal students — not a new icp. API keys almost leaked.

## I. Questions

Did the 100 tickets exist in the DB? What was the secret partner? Did the Wealthsimple meeting happen? (Do not hunt.)

## J. Connections

**SYSTEM SYNTHESIS:** Ugly-tape doctrine: steal the machine, do not skip. Maps to `golden-test-loop` (clocked test) + `paid-slice-funnel` smoke (path existed with bad data) + kill betting. Not `lead-web-find` on Wealthsimple.

## K. Future-Use

Unassigned: Sunday-clock dress rehearsal; “path worked, data wrong” as a QA split; never-show-keys as a filming rule.

## Steal / Operate-never

### Machine: Clocked launch test → written fail list (payload stays operate-never)
- **Epistemic:** SOURCE
- **Workflow / loop:** Name the exact clock → do a dress rehearsal → run the real clock → write what broke (data vs path vs logs) → fix → do not ship a lottery
- **Questions / signals:** Did we miss the dress rehearsal? Do we have logs? Is the product a draw?
- **Qualify / frame / objections:** Qualify: this is a vlog, not a client. Frame: progress = we know the breaks. Objection: “Wealthsimple is on the waitlist” — not a hunt.
- **Procedure:** Steal the test. Never the lottery. Never extra-email quota dodge. Never show keys.
- **Example that proves it:** 20:00 Sunday snapshot: early reveal, flicker, 0 tickets, no logs; Plaid path existed.
- **Why it works:** A hit clock plus a fail list is how a team learns. The product type is still forbidden.
- **Conditions / exceptions:** Betting payload. $ UNVERIFIED. Name-drops.
- **Operate-never payload:** Build/operate a lottery or betting app. Hunt Wealthsimple. New-email to dodge limits. Quote $10k jackpot as FACT.
- **Hive run (existing skills only):** `golden-test-loop` · `ask-principal`
- **Source:** `bWhjRLX0jpo` @ UNKNOWN


### Operate-never
- Operate a lottery/betting/draw product.
- Hunt Wealthsimple or a Montreal fintech waitlist.
- Show API keys.
- Create extra emails to dodge platform limits.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** There is no client ask. Do not invent Lodavo as a Path A. Felt problem is not a weekly draw.

**Four-blank:** None. $100 / $10k stay UNVERIFIED and unused.

**Skeptical-customer:** Waitlist-famous-name is smash. Betting stays operate-never. Clients parked. Learn the clocked test anyway.
