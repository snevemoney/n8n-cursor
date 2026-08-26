# Researcher — Vb1SwBAn9cQ
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Vb1SwBAn9cQ/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Vb1SwBAn9cQ/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~653 lines). Title: Build ANYTHING with Gemini 3 Pro and n8n AI Agents. Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Nov 18 drop. Studio free; API paid. AI Studio looks like Lovable/Base44 (games/apps/pages). He wants **API + n8n**, not the toy UI. Context ~1M in / 64k out like 2.5 family. 3 Pro costs more than 2.5 Pro (over-200k tier). Benchmarks vs 2.5 Pro / Sonnet 4.5 / GPT 5.1: 3 Pro bold on most; ScreenSpot Pro ~2× Sonnet; Vending Bench 2 ~**$5.5k** vs Sonnet **$3.9k** (UNVERIFIED). (2) Connect: native Gemini node (audio/doc/image/video + message) vs Gemini chat-model on an agent (same key) vs OpenRouter (one bill). New API: thinking level, media resolution, temperature, thought signatures. n8n Gemini + OpenRouter nodes **lack thinking level**; native “thinking budget” ≠ level. To set **low** he copies docs curl into HTTP. (3) Image eval: same prompt “describe the process.” Criminal-justice flowchart — OpenAI structure-light; Gemini more path detail. Wall water damage: both OK; Gemini leak-behind/wick-up. Car scratch: OpenAI scratches+dent; Gemini wheel-arch/dog-leg + rust + sideswipe story. Benchmarks → he’d pick 3 Pro for vision automations (tickets/cars). (4) 121-page Apple 10-K in **system prompt**; 10 Q eval; GPT-as-judge. 3 Pro **4.6/5**, ~98k tokens avg (not a tenth of 1M). 2.5 Flash **4.5**, cheaper/faster. GPT-5 mini **4.6**. n=10 “not enough”; best = per use case. Same 10-K family as `irg-2IfAjpo` (file-search count-miss) — **do not flatten**. (5) Gemini builds n8n JSON: Fireflies→research (Tavily)→internal brief email. Chat model wrong (stale prompt); HTTP 1.1 deprecated; Tavily filled except key. Second: daily AI-tool discount scout; schedule + structured `discounts_found` + Sheet always + email only if true; Perplexity/SER missing because static n8n docs, Tavily present. (6) **Thought-signature scar:** tool call sends the email, then second model hop **400** “function call missing thought signature.” Native + OpenRouter both fail. Docs: must echo encrypted thought on each function call; n8n nodes drop it. Tool worked; reply path died. Fake nate@example lunch mail **did send**. He asks comments if wrong. Skool JSON + Plus. **Do not flatten** vs `irg-2IfAjpo` / `kOKavHnlPik` RAG chooser · Gemini file-search. All $ / 4.6 / 5.5k UNVERIFIED.

## B. Atomic Knowledge

### Three connect paths; thinking-level only via HTTP
- **Claim:** Studio-free ≠ API. Native node / agent chat / OpenRouter all hit API. Thinking level low/high is not in the n8n Gemini or OpenRouter UI; copy the curl.
- **Reasoning:** New params ship in docs before nodes.
- **Mechanism:** Docs high vs low curl; HTTP body `thinkingLevel`.
- **Evidence:** He runs HTTP low; nodes show tokens/temp/top-p only.
- **Conditions:** Nov 18 preview. Pricing UNVERIFIED.
- **Exceptions:** Nodes may catch up (he says so).
- **Action:** Steal docs-curl-for-new-params. No Gemini spend.
- **Confidence:** high as the recipe that day.
- **Source:** `Vb1SwBAn9cQ` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** looking for thinking level in three UIs
- **Speech ≠ behavior:** “most intelligent / any idea” is Google’s blog, not his invoice.

### n=10 10-K is a chooser, not a crown; vision is the pitch
- **Claim:** 4.6 vs 4.5 vs 4.6 on 10 Qs. Flash wins if $ / latency matter. Vision flowchart/damage/scratch is why he’d pick 3 Pro. Whole PDF in system prompt ≠ file-search (`irg-2IfAjpo`).
- **Reasoning:** Best model = this job.
- **Mechanism:** n8n evals + GPT judge.
- **Evidence:** 98k tokens; 4.6/4.5/4.6 spoken.
- **Conditions:** Scores UNVERIFIED. Keep RAG rows open.
- **Exceptions:** n=10 he admits is thin.
- **Action:** Steal per-job eval. Do not crown Gemini.
- **Confidence:** high as the method; scores UNVERIFIED.
- **Source:** `Vb1SwBAn9cQ` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** builder used deprecated HTTP 1.1
- **Speech ≠ behavior:** “leading every category” vs Flash nearly ties on his 10-K.

