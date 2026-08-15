# Big Boss — 27Y44JYXZJ8
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/27Y44JYXZJ8/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/27Y44JYXZJ8/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 16:32, 4177 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: Claude console UI, session horizontal-bar, ClickUp comments, comparison PDF, and the “too dangerous to release” model note are described, not seen.

Beats, in order:

1. Cold open, three-day stack: (a) Anthropic blocks subscription use in third-party harnesses (Open Claw) — people upset, paying more unless local; (b) yesterday, a model “too dangerous to release,” “crushing Opus 4.6”; (c) today, **managed agents**, headline **production 10× faster**.
2. He spent **~3 hours**. He is **disappointed**. After the first two announcements you think they are coming for Open Claw. Pitch: host the agent on their cloud / infra so you skip months of infrastructure. Define **tasks, tools, guardrails**; they give a cloud sandbox. “Build and deploy 10× faster.”
3. Some real business use: Notion drag-to-status, Claude picks up and processes. Docs have other team proofs.
4. Promise: how they work, what they cost, when to use, honest thoughts, why disappointing.
5. Console: Managed Agents → Quick Start. Templates **or** chat-to-build. **No Claude Code sub required** — API key, “**five bucks** to start.”
6. He describes a competitor-research agent. Console writes name, description, model, system prompt, MCP, tools, skills. He refines: switch Sonnet 4.6 → Opus 4.6. Create.
7. Perspective filter: if you already live in Claude Code, this is not much. If you live in Claude Chat and have never used Cowork / Code, this is a huge value-add — describe a goal, five-step flow.
8. Step 2: environment = hosted container, pre-installed packages, “its own little computer in the web.” Networking rules = what the agent can do. He has three environments; creates a new one; picks **unrestricted** “for the sake of the demo.”
9. Session live. Must connect ClickUp. OAuth / MCP; stored in a **vault** shareable across the team. He makes a “test vault,” SSO into workspace “Up and AI.” “Anyone could go through this flow.”
10. Realizes the agent has **no business context**. Chats to add it. Agents tab shows **two versions**; system prompt **did not change**. Guided edit: “we run an AI coding platform… natural language → software / agents / websites.” Prompt actually updates. Test run on “competitor intel,” message “analyze Cloud Code.”
11. Session view: step-by-step timings, horizontal bar, four web searches. Same tool set as Claude Code (bash, read, grep, search, fetch). “Agent SDK with a nicer wrapper” for people scared of Code. “Ask Claude” button to understand the setup.
12. Templates are prompts + services you still connect. He has spun four agents (one Opus competitor intel, three Sonnet, some deleted). One environment per agent in his setup.
13. Billing: **not** environments. Idle environments cost nothing. Charge = **8 cents per hour** sessions are live **plus** API tokens. Vault credentials; add-credential list is mostly sign-in.
14. Competitor session: ~3 minutes, token count shown, summary (scale, revenue, strengths). Prompt was written by Claude — he would make it more specific. **Did not send to ClickUp** even though connected. User has to go back and fix.
15. Other tries: **Field monitor** — tech-space signals into a ClickUp channel. **~2 minutes** to set up. Run. Clusters + sources. **Did** send to ClickUp. **ClickUp research agent** — research-queue to-dos (voice AI providers); move to to-do; agent researches, comments (summary, findings, sources), moves to complete.
16. The break: agents must be **triggered by an API call**. Not automatic. He wanted ClickUp to wake the agent, or a **every-30-minutes** cron to check to-dos. **No native ClickUp trigger. No cron.** He would glue n8n schedule / ClickUp trigger → HTTP to the managed agent — “over-engineering.” Joke: they have a model too dangerous to release but no scheduled crons.
17. For this exact agent he would rather **Trigger.dev** + Agent SDK (cheaper, crons, delegate to scripts). He has a prior video. He will “probably never use” managed agents; Claude Code is more custom.
18. Teased, **not available**, apply for early access: (1) **outcomes** — success criteria, self-evaluate, iterate until met (Karpathy auto-research, built into build); (2) **multi-agent orchestration** — callable-agents tool, coordinator, swarm on Anthropic infra; (3) **persistent memory** across sessions (today each wake is stateless, system prompt only). He already applied “multiple hours ago.” Frankenstein memory today = logs + the right files.
19. CLI: build / use managed agents from Claude Code. Value: build the agent from a project that already has business context; build front-ends; delegate to sub-agents via API endpoints instead of a fat `.claude/agents` folder eating context. Demo: YouTube-transcript → ClickUp summary + action items, keep coding locally while the cloud agent does ClickUp.
20. Credential warning: Claude Code may **default to stuffing API keys into the system prompt**. Console-native build defaults to MCP. Keys can land in Anthropic history / other people’s view.
21. How he learns: a Claude Code project that researched a master guide, then “I’ve used Trigger.dev and desktop scheduled automations — what’s the best stack for **this** outcome?” Tool-for-use-case, not best tool. CLI-built YouTube analyzer prompt is “much more robust” than Quick Start.
22. Compare to Agent SDK + Trigger.dev or Open Claw (on-screen doc, “pause if you want”). What he still loves in Open Claw: **heartbeats** (wake every 5–30 min) and **Telegram**. That is what Anthropic would need to make Claude Code a powerhouse. Desktop scheduled tasks exist and he runs “tons,” but they are not a 5-minute heartbeat. He’d rather Code → Agent SDK → Trigger.dev every 5 minutes.
23. Who should use: beginners, no infra, hardly any keys — try managed agents. Builders already in Code — less value than the headline.
24. CTA: comparison PDF in free Skool, post for this video. Like + next.

