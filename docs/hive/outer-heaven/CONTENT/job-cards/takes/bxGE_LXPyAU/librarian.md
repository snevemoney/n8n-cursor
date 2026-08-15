# Librarian — bxGE_LXPyAU
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/bxGE_LXPyAU/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/bxGE_LXPyAU/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** I built an AI Agent in 2 hours (and got paid $2600)
**Channel:** Nate Herk | AI Automation
**Kind:** video (~7729 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Hook: agent in **2 hours**, paid **$2,600** (not $1,200). Rebuild today **~30 min**. Four-box wireframe he showed the client. Only **flow 4 is AI** — that is why it was robust and fast. Student pays → (1) welcome + Slack + CRM row. Daily (2) if still "account creation" and follow-up date = today → reminder email + tag. Daily (3) if already followed and human-takeover date = today → Slack escalate + tag. (4) account created → one LLM email → CRM + Slack "onboarded."
2. Build: webhook (Postman mock: first/last/email/phone) → **pin**. Gmail welcome "AIS Academy" + first name; **strip n8n attribution**. Slack #YouTube Testing; **strip workflow link**; squiggle separators. Sheets append: full name, email, phone, status **account creation**, `$now.format` pay date, follow-up **+3 days**, human **+5 days**. Demo dates Nov 6 / 9 / 11.
3. Flow 2: cron 2pm → get rows status=account creation AND follow-up=today (he simulates +3) → reminder Gmail → update match **email** (not name): status first-follow-up-sent, date **NA**. Flow 3: copy trigger; filters first-follow-up-sent + human date today; Slack "5 days… please reach out"; status human notified / escalated. Unique ID warning: two people, same name.
4. Flow 4: n8n **form** as stand-in (email required to match). Fields: names, email, business, team size, goal, 90-day outcome. Agent "Mr. Friendly and Nice" → JSON `{subject, body}` via structured parser (OpenRouter Sonnet 4.5). Joke on business name (Up It AI). Gmail text; update row account-created + demographics + NA the chase dates; Slack onboarded with vars. Live build "~30 minutes." Wireframe ≈ canvas.
5. Why $2,600: inbound YouTube, **not selling**; small channel; "could this work for my business?" calls. Client: messy onboarding. He said it would be fast; they paid for **never manually onboard again**. ROI story: 5 new/week × 30 min = 2.5h; @$50/h = **$125/wk = $500/mo = $6,000/yr** plus intangibles (retention, LTV, capacity, fewer refunds, referrals). Flywheel / "self-licking ice cream." Rule of thumb: show **10×** on the fee. **$2,600 vs $6k/yr is not 10×** — keep the dissent. Time / money / focus. One AI node. Goldman BI aside: this is old automation. From-scratch: talk for waste patterns → n8n → fast prototype + Loom → conversations (he cites **~25** discovery calls before first money) → price on time/money saved. Plus **2,500**. Skool guide.
Gap: real processor, production cron. Timestamp UNKNOWN. $2,600 / $6k / 10× / 25 calls UNVERIFIED. n8n/Gmail/Slack on-tape. AIS Academy ICP parked.

## B. Atomic Knowledge

### Wireframe; three deterministic chases; one AI letter; price the outcome (and check the 10×)
- **Claim:** The product is a status machine, not an agent. AI is one JSON email. Pin, strip watermarks, match email, NA the dates you no longer need. Wireframe is the sale and the build map. Inbound demo > pitch. They buy time/money/focus, not nodes. His 10× rule and his $6k/$2.6k story do not match — keep both. 25 calls before a yes. Rebuild-time (30 min / 2h / title) wobbles.
- **Reasoning:** Same time/money/focus spine as later offer tapes. Complements `pxzo2lXhWJE` (draft vs send) — here he **sends**. Hard step.
- **Mechanism:** wireframe → webhook/form → deterministic tags → one parsed email → Slack humans → HITL on real sends.
- **Evidence:** Nov 6/9/11; Up It AI joke; 30-min live vs 2h story; 25-call confession; 10× vs 2.3× math.
- **Conditions:** All $ UNVERIFIED. Sheet-as-CRM is the demo.
- **Exceptions:** Hive does not mail students or take $2,600 as a price analog.
- **Action:** File four-box onboarding, email-as-id, one-AI-node, 10×-vs-own-math dissent, 25-calls. Do not auto-send.
- **Confidence:** high as an onboarding-automation + pricing-story tape
- **Source:** `bxGE_LXPyAU` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none named on the happy path; he warns name-collision
- **Speech ≠ behavior:** "agent" title vs one AI node; "10× no-brainer" vs $6k/$2.6k; "2 hours" vs 30-min rebuild + 30-min live

## C. Mental Models
Deterministic first. Wireframe is the contract. Status is the CRM. Unique ID. Outcome not hours. Flywheel. Reps before the first check. Skool room.

## D. Procedures
1. Draw four boxes with the client.
2. Payment → welcome + Slack + tagged row (+3 / +5).
3. Daily: one auto reminder, then a human Slack.
4. Account-created → one parsed email → close the row.
5. Match email; strip n8n fingerprints; pin while building.
6. Price from weekly hours × loaded rate × year; then **check** it is actually 10×.
Avoid: n8n-cloud as hive; auto-send in production; $2,600 as our rate; 10× as FACT.

## E. Examples
**Up It AI joke:** Situation — form fields into Mr. Friendly. Action — structured subject/body. Outcome — name pun lands. Lesson — parser makes Gmail drag-ins work.

**25 calls:** Situation — first money. Action — he kept hopping on. Outcome — one inbound onboarding. Lesson — the tape's "just post" still had a funnel of nos.

## F. Decision Rules
- IF the step is a chase → no LLM.
- IF two humans can share a name → match email/phone.
- IF you cannot show time or money → do not quote 10×.
- IF the email is real → HITL.
- Refuse: n8n as hive; $2,600 analog; student-mail blast.

## G. Contrarian
Against "more AI = more fee." Against selling nodes. Against waiting to be an expert (his inbound story).

## H. Assumptions
Caption-only. Complements offer tapes (`8MEJen0nblQ`) and draft-not-send (`pxzo2lXhWJE`). Keep Plus 2,500 vs other counts.

## I. Questions
Was $2,600 one invoice or a package? Did the 10× ever get shown on that call?

## J. Connections
SYSTEM SYNTHESIS → time/money/focus; `ask-principal` on send; do not flatten 10×.

## K. Future-Use
Four-box onboarding + email-as-id + one-AI-node + 10×-check as atoms.

## Steal / Operate-never

### Machine: wireframe a status chase; AI writes one letter; price the year, then check the multiple
- **Epistemic:** SOURCE
- **Workflow / loop:** wireframe → pay hook → tag → +3 mail → +5 Slack → form → parsed welcome → close
- **Questions / signals:** How many hours/week? Unique ID? Is the 10× real on this number?
- **Qualify / frame / objections:** $2,600 is a story, not a rate card. The steal is the four boxes.
- **Procedure:** D above.
- **Example that proves it:** 30-min live; 25 calls; 10× vs $6k.
- **Why it works:** Deterministic chases plus one voice beat a mega-agent invoice.
- **Conditions / exceptions:** $ UNVERIFIED. Hive does not mail AIS students.
- **Operate-never payload:** Auto-send. n8n-cloud. $2,600 as analog. 10× as FACT.
- **Hive run:** File four-box + 10×-check. Sends stay HITL.
- **Source:** `bxGE_LXPyAU` @ UNKNOWN

### Operate-never
- n8n-cloud as hive. Auto-send student mail. Quote $2,600 / 10× as FACT. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Upgrade old take: add 10×-vs-math and 25-call dissent. Hard steps HITL. Clients parked.
