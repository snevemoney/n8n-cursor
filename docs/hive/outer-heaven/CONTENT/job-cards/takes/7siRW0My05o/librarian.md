# Librarian — 7siRW0My05o
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7siRW0My05o/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7siRW0My05o/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** This Vapi + n8n Voice Agent Won $5,000 in Just 21 Days
**Channel:** Nate Herk | AI Automation
**Kind:** video (~4170 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Plus hackathon: build a **voice** agent, backend **n8n**, 3 weeks, **$5,000** (UNVERIFIED). Winner **Azim/Zane** — ~6 months in, high school, no prior tech; YouTube + courses; Bolt new ~2 months ago. Nate: people think the answer is an agency; “apparently the answer is AI Plus.”
2. Product: mental-health web app — custom Bolt frontend, **9** n8n workflows, Vapi for voice, Firebase auth (email/password, user ids). Onboarding: name/email/phone/timezone/password + five intake Qs so it is not a generic bot. Dashboard: start session / progress / companion settings. Click-to-call: n8n personalizes the agent further, Vapi **outbound** to the phone. Live demo: Nate stressed-at-work; agent male, pauses, breathing exercise; Nate ends. Post-call: another agent condenses transcript/summary into the profile for the next call.
3. Workflows (“nine biggest pains”): (a) onboarding webhook → code extract → profile-manager agent (Sheets) → preference agent (morning/evening sheets). Bolt just POSTs the webhook. (b) on-demand call: webhook → **safety/crisis** branch (would alert emergency services “in the real world”) → caution-score twins → mental-health agent looks up user in Sheets → **new vs existing** Vapi assistant (create vs get+update prompt) → HTTP place-call + dynamic phone-number pool → poll every **30s** until ended → notify the app → merge transcript into profile → mark number free. (c) scheduled twins for morning/evening/Sunday (same flow, different trigger). (d) preference-changed webhook → master + two sub-agents (overall vs sub-profiles). (e) weekly report (in progress): Fri 8–6 hourly, walk users/preference sheets, email (Gmail stand-in for a CRM) — **linear**, not tools-on-an-agent, because order is fixed.
4. Nate’s praise: mostly **linear + conditionals**, few agents, he stays in control; number pool + poll as guardrails. Templates in Plus. Azim: will not public-launch without **HIPAA**/funding; agency portfolio piece; own YT + Skool + consults.
Gap: five other workflows, Vapi prompts, Bolt UI. Timestamp UNKNOWN. Vapi/n8n/Bolt/Firebase/Plus/Skool on-tape. Mental-health + emergency-services = operate-never for hive.

## B. Atomic Knowledge

### Linear voice spine: webhook → safety → personalize → pool/poll → write-back
- **Claim:** The winning machine is not “an agent that talks.” It is a linear n8n spine: intake to Sheets, crisis fork, new-vs-existing Vapi prompt, phone-number lock, 30s poll, profile write-back, scheduled clones of the same path. Fixed-order report stays a workflow, not tools.
- **Reasoning:** Autonomy in the middle would skip safety or double-book a number. Personalization is a profile that accumulates, not a smarter model.
- **Mechanism:** Bolt/Firebase → webhooks → Sheets as memory → Vapi HTTP → poll → write-back.
- **Evidence:** live outbound call; nine workflows; number available flag; crisis branch.
- **Conditions:** $5k / 21 days / hundreds of entries UNVERIFIED. HIPAA named as a launch blocker.
- **Exceptions:** Weekly report unfinished; Gmail ≠ CRM.
- **Action:** File linear-spine + pool/poll + crisis-fork. Do not build a hive therapist. Do not auto-alert emergency services. Vapi/n8n/Bolt stay on-tape.
- **Confidence:** high as a voice-ops machine; product is parked
- **Source:** `7siRW0My05o` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** “nine biggest pains”
- **Speech ≠ behavior:** “won $5k in 21 days” vs 3-week hackathon + Plus room; “alert emergency services” is hypothetical

## C. Mental Models
Frontend is a webhook. Memory is a sheet the next call can read. Linear beats autonomous when the order is known. A passion project can be a portfolio even if it never ships.

## D. Procedures
1. Split onboarding / on-demand / scheduled / preference / report — do not one-graph it.
2. Safety check before personalize/call.
3. Create vs update the voice assistant from the same profile.
4. Lock a number, poll to ended, unlock.
5. Keep fixed-order jobs as workflows.
6. Do not ship health/crisis without compliance (his own stop).
Avoid: Vapi as hive; Plus templates as SSOT; emergency auto-dial; new mental-health ICP; $5k as FACT.

## E. Examples
**Outbound demo:** Situation — Nate just onboarded. Action — webhook → Vapi call. Outcome — breathing exercise, natural pauses. Lesson — personalization + voice quality were the judged surface.

**Number pool:** Situation — one Vapi number per live call. Action — mark unavailable, poll 30s, free. Lesson — guardrail, not a smarter agent.

## F. Decision Rules
- IF order is known → linear workflow, not agent-tools.
- IF crisis language → dedicated path, not “the therapist will handle it.”
- IF HIPAA is unnamed → do not launch (his).
- Refuse: hive therapist; Vapi/n8n-cloud; Plus; emergency auto-alert; $5k as FACT.

## G. Contrarian
Against agency-as-the-only-monetize (Nate: Plus). Against agent-in-the-middle of a call spine.

## H. Assumptions
Hackathon judging ≠ production. Complements `4OOS96i2gfI` (climb-only) and `BO-jFbN4p8Y`. Caption-only.

## I. Questions
What did the other five workflows do? Was the crisis path ever tested with a real phrase?

## J. Connections
SYSTEM SYNTHESIS → `4OOS96i2gfI`; `BO-jFbN4p8Y`; `y-cq_Qo4zVo`; `-cdexJWN8YA`.

## K. Future-Use
Linear-spine + pool/poll + crisis-fork + fixed-order-not-tools as atoms. Product parked.

## Steal / Operate-never

### Machine: linear voice spine with safety fork, number pool, and profile write-back
- **Epistemic:** SOURCE
- **Workflow / loop:** intake → memory → safety → personalize assistant → lock number → call → poll ended → write profile → unlock → checkable stop = a transcript row and a free number, not a vibe
- **Questions / signals:** New or existing? Crisis? Which number is free? Is order fixed?
- **Qualify / frame / objections:** Control > autonomy on a phone call.
- **Procedure:** D above.
- **Example that proves it:** Nate’s outbound demo; 30s poll; weekly report kept linear.
- **Why it works:** The call is a state machine; the model only writes the prompt and the summary.
- **Conditions / exceptions:** HIPAA; $5k UNVERIFIED; report unfinished.
- **Operate-never payload:** Vapi/n8n/Bolt as hive; hive therapist; emergency auto-alert; Plus; $5k as FACT.
- **Hive run:** Steal the spine pattern only. Do not build or sell this product.
- **Source:** `7siRW0My05o` @ UNKNOWN

### Operate-never
- Mental-health companion as a hive offer. Auto emergency services. Vapi/n8n-cloud as hive. Quote $5k as FACT. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File linear-spine + crisis-fork. Do not unpark a health ICP. Do not copy the Plus hackathon as a hive contest.
