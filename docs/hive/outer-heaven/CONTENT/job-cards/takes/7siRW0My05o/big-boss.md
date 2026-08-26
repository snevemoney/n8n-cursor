# Big Boss — 7siRW0My05o
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7siRW0My05o/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7siRW0My05o/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Nate Herk interview (PACKET: 18:50, 4170 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: Bolt UI, nine n8n canvases, Firebase verify email, live Vapi call audio, Google Sheets profile rows. Captions garble names (`Azim`/`Zane`, `Seolassium`/`seem`, `VP`/`Appy` = Vapi, `NAN`/`N` = n8n, `bold` = Bolt).

Beats, in order:

1. Hook: Plus hackathon winner took **$5,000**; ~**6 months** in; still in high school. Hundreds entered. **$ UNVERIFIED.**
2. Brief was narrow: build a **voice agent**; backend must be n8n. 3 weeks.
3. Azim intro: mental-health web app. Stack: Bolt frontend, **9** n8n workflows, Vapi for voice, Firebase auth.
4. Background: no prior tech; learned from courses + Nate YouTube; Bolt was new two months ago.
5. Nate aside: people think the answer is an AI agency; “apparently the answer is to do an AI plus.”
6. Onboarding demo: name, email, phone, timezone, password → Firebase. Then **five** intake questions so the companion is not generic.
7. Main screen: start session / view progress / customize companion. Click start → n8n personalizes agent → Vapi outbound call to the user.
8. Live call (Nate as user): work stress; he will not share much; breathing exercise; he ends it. Nate likes voice, pauses, non-aggressive tone.
9. After-call: separate agent condenses transcript + summary into the user profile for the next call.
10. Workflow 1 — onboarding webhook: webhook → code extract → profile-manager agent (Sheet) → preference agent (morning/evening sheets). Nate: drop webhook URL into Bolt.
11. Workflow 2 — on-demand call (the “master”): webhook → **safety check** (crisis → emergency path) → load profile by user ID → new user creates Vapi assistant / existing user updates prompt → HTTP place call + fetch available number → poll until ended (~30s) → notify web app → merge transcript into profile → mark number available again.
12. Nate praise: **linear + conditionals**, “not very autonomous,” keeps you in control. Templates behind Plus paywall.
13. Scheduled twins: morning / evening / Sunday — same flow, schedule trigger.
14. Preference-changed webhook: profile manager + two sub-agents (overall vs preference sub-profiles).
15. Weekly report (in progress): Friday hourly 8–6, cycle users, email. Nate: do **not** give a fixed sequence as agent tools.
16. Azim on ship: needs HIPAA, data protection, funding to give it away. Unsure. Nate: keep it as a **passion demo** for an agency; even unlaunched it has net positives.
17. Close: Azim YouTube + consults + his own Skool. Plus download of the winning templates. Like the video.

Off-topic / not skipped: high-school inspire magnet; Plus vs agency joke; “nine biggest pains of my life”; Gmail-node-as-stand-in-for-CRM.

## B. Atomic Knowledge

### Narrow brief, judged build
- **Claim:** The hackathon only required a voice agent with an n8n backend. The winner added a Bolt app, Firebase, nine workflows, and a mental-health framing.
- **Reasoning:** A thin brief still needs a checkable artifact. Extra surface (web app + HIPAA talk) is taste, not the rule.
- **Mechanism:** 3-week Plus contest → one crowned build → interview as the magnet for Plus templates.
- **Evidence:** Nate: “all that they were told was that they needed to build a voice agent and the backend integration needed to be [n8n].”
- **Conditions:** Works as a contest when judges can run a demo call.
- **Exceptions:** Hundreds entered; we only see the winner. Survivorship.
- **Action:** Steal “narrow brief + demoable artifact,” not “win $5k with a therapist.”
- **Confidence:** high for the brief; low for “this is why he won” as a law
- **Source:** `7siRW0My05o` @ UNKNOWN — “build a voice agent and the backend integration needed to be ended in”
- **Epistemic:** SOURCE

### Passion demo is not a launch
- **Claim:** Azim will not ship this as a public product without HIPAA, data protection, and funding. Nate reframes it as a client-facing proof of craft.
- **Reasoning:** A call that “sounds nice” is a portfolio piece. Healthcare voice is a regulated product.
- **Mechanism:** Live call → “give it a quick call if you want to see the type of voice agents I can build.”
- **Evidence:** Azim: deploy needs HIPAA; Nate: even if it never makes money, net positives; agency + YouTube + Skool + consults.
- **Conditions:** Demo is useful when the buyer wants voice-agent craft, not therapy.
- **Exceptions:** Tape does not show a client who booked from this demo.
- **Action:** Definition of done for a proof slice ≠ definition of done for a health product.
- **Confidence:** high
- **Source:** `7siRW0My05o` @ UNKNOWN — “HIPPA compliance, data protection” / “passion project”
- **Epistemic:** SOURCE

### Linear plus gates beats a nameless swarm
- **Claim:** Nate likes the call flow because it is linear, full of conditionals, and “doesn’t seem very autonomous.”
- **Reasoning:** Control is the feature. Autonomy here would hide the safety fork and the number recycle.
- **Mechanism:** Webhook → extract → safety → profile lookup → create-or-update assistant → place call → poll → write-back.
- **Evidence:** “keeps you in control pretty much the whole way”; weekly report should stay linear so the agent cannot mess up the order.
- **Conditions:** The sequence is known in advance (onboard, call, report).
- **Exceptions:** Profile-manager agents still sit on Sheets; “agent” here is a node, not a desk.
- **Action:** Prefer a written path with named forks over “the companion figures it out.”
- **Confidence:** high
- **Source:** `7siRW0My05o` @ UNKNOWN — “pretty linear” / “doesn’t seem very autonomous”
- **Epistemic:** SOURCE

### Safety check before the model talks
- **Claim:** After the call webhook extracts the query, a safety segment runs. Crisis routes to an emergency path that “in the real world would alert emergency services.”
- **Reasoning:** Mental-health voice without a stop is reckless. The stop is the only part of the therapist we keep as physics.
- **Mechanism:** Safety node → emergency branch vs northern “no emergency / caution score” branches → then the companion.
- **Evidence:** Azim narrates the fork; Nate calls it “really cool.” No live crisis is shown.
- **Conditions:** Useful when the next step is a model that will speak to a human about distress.
- **Exceptions:** “Would alert emergency services” is claimed, not demonstrated. Caution-score difference is not specified.
- **Action:** Any future voice **draft** gets a refuse/escalate gate before speech. Therapist SKU stays operate-never.
- **Confidence:** high that the node exists; low that the emergency path works
- **Source:** `7siRW0My05o` @ UNKNOWN — “checking the safety of the user’s query”
- **Epistemic:** SOURCE

### Write the profile before you personalize the call
- **Claim:** Onboarding agents write Sheets; the call flow reads the same user ID back so the assistant is not generic.
- **Reasoning:** Tailoring needs a handle. Five intake answers plus post-call summaries are the memory.
- **Mechanism:** Profile manager + preference agent on onboard; later lookup by user ID; after-call agent merges transcript/summary; preference-changed webhook updates sub-profiles.
- **Evidence:** Demo: five questions → “not some generic voice agent”; after call, “smarter and smarter.”
- **Conditions:** Works when the next call can find the same row.
- **Exceptions:** Nate did not pick a gender; he still got a male voice. Preference sheets (morning/evening/Sunday) are a split he later called painful.
- **Action:** Named artifact in a known store before the expensive step (the call).
- **Confidence:** high for the write/read loop; medium for “feels like a human”
- **Source:** `7siRW0My05o` @ UNKNOWN — “maps all of the foreign details to your newly created profile”
- **Epistemic:** SOURCE

### New user creates; existing user updates
- **Claim:** The call path forks: new user → write prompt → create Vapi assistant. Existing user → fetch current assistant → rewrite prompt → update/recreate.
- **Reasoning:** One assistant ID per person, mutated over time, is cheaper than a blank agent each call — on tape.
- **Mechanism:** User-ID lookup → branch → HTTP to Vapi create vs update.
- **Evidence:** Azim: “my struggles did not stop here… route new users and also existing users.”
- **Conditions:** Requires a stable user ID and a stored assistant handle.
- **Exceptions:** Recreate vs update is collapsed in speech; we do not see a failed update.
- **Action:** Steal create-or-update, not “new therapist every session.”
- **Confidence:** high
- **Source:** `7siRW0My05o` @ UNKNOWN — “create the assistant” / “update that prompt”
- **Epistemic:** SOURCE

### Poll until ended, then recycle the number
- **Claim:** After placing the call, the workflow polls (~30s) until the call has ended, notifies the web app, writes the profile, and marks the phone number available again.
- **Reasoning:** Vapi does not push “done” in this design. A number cannot host two conversations.
- **Mechanism:** HTTP get-call → route until ended → ended notification → merge → mark number free. On-demand vs scheduled copies share this tail.
- **Evidence:** Nate restates polling and unavailable/available marking as “error handling guardrails.”
- **Conditions:** Works when one number is a scarce lock.
- **Exceptions:** Poll interval and failure-to-end are not shown. Scheduled morning/evening/Sunday twins are “pretty similar,” not walked.
- **Action:** Checkable stop = status ended + lock released. Do not treat “call started” as done.
- **Confidence:** high
- **Source:** `7siRW0My05o` @ UNKNOWN — “check every 30 seconds” / “marking off a number as unavailable”
- **Epistemic:** SOURCE

### Do not hand a known sequence to an agent as tools
- **Claim:** The Friday report always checks the same preference sheets then emails. Giving those steps as agent tools would add ways to mess up.
- **Reasoning:** If the order is known, linearity is the guardrail.
- **Mechanism:** Schedule → cycle users → extract preference profiles → email sender (Gmail as stand-in; “real world” = CRM).
- **Evidence:** Nate: “because Azim understood that this flow was going to happen in the same order every time… it wouldn’t make much sense to make all of those a tool given to an agent.”
- **Conditions:** Sequence is stable. Email is a demo.
- **Exceptions:** Flow is “in progress.” No real CRM. Hourly Friday window is a sketch.
- **Action:** Fixed report = script. Agent tools are for unknown order.
- **Confidence:** high as a design rule; low as a shipped report
- **Source:** `7siRW0My05o` @ UNKNOWN — “in control the entire way”
- **Epistemic:** SOURCE

### Nine workflows is still one product
- **Claim:** Azim calls the nine n8n workflows “the nine biggest pains of my life.” Nate still sells them as one $5k voice-agent build.
- **Reasoning:** Pain count is not a portfolio. One companion is the product; the nine are slices of one pipe.
- **Mechanism:** Onboard, on-demand call, three schedule copies, preference change, weekly report, plus two not walked.
- **Evidence:** “We didn’t get to cover all nine today” → Plus + Azim YouTube.
- **Conditions:** Contest scoring liked completeness.
- **Exceptions:** Two (or more) workflows are unseen. Copy-paste of the call flow into morning/evening/Sunday is admitted duplication.
- **Action:** One system this take = the safety-gated call path, not a nine-workflow estate tour.
- **Confidence:** high
- **Source:** `7siRW0My05o` @ UNKNOWN — “nine N workflows and also the nine biggest pains”
- **Epistemic:** SOURCE

### Contest $ and Plus are the close, not a price analog
- **Claim:** $5,000, 6 months, high school, hundreds of participants, Plus templates, Azim Skool/consults are the magnet.
- **Reasoning:** Inspire + download is the funnel. None of it is a hive receipt.
- **Mechanism:** Interview → “download this template in the community.”
- **Evidence:** Opening and close. **$ UNVERIFIED.**
- **Conditions:** Works if Plus exists and the template imports.
- **Exceptions:** We do not see other entries. High-school claim is on tape only.
- **Action:** Do not quote $5k / 6 months / 9 workflows as FACT. Do not join Plus/Skool.
- **Confidence:** high that they said it; none as our economics
- **Source:** `7siRW0My05o` @ UNKNOWN — “winner of the $5,000”
- **Epistemic:** SOURCE

## C. Mental Models

- **Control is the win condition.** Linear + forks > “autonomous companion.” **SOURCE**
- **Safety is a branch, not a vibe.** Crisis path before speech. **SOURCE**
- **Memory is a Sheet row.** Write on onboard and after-call; read on the next trigger. **SOURCE**
- **A number is a lock.** Occupy, poll, release. **SOURCE**
- **Known order stays a script.** Tools are how agents scramble a Friday report. **SOURCE**
- **Unshipped can still sell craft.** Passion demo for an agency. **SOURCE**
- **HIPAA is a stop, not a stretch goal.** Azim will not public-launch without funding/compliance. **SOURCE**
- **Plus is the store.** Winning templates are behind the paid community. **INFERENCE**
- **“Inspiring high school” is the hook, not a hiring bar.** **INFERENCE**

## D. Procedures

1. **Scope the contest/product in one sentence.** Here: voice agent + n8n backend. Extra UI is optional.
2. **Onboard to a named store.** Form → webhook → extract → profile row + preference rows. Checkable stop: row exists for that user ID.
3. **Intake enough to tailor, not enough to play doctor.** Five questions on tape. Stop before diagnosis.
4. **Before any outbound voice:** run a safety/crisis check. Emergency path is a human/services problem, not a model chat.
5. **Load the profile.** New → create assistant. Existing → update prompt. Do not call a blank agent.
6. **Acquire a free number, place the call, poll until ended.** Notify the surface. Merge transcript. Release the number.
7. **Preference changes** go through a dedicated write path (sub-profiles), not a rewrite of the whole brain.
8. **Recurring reports** stay linear if the order is known. Do not tool-ify a fixed checklist.
9. **Ship decision:** if the domain is health/legal/money, compliance is a stop. Keep the demo as proof of craft only.
10. **CTA on tape** is Plus + Azim links. Ours is none — clients parked.

**Qualify / frame:** Content-ops / agency-portfolio tape, not a clinic SKU. Nate is the host; Azim is the builder.
**Objections:** “It won $5k so we should clone it” — answer with HIPAA stop + linear-not-autonomous praise + unseen workflows.
**Avoid:** Vapi/Firebase/Bolt/n8n-cloud as hive OS. Mental-health voice. Scheduled outbound “companion” calls.
**When to change:** If safety cannot route, do not place the call. If the number cannot be locked, do not start a second session.

## E. Examples

**Situation:** Nate finishes five intake questions and clicks start session.  
**Action:** n8n personalizes the agent from the new profile, Vapi dials him, companion offers a breathing exercise.  
**Reasoning:** Tailor-then-call is the product story.  
**Outcome:** Nate likes the voice; ends the call; profile is supposed to update.  
**Lesson:** The checkable stop is “call happened + profile write,” not “cured stress.” Implicit rule: demo feelings are not clinical proof.

**Situation:** User query might be a crisis.  
**Action:** Safety segment forks to an emergency path before the companion.  
**Reasoning:** Speech to a distressed human without a stop is the failure.  
**Outcome:** Fork is described, not live-tested.  
**Lesson:** A narrated gate is still the machine. Implicit rule: do not skip the gate because the happy-path call sounded kind.

**Situation:** Friday report must hit four preference sheets then email.  
**Action:** Keep the path linear; do not expose those steps as agent tools.  
**Reasoning:** Known order + tools = extra ways to scramble.  
**Outcome:** Sketch only; Gmail stands in for CRM.  
**Lesson:** Scripts for sequences, agents for unknowns. Implicit rule: “in progress” is not done.

**Situation:** Azim is asked what he will do with the app.  
**Action:** He names HIPAA/funding and stays unsure. Nate converts it to a passion demo for agency sales.  
**Reasoning:** Public mental-health voice is a different product than a contest build.  
**Outcome:** Close goes to YouTube / consults / Skool / Plus.  
**Lesson:** Unshipped work can still be a proof artifact. Implicit rule: do not launch the demo as the SKU.

## F. Decision Rules

- If the next step is a model speaking to a human in distress → safety fork first, or do not call.
- If the sequence is known → linear path, not a tool-bearing agent.
- If the user is new → create assistant; if existing → update. Do not blank-slate.
- If the call has not ended → keep polling; do not write the profile or free the number.
- If the domain needs HIPAA/funding to exist in public → park the product; keep the demo.
- If a number is in use → it is unavailable. No double book.
- Optimize: one demoable voice path with gates.
- Refuse (on this desk): AI therapist SKU, Vapi clone, Plus template install, scheduled “companion” outbound as ours.

## G. Contrarian

- Against “more autonomy wins hackathons”: Nate crowns the linear, gated build.
- Against “launch the winner”: Azim will not, citing HIPAA.
- Against “AI agency is the answer”: Nate jokes the answer is Plus. We steal neither joke nor community.
- Against “nine workflows = nine products”: it is one companion pipe with copies.
- Field assumes the live call proves safety. The crisis path is talk-only.

## H. Assumptions

**His:** Bolt + n8n + Vapi + Firebase + Sheets is enough for a contest; a kind voice is a good therapist demo; Plus should host the templates; high-school / 6-month story inspires; passion demo sells agency work.

**Ours:** Captions are complete enough (4170 words). Audio quality and Sheet correctness are **UNVERIFIED** (not seen). $5,000 / hundreds of entrants / 6 months / high school = **UNVERIFIED**. Domain-specific: contest + mental-health framing, not a plumber book-flow. “Alert emergency services” is unverified.

**Falsifiers:** Safety path fails silently. Poll never sees `ended`. Number lock deadlocks. Firebase/Sheet write fails and the next call is generic. A real user in crisis hits the companion.

**Disagreement (keep labeled):** Hive will not operate a mental-health voice companion or Vapi. The **safety-before-speech**, **linear-known-order**, and **poll-until-ended + release lock** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What do the two (or more) unwalked workflows do?
- Does the emergency path actually page a human, or is it a node labeled “emergency”?
- How is “caution score” computed, and who set the threshold?
- What happens if polling never sees ended?
- How many Vapi numbers, and what is the lock contention under two simultaneous users?
- Did any paying client book from this demo? Not on tape.
- HIPAA list: what is the minimum he thinks he needs? Not specified.

## J. Connections

- **SYSTEM SYNTHESIS** → `BO-jFbN4p8Y` (same poll-until-ended + Vapi HTTP pair; that tape is outbound sales — operate-never as a dialer).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (poll until a status, then write).
- **SYSTEM SYNTHESIS** → `ask-principal` (any real call / any publish of a health demo).
- **SYSTEM SYNTHESIS** → `slice-build` (one call path, not nine-workflow tourism).
- **SYSTEM SYNTHESIS** → `agent-job-card` (safety owns the refuse; companion does not).
- **SYSTEM SYNTHESIS** → `interview-to-desk` (named jobs: profile writer vs call placer vs reporter).
- Do not force a clinic ICP or unpark Normand from a contest therapist.

## K. Future-Use

- Safety-check as a reusable refuse gate on any voice **draft** (Watchdog / HITL — unassigned).
- Number-as-lock as a concurrency pattern (Forge — unassigned).
- “Passion demo vs launch” as a Big Boss done-definition (this desk).
- Preference sub-profiles vs one row — Librarian routing question (unassigned).
- Weekly linear report as a “don’t tool-ify a checklist” lesson (Day Planner — unassigned).

## Steal / Operate-never

### Machine: Safety gate → load profile → create-or-update → poll until ended → release lock
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (form or start-session) → write/read named profile → **safety check** → crisis stop / else load user → new-or-existing assistant → acquire free number → place call → poll until ended → notify surface → merge transcript → free number. Scheduled copies reuse the tail, not a new brain.
- **Questions / signals:** “Is this a crisis?” “New or existing?” “Is the number free?” “Has status ended?” “Is this a launch or a demo?”
- **Qualify / frame / objections:** Contest + mental-health framing, not a clinic SKU. “Won $5k” is the magnet, not done. Objection: we need voice agents — answer with a draft gate, not Vapi.
- **Procedure:** D steps 2–8. Checkable stops: (1) profile row exists, (2) safety passed or emergency routed, (3) status ended, (4) number released, (5) health product not launched.
- **Example that proves it:** Nate clicks start → personalized outbound call → he ends it → after-call merge promised; crisis path exists but is not live-tested. Lesson: the happy-path call is not the safety proof.
- **Why it works:** Later calls need a handle. Speech to a human needs a refuse. A scarce number needs a lock. Known order should not be tools. Conditions: one product, named forks, a human who will not ship healthcare. Exceptions: emergency path unverified; two workflows unseen; report in progress.
- **Conditions / exceptions:** Cursor + Grok only (Vapi / Bolt / Firebase / n8n-cloud / Plus / Skool stay on tape). No outbound companion. Clients parked.
- **Operate-never payload:** AI therapist / mental-health voice; Vapi clone; scheduled “while you sleep” companion; Plus template install; $5k as FACT.
- **Hive run (existing skills only):** `slice-build` (one call path) · `golden-test-loop` (poll until ended) · `agent-job-card` (safety owns refuse) · `ask-principal` (any real call / any public health demo) · `interview-to-desk` (named writers vs placers) · `agent-as-hire` (scope the brief before tools).
- **Source:** `7siRW0My05o` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- AI therapist / mental-health voice companion / crisis-hotline automation
- Vapi + Firebase + Bolt + his n8n templates as hive OS
- Install Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- Quote $5,000 / 6 months / 9 workflows / high school / hundreds of entrants as FACT
- New `icp_id` / unpark Normand / clinic or “voice companion” hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not crown a therapist.

- **Done** on a voice-adjacent slice: written safety refuse + named profile + poll-until-ended check. A kind demo call is not done. A public health launch is refused.
- **Delegate without being asked:** Forge/Watchdog own the ended-status check; HITL owns any real call; Consultant does not turn this into a clinic offer; Publishing Engine does not ship Azim’s story as ours.
- **Skeptical review:** $5k + high school is the hook. I will not approve a Vapi companion farm because Nate said it sounded natural.
- **One system this take:** a safety-check gate on any future voice **draft**. Not a therapist. Not a nine-workflow replay.
- Live hunt stays parked. I do not rotate to mental-health or “voice agency” because a contest slapped.
