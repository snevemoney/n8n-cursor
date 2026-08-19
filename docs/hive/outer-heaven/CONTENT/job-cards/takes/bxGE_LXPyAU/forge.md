# Forge — bxGE_LXPyAU
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/bxGE_LXPyAU/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/bxGE_LXPyAU/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk rebuilds a **student-onboarding** system he sold for **$2,600** (2h then; ~30 min now) UNVERIFIED. Client inbound from a small YouTube; he wasn’t pitching. Wireframe first (4 pieces) then n8n live. **1 Payment webhook** → welcome Gmail (account link, n8n attribution off) → Slack “new student paid” (workflow-link off, separator lines) → Sheets append: name/email/phone, status=`account creation`, pay date=`$now`, follow-up=`+3d`, human=`+5d`. **2 Daily 2pm:** get rows status=account creation AND follow-up=today → reminder mail → update status=`first follow-up sent`, date=`NA`. **3 Daily:** status=first follow-up sent AND human-date=today → Slack escalate (don’t mail again) → status=`human notified`, takeover=`escalated`. **4 Account-created** (form stand-in): AI “Mr. Friendly and Nice” → structured `{subject,body}` (OpenRouter Claude Sonnet 4.5) → Gmail → update status=`account created` + demographics, NA the chase dates → Slack onboarded. Match rows on **email** (not name). Pin Postman mock. Only flow 4 is AI — that’s why 2h and robust. Price: 5 clients/wk × 30 min × $50/hr → $6k/yr time UNVERIFIED; 10x rule; flywheel. ~25 discovery calls before first money. From-scratch: find waste → n8n → fast Loom → talk, don’t pitch. Caption-only. n8n / Slack / Sheets / OpenRouter / Skool on-tape.

## B. Atomic Knowledge

### Wireframe four statuses; AI last; unique-ID match
- **Claim:** Three deterministic flows make the system trustworthy; one AI email is enough to call it an “agent” in the thumbnail. Client paid for never-manual-onboard, not nodes or hours.
- **Reasoning:** AI is where you spend refine/test time. Status tags are the filter so nobody gets the wrong chase.
- **Mechanism:** `account creation` → `first follow-up sent` → `human notified` → `account created`. Dates pre-computed at pay. Daily get-rows with two filters. Update by email. Attribution/link-to-workflow off.
- **Evidence:** Live Postman → mail/Slack/row; +3/+5 sim; form → joke on “Up It AI”; Slack separators.
- **Conditions:** Payment processor can POST a webhook. Sheet is the CRM.
- **Exceptions:** Two people same name — don’t match on name. Production uses `$now` not +3 demo.
- **Action:** Steal status machine + AI-last + email match. Do not auto-mail students. Do not quote $2,600 as FACT.
- **Confidence:** high on the spine.
- **Source:** `bxGE_LXPyAU` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none shown
- **Speech ≠ behavior:** none

### Outcome price, not hours; inbound from showing work
- **Claim:** They didn’t care it was fast. 10x on what they pay. Time saved becomes more sales → more onboardings → more value (self-licking cone). He wasn’t selling; people asked “could this work for us?” ~25 calls before first yes.
- **Reasoning:** Businesses buy measurable return + peace of mind, not flashy agents.
- **Mechanism:** Conservative hours × loaded rate × 52; name intangibles that become retention/LTV/referrals. Price so 10x is obvious.
- **Evidence:** $2,600 vs $6k/yr story UNVERIFIED. Goldman BI analogy — this automation is old.
- **Conditions:** Inbound YouTube, small channel, multiple posters.
- **Exceptions:** Weekly savings can grow ($125→$600) — he uses that to inflate the year; still UNVERIFIED.
- **Action:** Steal 10x frame + show-work inbound. Do not start a YouTube hunt. Do not quote $50/hr or $6k as FACT.
- **Confidence:** high on the frame; math UNVERIFIED.
- **Source:** `bxGE_LXPyAU` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 25 calls before money
- **Speech ≠ behavior:** none

## C. Mental Models
Statuses are the product. AI is a garnish. Wireframe = client alignment + build speed. Hours are your cost, not their price. Accessibility > expert posture.

