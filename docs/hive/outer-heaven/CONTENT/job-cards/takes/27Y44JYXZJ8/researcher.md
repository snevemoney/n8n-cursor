# Researcher — 27Y44JYXZJ8
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/27Y44JYXZJ8/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/27Y44JYXZJ8/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~4177 words). Title: I Tested Claude's New Managed Agents... What You Need To Know. Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Context: 4 days ago Anthropic bans subscription in third-party harnesses (Open Claw); yesterday a “too dangerous to release / crushing Opus 4.6” model; today **managed agents** — “production 10× faster.” He spent ~3 hours and is **disappointed**. Pitch: define tasks/tools/guardrails; they host the sandbox. Notion example: drag a task, agent picks it up. Docs have other team proofs. (2) Console → Managed agents → quick start: templates or chat-describe. **No Code sub required** — API key, “five bucks to start.” Competitor-intel agent: name/description/model/system/MCP/tools/skills. He switches Sonnet 4.6 → Opus 4.6 in chat, creates. (3) Five-step: create agent → create **environment** (cloud container, packages, networking). He picks **unrestricted** for the demo. Start session → ClickUp via OAuth/MCP into a **vault** (shareable). Session live. (4) Scar: chat “add business context” did **not** change v1 vs v2 system prompts. **Guided edit** did. Test run → path UI, web searches, bash/read/grep/fetch — “Claude Code / agent SDK with a nicer wrapper” for Chat-only people. Ask-Claude helper. (5) Billing: environments idle = $0; **sessions** bill **$0.08/hour live** plus API tokens. Vault credentials. Competitor run ~3 min; report exists; **ClickUp never sent** despite being connected — he must fix the prompt. (6) Field monitor: ~2 min setup, sources + ClickUp send, works. ClickUp research agent: move card → wants auto-pickup. Reality: agents only wake on **API call**. No ClickUp webhook-native, **no cron**. He’d glue n8n schedule → HTTP to the managed agent and calls that over-engineering. Prefers **trigger.dev** (cheaper, cron, scripts) — prior video. Joke: model too dangerous to ship, but no cloud cron. (7) Teased, apply-for-early-access: **outcomes** (self-eval to criteria, Karpathy-ish), **multi-agent** (callable agents / coordinator), **persistent memory** (today each session is stateless; only the system prompt). He applied hours ago. Workaround now: write logs the next run can read. (8) CLI from Claude Code: build managed agents from a fat project (better system prompts than quick start). Risk: Code may **paste API keys into the system prompt**; console defaults to MCP/vault. Hosted history may also hold keys. (9) He made a Code project that researched managed agents vs trigger.dev vs desktop scheduled tasks vs Open Claw. Open Claw keepers: **heartbeats** (5–30 min wake) + Telegram. Desktop scheduled tasks “not the same.” Who: beginners / Chat-only → try managed; already-building → maybe skip. PDF in free Skool. **Do not flatten** vs `ehg4fhydTgs` (routines *do* have schedule, 1h min) — this tape’s managed agents have **no** cron. vs `YHk45NEpspE` CLI>API>MCP. All $ / 10× / 3 hours UNVERIFIED.

## B. Atomic Knowledge

### Hosted agent ≠ always-on agent
- **Claim:** Managed agents give you a cloud sandbox + vault + pretty session UI. They do **not** wake on cron or native ClickUp move. You must HTTP-trigger them. Idle environments are free; live sessions meter.
- **Reasoning:** “10× to production” is infra-setup, not product-automation. Without a heartbeat they are a fancy run button.
- **Mechanism:** Agent + environment + session. $0.08/h + tokens while the session is live. Trigger.dev (on-tape) or n8n schedule → HTTP if you insist.
- **Evidence:** ClickUp research agent cannot poll every 30 min. Field monitor worked when *he* hit run.
- **Conditions:** His 3-hour pass. Early-access outcomes/memory/multi-agent not on.
- **Exceptions:** Notion’s in-product drag-to-status is a different glue (the host app triggers).
- **Action:** Steal “hosted ≠ scheduled.” Hive: no Anthropic managed agents, no trigger.dev install.
- **Confidence:** high as the scar.
- **Source:** `27Y44JYXZJ8` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** chat-edit didn’t change prompt; ClickUp not sent
- **Speech ≠ behavior:** “10× faster” headline vs “I’m a little bit disappointed.”

### Chat-refine can lie; guided edit writes the prompt
- **Claim:** Talking to the session about the business did not bump v1→v2 system text. Guided edit did. Connected tools still need the prompt to *use* them.
- **Reasoning:** Wrapper UIs look like they learned. Diff the prompt.
- **Mechanism:** Agents tab versions + guided edit + test run + read whether the side-effect (ClickUp) happened.
- **Evidence:** “They didn’t even change.” Competitor summary never posted.
- **Conditions:** Quick-start flow as shown.
- **Exceptions:** CLI-built agent had a “much more robust” prompt because the Code project already knew the business.
- **Action:** Steal prompt-diff + side-effect check. `golden-test-loop`.
- **Confidence:** high.
- **Source:** `27Y44JYXZJ8` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** silent no-op edit; missing ClickUp send
- **Speech ≠ behavior:** OAuth connected ≠ tool used.