Off-topic / not skipped: Open Claw subscription ban; “too dangerous” model; Notion drag; 8¢/hr; early-access form; Telegram heartbeat crush; n8n glue as the thing he will not do.

## B. Atomic Knowledge

### Headline 10× is not a definition of done
- **Claim:** After ~3 hours he is disappointed. The pitch is “months of infra → define tasks / tools / guardrails → sandbox.” The product is a hosted chat with a container.
- **Reasoning:** Shipping-to-production implied a trigger. Without a wake, it is a session you start.
- **Mechanism:** Quick Start writes a prompt; you create an environment; you click start session; you pay while the session is live.
- **Evidence:** Open + “I’m a little bit disappointed.” Later: no cron, no ClickUp pickup.
- **Conditions:** Beginners who never left Claude Chat may still feel 10× vs clicking Code. Builders will not.
- **Exceptions:** Notion’s drag-to-status is a real in-product trigger — not what he built in the console.
- **Action:** Do not buy “10× faster” as a lane. Define task / tools / guardrails **before** any host conversation.
- **Confidence:** high for his disappointment; 10× / 3 hours UNVERIFIED as facts
- **Source:** `27Y44JYXZJ8` @ UNKNOWN — “I’ve spent the past 3 hours… I’m a little bit disappointed”
- **Epistemic:** SOURCE

### Beginner vs builder is a filter, not a purchase
- **Claim:** If you already live in Claude Code, managed agents are “not super helpful.” If you live in Claude Chat and have never used Cowork / Code, describe-a-goal + OAuth vault is a value-add.
- **Reasoning:** The wrapper is the product for the scared. The SDK under it is what he already has.
- **Mechanism:** Five-step create → environment → vault → session → (maybe) guided edit.
- **Evidence:** Spoken twice (mid-tour and who-should-use close).
- **Conditions:** Hive already has 17 desks and a working tab. We are the builder side of his filter.
- **Exceptions:** CLI-from-Code is the one builder-shaped maybe (context-rich prompt, sub-agent via API).
- **Action:** Filter says skip. Do not install the console to feel current.
- **Confidence:** high
- **Source:** `27Y44JYXZJ8` @ UNKNOWN — “if you’ve already been building, then there might not be as much value as you might think”
- **Epistemic:** SOURCE

### Unrestricted network is a demo permission
- **Claim:** Environment networking is “what can your agent actually do.” He picks **unrestricted** for the demo.
- **Reasoning:** Same smell as the Eleven Labs “key can do anything.” Demo speed vs blast radius.
- **Mechanism:** Create environment → networking question → unrestricted → session.
- **Evidence:** “for the sake of the demo.”
- **Conditions:** A research agent that only fetches the public web still does not need “unrestricted” as a habit.
- **Exceptions:** He does not show a locked-down environment on tape.
- **Action:** Network / keys stay gated. Unrestricted is not a SOP.
- **Confidence:** high
- **Source:** `27Y44JYXZJ8` @ UNKNOWN — “I’m just going to go ahead for the sake of the demo and say unrestricted”
- **Epistemic:** SOURCE

