# Big Boss — BO-jFbN4p8Y
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Nate Herk (PACKET: 26:41, 6445 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt`. Visual-only gaps: n8n canvas, native form, live Elliot/Vapi call, Sheet row, wireframe, Vapi assistant UI, API docs, Twilio vs Vapi number error, structured-output drill-down. On-tape: n8n, Vapi, Claude-for-code-node, OpenAI GPT-4o, Twilio, Skool **225k**. **Do not install Vapi. Auto-dial is kill.**

Beats, in order:

1. Hook: agent that **calls while you sleep**. n8n logic + Vapi voice. “Everything free.”
2. Use-cases he names: surveys, reviews, **reactivating leads**, today’s demo = **outbound lead qualification**.
3. Story: site form (UpAI in prod) → webhook. Demo uses **native n8n form** so the template runs.
4. Live: mock Richard / Greengrass / gardening lead-gen / company size. HTTP “call lead” → Elliot from **Uppit** introduces as an **AI agent**. Questions: why now, timing, past AI, budget (**5–10k** on tape), free vs paid discovery. Elliot ends the call. **$ UNVERIFIED** as a real budget.
5. Poll until call data returns → Sheet: request, size, interest, motivation, urgency, past experience, budget, intent, status=complete.
6. **Wireframe before nodes** (Plus talking point): form fields → normalize phone → start call → poll get-details → pickup vs voicemail → log.
7. Form fields restated. Vapi must receive name/company/request dynamically.
8. **Normalize phone** (code node). He cannot code: copy incoming JSON → Claude one-shot: 10 digits, no punctuation; else `incorrect format` (too many/few, extra country code).
9. **If incorrect → log, do not call** (API would fail). Else HTTP create-call.
10. Vapi assistant: no tools, extract-only. GPT-4o. Wait for user to speak first. System prompt: identity Elliot/Uppit, style, **{{lead_name}} {{company}} {{request}}**, tasks (wrong number / bad time / confirm interest / motivation / urgency / past vendors / budget / not endless free calls / may end call). Prompt “make or breaks”; expect to tweak from logs. End-call toggle on. Structured outputs replace deprecated summary/success: status, budget, urgency, past experience, motivation, etc.; each output linked to this assistant.
11. Create-call HTTP: POST, bearer key from Vapi, assistant ID, **phone number ID**, `+1`+form number (US assumed), `assistantOverrides` variable map. Vapi-bought numbers have a **daily outbound limit** — he hit it, switched to **Twilio**. Ethics: introduce as AI; optional transfer if upset / asks for human (not built in the walk).
12. Create-call returns “initiated,” not transcript. Wait ~60s → GET call by ID → limit first item (Vapi bug: 26 items) → if status ≠ `ended` wait 10s and loop → if `endedReason=voicemail` log callback; else write structured fields to Sheet.
13. Finds structured outputs under `artifacts` (painful drill). Invalid-number proof: pin form, drop a digit → `incorrect format` row, no call.
14. Close: free Skool **225k**, search video title, workflow + prompt + Sheet. Plus 1-hour live breakdown. Like the video.

Off-topic / not skipped: “I’m not saying this is the optimal way to run an AI agency”; curly-brace variables like n8n; bearer-auth how-to.

## B. Atomic Knowledge

### Wireframe the pipe before you drag nodes
- **Claim:** He drew the high-level path (form → normalize → call → poll → voicemail fork → log) before n8n.
- **Reasoning:** Connecting nodes without a map is how you skip the refuse.
- **Mechanism:** Spoken wireframe; Plus courses mentioned.
- **Evidence:** “Understand at a high level what you’re expecting to build before you jump into [n8n].”
- **Conditions:** Any outbound system with a hard step.
- **Exceptions:** Demo still uses a native form instead of the real site webhook.
- **Action:** Write the forks (bad phone, voicemail, human transfer) on paper. Then decide which forks we will **not** operate.
- **Confidence:** high
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN — “wireframe that I built before I actually built this”
- **Epistemic:** SOURCE

### Normalize, then refuse the bad number
- **Claim:** Phones arrive with dashes, parens, country codes. Vapi wants a known shape. If the code node emits `incorrect format`, log and **do not call**.
- **Reasoning:** A bad number is a failed API and a spam risk. The refuse is the only part of this tape we can keep as physics.
- **Mechanism:** Claude-written code node from copied JSON; if-node on the flag; Sheet row marked invalid.
- **Evidence:** Live nine-digit proof writes the error row and skips HTTP.
- **Conditions:** You do not fully control the form mask.
- **Exceptions:** He hardcodes `+1` later — global numbers need a different rule.
- **Action:** Validate → ticket for Evens. Never auto-dial the valid ones either.
- **Confidence:** high
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN — “if it’s incorrect, this API called [Vapi] will fail”
- **Epistemic:** SOURCE

### Two requests: start is not done
- **Claim:** Vapi takes one POST to start a call and a later GET for details. The POST says “initiated,” not ended, not transcript.
- **Reasoning:** Treating start as success is how you log ghosts.
- **Mechanism:** Wait ~60s → GET by call ID → loop every ~10s until `status=ended` → then branch voicemail vs assistant-ended.
- **Evidence:** GET node ran **10** times on the demo; first `in-progress`, last `ended`. Same poll idea as `7siRW0My05o`.
- **Conditions:** Vendor has no usable webhook in this design (or he did not use one).
- **Exceptions:** 60s wait is a guess (“no answer ~60s”). Vapi multi-item bug forced a Limit node.
- **Action:** Checkable stop = `ended` + reason. “Call lead” HTTP is not done.
- **Confidence:** high
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN — “it takes one request to call the lead and then it takes a second request to get back the call details”
- **Epistemic:** SOURCE

### Structured outputs are the extract contract
- **Claim:** After the talk, Vapi returns named fields (status, budget, urgency, past experience, motivation, paid intent…). Old summary/success evals are deprecated.
- **Reasoning:** A transcript dump is not a qualifier. A contract is.
- **Mechanism:** Each output: name, type, description; linked to the assistant; buried under `artifacts` on GET.
- **Evidence:** Sheet columns I–N match the spoken Richard answers (holiday slowdown, 1-month urgency, no past AI, 5–10k).
- **Conditions:** Prompt + schema must agree. Prompt “make or breaks.”
- **Exceptions:** He threw the prompt together in ~30 minutes. Production = monitor and tweak. We will not run that loop on live humans.
- **Action:** Steal “named fields after a human conversation,” as a form or a booked call — not as a night dialer.
- **Confidence:** high
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN — “telling the agent exactly which fields we want it to return”
- **Epistemic:** SOURCE

### Form variables go into the prompt at call time
- **Claim:** `{{lead_name}}` etc. in the Vapi prompt are filled via `assistantOverrides` from the form so Elliot knows Richard / Greengrass / the request.
- **Reasoning:** A generic qualifier is colder and dumber than the form they just submitted.
- **Mechanism:** Curly-brace variables; POST body maps form JSON in.
- **Evidence:** Live call restates gardening lead-gen without Nate typing it into Vapi by hand.
- **Conditions:** Form actually collected those fields.
- **Exceptions:** Wrong-number and “bad time” scripts exist in the prompt; only the happy path is shown live.
- **Action:** If we ever qualify, the brief includes what they already typed. Still no auto-call.
- **Confidence:** high
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN — “substitute all these variables”
- **Epistemic:** SOURCE

### Introduce as AI; transfer is mentioned, not built
- **Claim:** Elliot says he is an AI agent. Nate calls that voice ethics. He mentions a human transfer if upset / asks for a human — “you could.”
- **Reasoning:** Deception is a separate product. Transfer-as-cover is how farms look polite.
- **Mechanism:** First-message wait-for-hello; identity line in the prompt. Transfer not configured in the walk.
- **Evidence:** “I think that it’s just best practice when it comes to AI voice ethics.”
- **Conditions:** Any synthetic outbound voice (we refuse the class).
- **Exceptions:** Ethics line does not make auto-dial OK.
- **Action:** Operate-never the dialer. If a human ever calls, they identify. No fake Elliot.
- **Confidence:** high
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN — “introduce himself as an AI agent”
- **Epistemic:** SOURCE

### Vendor daily cap is a stop, not a scale plan
- **Claim:** Numbers bought on Vapi have a **daily outbound call limit**. He hit the error, imported Twilio “to scale without limits.”
- **Reasoning:** The product wants a queue. A cap is a receipt that this is farm-shaped.
- **Mechanism:** Error in call logs → switch phone-number ID.
- **Evidence:** On-screen error quoted.
- **Conditions:** Outbound at volume.
- **Exceptions:** 10 free US Vapi numbers mentioned. Still capped.
- **Action:** Treat volume caps as a kill signal for this SKU, not a Twilio shopping list.
- **Confidence:** high
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN — “daily outbound call limit”
- **Epistemic:** SOURCE

### Voicemail is a different row, not a retry storm
- **Claim:** `endedReason=voicemail` logs “call back”; assistant-ended writes the structured qualifier.
- **Reasoning:** Same `ended` status, different work. Blind retry is a harassment loop.
- **Mechanism:** Second if after the poll.
- **Evidence:** Earlier pinned run showed voicemail true-branch.
- **Conditions:** Vendor exposes a reason code.
- **Exceptions:** No policy for how many callbacks. Sleep-dialer would invent one.
- **Action:** A miss becomes a ticket, not an automatic redial farm.
- **Confidence:** high
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN — “we need to call this person back because we got sent to their voicemail”
- **Epistemic:** SOURCE

### One-shot code is OK when the guardrail is exact
- **Claim:** He pasted JSON into Claude and got the normalize node in one try because he specified the exact output shape and the failure token.
- **Reasoning:** Vague “fix the phone” would have failed. Exact refuse language is the spec.
- **Mechanism:** Copy incoming JSON → one-shot prompt → paste code.
- **Evidence:** Nine-digit test later matches `incorrect format`.
- **Conditions:** Output contract is tiny and testable.
- **Exceptions:** He still does not want to “know how to code.” The test is the proof, not the vendor.
- **Action:** `golden-test-loop` on the refuse path. Cursor + Grok, not Claude.
- **Confidence:** high
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN — “because I knew exactly what I wanted and exactly the guardrails”
- **Epistemic:** SOURCE

### “While you sleep” is the product he is selling
- **Claim:** Title and open: calls for you while you sleep. Also surveys, reviews, reactivation. Template + 225k Skool is the close.
- **Reasoning:** The machine we steal (validate → structured fields → human follow-up) is not the machine he is selling (unattended outbound voice).
- **Mechanism:** Free classroom post with workflow, prompt, Sheet.
- **Evidence:** Opening sentence; use-case list; close.
- **Conditions:** His agency-demo story (Uppit/UpAI).
- **Exceptions:** Demo is one self-call, not a night queue.
- **Action:** Doctrine already kills auto-dial. Walk; do not run.
- **Confidence:** high
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN — “make phone calls for you while you sleep”
- **Epistemic:** SOURCE

## C. Mental Models

- **Map the forks before the nodes.** **SOURCE**
- **Bad input must not reach the expensive/irreversible step.** **SOURCE**
- **Initiated ≠ ended.** **SOURCE**
- **Prompt + schema = the qualifier.** **SOURCE**
- **Ethics line is identify-as-AI, not “don’t dial.”** **SOURCE**
- **Vendor cap means they expect a farm.** **SOURCE**
- **Voicemail is a different job.** **SOURCE**
- **Exact refuse language gets you a one-shot script.** **SOURCE**
- **Sleep-dial is the SKU.** We kill it. **INFERENCE**

## D. Procedures

1. **Wireframe** trigger, normalize, hard step, poll, voicemail, log.
2. **Collect** only what the next human needs (name, phone, email, company, ask, size).
3. **Normalize phone.** If invalid → write the row, **stop**.
4. **Do not place the call.** (His next step is Vapi POST. Ours is a ticket / book link.)
5. If a human call ever happens: identify as human; structured fields after; no night queue.
6. **Poll** any vendor that returns “started” until a terminal status. Then branch on reason.
7. **Prompt is never finished** — he says monitor and tweak. We do not put that loop on live strangers.
8. **CTA** is Skool. Ours is none.

**Qualify / frame:** Auto-dial qualifier. Richard is a prop. 5–10k is roleplay.
**Objections:** “We need faster lead qual” — form fields + booked call, not Elliot. “We’d add a human transfer” — still a dialer.
**Avoid:** Vapi/Twilio outbound, review/reactivation farms, Plus 1-hour build.
**When to change:** Number invalid → never call. Status not ended → do not write “complete.”

## E. Examples

**Situation:** Form phone has 9 digits.  
**Action:** Code node → `incorrect format` → Sheet error row, HTTP call node deleted/skipped.  
**Reasoning:** Vapi would fail; refuse is cheaper.  
**Outcome:** No ring.  
**Lesson:** Validate-then-stop is the keep. Implicit rule: valid format still does not authorize a machine call.

**Situation:** Richard answers; Elliot qualifies; hangs up.  
**Action:** Poll to `ended` / assistant-ended → structured fields into Sheet.  
**Reasoning:** Start POST is not the artifact.  
**Outcome:** Row with motivation/urgency/budget/intent.  
**Lesson:** Named fields after a conversation are useful. Implicit rule: the conversation must not be an unattended outbound bot.

**Situation:** Vapi number hits daily outbound limit.  
**Action:** He switches to Twilio “without limits.”  
**Reasoning:** Keep the queue alive.  
**Outcome:** Scale path.  
**Lesson:** Cap is a farm signal. Implicit rule: do not buy the next number.

## F. Decision Rules

- If phone fails the contract → log, do not proceed to any call API.
- If vendor says initiated → keep polling; do not mark complete.
- If endedReason is voicemail → ticket, not a retry storm.
- If the design is outbound voice without Evens on the line → refuse the SKU.
- If a vendor sells “unlimited outbound” → treat as farm-shaped.
- Optimize: clean form row + human follow-up.
- Refuse: Vapi, sleep-calls, review/reactivation farms, Skool template as ours.

## G. Contrarian

- Against “AI closer while you sleep”: we take the validate-and-log spine only.
- Against “native form is production”: he says prod is a site webhook — still a dialer.
- Against “Twilio fixes the cap”: that is how you scale a kill-SKU.
- Field assumes structured outputs make it professional. They make a farm more efficient.

## H. Assumptions

**His:** Immediate callback raises intent; Elliot/Uppit is a fair agency demo; 30-minute prompt is enough to show; Skool free is the distribution; Twilio = grown-up.

**Ours:** Captions complete (6445 words). Call quality **UNVERIFIED**. 225k / 5–10k / 10 free numbers / 26-item bug = **UNVERIFIED** as general facts. Auto-dial is already on the doctrine kill list.

**Falsifiers:** Valid numbers still fail Vapi. Poll never ends. Structured fields hallucinate budget. “Identify as AI” does not prevent harm.

**Disagreement (keep labeled):** We will not operate this dialer. We steal wireframe-first, normalize-and-refuse, poll-until-terminal, named extract fields, exact-guardrail one-shot. **SYSTEM SYNTHESIS**

## I. Questions

- Prod webhook vs native form: any other normalize rules?
- Transfer-to-human: built anywhere, or only spoken?
- How many voicemail callbacks before stop? Not on tape.
- What is Uppit vs UpAI — brand drift in captions?
- Does he store recordings? Artifacts mention recording — not walked.

## J. Connections

- **SYSTEM SYNTHESIS** → `7siRW0My05o` (poll until ended; number as lock vs number as weapon).
- **SYSTEM SYNTHESIS** → doctrine kill: auto-dial / auto-book.
- **SYSTEM SYNTHESIS** → `ask-principal` (any call).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (incorrect-format path).
- **SYSTEM SYNTHESIS** → `playbook-before-send` / `same-day-qa` (if outreach ever unparks — form + human, not Vapi).
- **SYSTEM SYNTHESIS** → `missed-call-book` is inbound; this tape is outbound — do not confuse them.
- Do not unpark a gardening ICP from Greengrass.

## K. Future-Use

- Incorrect-format gate as a generic input contract (Forge — unassigned).
- Wireframe-before-nodes as a Big Boss done check (this desk).
- `ended` vs `endedReason` as a Watchdog pair (unassigned).
- “Daily cap” as a farm detector in Researcher packets (unassigned).

## Steal / Operate-never

### Machine: Wireframe → normalize → refuse bad input → ticket a human (do not dial)
- **Epistemic:** SOURCE (gates + poll) / SYSTEM SYNTHESIS (we stop before his hard step)
- **Workflow / loop:** form in → wireframe the forks → normalize phone → if invalid, log and stop → if valid, **create a ticket / book path for Evens** (his tape would POST Vapi — we will not) → any vendor “started” must poll to a terminal status before a row is “complete” → voicemail ≠ qualified → structured fields only after a human conversation.
- **Questions / signals:** “Does the phone match the contract?” “Is this initiated or ended?” “Voicemail or person?” “Who is allowed to ring a stranger?”
- **Qualify / frame / objections:** Sleep-dialer tape. “Free template” is the magnet. Objection: we need qual — use the form + a booked call.
- **Procedure:** D steps 1–6. Checkable stops: (1) wireframe includes refuse, (2) invalid number never leaves the Sheet, (3) no Vapi/Twilio outbound, (4) no “complete” without a terminal status if we ever poll anything.
- **Example that proves it:** Nine-digit number → error row, no ring. Lesson: the refuse path is the product we keep.
- **Why it works:** Irreversible steps need a contract. Start≠done. Caps reveal farms. Conditions: form exists; human owns the call. Exceptions: he hardcodes +1; transfer unbuilt; demo is one self-call.
- **Conditions / exceptions:** Cursor + Grok only. Vapi/Twilio/n8n-cloud/Skool on tape. Clients parked. Auto-dial kill.
- **Operate-never payload:** Sleep-calls; review/reactivation farms; Vapi install; quote 225k as FACT.
- **Hive run (existing skills only):** `ask-principal` · `golden-test-loop` · `slice-build` (form → ticket) · `playbook-before-send` (if unparked) · `agent-job-card` (no outbound voice).
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Vapi / n8n outbound dialer / calls while you sleep
- Review, survey, or reactivation call farms
- Install Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- Quote daily limit / 225k / 5–10k roleplay / “while you sleep” as FACT
- Nate Skool / Uppit Elliot as a hive SKU
- New `icp_id` / unpark Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not let Elliot ring Richard at night.

- **Done** on a lead-capture slice: valid phone + complete form + ticket for Evens. A completed Vapi row is not done. A Twilio “unlimited” number is refused.
- **Delegate without being asked:** Forge owns the format test; HITL owns any call; Lead Hunter does not get this workflow; I do not add a nameless qualifier agent.
- **Skeptical review:** “While you sleep” is the title. I will not approve outbound voice because the Sheet looked complete.
- **One system this take:** form → validate phone → **ticket**. Not a sleep-dialer.
- Live hunt stays parked. I do not rotate to “AI agency qualifier” or gardening.
