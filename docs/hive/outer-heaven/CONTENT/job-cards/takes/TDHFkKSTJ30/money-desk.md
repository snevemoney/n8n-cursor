# Money Desk — TDHFkKSTJ30
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/TDHFkKSTJ30/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/TDHFkKSTJ30/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~4694 words. Nate: n8n native NL→workflow builder (GPT-like pane, not fully rolled out) — 70% skeleton, not production. Caption-only; timestamp UNKNOWN. Beats in order: cold open — webhook form (company/budget/project) → research+industry+budget+‘wants custom AI’ → hot/warm/cold → ClickUp CRM + Gmail + Slack. He approves the plan; builder emits graph + six-item setup guide + how-to-activate. Nodes already mapped (name, lead fields, AI analysis, qual level, score/100, priority); Set writes email subject/body he didn’t ask for; agent system prompt + HTTP Google-the-company-URL. Thesis: cuts time-to-POC; **false sense of security** — never download-and-sell; same as a template. Three tests: vague / detailed / agentic. (1) Vague: ‘AI agent researches news every morning, email me a newsletter.’ Plan → approve. 7am schedule; config set = recipient unknown, topics tech/AI/business, style professional. Research agent: 5–7 stories + links in the **user** message (he’d put behavior in system); system says use web-research tool; **tool is empty GET, no endpoint/description**. Mail HTML/text + dated subject — nice. Lots left to configure. (2) Detailed: 7am; Tavily + Perplexity top-five AI/tech; Claude 3.5 Sonnet HTML; title, H2s, bold, 2–3 sentence summaries, sources footer. Tavily community node missing → HTTP with key in a front Set (looks correct). Perplexity native. Merge **append** → two items → two newsletters (Tavily copy vs Perplexity copy, different HTML). Links real (YouTube + TechCrunch). He asks builder: one newsletter + inline citations. Builder claims Merge fix + adds ‘[1][2] after each sentence’ to **user** prompt; **Merge still append**. Inline numbers appear, not clickable. Lesson: you still have to see the Merge mode. Faster than hand-prompting once keys are in. (3) Complex: Telegram personal assistant, Gmail/calendar/ClickUp **sub-agents**, Think tool, Sonnet 3.7. Graph: each sub has **one** tool (send / create event / create task) not the belt; Telegram input + preferences Set; main agent looks for a **connected chat trigger that isn’t there**; Gmail sub has user+system, calendar/ClickUp **no user message** (would error; fix = enable ‘from main’). Verdict: builder is good at linear workflows + variable passing, weak at autonomous multi-agent. Preset invoice pipeline is the shape he wants (1→2→3, specific extract/Airtable/when-to-analyze) — but even that agent has **no live invoice variable** (fixed text). Mindset: AI gets you ~70% / cuts ~70% time; you finish the path. Plus / one-person agency CTA.

## B. Atomic Knowledge
### Approve-the-plan-then-open-every-red-node
- **Claim:** Cold-open graph looked ‘correct’ and still needed ClickUp creds + a human to read score/priority. Vague newsletter’s research tool was an empty GET. Invoice preset agent parsed an invoice that never arrived.
- **Reasoning:** Setup guide ≠ production. Same rule as a downloaded template.
- **Mechanism:** Approve → walk nodes → fill creds → prove the live variable exists → then run.
- **Evidence:** On-tape empty GET; missing chat trigger; no invoice field.
- **Conditions:** A builder POC.
- **Exceptions:** n8n builder / auto-Gmail / auto-Slack / auto-ClickUp / sell-the-POC are not ours.
- **Action:** Steal walk-every-node. Do not ship the first graph. HITL send.
- **Confidence:** high
- **Source:** TDHFkKSTJ30 @ UNKNOWN
- **Epistemic:** SOURCE
### Name-the-stack-or-it-invents-an-HTTP
- **Claim:** Vague → empty web tool. Detailed (Tavily+Perplexity+Sonnet 3.5+HTML rules) → real HTTP body for Tavily and a runnable mail. Merge append still doubled the letter until a human saw it.
- **Reasoning:** Builder said it fixed Merge and didn’t. Inline cites went in the user prompt, not system (he’d flip that).
- **Mechanism:** Name models, tools, output shape. After ‘I fixed it,’ open the Merge mode yourself.
- **Evidence:** On-tape two newsletters; TechCrunch+YouTube links; [1][5] not clickable.
- **Conditions:** A second pass on the same job.
- **Exceptions:** Same family as `a5sJNwfZ528` (include-answer / three emails). n8n not ours.
- **Action:** Steal name-the-stack-and-reopen-Merge. HITL.
- **Confidence:** high
- **Source:** TDHFkKSTJ30 @ UNKNOWN
- **Epistemic:** SOURCE
### Linear-yes-orchestrator-no
- **Claim:** Telegram+three subs+Think was the fail: one tool each, missing trigger, empty user messages. Invoice 1→2→3 is the shape he’d trust — and even that missed the live variable.
- **Reasoning:** He will use the builder for HTTP/prompt/start, not for autonomous swarms.
- **Mechanism:** Keep the builder on a named path. Don’t ask it for a personal assistant.
- **Evidence:** On-tape calendar sub with no user message; invoice agent with no invoice.
- **Conditions:** A complex agentic ask.
- **Exceptions:** n8n / Plus / auto-Telegram operate-never.
- **Action:** Steal linear-for-the-builder. HOLD the swarm.
- **Confidence:** high
- **Source:** TDHFkKSTJ30 @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: 70% time-cut is the win; false security is the risk. Priority: detailed stack, walk nodes, linear. Experience: four graphs (open + vague + detailed + swarm). Contrarian: don’t use this for multi-agent. Uncertainty: rollout not global; Plus CTA.

