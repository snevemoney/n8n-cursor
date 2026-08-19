# Communications Manager — 3QclAjmu5Tw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/3QclAjmu5Tw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/3QclAjmu5Tw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** Claude Just Solved Session Limits
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** news/talk · 2483 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Claude × SpaceX partnership: more compute → higher Claude Code + API limits. First 2026 Code with Claude (SF/London/Tokyo); extra day from demand.
- Last quarter: outages; not enough compute for demand. Effective immediately: 5-hour Claude Code rate limits doubled (Pro/Max/Team). Peak-hours limit reduction removed for Pro/Max.
- Aside: they had blocked new Pro from Claude Code (Max required except existing). Unused bought compute is also waste — hard projection problem.
- TOS aside: Open Claude / Hermes on subscription banned; he wonders if that was also demand control. Switch to API might reduce abuse.
- API: Opus per-minute input was 30K; output 8K→80K/min (~16% language on input vs 10× output — he mixes the figures). Lowest tiers biggest multiples. Tier-1 example: 30K ≈ 20–22 pages → ~370 pages / 500K input — UNVERIFIED.
- Buying spree: Amazon, Google, Broadcom, Microsoft, Nvidia, FluidStack; Goldman Sachs JV + Blackstone day before. Enterprise + international.
- Managed agents (webhooks, auto-dreaming, multi-agent) mentioned, not covered.
- Why it matters: builders hitting walls; even highest Max shut down before 5 hours; production Opus APIs rate-limited.
- SpaceX deal: 300 MW, 220k Nvidia GPUs — UNVERIFIED. Closed vs open models = compute. Orbital AI compute (gigawatts) expressed interest; terrestrial power/water/community ceiling.
- Five builder moves: (1) retest workflows that broke on limits — LinkedIn infographic client, 3 months later new image model, he called back. (2) If you /opus-plan or dumped to Haiku/Sonnet to save session, you can use more Opus; context still matters. (3) 1M context usable in production (API). (4) Claude Code behind production + routines without eating the whole session. (5) Multi-agent viable (five subs × 50k).
- Signals: 5+ year compute bet; Claude Code flagship (not Cowork); community electricity-hike commitment as trust play. CTA: watch his token-management video.

## B. Atomic Knowledge

### Limits moved; retest what you abandoned
- **Claim:** Doubled 5-hour windows + no peak throttle + higher API RPM means walls from six months ago may be gone.
- **Reasoning:** Models and infra change under the same prompt. Abandoning a client build can be premature.
- **Mechanism:** Retest the old Opus agent / image flow. Don’t assume the wall.
- **Evidence:** LinkedIn infographic client: not confident → 3 months → new image model → called him → built.
- **Conditions:** The failure was rate/quality, not a dead idea.
- **Exceptions:** 300 MW / 220k GPUs / 80k TPM / orbital compute UNVERIFIED. Calling a parked client is operate-never this week.
- **Action:** Steal: revisit-broken-builds as a note. Do not quote SpaceX MW. Do not unpark a client because limits doubled.
- **Confidence:** high as advice; infra numbers UNVERIFIED
- **Source:** `3QclAjmu5Tw` @ UNKNOWN
- **Epistemic:** SOURCE

### Session math still exists; Code is the flagship
- **Claim:** Double usage does not delete context management. Routines + daily knowledge work used to eat one session; now maybe both fit.
- **Reasoning:** They bought compute to serve Code + API + enterprise, not to make send free.
- **Mechanism:** Keep token hygiene (he points to another video). Treat Code as the product they talked about.
- **Evidence:** Peak-hour story; Pro-blocked-from-Code; TOS on Hermes/Open Claude.
- **Conditions:** You are on a subscription or API.
- **Exceptions:** Hermes-on-sub is against their TOS — we do not operate that. Grok Bot ≠ this.
- **Action:** Do not arm 24/7 mail routines because limits doubled.
- **Confidence:** high
- **Source:** `3QclAjmu5Tw` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Compute is the closed-model moat; local/open needs RAM/VRAM. **SOURCE**
- Unused compute is also waste — capacity planning is not simple. **SOURCE**
- Orbital compute is a long-horizon bet, not this year. **SOURCE**

## D. Procedures
- If an Opus/API build died on RPM → retest. **SOURCE**
- If you routed to Haiku only to save the window → try more Opus, still manage context. **SOURCE**
- This desk: no production mailer on doubled limits. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Client wanted AI LinkedIn infographics; quality not there. → **Action:** Wait; new image model; call back; build. → **Reasoning:** Things move fast. → **Outcome:** Build happened later. → **Lesson:** Retest abandoned work. Implicit rule: we do not call parked clients this week.

## F. Decision Rules
- If the wall was rate limits → retest before declaring dead.
- If the wall was ‘I would not want you to post this’ → still HITL on publish.
- Refuse: quote 300 MW / 220k GPUs / 80k TPM as FACT. Hermes-on-Claude-sub. 24/7 comms routines.
- Optimize: token hygiene + revisit, not more send.

## G. Contrarian
- Field treated session death as permanent. He says the wall may have moved. **SOURCE**

## H. Assumptions
- All MW/GPU/TPM/page-count figures UNVERIFIED. Partnership claims are news, not our facts. Falsifier: doubled limits still exhaust on a real multi-agent day.

## I. Questions
- Did managed-agents (webhooks/auto-dreaming) ship in a later tape?

## J. Connections
- **SYSTEM SYNTHESIS:** `6cEQEba0i2A` (cache/TTL). `xJ5oz63mIec` (deploy methods). Token-hacks video he tags (not this id).

## K. Future-Use
- Orbital compute / community power-bill play as unassigned infra color. Retest-abandoned-builds as a personal ops note.

## Steal / Operate-never

### Machine: Retest-abandoned-builds when the infra wall moves; do not turn doubled limits into a mailer
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Old build died on limits → note the wall type → retest quality → Evens decides if anyone is called → stop. No send. No routine mailer.
- **Questions / signals:** Was it rate, quality, or TOS? Would we still want it posted?
- **Qualify / frame / objections:** Qualify: wall moved vs idea dead. Frame: HITL. Objection: ‘limits doubled so we can 24/7’ → he still says manage tokens.
- **Procedure:** 1) Classify the old failure. 2) Retest privately. 3) No client call this week. 4) No quote of MW/GPUs.
- **Example that proves it:** LinkedIn infographic: 3 months later the image model was good enough.
- **Why it works:** Infra changes; abandoned work can revive. Send still never.
- **Conditions / exceptions:** News-day tapes. Exceptions: parked clients stay parked.
- **Operate-never payload:** Unpark because SpaceX. Quote 300 MW. Hermes-on-sub. Auto-dreaming mailer.
- **Hive run (existing skills only):** `ask-principal` · `golden-test-loop`.
- **Source:** `3QclAjmu5Tw` @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote SpaceX 300 MW / 220k GPUs / orbital gigawatts as FACT. Call the infographic client.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I do not write ‘we have SpaceX compute’ or ‘limits doubled so we can automate your inbox.’ Draft only if Evens names a revisit.
