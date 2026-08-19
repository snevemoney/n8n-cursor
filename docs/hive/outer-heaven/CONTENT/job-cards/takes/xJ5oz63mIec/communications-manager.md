# Communications Manager — xJ5oz63mIec
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xJ5oz63mIec/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xJ5oz63mIec/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** How to Deploy Your Claude Automations (3 Methods)
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** tutorial · 5337 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Open: three ways to deploy skills/agents so they run while you sleep. Slider: laptop vs cloud (Anthropic / Modal / Trigger / VPS) × deterministic script vs autonomous loop. No single best; depends on the job. WAT: workflow, agent, tools — what actually gets deployed. Also: must the computer stay on? must the session stay on?
- Method 1: /loop. Every N minutes run the skill, then stop, until you halt or it hits a limit. Tools: cron create/list/delete. Scheduler lives inside the Claude process. Session-scoped (five tabs = five loop sets; collide only if they write the same file). Desktop or terminal; terminal has extras. Natural language (‘remind me to take out the trash every 10 minutes’) or /loop. Rest of tape: methods 2–3 (cloud/VPS-shaped) + when to pick which. Same family as UGIZ/vfWTy: sleep-run is the pitch; send is the risk.

## B. Atomic Knowledge

### Sleep-run is a host decision — send is still HITL
- **Claim:** The slider is where it runs and how wild it is. A 10-minute loop on the laptop dies with the tab. A cloud host does not. Neither is a license to mail.
- **Reasoning:** WAT: if the deployed thing includes a send tool, we do not deploy it.
- **Mechanism:** Steal: name laptop-vs-cloud and script-vs-agent before anyone hosts. Do not install Claude/Trigger/Modal. Do not loop a mailer.
- **Evidence:** Trash reminder loop; session-scoped crons; WAT + on/off axes.
- **Conditions:** Any ‘while you sleep’ deploy.
- **Exceptions:** Claude as ours is never.
- **Action:** No sleep-send. No VPS mailer.
- **Confidence:** high
- **Source:** `xJ5oz63mIec` @ UNKNOWN
- **Epistemic:** SOURCE

### Session-scoped means close the tab, kill the cron — cloud is the opposite
- **Claim:** He likes that loops don’t leak across terminals. That’s a safety. Cloud/VPS methods later in the tape remove that safety.
- **Reasoning:** If we ever schedule a draft reminder, keep it in-session and off Gmail.
- **Mechanism:** Do not promote a loop to Trigger ‘so it survives.’
- **Evidence:** Five sessions, five loop sets; same-file collide.
- **Conditions:** Local vs hosted.
- **Exceptions:** We do not run Claude crons.
- **Action:** No promote-to-cloud. No send.
- **Confidence:** high
- **Source:** `xJ5oz63mIec` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Pick the square on the slider; don’t default to full-agent-in-the-cloud. **SOURCE**
- Cron = scheduled task; you don’t have to read cron syntax. **SOURCE**
- WAT: know what you actually shipped. **SOURCE**

## D. Procedures
- Name run-where + how-wild → if loop, session cron → if cloud, that’s a harder never for mail. **SOURCE**
- This desk: no deploy. Draft only. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Want it while you sleep. → **Action:** He starts with a 10-min local loop. → **Reasoning:** Fastest deploy. → **Outcome:** A reminder, not a campaign. → **Lesson:** First method is local. Implicit rule: don’t skip to cloud-send.

## F. Decision Rules
- If the loop can send → never.
- If the pitch is ‘computer off’ + outreach → never.
- Refuse: Claude/Trigger/Modal as ours. Sleep-mailer.
- Optimize: name the square; stay off the outbox.

## G. Contrarian
- Field jumps to always-on agents. He starts with a trash reminder. **SOURCE**

## H. Assumptions
- Methods 2–3 are the rest of the tape. Falsifier: a hive sleep-send.

## I. Questions
- Are we about to promote a local reminder to a cloud host?

## J. Connections
- **SYSTEM SYNTHESIS:** `UGIZnh6HNLc`. `vfWTyEreOEc` (/loop). `3XIGcM7VICc` (Jarvis catch).

## K. Future-Use
- Slider + WAT as an ops note. No sleep-send.

## Steal / Operate-never

### Machine: Name laptop-vs-cloud before host; never loop a mailer; never sleep-send
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Deploy tape → write the slider → no host → no send.
- **Questions / signals:** Does this survive a closed laptop and still mail?
- **Qualify / frame / objections:** Qualify: trash reminder vs campaign. Frame: session-scoped safety. Objection: ‘while you sleep’ → not a letter.
- **Procedure:** 1) No Claude cron. 2) No Trigger/Modal. 3) No send.
- **Example that proves it:** Trash loop is method one; cloud is the later temptation.
- **Why it works:** WAT includes whether a send tool shipped.
- **Conditions / exceptions:** Deploy tapes. Exception: Cursor + Grok.
- **Operate-never payload:** Sleep-mailer. VPS outbox.
- **Hive run (existing skills only):** `ask-principal`. `send-removed`.
- **Source:** `xJ5oz63mIec` @ UNKNOWN


### Operate-never (this desk will not operate)
- Claude /loop that mails. Trigger/Modal/VPS outbox. Sleep-send.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I do not deploy a sleep-mailer. I do not send. Clients parked.