### Chat edits can lie; guided edit is the write
- **Claim:** He added business context in chat. Agents tab showed two versions; the system prompt **did not change**. Guided edit did.
- **Reasoning:** A version badge is not a receipt. Read the prompt.
- **Mechanism:** Guided edit → “add that we run an AI coding platform…” → prompt text actually updates → then test run.
- **Evidence:** Side-by-side version 1 vs 2 “didn’t even change.”
- **Conditions:** Any console that versions agents. Also any hive skill file we “updated in chat.”
- **Exceptions:** Later CLI-built YouTube analyzer prompt looked robust on first open — still read it.
- **Action:** `golden-test-loop`: open the artifact, do not trust the chat’s “I updated it.”
- **Confidence:** high
- **Source:** `27Y44JYXZJ8` @ UNKNOWN — “They didn’t even change. So I don’t think that it actually implemented that knowledge”
- **Epistemic:** SOURCE

### Missing trigger = missing machine
- **Claim:** Managed agents wake when you (or something) hit their API. No native ClickUp webhook, no cron. A research queue that “picks up to-dos” is you telling it to go look.
- **Reasoning:** He wanted always-on: move a card → work happens, or sleep/wake every 30 minutes. Without that, it is a chat with a container. Notion has the trigger **inside Notion**; the console does not.
- **Mechanism:** His workaround options: ClickUp webhook (he doesn’t have it) → n8n schedule / ClickUp trigger → HTTP (over-engineering) → or leave to Trigger.dev.
- **Evidence:** ClickUp research agent comments and moves cards **when he runs it**. Field monitor sent **when he hit run**. Competitor intel never sent to ClickUp.
- **Conditions:** Any “always-on assistant” claim. Heartbeats / 5-minute checks are what he actually wants (Open Claw).
- **Exceptions:** Desktop Claude Code scheduled tasks exist; he runs “tons”; he still says they are not a 5-minute heartbeat.
- **Action:** Cadence we already own is `coverage-loop`, HITL. Do not install Trigger.dev / Open Claw / managed agents to buy a wake.
- **Confidence:** high
- **Source:** `27Y44JYXZJ8` @ UNKNOWN — “it can’t even wake up on a cron”
- **Epistemic:** SOURCE

### You pay for live sessions, not for parked containers
- **Claim:** Environments can sit idle at $0. Charge is **8¢/hour** while a session is live, plus tokens. Vaults are shared; they are not the meter.
- **Reasoning:** “Hosted” sounds like always-on spend. The meter is the session. That is also why it does not feel always-on — they will not let it wake itself.
- **Mechanism:** Idle vs live in the console. His competitor run ~3 minutes; field monitor ~2 minutes to set up (not the same as session hours).
- **Evidence:** Spoken billing beat.
- **Conditions:** Useful if someone pitches “the container is running, you’re bleeding.” Counter: sessions. Still UNVERIFIED as our cost.
- **Exceptions:** Token spend can dwarf 8¢/hr. He does not show a bill.
- **Action:** Do not quote 8¢ / $5 start as FACT. Do not buy idle-fear or 10×-savings from this tape.
- **Confidence:** medium (he stated it; no receipt)
- **Source:** `27Y44JYXZJ8` @ UNKNOWN — “You actually get charged on the sessions being active… 8 cents per hour”
- **Epistemic:** SOURCE (claim) / UNVERIFIED (price)

### Teased outcomes / swarm / memory are not the product today
- **Claim:** Self-evaluate-to-criteria, multi-agent swarm, and cross-session memory are **apply-for-early-access**. Today each session is stateless except the system prompt. He already applied.
- **Reasoning:** The disappointment is current-tense. The tease is how they keep the video from being a hard no.
- **Mechanism:** Frankenstein memory now = write logs + point the next session at them. Outcomes ≈ “don’t stop until the check passes” (sibling Opus 5 verification).
- **Evidence:** “all of these are not available yet.”
- **Conditions:** Do not plan hive work on a form he submitted.
- **Exceptions:** He will make a follow-up if he gets in. That tape does not exist here.
- **Action:** Steal the **idea** of success criteria as a stop. Do not wait for Anthropic’s outcomes feature.
- **Confidence:** high
- **Source:** `27Y44JYXZJ8` @ UNKNOWN — “you have to basically go apply for early access”
- **Epistemic:** SOURCE

