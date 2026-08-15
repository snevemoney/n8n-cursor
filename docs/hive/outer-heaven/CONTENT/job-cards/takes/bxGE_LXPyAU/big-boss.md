# Big Boss — bxGE_LXPyAU
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/bxGE_LXPyAU/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/bxGE_LXPyAU/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 27:34, 7729 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: client wireframe, Postman mock, Gmail/Slack screens, Google Sheet CRM, n8n form, Sonnet welcome email, 10× ROI slide.

Beats, in order:

1. Claim: built an agent in 2 hours; client paid **$2,600** (not $1,200). Little n8n then; rebuild today **~30 min**. **$ / times UNVERIFIED.**
2. He will build it live, then say why they paid, what it means for beginners, how he’d sell the first agent from zero.
3. Wireframe shown first: **four** pieces. AI only on #4.
4. Flow 1 — payment: webhook → welcome email + account-create link → Slack “new student paid” → CRM row (Google Sheet). Status `account creation`. Follow-up date = pay+3; human takeover = pay+5.
5. Flow 2 — daily 2pm: get rows where status = `account creation` AND follow-up date = today → reminder email → update status `first follow-up sent`, date NA.
6. Flow 3 — daily: status = `first follow-up sent` AND takeover date = today → Slack **human** “5 days, please reach out” → status `human notified`.
7. Flow 4 — account created (form/webhook): fields include email (match key), business, team size, goal, 90-day outcome → Sonnet writes JSON `{subject, body}` as “Mr. Friendly and Nice” → email student → CRM `account created` + demographics → Slack “fully onboarded.”
8. Hygiene: unique match on email/phone, not full name. Turn off n8n attribution on Gmail/Slack. Slack squiggle separators.
9. Why they paid: inbound from small YouTube; he was not pitching; they paid for **outcome** (never manual onboard again), not hours or nodes. One AI step is why 2 hours was possible.
10. Value story: 5 clients/week × 30 min = 2.5h; $50/h → $125/wk → $500/mo → **$6,000/yr** direct; intangibles → retention/LTV. Flywheel / “self-licking ice cream cone.” Rule of thumb: show **10×** return. **All $ UNVERIFIED.**
11. From-zero: find weekly waste → pick n8n → prototype + Loom → talk, don’t pitch → price on time/money saved. **~25** discovery calls before first yes. **UNVERIFIED.**
12. Close: free Skool guide; Plus **2,500** members + premium course. **UNVERIFIED.**

Off-topic / not skipped: Goldman BI aside; AIS Academy as the demo school; “Up It AI” joke in the welcome.

## B. Atomic Knowledge

### Wireframe before canvas
- **Claim:** He sold and built from a four-box wireframe the client already saw.
- **Reasoning:** Alignment first. Canvas is faster when the boxes exist.
- **Mechanism:** Present the four flows; then n8n nodes mirror the boxes.
- **Evidence:** “exact wireframe that I presented to the client”; later “wireframes and the actual n8n flows are pretty much identical.”
- **Conditions:** Client can see the pipe. Works for a clog (onboarding), not a vibe.
- **Exceptions:** Tape does not show the client rejecting a box.
- **Action:** No build without a visible four-box (or equivalent) and a definition of done.
- **Confidence:** high
- **Source:** `bxGE_LXPyAU` @ UNKNOWN — “exact wireframe that I presented to the client”
- **Epistemic:** SOURCE

### Three deterministic rails, one AI sentence
- **Claim:** Flows 1–3 are plain automation. Only flow 4 calls a model.
- **Reasoning:** AI is where you spend time prompting and testing. Deterministic rails made the system “extremely robust” and the 2-hour clock possible.
- **Mechanism:** Webhook / cron / filters / Gmail / Slack / Sheets. Sonnet only after account-created, structured JSON out.
- **Evidence:** He says this is the only AI in the system; he built it when he was new.
- **Conditions:** The judgment slice is one email. The rest is status + dates.
- **Exceptions:** A messier onboard (mentor match, payments edge cases) would need more AI — he says that’s when the clock blows up.
- **Action:** Agent only on the judgment slice. Rails first.
- **Confidence:** high
- **Source:** `bxGE_LXPyAU` @ UNKNOWN — “the only time in this entire system that we’re using AI”
- **Epistemic:** SOURCE