### Thought signatures break n8n tool-loop; the side effect still sends
- **Claim:** Gemini 3 tool-calling needs thought signatures echoed. n8n drops them. Email tool **fires**; model reply 400s. Same on OpenRouter.
- **Reasoning:** Encrypted thought is required on the second hop.
- **Mechanism:** Agent → model → Gmail → model (dies).
- **Evidence:** Lunch mail sent to example.com; error text quoted.
- **Conditions:** As of tape. He may be wrong (asks comments).
- **Exceptions:** Custom Python/HTTP that forwards the field.
- **Action:** Steal “tool can succeed while the loop dies.” Operate-never: wire Gemini-3 as the brain of a send-agent.
- **Confidence:** high as the scar that day.
- **Source:** `Vb1SwBAn9cQ` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** native then OpenRouter, both 400
- **Speech ≠ behavior:** “doesn’t quite work” vs the email already left.

## C. Mental Models
Preview-day params live in HTTP. Eval per job, n=10 is a sniff. Whole-doc in prompt is a different RAG row. Builder JSON inherits stale docs. Signature-shaped APIs break generic nodes. Side effects can commit before the error.

## D. Procedures
1. Pick native / OpenRouter / HTTP by whether you need new params.
2. Vision? he picks 3 Pro. Cheap/fast 10-K? try Flash.
3. Run your own eval; don’t trust the blog table.
4. Don’t put Gemini 3 on a tool-loop in n8n until signatures persist.
5. Treat first tool hop as live (HITL).
6. Hive: no Gemini/OpenRouter spend.

## E. Examples
- **Situation:** Thinking level. **Action:** three UIs fail; HTTP curl. **Outcome:** low works. **Lesson:** docs first.
- **Situation:** 10-K. **Action:** 10 Q. **Outcome:** 4.6 / 4.5 / 4.6. **Lesson:** chooser.
- **Situation:** Lunch email. **Action:** Gemini 3 agent. **Outcome:** sent + 400. **Lesson:** signature; HITL.

## F. Decision Rules
- IF you need thinking level → HTTP, not the Gemini node.
- IF n=10 → do not crown a model.
- IF Gemini 3 + tools in n8n → expect reply-path death; assume the tool may have fired.
- Refuse: $5.5k vending as FACT; Gemini spend; flatten file-search row; new ICP.

## G. Contrarian
“Build anything” is a launch-day tour + a broken tool loop. Plus four courses. He sent a live email to prove a bug.

## H. Assumptions
Pricing, 4.6/4.5, 98k, $5.5k/$3.9k, 2× ScreenSpot = **UNVERIFIED**.
**Desk dissent:** whole-prompt 10-K vs `irg-2IfAjpo` file-search. Gemini vs hive Cursor+Grok.

## I. Questions
- Did n8n later add thought signatures?
- Same 10-K / 10 Q as other eval tapes?
- Tavily in the builder — live or hallucinated?

## J. Connections
- **SYSTEM SYNTHESIS:** `irg-2IfAjpo` · `kOKavHnlPik` · `a5sJNwfZ528` n8n-builder · vending-bench in `AO5aW01DKHo`. Skills: `golden-test-loop` · `info-gain-cite` · `workflow-compiler` · `send-removed`.

## K. Future-Use
HTTP-for-new-params. Per-job eval. Whole-doc-in-prompt row. Thought-signature tool-loop scar. Side-effect-before-error.

## Steal / Operate-never

### Machine: docs-curl-then-per-job-eval-then-assume-side-effect
- **Epistemic:** SOURCE
- **Workflow / loop:** read new API params → HTTP if the node lacks them → eval n on *this* job → never crown from a blog → if tool-loop, assume first tool may have fired
- **Questions / signals:** Is thinking level in the node? What’s the job? Did the tool already send?
- **Qualify / frame / objections:** n=10. Preview-day.
- **Procedure:** D.
- **Example that proves it:** HTTP low; 4.6 vs Flash 4.5; lunch mail + 400.
- **Why it works:** Nodes lag docs; benches ≠ your task; errors can be after the write.
- **Conditions / exceptions:** Gemini on-tape. Hive: no spend. HITL send.
- **Operate-never payload:** Gemini-3 as send-brain; quote 4.6/5.5k as FACT; new ICP.
- **Hive run (existing skills only):** `golden-test-loop` · `info-gain-cite` · `send-removed` · `workflow-compiler`
- **Source:** `Vb1SwBAn9cQ` @ UNKNOWN

**Operate-never**
- Auto-send via a broken tool-loop. Gemini spend. New `icp_id`. Flatten RAG rows.

## L. Role-Specific Applications
Add Gemini-3 + n8n thought-signature as its own scar row. Keep 10-K-in-prompt separate from file-search. Side-effect-before-error into `send-removed`.