### CLI can leak keys into the prompt
- **Claim:** Building managed agents from Claude Code may default to putting API keys in the system prompt. Console-native defaults to MCP. Hosted history can keep the key.
- **Reasoning:** Convenience of “it already understands the config” is the leak path.
- **Mechanism:** Prefer vault / MCP. Do not let the builder paste secrets into the agent card.
- **Evidence:** Explicit warning beat before the wrap.
- **Conditions:** Any “build the agent from the repo” flow.
- **Exceptions:** He still demos CLI-created YouTube analyzer because the prompt was richer.
- **Action:** Keys never in the prompt. Same as `3GAxd90fEE4` hot-key-not-in-chat.
- **Confidence:** high
- **Source:** `27Y44JYXZJ8` @ UNKNOWN — “it might try to default and send over, potentially in the system prompt, the API keys”
- **Epistemic:** SOURCE

### Best tool is the tool for this outcome
- **Claim:** He teaches himself by asking the existing stack (Trigger.dev, desktop schedules, Code) which one fits **this** outcome. Not which logo won the week.
- **Reasoning:** Open Claw still wins for him on heartbeats + Telegram. Managed agents win for a Chat-only beginner. Trigger.dev wins for a cron he would actually run.
- **Mechanism:** Master-guide project + “what’s the best tech stack for me based on XYZ.”
- **Evidence:** Close mindset + who-should-use split.
- **Conditions:** Requires a named outcome. “Try managed agents because they launched” fails the test.
- **Exceptions:** He still applied for early access — curiosity ≠ adoption.
- **Action:** Named outcome first. Hive outcome already has a cadence skill. Do not add a host.
- **Confidence:** high
- **Source:** `27Y44JYXZJ8` @ UNKNOWN — “it’s always not a matter of which tool is the best, it’s which tool is the best for this specific use case”
- **Epistemic:** SOURCE

### Connected ≠ used
- **Claim:** ClickUp was in the vault; competitor intel still did not send there. Field monitor did. Research agent did when he ran it.
- **Reasoning:** OAuth success is not a routing rule. You still have to tell the agent to write.
- **Mechanism:** After a run, check the destination, not the vault badge.
- **Evidence:** “this didn’t even get sent to ClickUp, even though we actually had this connected.”
- **Conditions:** Any MCP / vault demo.
- **Exceptions:** None on tape.
- **Action:** Destination check is part of done. Vault connected is not.
- **Confidence:** high
- **Source:** `27Y44JYXZJ8` @ UNKNOWN — “that would be another case where I, the user, would have to go back and fix it”
- **Epistemic:** SOURCE

## C. Mental Models

- **Sandbox ≠ production.** Production needs a wake. **SOURCE**
- **Wrapper for the scared; SDK for the builder.** Filter, don’t purchase. **SOURCE**
- **Unrestricted is a demo.** **SOURCE**
- **Version badge can lie.** Read the prompt. **SOURCE**
- **Connected ≠ routed.** **SOURCE**
- **Heartbeats are the product he actually wants.** Telegram + 5-minute wake. **SOURCE**
- **Tool for this outcome.** **SOURCE**
- **Keys in the prompt are a leak.** **SOURCE**
- **“Too dangerous to release” is a magnet next to “no cron.”** **INFERENCE**

## D. Procedures

1. **Name the outcome** (competitor memo, queue comment, heartbeat check). If you cannot name the wake, you do not have a machine.
2. **Write task / tool allow-list / guardrails** before any host chat. Read the prompt back. Do not trust “I updated it.”
3. **Scope the environment.** No unrestricted default. No keys in the prompt.
4. **Connect ≠ done.** After a run, open the destination (ClickUp, sheet, packet).
5. **Ask: what wakes this?** If the answer is “I click Run,” it is a headed session, not cadence.
6. **Who-should-use filter.** If we already have a tab and 17 desks, skip the beginner console.
7. **Compare stacks against the outcome**, not the launch post. Park Open Claw / Trigger.dev / managed agents as on-tape names.
8. **Teased features stay parked.** Outcomes / swarm / memory are forms, not work.