### Status tags are the filter, not a chatbot
- **Claim:** Four statuses (`account creation` → `first follow-up sent` → `human notified` → `account created`) decide who gets mail, Slack, or nothing.
- **Reasoning:** Daily crons do not “think.” They get rows that match.
- **Mechanism:** Get-rows filters on status + date. Update-row matches email, writes next status, blanks the used date.
- **Evidence:** Live Sheet updates on tape.
- **Conditions:** Status vocabulary is closed. Dates are computed at insert (pay+3, pay+5).
- **Exceptions:** If they create an account early, flow 4 should NA both dates (he says you could).
- **Action:** Definition of done includes the status ladder, not “an onboarding agent.”
- **Confidence:** high
- **Source:** `bxGE_LXPyAU` @ UNKNOWN — “this is how we make sure we filter them out later”
- **Epistemic:** SOURCE

### One auto-nudge, then a human
- **Claim:** Day-3 email is automatic. Day-5 is Slack to a person, not a second blast.
- **Reasoning:** You do not want to “manually be chasing,” but you also do not want an infinite drip.
- **Mechanism:** Cron 2pm → reminder once → tag. Next cron → “please reach out” internally.
- **Evidence:** Slack copy: “5 days… haven’t yet created an account. Please reach out to assist.”
- **Conditions:** One reminder is the tape’s law, not a universal cadence.
- **Exceptions:** He does not show a third touch or a kill.
- **Action:** `ask-principal` + `send-removed` on the second touch. Hive does not auto-email a paid list without an escalate.
- **Confidence:** high for the shape
- **Source:** `bxGE_LXPyAU` @ UNKNOWN — “human escalation”
- **Epistemic:** SOURCE

### Match on a unique ID
- **Claim:** Update-row matches email (or phone), not full name.
- **Reasoning:** Two people can share a name. Email is the join between payment webhook and account form.
- **Mechanism:** Form re-asks email so flow 4 can find the row.
- **Evidence:** He warns against matching full name.
- **Conditions:** Email is present on both sides.
- **Exceptions:** Phone as alternate unique.
- **Action:** Every CRM write names the match key. Name is display, not join.
- **Confidence:** high
- **Source:** `bxGE_LXPyAU` @ UNKNOWN — “what if you do have two people with the same full name?”
- **Epistemic:** SOURCE

### They paid for the clog, not the hours
- **Claim:** Client paid **$2,600** for never manually onboarding again — not for 2 hours or node count. He even said it would not take long.
- **Reasoning:** Outcome (smooth student, tracked team, peace of mind) is the SKU. Time is the builder’s cost, not the price.
- **Mechanism:** Inbound from YouTube demos; discovery as “making friends”; wireframe; build.
- **Evidence:** “They weren’t paying for my time or how many nodes I used.” **$ UNVERIFIED.**
- **Conditions:** Buyer already feels the clog. He was not pitching.
- **Exceptions:** ~25 discovery calls before first yes — also **UNVERIFIED**; not a close-rate proof.
- **Action:** Outcome-offer sentence. Do not sell “an agent.” Do not hunt a school because AIS Academy is the prop.
- **Confidence:** high that he framed it this way; zero as our price
- **Source:** `bxGE_LXPyAU` @ UNKNOWN — “paying for the outcome”
- **Epistemic:** SOURCE (frame) / UNVERIFIED ($)

### 10× slide is a sales story, not a receipt
- **Claim:** Rule of thumb: show the system returns **10×** what they pay. Example math: $50/h × 2.5h/wk → $6k/yr, then a flywheel.
- **Reasoning:** “Give me $1,000, I give you $10,000” is how he wants buyers to hear automation.
- **Mechanism:** Hours × rate × 52, plus intangibles he claims become retention/LTV.
- **Evidence:** Slide + “self-licking ice cream cone.” **$ / 10× UNVERIFIED.**
- **Conditions:** Only if hours and rate are the client’s, not invented.
- **Exceptions:** He says the $6k is conservative and will grow — still a story.
- **Action:** Steal the **hours→money sentence**. Do not quote $2,600 / $6k / 10× as FACT.
- **Confidence:** high he taught it; low as a law
- **Source:** `bxGE_LXPyAU` @ UNKNOWN — “10x return on what they pay you”
- **Epistemic:** SOURCE (he said it) / UNVERIFIED (math)

### Structured output is why the AI step is small
- **Claim:** The model must emit `{subject, body}` so Gmail fields map without parsing prose.
- **Reasoning:** Two Gmail boxes need two fields. A blob fails the rail.
- **Mechanism:** System prompt + JSON schema parser. Sonnet 4.5 via Open Router on tape.
- **Evidence:** “Time to up it your game” subject from “Up It AI.”
- **Conditions:** Schema is required. Attribution off.
- **Exceptions:** Joke quality is taste, not a test.
- **Action:** If we ever draft a welcome, schema first. Send stays HITL.
- **Confidence:** high
- **Source:** `bxGE_LXPyAU` @ UNKNOWN — “JSON object with two fields, subject and a body”
- **Epistemic:** SOURCE