## D. Procedures
His order: plan → approve → setup guide → open tools/prompts/Merge → run → criticize → reopen what it claimed to fix. Our order: do not use the builder. Steal walk-every-node and name-the-stack. Caption-only: UI UNKNOWN.

## E. Examples
**Situation:** Vague morning newsletter. **Action:** approve. **Reasoning:** see the floor. **Outcome:** empty GET tool. **Lesson:** Vague = costume graph.

**Situation:** Detailed Tavily+Perplexity. **Action:** run. **Reasoning:** named stack. **Outcome:** two mails; builder ‘fixes’ Merge and doesn’t. **Lesson:** Reopen the node it bragged about.

**Situation:** Telegram assistant. **Action:** four-agent ask. **Reasoning:** stress test. **Outcome:** missing trigger, empty user msgs. **Lesson:** Builder ≠ orchestrator.

## F. Decision Rules
IF prompt is one sentence → expect empty tools. IF it says it fixed Merge → open Merge. IF the ask is multi-agent autonomous → don’t. IF Plus / 70% → not a SKU / slogan. Refuse: n8n builder as ours; auto-Gmail/Slack/ClickUp; sell the POC.

## G. Contrarian
Rejects download-and-sell. Rejects builder-as-orchestrator. Rejects trusting the setup guide as done.

## H. Assumptions
Feature not GA. Two newsletters are toys. 70% is a slogan. Survivorship: he already knew append vs combine (`a5sJNwfZ528`). Falsifier: Merge actually flips next build. Speech≠behavior: ‘don’t sell the template’ then Plus agency course.

## I. Questions
Did Merge-combine ever get fixed in-builder? Any receipt we can open that a builder POC became a paid workflow? What’s the live rollout?

## J. Connections
SYSTEM SYNTHESIS: 70% skeleton = `a5sJNwfZ528`. Linear-not-orchestrator = `7siRW0My05o` / `jZgcWCzxh1I`. Reopen-the-claimed-fix = golden-test-loop. n8n/Plus/auto-send operate-never.

## K. Future-Use
Unassigned: setup-guide-as-a-false-done. Behavior-in-user-vs-system as a builder habit.

## Steal / Operate-never

### Machine: Name-the-stack-walk-every-node-dont-believe-I-fixed-it
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: a builder plan → action: name models/tools/output; approve; open every tool/prompt/Merge; run; if it claims a fix, reopen that node → checkable stop: one item, live variables present, send still HITL
- **Questions / signals:** Is the tool empty? Is Merge append? Is the invoice actually in the prompt? Did it fix what it said?
- **Qualify / frame / objections:** Frame: 70% POC, not production. Objection: ‘setup guide means done’ — empty GET and missing trigger.
- **Procedure:** Do not use n8n builder. Do not auto-Slack. Tape 70% is a slogan.
- **Example that proves it:** Empty GET; two newsletters after ‘fixed’ Merge; Telegram sub with no user message. UNVERIFIED.
- **Why it works:** The builder maps a costume. Production is the human who opens the node.
- **Conditions / exceptions:** Works as a use-rule. Exception: n8n / auto-send / Plus / sell-the-POC operate-never.
- **Operate-never payload:** n8n NL builder · auto-Gmail/Slack/ClickUp · sell the POC · Plus agency as SKU
- **Hive run (existing skills only):** `golden-test-loop` · `playbook-before-send` · `ask-principal` · `pricing-margin-roi-guardrails`
- **Source:** TDHFkKSTJ30 @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote 70% time-cut as FACT or as our analog.
- n8n builder as ours. Auto-send Gmail/Slack. Push a builder graph to a client.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD the n8n builder. Steal name-the-stack and reopen-the-claimed-fix. Send stays HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