**Qualify / frame / objections:** Product-announcement tape + disappointment. Frame: trigger is the machine. Objection: “10× to production” — no cron, no ClickUp pickup. Objection: “Notion does it” — that trigger lives in Notion, not in this console. Objection: voice / Telegram always-on — operate-never; steal the **qualify** (task / tools / guardrails / who wakes it).
**Avoid:** installing managed agents / Open Claw / Trigger.dev / Claude Code. Unrestricted network. Auto-pickup to-dos that can send. Quote 10× / 3 hours / $5 / 8¢ / 30 min / 5 min as FACT.
**When to change:** if the destination did not receive the write, not done. If the only wake is a human click, do not call it always-on.

## E. Examples

**Situation:** Launch week: sub ban, “too dangerous” model, managed agents 10×.  
**Action:** He spends ~3 hours and records disappointment.  
**Reasoning:** Infra-skip is real; production-wake is not.  
**Outcome:** A who-should-use split, not an install.  
**Lesson:** Headline ≠ machine. Implicit rule: three announcements in four days is a magnet, not a stack change.

**Situation:** Chat “add our business”; versions increment; prompt unchanged.  
**Action:** Guided edit; then test.  
**Reasoning:** Read the artifact.  
**Outcome:** Prompt actually changes; analysis can use the business.  
**Lesson:** Version badge is not a receipt. Implicit rule: chat-updated is a lie until you open the file.

**Situation:** He wants the research queue to process itself every 30 minutes.  
**Action:** Looks for cron / ClickUp trigger; finds neither; refuses n8n glue as over-engineering; names Trigger.dev as what he would actually use; does not switch the hive.  
**Reasoning:** Missing trigger = missing machine.  
**Outcome:** “I’ll probably never use this.”  
**Lesson:** A container you start is a session. Implicit rule: do not glue four vendors to fake a heartbeat.

**Situation:** ClickUp connected in the vault; competitor run never posts there.  
**Action:** He notices and says the user has to fix it.  
**Reasoning:** Connected ≠ routed.  
**Outcome:** Field monitor, when told to send, does send.  
**Lesson:** Destination check is done. Implicit rule: OAuth success is not a write.

## F. Decision Rules

- If the brief is a launch headline → run the who-should-use filter first.
- If we already have a tab → skip the beginner console.
- If there is no wake → do not call it production / always-on.
- If the prompt was “updated in chat” → open the file.
- If the vault is green → still check the destination.
- If a builder flow wants keys in the prompt → stop.
- If the feature is “apply for early access” → park.
- Optimize: time-to-a-named-wake + a read-back prompt.
- Refuse: unrestricted network, Open Claw Telegram, Trigger.dev install, 10× as a KPI.

## G. Contrarian

- Against “Anthropic shipped always-on agents”: he cannot get a cron.
- Against “builders should migrate”: the wrapper is for Chat people.
- Against “best new infra”: tool-for-this-outcome; he keeps Open Claw for heartbeats and still will not make us install it.
- Against “connected MCP means it writes”: competitor run.
- Field assumes disappointment is salt. He still lists who should use it and applies for the tease.

## H. Assumptions

**His:** 3 hours is enough to judge; Notion’s pattern should exist in the console; Trigger.dev is the real cron host; Open Claw heartbeats + Telegram are the bar; a PDF in Skool is the help; $5 / 8¢ is cheap enough to try.

**Ours:** Captions complete enough (4177 words). 10× / 3 hours / $5 / 8¢ / 2–3 minutes / 30 min / 5 min **UNVERIFIED**. Domain-specific: creator tool-review, not a client SKU. Hive cadence already exists. Voice / Telegram always-on stay operate-never.

**Falsifiers:** Native cron ships next week and he recants (future tape). Guided-edit lie is a one-off UI bug. Beginners ship real production on this and the filter is wrong.

**Disagreement (keep labeled):** Hive will not operate managed agents / Open Claw / Trigger.dev. The **task + tools + guardrails + named wake + read-the-prompt** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Did he get early access? Not this tape.
- What does the comparison PDF actually conclude? Skool, not here.
- Idle environment “$0” — always, or a promo? Not shown.
- Notion drag-to-status: who holds send / write? Not walked.

## J. Connections