## D. Procedures
1. Do not install n8n-cloud, OpenRouter, Slack-as-hive. Do not send Skool.
2. Do not quote $2,600 / $6,000 / $50/hr / 10x as FACT.
3. Do not auto-send student mail or Slack a real team.
4. Wireframe four boxes with the client before n8n.
5. Webhook → pin a mock. Attribution off.
6. Status + two dates at insert. Daily filter pair. Escalate humans, don’t double-email.
7. Match email. Structured subject/body if AI writes mail.
8. Price from their hours × rate × year, then 10x. They buy the outcome.
9. Show work; take the inbound call; validate possibility; don’t pitch.
10. Clients parked. Send HITL.

## E. Examples
**Situation:** Paid but no account after 3 days.  
**Action:** Daily get-rows; reminder; stamp follow-up sent.  
**Reasoning:** One auto nudge.  
**Outcome:** Human only if still dark at day 5.  
**Lesson:** Machine does first chase; human is a status, not a vibe.

**Situation:** Form “Up It AI” / 3x revenue.  
**Action:** Structured JSON mail.  
**Reasoning:** Gmail needs two fields.  
**Outcome:** Subject jokes the name; body uses 90-day goal.  
**Lesson:** Structure is for the next node.

**Situation:** “This won’t take long.”  
**Action:** Said it on the call; they still paid $2,600.  
**Reasoning:** They buy never-manual.  
**Outcome:** 2h build.  
**Lesson:** Don’t price your speed.

## F. Decision Rules
- IF the pain is chase/status → three dumb flows beat one fat agent.
- IF you need personalization → one structured AI step at the end.
- IF match key isn’t unique → don’t use it.
- IF you can’t show ~10x → he wouldn’t call it a no-brainer (tape $ UNVERIFIED).
- IF you’re pitching → stop; show a Loom and talk.
- IF send → HITL.

## G. Contrarian
Field sells “AI agents.” He sold a sheet + two crons + one joke email. Field prices hours. He prices the flywheel.

## H. Assumptions
n8n + Gmail + Slack + Sheets. $2,600 and $6k math UNVERIFIED. AIS Academy is a demo name. Falsifier: webhook can’t fire from their processor. Clients parked.

## I. Questions
What’s a hive onboarding that isn’t student-mail? What’s our unique match key if we ever log a funnel? Do we already have the 10x rule on `Lg5TYWPSg6M`?

## J. Connections
SYSTEM SYNTHESIS: `Lg5TYWPSg6M` 10x + don’t hourly-punish-speed. `pxzo2lXhWJE` structured fields + draft. `LVAHYV4Xrto` outcome not annoyance. Send HITL. Cursor + Grok.

## K. Future-Use
Status machine. AI last. Email match. 10x frame. Show-work inbound. No $2,600 quote.

## Steal / Operate-never

### Machine: pay → status row → day-3 mail → day-5 human Slack → account-created AI mail; price the never-chase
- **Epistemic:** SOURCE
- **Workflow / loop:** webhook → welcome+Slack+row(status+dates) → daily filter/mail/stamp → daily filter/Slack/stamp → form → structured AI mail → stamp created + Slack
- **Questions / signals:** What’s the unique ID? Which status are they in? Is this the AI step or a dumb cron?
- **Qualify / frame / objections:** They pay for peace + flywheel, not nodes. 25 calls is normal.
- **Procedure:** No auto-send. No tape $ as FACT. No Skool. No n8n-cloud as hive.
- **Example that proves it:** +3/+5 sheet; Up It AI joke subject; $2,600 for 2h UNVERIFIED.
- **Why it works:** Deterministic chase + one tasteful AI; wireframe twins the canvas.
- **Conditions / exceptions:** Demo dates vs `$now`. Name collision.
- **Operate-never payload:** Auto student email; quote $2,600; OpenRouter as hive brain; YouTube hunt; Skool.
- **Hive run:** none. Send HITL.
- **Source:** `bxGE_LXPyAU` @ UNKNOWN

### Operate-never
- Do not auto-email students or Slack a real team.
- Do not quote $2,600 / $6k / $50/hr as FACT.
- Do not install n8n-cloud or OpenRouter as hive.
- Do not send Skool or start a client hunt.
- Clients parked. Send HITL.

## L. Role-Specific Applications
Forge steals **status-as-CRM**, **AI-last**, **match-on-email**, **10x not hours**. We do not rebuild AIS Academy or mail anyone. If a named client ever needs onboarding, wireframe first; send stays HITL.