### Inbound from proof, not a pitch
- **Claim:** Small YouTube, not positioning as expert, people asked “could this work for my business?” He hopped on calls to validate.
- **Reasoning:** Demos are the portfolio. Pitching is the smell.
- **Mechanism:** Post builds → inbound → talk pain → wireframe → price on outcome.
- **Evidence:** This client came inbound; messy onboarding was the stated clog.
- **Conditions:** Works when the demo matches a clog they already have.
- **Exceptions:** 25 nos before a yes — survivorship.
- **Action:** `one-channel-deep` proof artifacts. No new hunt. Clients parked.
- **Confidence:** medium (one inbound story)
- **Source:** `bxGE_LXPyAU` @ UNKNOWN — “I wasn’t trying to sell anything”
- **Epistemic:** SOURCE

## C. Mental Models

- **Boring rails are the product.** Predictable status + dates beat an “agent.” **SOURCE**
- **AI is the expensive slice.** Use it once, late, structured. **SOURCE**
- **Price the clog.** Hours are the builder’s cost. **SOURCE**
- **Wireframe is the contract.** Canvas copies the boxes. **SOURCE**
- **One nudge, then a person.** Infinite drip is not the tape. **SOURCE**
- **Email is the join.** Name is not a key. **SOURCE**
- **10× is how he wants them to feel.** Not a hive FACT. **INFERENCE**
- **Posting demos is the lead magnet.** Plus/Skool is the close. **INFERENCE**

## D. Procedures

1. **Name the clog:** paid but not activated (or equivalent).
2. **Wireframe** the four boxes with the buyer. Status ladder + dates on the page.
3. **Rail 1:** payment event → welcome + link + internal ping + CRM row (`account creation`, +3, +5).
4. **Rail 2:** daily — unpaid-account + due date → **one** reminder → tag.
5. **Rail 3:** daily — already reminded + due → **human** Slack → tag.
6. **Rail 4:** account-created → model drafts `{subject, body}` from form fields → **draft** (his tape sends) → CRM complete → Slack done.
7. **Match** on email/phone. Never name.
8. **Test** each status with pinned mock payloads (Postman / form).
9. **Price** as hours-back + experience, not nodes. Show their math. **Do not quote his $.**
10. **From-zero (his):** waste patterns → tool → Loom → conversations → reps.

**Qualify / frame:** school-onboard demo. AIS Academy is a prop. Not a Path A plumber.
**Objections:** “It’s just four zaps” — yes; that’s why it held. “$2,600 for 2 hours” — outcome story, **UNVERIFIED**.
**Avoid:** auto-email without escalate; quoting 10× / 25 calls as FACT; n8n/Skool as hive OS.
**When to change:** if status cannot be listed, stop. If the next step is send, HITL.

## E. Examples

**Situation:** Student pays; no account yet.  
**Action:** Webhook writes CRM `account creation`, emails link, Slacks the team.  
**Reasoning:** Payment is the trigger; status is the memory.  
**Outcome:** Row exists with +3 / +5 dates.  
**Lesson:** Ingest + tag is done. Implicit rule: no AI on the payment rail.

**Situation:** Three days later, still no account.  
**Action:** Cron filters those rows, sends one reminder, tags `first follow-up sent`.  
**Reasoning:** One automatic chase.  
**Outcome:** Human has not touched it yet.  
**Lesson:** One nudge is the machine. Implicit rule: do not loop the blast.

**Situation:** Five days, still no account.  
**Action:** Slack the team; tag `human notified`. No second student email.  
**Reasoning:** Next touch is judgment.  
**Outcome:** A person is on the hook.  
**Lesson:** Escalate is a hard step. Implicit rule: Slack ≠ auto-send the student.

**Situation:** They create an account and fill goal / 90-day outcome.  
**Action:** Model writes a joke-personalized welcome as JSON; he sends it; CRM `account created`.  
**Reasoning:** Only now is there taste.  
**Outcome:** “Up It AI” subject lands.  
**Lesson:** AI last, schema on. Implicit rule: hive drafts; Evens sends.

## F. Decision Rules

- If the box is status + date → no model.
- If the box is a sentence with taste → one model, structured out.
- If they have not created an account → one reminder, then a human.
- If two records could collide → match email/phone.
- If the buyer asks “how long to build?” → do not price hours.
- If you cannot show **their** hours-back math → do not invent $50/h.
- Optimize: paid → activated, tracked.
- Refuse: auto-email a list without escalate; $2,600 SKU; 25-call hunt; school ICP.

## G. Contrarian

- Against “sell an agent”: three rails are zaps; one email is AI.
- Against “charge time”: they paid for never chasing again.
- Against “pitch”: inbound from demos, friend-calls.
- Against “more AI = more value”: more AI = more clock and more break.