- **SYSTEM SYNTHESIS** → `0WDkwMxj13s` (150k send; proactive pickup; instructions ≠ capabilities).
- **SYSTEM SYNTHESIS** → `-cdexJWN8YA` (unrestricted key; dashboard steps only you can do).
- **SYSTEM SYNTHESIS** → `35WuZxbAY68` (harnesses; tool-for-this-task; he graduated Open Claw there, still loves heartbeats here — labeled tension).
- **SYSTEM SYNTHESIS** → `2J3uX8iRNng` (verification / don’t-stop-until as the “outcomes” tease).
- **SYSTEM SYNTHESIS** → `agent-as-hire` · `coverage-loop` · `ask-principal` · `golden-test-loop` · `interview-to-desk` (no 18th managed-agent desk) · `slice-build`.

## K. Future-Use

- Who-should-use filter as a launch-week card (unassigned).
- Guided-edit / read-the-prompt as a Watchdog smoke (unassigned).
- Named-wake checklist before anyone says “always-on” (unassigned).
- Early-access tease log — do not build on forms (unassigned).

## Steal / Operate-never

### Machine: Task + tools + guardrails + named wake + read the prompt
- **Epistemic:** SOURCE (disappointment + demos) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (new host / “always-on agent”) → who-should-use filter → write task / allow-list / guardrails **in a file** → read the file back (chat-update is not a receipt) → scope network / keys (no unrestricted, no keys in prompt) → name the **wake** (human click vs event vs cadence we already own) → run once headed → check the **destination**, not the vault → park teased features. If there is no wake, stop calling it production.
- **Questions / signals:** “Who is this for — Chat beginner or us?” “What wakes it?” “Did the prompt file actually change?” “Did the destination receive the write?” “Are keys in the card?”
- **Qualify / frame / objections:** Launch tape. Frame: trigger is the machine. Objection: 10× — no cron. Objection: Notion — different product. Objection: Telegram heartbeat — operate-never; steal the qualify (task / tools / guardrails / wake).
- **Procedure:** D steps 1–8. Checkable stops: (1) outcome named, (2) prompt file read, (3) wake named, (4) destination checked, (5) no new host installed.
- **Example that proves it:** Research queue “picks up to-dos” only when he runs it; no 30-minute wake. Lesson: a container you start is a session. Implicit rule: do not glue n8n to fake a heartbeat.
- **Why it works:** Production is a wake + a write you can open. Wrappers help beginners; they do not add a trigger. Conditions: builder already has a tab. Exceptions: he still applied for early access; that is curiosity, not the machine.
- **Conditions / exceptions:** Cursor + Grok only. Managed agents / Open Claw / Trigger.dev / Claude Code / Telegram stay on tape. Clients parked. Tape $ / 10× UNVERIFIED. Voice / auto-dial / always-on Telegram = operate-never.
- **Operate-never payload:** Anthropic sandbox as hive OS; unrestricted network; auto-pickup to-dos; Open Claw heartbeats; Trigger.dev install; 10× as a KPI; Skool PDF as a SKU.
- **Hive run (existing skills only):** `agent-as-hire` (task + tools + guardrails) · `coverage-loop` (cadence we already own) · `golden-test-loop` (read the prompt; check destination) · `ask-principal` (any wake that can send) · `interview-to-desk` (no 18th agent) · `slice-build` (one outcome) · `agent-job-card` (owns/never — no volunteer host).
- **Source:** `27Y44JYXZJ8` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Claude managed agents / Open Claw / Trigger.dev / Claude Code. Cursor + Grok only
- Unrestricted network agent. Auto-pickup to-dos that can send. Telegram always-on / auto-dial
- Quote 10× / 3 hours / $5 / 8¢ / 30 min / 5 min heartbeat as FACT
- Nate Skool PDF as a hive SKU
- New hunt ICP. Clients parked. No Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not host a disappointment.

- **Done** on this slice: task / tools / guardrails written in a file we opened + wake named (headed or `coverage-loop`) + destination checked. A new Anthropic environment is not done.
- **Delegate without being asked:** Watchdog reads the prompt file after any “I updated it.” Forge refuses “vault connected.” HITL holds any wake that can send. Researcher may keep the launch note; Librarian does not persist 10× as FACT.
- **Skeptical review:** Four days of announcements is the magnet. I will not approve Open Claw because he still likes heartbeats.
- **One system this take:** write the agent card before any host conversation. Not a sandbox. Not a 5-minute Telegram ping.
- Live hunt stays parked. I do not rotate to “managed agents for SMBs.”