### CLI build is richer and leakier
- **Claim:** Building the managed agent from Claude Code (fat context) yields a better system prompt. The same path may stuff endpoint keys into that prompt instead of the vault. Console/MCP is the safer default.
- **Reasoning:** Hosted conversation history is another copy of the secret.
- **Mechanism:** Anthropic CLI from a Code project → YouTube-transcript-analyzer agent appears in the dashboard with a thicker prompt.
- **Evidence:** He warns “other people might be able to see those keys.”
- **Conditions:** Team vaults exist; still a footgun.
- **Exceptions:** none named.
- **Action:** Steal vault-not-prompt. Operate-never: keys in system prompts.
- **Confidence:** high as the warning.
- **Source:** `27Y44JYXZJ8` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none shown
- **Speech ≠ behavior:** none.

## C. Mental Models
Chat-only people get a wrapper; Code people already had the SDK. Best tool = best for *this* job (trigger.dev vs managed vs desktop schedule vs Open Claw). Heartbeat is the feeling of always-on. Unrestricted network is a demo default, not a policy. Early-access teasers are not features.

## D. Procedures
1. If you are only evaluating the product (on-tape): console → describe agent → create environment → vault OAuth → guided-edit the prompt → test run → check the *side effect*, not just the essay.
2. Diff v1/v2 system text after every “it learned.”
3. Do not expect cron; if you need wake-ups, he uses trigger.dev or n8n HTTP — hive uses neither new vendor.
4. If building from CLI: forbid keys in the prompt; vault/MCP only.
5. Compare stacks by the missing primitive (heartbeat, Telegram, cron), not by the press headline.
6. Hive: Cursor + Grok; no Anthropic managed agents; no Open Claw; no Skool PDF as source of truth.

## E. Examples
- **Situation:** Add business context in chat. **Action:** expects v2 prompt change. **Outcome:** identical text. **Lesson:** guided edit or it didn’t happen.
- **Situation:** Competitor intel + ClickUp connected. **Action:** test run. **Outcome:** essay, no send. **Lesson:** connection ≠ call.
- **Situation:** Field monitor. **Action:** he hits run. **Outcome:** sourced clusters + ClickUp. **Lesson:** manual wake works.
- **Situation:** Auto-pickup ClickUp cards. **Action:** wants cron/webhook. **Outcome:** neither exists. **Lesson:** hosted ≠ always-on.

## F. Decision Rules
- IF you need a schedule or native app trigger → this product (as taped) is the wrong layer.
- IF you only live in Chat → he says try it; hive still doesn’t.
- IF the UI said it updated the agent → diff the system prompt.
- IF Code is writing the agent → watch for keys in the prompt.
- IF Open Claw is the comparison → heartbeat + Telegram are his keepers (on-tape only).
- Refuse: $0.08/h as FACT; unrestricted-as-default in hive; new ICP; vendor install.

## G. Contrarian
The video is a “what you need to know” that concludes *he* won’t use it. Subscription-ban + unreleased-dangerous-model + 10×-prod in one week is a press sandwich. n8n-glue is “over-engineering” only because he already has trigger.dev — hive should not take that as a buy. Unrestricted network for a demo repeats the `ehg4fhydTgs` full-network footgun.

## H. Assumptions
$0.08/h, $5 start, 10×, 3 hours, Opus 4.6 “too dangerous,” token counts = **UNVERIFIED**.
**Desk dissent:** Learn hosted≠cron and prompt-diff. Do not add managed agents. Keep routines (`ehg4fhydTgs`) as a *different* Anthropic schedule product.

## I. Questions
- Did early-access outcomes/memory ever ship after tape?
- Exact session vs environment meter in the invoice?
- Notion trigger — webhook or in-app only?

## J. Connections
- **SYSTEM SYNTHESIS:** `ehg4fhydTgs` (routines *have* schedule) · `YHk45NEpspE` (CLI vs MCP) · `jZgcWCzxh1I` (width/confirm) · Open Claw / instance-MCP operate-never. Skills: `ask-principal` · `golden-test-loop` · `send-removed`.

## K. Future-Use
Hosted≠scheduled. Guided-edit vs chat-no-op. Vault-not-prompt. Heartbeat as the always-on primitive. Side-effect test, not essay test.

## Steal / Operate-never

### Machine: hosted-agent-side-effect-test
- **Epistemic:** SOURCE
- **Workflow / loop:** create wrapper agent → vault the creds → guided-edit prompt → run → check the external side effect → if you needed a cron and don’t have one, the product is the wrong layer
- **Questions / signals:** Did v2 text actually change? Did ClickUp/email fire? Can it wake without me?
- **Qualify / frame / objections:** Beginner-friendly ≠ hive. trigger.dev / Open Claw stay on-tape.
- **Procedure:** D.
- **Example that proves it:** Silent prompt no-op; connected ClickUp no-send; no cron.
- **Why it works:** Wrappers hide whether the agent or the human did the learning.
- **Conditions / exceptions:** $ UNVERIFIED. Hive stack unchanged.
- **Operate-never payload:** Anthropic managed agents; keys in prompts; unrestricted default; Skool PDF; new ICP.
- **Hive run (existing skills only):** `golden-test-loop` · `ask-principal` · `send-removed`
- **Source:** `27Y44JYXZJ8` @ UNKNOWN

**Operate-never**
- Enable managed agents / trigger.dev / Open Claw. Quote $0.08/10× as FACT. New `icp_id`. Send / pay / deploy.

## L. Role-Specific Applications
File hosted≠cron next to routines-have-cron. Keep the prompt-diff scar. Do not recommend Anthropic cloud agents to the hive.
