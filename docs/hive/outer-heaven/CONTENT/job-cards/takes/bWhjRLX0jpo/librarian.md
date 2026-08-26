# Librarian — bWhjRLX0jpo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/bWhjRLX0jpo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/bWhjRLX0jpo/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Lodavo Montreal $1B fintech vlog EP1
**Channel:** Lodavo
**Kind:** vlog (~2318 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
Ugly vlog, not a tutorial. Beats in order:
1. Cold open: teammate remembers a 20-digit card, forgets a 4-day conversation. Weekly draws Sunday→Sunday; Sunday 8:00 p.m. restart; compute last week’s winner; issue next week’s tickets. They tried to test last Sunday: called Luke 7:55, simulator + timer for the exact second — not enough time; slip to next weekend.
2. Animation pack review (earn tickets / winner spin / payout). “Free?” — platform limits; joke about new-email accounts; they say they will respect copyright; limit is the platform’s.
3. PostHog set up last night; Luke to set up; review via MCP for errors. Funnel: download → use → sign up → weekly return; A/B on changes. Missed startup discount by ~10 days (need <2 years; incorporated 2y10d); emailed, they said fine; free credits; merch joke.
4. Wealthsimple-senior on waitlist; after first waitlist email, LinkedIn connect “thanks for being on our radar”; he had researched the concept; meeting booked. Editor (third core, joined after founding) fourth-wall. Origin: McGill poker; Ben pitching waitlist; editor wanted a startup, came in as dev, moved to growth/camera after they needed content. Lost ~$150 that night (UNVERIFIED).
5. Security guard tries to kick them out despite “24/7 deal”; leaving in 30; cold butter chicken.
6. Face ID: purposely skip Face ID → sign-in screen → continue with Face ID — expected prompt missing → “let’s go fix that.”
7. Workstation: Lodavo on phone; “create personal API” — **he should not be showing API keys** (said on tape). Zoom-in joke.
8. Approaching 8:00 p.m. test (~2 weeks to launch). Prize rules: weekly guaranteed $100 to most matches; ties random; $10K if match all seven. Editor re-asks PostHog (already filmed) — callback to card-memory gag.
9. First official test: hide fancy code; Sunday 8:00 seventh number + snapshot freezes tickets for the week. Delete old users; slow McGill Wi-Fi; waitlist promo; one account no bank link (code-only tickets); leap-day birthday. **Failures:** winning number released early / reveal glitch; screen “busting around” (API load alternating old/new ticket-breakdown screen); “no winner this week” (correct if last week had no users); frontend shows 0 tickets (expected 100 from waitlist code) — data vs display unknown; Luke has no logs.
10. Postmortem: not bad; know what to fix; whole path worked — download, account, Plaid link, home — **bad data**. Number revealed early. OTP wait. Dilution talk: no one forced to invest, but then cannot complain if diluted. Beep partner “secret.” Cut.
Gap: many visuals, music beds, API key on screen. Timestamp UNKNOWN. Caption-only. PostHog/Plaid/Wealthsimple on-tape.

## B. Atomic Knowledge

### Sunday-boundary tests need a rehearsal, not a 5-minute hop-on
- **Claim:** A weekly 8:00 p.m. snapshot cannot be first-tested at 7:55; you need users wiped, logs on, timer, and a written expected ticket count before the bell.
- **Reasoning:** They slipped a week; the official run still shipped with early reveal, 0 tickets displayed, no logs.
- **Mechanism:** Delete old users → simulator + device → known promo code / expected count → snapshot → compare frontend to backend.
- **Evidence:** 7:55 fail; later “I have no logs”; frontend 0 vs expected 100.
- **Conditions:** Time-boxed weekly job; launch ~2 weeks out.
- **Exceptions:** “No winner this week” can be correct if last week had zero users — do not flatten with the 0-ticket bug.
- **Action:** Steal the boundary-test loop. Do not operate their lottery.
- **Confidence:** high as demonstrated failure
- **Source:** `bWhjRLX0jpo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated
- **Modality:** speech + (unobserved) screen
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 7:55 test slipped; 8:00 test: early reveal, animation glitch, 0 tickets, no logs
- **Speech ≠ behavior:** “24/7 deal” vs guard kicking them out; “I’m not disappointed” vs editor filming disappointed face

### Hide secrets; analytics before the launch test
- **Claim:** They set PostHog (download→use→signup→return) and then almost showed API keys on camera.
- **Evidence:** “Oh, I should not be showing our API keys.”
- **Action:** File as operate-never for keys; steal the funnel nouns
- **Confidence:** high
- **Source:** `bWhjRLX0jpo` @ UNKNOWN
- **Epistemic:** SOURCE

### Waitlist → thank-you LinkedIn to an inbound exec
- **Claim:** A senior at Wealthsimple joined the waitlist; after the first blast they sent a low-ask LinkedIn (thanks / radar), then booked a meeting because he had already researched the concept.
- **Evidence:** “found our project. Thought it was pretty cool. So, we’re going to have a meeting”
- **Action:** File inbound-thank-you; do not unpark Wealthsimple as a hive client
- **Confidence:** medium (meeting not shown)
- **Source:** `bWhjRLX0jpo` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Ship-and-film culture. Editor as growth because founders are “too shy.” Progress = walked the whole path even with bad data. Dilution: if you do not put money in, do not complain. Secrets stay secret (they said it as they broke it).

## D. Procedures
1. Write the Sunday 8:00 contract: winner calc, ticket issue, freeze snapshot.
2. Rehearse before the weekend: timer, simulator, logs on, old users deleted, expected counts.
3. Instrument PostHog: download / use / signup / weekly return; MCP-check the install.
4. Launch-test path: download → account → Plaid (and a no-bank-link control) → home → ticket count vs DB.
5. Separate “correct empty state” (no users last week) from “wrong zero.”
6. Waitlist inbound: thank-you, not a pitch; meeting later.
7. Never show API keys on camera.
Avoid: 5-minute hop-on; filming secrets; treating $100/$10K as hive offers.

## E. Examples
**7:55 hop-on:** Situation — weekly restart. Action — call at 7:55 with a timer. Outcome — slipped a week. Lesson — boundary tests are scheduled rehearsals.

**8:00 official:** Situation — first full run. Action — waitlist code, no-bank control, leap-day. Outcome — early reveal, glitch, 0 tickets, no logs; path otherwise walked. Lesson — frontend-green + backend-wrong is the bug class; logs are not optional.

**Wealthsimple waitlist:** Situation — exec on list. Action — post-blast LinkedIn thanks. Outcome — meeting. Lesson — inbound thank-you, not a cold hunt.

## F. Decision Rules
- IF <30 minutes to a time-boxed event → do not call it a test; slip.
- IF frontend says 0 and promo promised N → check DB before rewriting UI.
- IF last week had zero users → “no winner” may be correct.
- IF a key is on screen → stop; rotate (operate-never to publish the key).
- IF inbound exec is already on the list → thank-you, not a pitch deck.
- Refuse: unpark Wealthsimple; lottery operate; new-email ToS dodge as advice.

## G. Contrarian
Against polished launch vlogs that hide the failed snapshot. Against “we have a 24/7 deal” as a fact — the guard disagreed.

## H. Assumptions
$1B in the title is marketing, not a fact on tape. $100/$10K/$150 UNVERIFIED. “Beep partner” secret — do not hunt. Caption-only. Ugly tape still has a machine.

## I. Questions
Did DB have the 100 tickets? Was early reveal timezone or a job fire? What is “beep”? Did the Face ID bug get a ticket?

## J. Connections
SYSTEM SYNTHESIS → hive hard-step HITL. → PostHog as on-tape analytics (do not install as doctrine). → inbound waitlist ≠ new `icp_id`.

## K. Future-Use
Boundary-test rehearsal + frontend-vs-DB check + inbound-thank-you as atoms.

## Steal / Operate-never

### Machine: time-boxed snapshot rehearsal + path-vs-data postmortem
- **Epistemic:** SOURCE (failures) + SYSTEM SYNTHESIS (named machine)
- **Workflow / loop:** write the Sunday contract → rehearse before T-0 → wipe users / logs on / expected counts → run path (download→account→link→home) → compare UI to DB → classify empty-correct vs zero-wrong → checkable stop = ticket count and winner label match backend
- **Questions / signals:** Do we have logs? What is expected N? Is “no winner” correct?
- **Qualify / frame / objections:** “Not bad / we know what to fix” — walk the path, then the data.
- **Procedure:** D above.
- **Example that proves it:** 7:55 slip; 8:00 0-ticket + early reveal.
- **Why it works:** Weekly jobs fail at the boundary; UI-green lies.
- **Conditions / exceptions:** Correct empty state; launch window ~2 weeks.
- **Operate-never payload:** Their lottery; API keys; new-email limit dodge; unpark Wealthsimple; $100/$10K as FACT.
- **Hive run:** HITL on send/pay. No new client.
- **Source:** `bWhjRLX0jpo` @ UNKNOWN

### Operate-never
- Operate Lodavo draws. Publish or reuse on-tape API keys. Unpark Wealthsimple. Quote $1B/$10K as FACT. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File the failed snapshot as a Librarian caution: weekly jobs need a written expected count and logs. Do not turn EP1 into a fintech hunt.
