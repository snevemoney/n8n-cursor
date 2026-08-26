# Communications Manager — 7siRW0My05o
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7siRW0My05o/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7siRW0My05o/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** This Vapi + n8n Voice Agent Won $5,000 in Just 21 Days
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** interview · 4170 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Nate + Azim (ASR: Zane). Plus hackathon: $5,000, 3 weeks, hundreds entered — UNVERIFIED. Azim ~6 months in, still in high school, no prior technical background. Assignment: voice agent + n8n backend.
- Build: mental-health web app (Seolassium / similar name in ASR). Bolt frontend, Firebase auth, nine n8n workflows, Vapi for the voice. Onboarding: name, email, phone, timezone, password, then five intake questions so the companion is not generic.
- Start session → n8n personalizes the agent from the sheet → Vapi places an outbound call. Demo: Nate answers; male voice; breathing exercise; he ends. After hangup a separate agent condenses transcript+summary into the user profile for the next call.
- Workflows: onboarding webhook → code extract → profile-manager agent + preference agent → Google Sheets. On-demand call: webhook → safety/crisis branch (would alert emergency services ‘in the real world’) → caution score → load sheet by user id → new user creates Vapi assistant / existing updates prompt → HTTP place call → poll every 30s until ended → notify app → merge transcript into profile → free the phone number. Morning/evening/Sunday = same flow, schedule trigger. Preference-changed webhook updates main + sub-profiles. Weekly report (in progress): Friday hourly 8–6, cycle users, email — he used a Gmail node as a stand-in; ‘real world’ would be a CRM. Nate praises linear + conditionals over autonomous soup.
- Azim: to ship publicly would need HIPAA / data protection / funding to offer it free. Agency idea: show the passion project on a sales call. Azim’s YouTube + his own School. Plus CTA to download the $5k templates. Nate: ‘everyone thinks the answer is an AI agency, apparently the answer is AI Plus.’

## B. Atomic Knowledge

### A prize voice agent is still a dialer — mental-health outbound is a never
- **Claim:** The winning app places Vapi outbound calls and writes session notes back to a sheet. Crisis routing is sketched, not a compliance program. Azim says HIPAA would be required to launch.
- **Reasoning:** Hackathon constraints (voice + n8n) produced a caller. A caller that stores therapy-shaped data is not a hive SKU.
- **Mechanism:** Do not install Vapi. Do not copy the nine workflows. Do not write ‘won $5k in 21 days.’
- **Evidence:** Outbound demo to Nate; 30s poll; number lock; scheduled morning calls.
- **Conditions:** Any voice + sheet + outbound.
- **Exceptions:** $5k / 3 weeks / hundreds / high school / 6 months UNVERIFIED. Vapi/Bolt/n8n as ours is never.
- **Action:** Steal: linear + safety branch as a pattern to notice. Operate-never: the dialer and the prize letter.
- **Confidence:** high
- **Source:** `7siRW0My05o` @ UNKNOWN
- **Epistemic:** SOURCE

### Linear beats autonomous when the path is the same every time
- **Claim:** Nate flags that Azim did not turn the Friday report into a pile of tools. Same order every time → a line with guardrails.
- **Reasoning:** More agent tools = more ways to send the wrong email.
- **Mechanism:** If the sequence is known, do not give the model a send tool. We already have send-removed.
- **Evidence:** Weekly report: four sheets then email; Gmail node as demo.
- **Conditions:** Repeatable back-office paths.
- **Exceptions:** Even a linear Gmail node is a send if it fires. Demo ≠ production.
- **Action:** Keep reports as drafts. No Gmail node. No scheduled companion calls.
- **Confidence:** high
- **Source:** `7siRW0My05o` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Passion-project caller as a sales prop is his advice — not ours. **SOURCE**
- Crisis branch is a cartoon until lawyers and HIPAA. **SOURCE**
- Plus classroom is the magnet. **SOURCE**

## D. Procedures
- Form → sheet → personalize → (safety) → Vapi call → poll → write-back. **SOURCE**
- This desk: no outbound. No mental-health agent. No prize $. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Nate clicks Start session. → **Action:** n8n → Vapi outbound in about a minute. → **Reasoning:** That’s the assignment. → **Outcome:** A calm male voice; profile updates after. → **Lesson:** Winner ≠ we dial. Implicit rule: prize $ stay off the letter.

## F. Decision Rules
- If it places a call → never.
- If it stores therapy-shaped intake → never.
- If the proof is $5k / high school → omit; UNVERIFIED.
- Refuse: Vapi install. Plus as our SKU. ‘Join the hackathon’ in mail.
- Optimize: linear drafts; Evens is the call.

## G. Contrarian
- Field will clone the winner. He also says it cannot launch without HIPAA. **SOURCE**

## H. Assumptions
- Prize and student-status UNVERIFIED. Falsifier: a copied dialer that ‘only demos.’

## I. Questions
- Did any hive draft ever imply we run voice outreach? Kill it.

## J. Connections
- **SYSTEM SYNTHESIS:** `y-cq_Qo4zVo` / `zWLZ3bVVwD8` (Vapi). `send-removed`. `ask-principal`.

## K. Future-Use
- Prize-dollars-off-the-page as an ops note. No new voice ICP.

## Steal / Operate-never

### Machine: Linear + safety-notice; never operate the prize dialer; never mail $5k / high school
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** See a voice winner → write the never → no Vapi → no send → clients parked.
- **Questions / signals:** Is this a call? Is this a prize proof?
- **Qualify / frame / objections:** Qualify: interview vs SKU. Frame: HIPAA he named. Objection: ‘high schooler did it’ → not a line we write.
- **Procedure:** 1) No Vapi. 2) No outbound. 3) No prize $. 4) No send.
- **Example that proves it:** Nate receives the companion call on speaker.
- **Why it works:** A hackathon assignment is not a production license.
- **Conditions / exceptions:** Plus tapes. Exception: we do not operate Bolt/Vapi/n8n.
- **Operate-never payload:** Install Vapi. Quote $5k as FACT. Mental-health caller.
- **Hive run (existing skills only):** `ask-principal`. `send-removed`.
- **Source:** `7siRW0My05o` @ UNKNOWN


### Operate-never (this desk will not operate)
- Install Vapi / Bolt / n8n. Auto-dial. Quote $5k · 21 days · hundreds · high school as FACT. Mail a therapy companion.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I do not operate a prize-voice dialer. I do not write ‘won $5k.’ I do not send. Clients parked.
