# Librarian — 27Y44JYXZJ8
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/27Y44JYXZJ8/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/27Y44JYXZJ8/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** I Tested Claude's New Managed Agents... What You Need To Know
**Channel:** Nate Herk | AI Automation
**Kind:** video (~4177 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Context: Anthropic blocks subscription in third-party harnesses (OpenClaw); then a “too dangerous to release” model vs Opus 4.6; then **Managed Agents** — “production 10× faster” (UNVERIFIED). He spent ~3 hours; **disappointed**. Pitch: define tasks/tools/guardrails; they host the sandbox. Notion example: drag a task, agent picks it up. Docs have other team proofs.
2. Console Quick Start: templates or chat-a-goal. **No Code sub required** — API key + ~$5 (UNVERIFIED). Competitor-intel agent: name/desc/model/system/MCP/tools/skills. Chat people get a 5-step wizard; Code people shrug. Environment = hosted container + network rules (he picks unrestricted for demo). Session live → ClickUp OAuth into a **shared vault**. Agent still knows nothing about the business — chat edit **did not** change v1 vs v2 prompts; **guided edit** did. Test run: Code-like tools (bash/read/grep/web); Ask Claude to explain the setup. Wrapper around the agent SDK with a Chat UI.
3. Billing: environments idle = $0; **sessions** $0.08/hr + API tokens (UNVERIFIED). Field-monitor → ClickUp in ~2 min setup, worked. ClickUp research-queue: move card → he wanted auto-pickup; agents only wake on **API call**. No ClickUp webhook, **no cron**. Glue would be n8n/ClickUp → HTTP to the managed agent — “over-engineering.” He would use **Trigger.dev** (cheaper, has cron) instead.
4. Teased (apply for EA): **outcomes** (self-eval to criteria, Karpathy-ish); **multi-agent** callable-agents swarm; **persistent memory** across sessions (today stateless except the system prompt; he Frankensteins logs). CLI: build managed agents from Code so the system prompt inherits the repo; front-ends; call them as endpoints instead of fat `agents/` folders. **Credential landmine:** Code may paste API keys into the system prompt; console defaults to MCP/vault.
5. He had Code write a master guide, then asked “managed vs Trigger.dev vs desktop schedules — best for XYZ.” Who: beginners / Chat-only → managed; builders → Code + Trigger.dev. OpenClaw still wins for him on **heartbeats** (5–30 min) + Telegram. Desktop schedules ≠ 5-min heartbeat. Skool PDF.
Gap: Notion drag, EA features. Timestamp UNKNOWN. Claude/Trigger.dev/OpenClaw/n8n/Skool on-tape. 10× / $0.08 / $5 UNVERIFIED.

## B. Atomic Knowledge

### Hosted agent without a wake-up is a demo, not production
- **Claim:** Managed Agents are a Chat-UI wrapper on the agent SDK + vault OAuth. No cron, no native app trigger — wake = API call. Idle environments are free; live sessions meter. Guided edit, not chat, changes the prompt. Code-built agents get a better prompt and a key-leak risk.
- **Reasoning:** Production is “when the card moves” or “every 30 min,” not “when I start a session.” Missing heartbeat is why he keeps OpenClaw/Trigger.dev.
- **Mechanism:** wizard → environment → vault → session → (optional) HTTP glue.
- **Evidence:** v1/v2 prompt unchanged; ClickUp send worked on field-monitor, not on first intel run; no cron; CLI YouTube-transcript agent richer than Quick Start.
- **Conditions:** 10× / $0.08/hr / $5 UNVERIFIED. EA features unreleased.
- **Exceptions:** Chat-only beginners may still want the wizard.
- **Action:** File no-wake-up + guided-edit + key-not-in-prompt. Do not install managed agents as hive. Do not add Trigger.dev/OpenClaw.
- **Confidence:** high as a “who is this for” tape
- **Source:** `27Y44JYXZJ8` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** chat-edit no-op; intel run skipped ClickUp; wanted cron
- **Speech ≠ behavior:** “10× to production” vs 3-hour disappointment and n8n glue

## C. Mental Models
Best tool = best for this job. Chat UI ≠ always-on. Vault OAuth is the beginner unlock. Heartbeat is the product.

## D. Procedures
1. Ask: who starts the agent — a human session or the world?
2. If the world (card move / clock) → you still need a trigger outside this product (today).
3. Change prompts with guided edit; verify the version diff.
4. If building from Code, forbid keys in the system prompt; use the vault.
5. Compare stacks against the outcome, not the launch blog.
Avoid: Claude managed agents as hive; 10× as FACT; OpenClaw/Trigger.dev as hive; always-unrestricted network.

## E. Examples
**Guided edit:** Situation — “we sell an AI coding platform.” Action — chat vs guided. Outcome — only guided rewrote the prompt. Lesson — version tabs can lie.

**Research queue:** Situation — move ClickUp to To-do. Action — hoped for pickup. Outcome — must API-call; no cron. Lesson — hosted ≠ scheduled.

## F. Decision Rules
- IF you already live in Code → he would skip this.
- IF you need 5-min wake → not this (today).
- IF Code writes the agent → inspect for keys in the prompt.
- Refuse: Claude as hive; 10× as FACT; OpenClaw as hive.

## G. Contrarian
Against the 10× production headline. Against “they have an unreleased god-model so they must have cron.”

## H. Assumptions
3-hour test. Complements `ehg4fhydTgs` (routines have schedule, managed agents do not). Caption-only.

## I. Questions
Did EA outcomes/memory ship? Did team vault sharing leak?

## J. Connections
SYSTEM SYNTHESIS → `ehg4fhydTgs`; `UGIZnh6HNLc`; `EuzYhzB0vbI`; `R0qF17BVl9w`.

## K. Future-Use
No-wake-up + guided-edit + key-not-in-prompt + best-for-this-job as atoms.

## Steal / Operate-never

### Machine: ask who wakes it; hosted UI is not a heartbeat
- **Epistemic:** SOURCE
- **Workflow / loop:** name the wake event → if it is not “I opened a session,” this product needs glue → prefer a stack that already has cron → checkable stop = the card moved and a comment appeared without you clicking Run
- **Questions / signals:** Session or world? Did the prompt version actually change? Keys in the prompt?
- **Qualify / frame / objections:** Beginners get OAuth; builders already have Code.
- **Procedure:** D above.
- **Example that proves it:** no cron; guided-edit; field-monitor vs intel ClickUp miss.
- **Why it works:** Production is a trigger, not a sandbox.
- **Conditions / exceptions:** EA cron-like features unreleased; $ UNVERIFIED.
- **Operate-never payload:** Claude managed agents as hive; 10× as FACT; OpenClaw/Trigger.dev; unrestricted always.
- **Hive run:** Keep Cursor+Grok. File the wake-event question. Do not add Anthropic cloud agents.
- **Source:** `27Y44JYXZJ8` @ UNKNOWN

### Operate-never
- Claude managed agents as hive. Quote 10×/$0.08 as FACT. OpenClaw/Trigger.dev as hive. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File no-wake-up next to routines (which *do* schedule). Do not add a hive managed-agent SKU.