## H. Assumptions

**His:** Sheet-as-CRM is enough; 3/5-day cadence is right; $50/h and 5/week are fair analogs; 10× closes; YouTube inbound repeats; n8n is the tool to learn.

**Ours:** Captions complete enough (7729 words). $2,600 / 2h / 30 min / $6k / 10× / 25 calls / 2,500 Plus = **UNVERIFIED**. Domain: course onboarding, not local-pro. Clients parked.

**Falsifiers:** Day-3 email is ignored and day-5 Slack is ignored. Sheet collisions. Webhook misses payments. Buyer wanted a real CRM, not Sheets.

**Disagreement (keep labeled):** Hive will not operate auto-welcome send or a $2,600 n8n SKU. The **rails-then-one-AI** and **one-nudge-then-human** machines are stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What was the real client stack (not the YouTube Sheet)?
- Did day-5 Slack ever convert an account on tape? Not shown.
- Who owned the account-create URL?
- Refund / chargeback path — absent.
- Actual hours including test/fix — he says 2; rebuild 30 min — **UNVERIFIED**.

## J. Connections

- **SYSTEM SYNTHESIS** → `paid-slice` / `checkout-proof`: payment is the trigger, not a chatbot.
- **SYSTEM SYNTHESIS** → `ask-principal` + `send-removed`: reminder send and welcome send stay HITL.
- **SYSTEM SYNTHESIS** → `outcome-offer-funnel`: price the clog.
- **SYSTEM SYNTHESIS** → `slice-build`: wireframe = bible.
- **SYSTEM SYNTHESIS** → `kOKavHnlPik`: filters on a table, not vectors.
- Do not unpark a school / academy ICP.

## K. Future-Use

- Status ladder as a Watchdog smoke (unassigned).
- Attribution-off as a Communications hygiene note (unassigned).
- Flywheel sentence for GTM copy (learn only).
- 25-call reps as Career Strategist morale, not a quota.

## Steal / Operate-never

### Machine: Rails first, one AI sentence, one nudge then a human
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** payment event → welcome + CRM tag → daily filter → one reminder → daily filter → human escalate → account-created → model drafts structured welcome → human sends → tag done.
- **Questions / signals:** “What are the statuses?” “What is the unique match?” “Where does AI actually start?” “Who owns day-5?”
- **Qualify / frame / objections:** Course-onboard demo, not a hive SKU. “$2,600 agent” is the title. Objection: too simple — that’s the point.
- **Procedure:** D steps 1–8. Checkable stops: (1) wireframe signed, (2) row with status+dates, (3) one reminder tagged, (4) human Slack tagged, (5) draft welcome, not a silent send.
- **Example that proves it:** Pay → Sheet row → day-3 mail → day-5 Slack → form → JSON welcome. Lesson: the agent is the last box.
- **Why it works:** Deterministic work should stay deterministic. Taste is one letter. Escalation is a person. Conditions: closed status set, unique key, buyer feels the clog. Exceptions: he auto-sends on tape; we do not.
- **Conditions / exceptions:** Cursor + Grok only. n8n / Sonnet / Skool / AIS Academy on tape. Clients parked. Tape $ UNVERIFIED.
- **Operate-never payload:** Auto-email a paid list; quote $2,600 / 2h / 30 min / 10× / 25 calls / 2,500 as FACT; school hunt; his stack as OS.
- **Hive run (existing skills only):** `slice-build` · `outcome-offer-funnel` · `ask-principal` · `send-removed` · `paid-slice` (payment as trigger) · `golden-test-loop` (status smokes).
- **Source:** `bxGE_LXPyAU` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Auto-email without Evens on escalate
- Quote $2,600 / 2h / 30 min / $6k / 10× / 25 calls / Plus 2,500 as FACT
- Nate Academy / Plus / Skool as a hive SKU
- New hunt ICP / unpark Normand / school-onboard hunt
- Install Claude / n8n-cloud as the OS · Cursor + Grok only
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md`

## L. Role-Specific Applications

I manage; I do not sell a 2-hour miracle.

- **Done** on an onboard slice: wireframe + status ladder + one reminder + a human escalate + a **draft** welcome. A sent Gmail is not done.
- **Delegate without being asked:** Forge/Watchdog smoke the four statuses; Communications drafts only; Money Desk does not book $2,600.
- **Skeptical review:** One inbound YouTube story is not a price list. I will not approve “an agent” that is three crons and a joke email.
- **One system this take:** paid → account-created checklist. Not a $2,600 SKU. Not 25 cold discoveries.
- Live hunt stays parked.
