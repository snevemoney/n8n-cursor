# Day Planner — TDHFkKSTJ30
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/TDHFkKSTJ30/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/TDHFkKSTJ30/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: n8n **agent / text-to-workflow builder** (not fully rolled out). Beats: webhook form → qualify hot/warm/cold → ClickUp + **Gmail + Slack** (setup guide, score/100, HTTP Google the company); **false sense of security** — never download a template and push/sell; three tests: (1) vague “morning news email” — schedule 7am, defaults topics, **web tool unconfigured** (empty GET); (2) detailed: Tavily + Perplexity + Sonnet 3.5 + HTML rules — HTTP Tavily looks right; **merge append = two newsletters**; builder “fixed” merge, **still append**; inline citations added to **user** prompt; (3) Telegram + Gmail/calendar/ClickUp sub-agents + Think + Sonnet 3.7 — each sub-agent **one tool**, calendar/ClickUp **no user message**, main looks for missing chat trigger; invoice preset: **no live variables** into the parse agent. Thesis: builder is good at **linear workflows + variable pass**; bad at autonomous multi-agent; know source/fields/analysis before you prompt; **70% then you finish**. Plus / one-person agency CTA. Caption-only. Timestamp UNKNOWN.

## B. Atomic Knowledge
### Builder is a 70% skeleton; verify merge and live vars; don’t generate the swarm
- **Claim:** Vague prompts leave tools empty. Detailed prompts still lie (append vs combine). Multi-agent Telegram assistants come out half-wired. A “fixed it” chat is not a passing run.
- **Reasoning:** Linear paths are predictable for humans and for the builder; orchestrators are not.
- **Mechanism:** Name the path → generate → open every node → run → if merge N-items or fixed (not live) vars, you fix it.
- **Evidence:** “you would never just download a template and push it into production.” / “it didn’t actually change that merge node.”
- **Conditions:** You can name data in/out before the prompt.
- **Exceptions:** He still fires Gmail in the demo — we don’t.
- **Action:** Steal 70%+verify. Do not n8n-cloud builder as hive. Do not send Slack/Gmail. Do not Plus.
- **Confidence:** high (same spine as `a5sJNwfZ528`).
- **Source:** `TDHFkKSTJ30` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (speech)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** empty HTTP tool; append-merge; builder lied about the fix; missing user messages
- **Speech ≠ behavior:** “looks correct” first demo vs later “still appending”

## C. Mental Models
False security is the product risk. Priority: understand why. Uncertainty: rollout / Plus.

## D. Procedures
1. Write the linear path (trigger → research → one item → dest).
2. Approve the plan only as a skeleton.
3. Open tools: empty GET = not done.
4. Run; if two emails, the merge is append — fix it yourself if the chat lied.
5. If the agent has no live variable, stop.
Avoid: Telegram assistant from a prompt; Plus; auto-notify CRM.

## E. Examples
**Merge lie:** Situation → two sources. Action → builder says combine. Reasoning → it knew append was wrong. Outcome → still two newsletters. Lesson → steal verify-the-node.

**Invoice preset:** Situation → parse invoice. Action → look at agent input. Reasoning → should be live. Outcome → fixed text, no file. Lesson → steal live-var check.

## F. Decision Rules
- IF the builder says it fixed X → re-run and look at the node.
- IF the graph is an orchestrator with sub-agents → don’t start there (his).
- IF Gmail/Slack is in the skeleton → strip send.

## G. Contrarian
Rejects “NL → production agent.” Field: one-shot agent. He: 70% + you still read nodes.

## H. Assumptions
Theirs: Plus is the school. Ours: no. Falsifier: a swarm prompt that shipped wired. Survivorship: three demos.

## I. Questions
Same builder as `a5sJNwfZ528` (later Cloud version)?

## J. Connections
- SYSTEM SYNTHESIS → `a5sJNwfZ528` · `4OOS96i2gfI` · `golden-test-loop`.

## K. Future-Use
70%+verify. Live-var check. Unassigned Telegram swarm.

## Steal / Operate-never

### Machine: detailed linear prompt → 70% skeleton → verify merge + live vars yourself
- **Epistemic:** SOURCE
- **Workflow / loop:** name the path → generate → open tools/vars → run → if chat “fixed” it, look anyway
- **Questions / signals:** Empty GET? Append merge? Fixed invoice text?
- **Qualify / frame / objections:** “Push the template” is the fail. Verify-the-node is the pass.
- **Procedure:** No n8n Cloud. No Gmail/Slack send. No Plus.
- **Example that proves it:** Situation → two research nodes. Action → “we fixed merge.” Reasoning → still append. Outcome → two emails. Lesson → steal the look.
- **Why it works:** A second run is checkable; a setup-guide paragraph is not.
- **Conditions / exceptions:** Builder not rolled out to all (his).
- **Operate-never payload:** n8n Cloud; auto-Gmail/Slack; Plus; sell the template.
- **Hive run (existing skills only):** `golden-test-loop` · `slice-build`.
- **Source:** `TDHFkKSTJ30` @ UNKNOWN

### Operate-never
- n8n Cloud / auto-notify / Plus / sell-unverified-flow.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as 70%+verify-the-node. Clients parked.
