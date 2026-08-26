# Librarian — Vb1SwBAn9cQ
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Vb1SwBAn9cQ/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Vb1SwBAn9cQ/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Build ANYTHING with Gemini 3 Pro and n8n AI Agents
**Channel:** Nate Herk | AI Automation
**Kind:** video (~5836 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Gemini 3 Pro preview **Nov 18** (year on-tape). Blog: "new era." AI Studio free build (Lovable/Base44-shaped); API paid. 1M in / 64k out like 2.5 family; 3 Pro costs more than 2.5 Pro, especially >200k. Benchmarks vs 2.5 Pro / Sonnet 4.5 / GPT-5.1: he says 3 Pro **bold-wins most**, ScreenSpot Pro ~**2×** Sonnet, vending-bench-2 net worth ~**5.5k vs Sonnet 3.9k** (all UNVERIFIED vendor slides).
2. n8n connect three ways: native Gemini node (audio/doc/image/video + message), Gemini chat-model on an agent (same key), or **OpenRouter** (one bill). Thinking level (low/high; medium "soon") is **not** in n8n Gemini, OpenRouter, or native LLM "thinking budget." To set it for-sure: raw **HTTP** from the curl in the docs.
3. Exp 1 — images, same prompt "describe the process/damage": criminal-justice flowchart (OpenAI structural, Gemini more path-detail); wall water damage (both name stain/peel; Gemini guesses leak/flood); faint car scratch (OpenAI scratch+dent; Gemini dog-leg + rust + sideswipe story). He still picks Gemini for image jobs **because the slide said so**, while saying both did well.
4. Exp 2 — 121-page Apple 10-K dumped into the **system prompt**; 10-Q eval scored by GPT. Gemini 3 **4.6/5**, ~98k tokens avg (not even 1/10 of 1M). 2.5 Flash **4.5**, cheaper/faster. GPT-5 mini **4.6**. His point: **10 items is not enough**; pick the model for the use case.
5. Exp 3 — Gemini writes n8n JSON. (a) Fireflies → research → internal AI-audit brief → email. First-pass miss: wrong/outdated chat model; HTTP request **v1.1 deprecated**; Tavily filled except key — because he fed **stale n8n docs**. (b) Daily AI-tool discount scout: schedule → agent + structured parser (`discounts_found`) → always log Sheet → email only if true. Agent has no live Perplexity/SER; knows Tavily; tells you what to configure.
6. **Tool-calling break (the tape's real result):** Gemini 3 **thought signatures** must be echoed on the next model call. n8n (and OpenRouter-through-n8n) drop them. Demo: "email nate@example.com lunch" — **the Gmail tool sends**, then the node 400s (`function call is missing a thought signature`). He checked forums: n8n must update nodes. He flags he is not deeply technical; ask comments if wrong. Skool template + Plus ("**over 200** members," four courses) — do not flatten with 3,000 elsewhere.
Gap: eval question set, builder prompt. Timestamp UNKNOWN. Gemini/n8n/OpenRouter/Plus on-tape.

## B. Atomic Knowledge

### Eval the use-case; raw HTTP for hidden knobs; n8n+Gemini tools can send then crash
- **Claim:** Studio demos ≠ API-in-n8n. Thinking level needs a raw request. Image "winner" is a slide plus a tie in the room. Long-context 10-Q: three models cluster ~4.5–4.6; cheaper Flash may win. Generated workflows inherit **stale docs**. Thought signatures: the side-effect (send) can succeed while the graph errors — a send-then-crash is worse than a clean fail.
- **Reasoning:** The lunch email is the operate-never. Benchmarks are vendor. 10 evals are a method, not a crown.
- **Mechanism:** connect → if a param is missing, HTTP → eval N≥? on *your* task → never put Gemini 3 on a tool-agent in n8n until signatures persist → HITL before mail.
- **Evidence:** thinking level absent in three UIs; 4.6/4.5/4.6; deprecated 1.1; lunch send + 400.
- **Conditions:** Nov-18 preview; prices/benchmarks UNVERIFIED and dated. "200" vs other tapes' 3,000 — keep both.
- **Exceptions:** Hive does not adopt Gemini or n8n-cloud as OS.
- **Action:** File use-case-eval, HTTP-for-hidden-params, send-then-crash. Do not crown Gemini. Do not auto-mail.
- **Confidence:** high as a "don't trust the node" tape
- **Source:** `Vb1SwBAn9cQ` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** thought-signature 400 after a successful send; outdated builder JSON
- **Speech ≠ behavior:** "Gemini leading every category" vs Flash/mini tying the 10-Q; "doesn't quite work" vs the email already left

## C. Mental Models
Studio toy vs API graph. Model-for-task. Stale docs → stale JSON. Send-then-crash. Plus count wobbles.

## D. Procedures
1. Prefer one bill (OpenRouter-shaped) unless you need a native multimodal op.
2. If the docs expose a knob the node hides, use HTTP.
3. Eval on your questions; do not crown from 10 rows or a blog table.
4. Treat generated n8n as a draft that will be a version behind.
5. Do not attach Gemini 3 to tools in n8n until signatures round-trip.
Avoid: auto-email; n8n-cloud; Gemini as hive; 2× ScreenSpot as FACT.

## E. Examples
**Lunch 400:** Situation — prove tools. Action — send lunch mail. Outcome — mail goes, graph dies. Lesson — side-effect before ack is the bug class.

**10-K cluster:** Situation — 121 pages in the prompt. Action — 10 scored Qs. Outcome — 4.6 / 4.5 / 4.6. Lesson — use-case, not brand.

## F. Decision Rules
- IF the node cannot echo thought signatures → no tool-agent.
- IF you only have 10 evals → do not pick a winner.
- IF the builder used old docs → expect deprecated nodes.
- Refuse: Gemini/n8n as hive; sendPrompt; benchmarks as FACT.

## G. Contrarian
Against "drop Gemini 3 into every agent today." Against Studio-game as proof of production.

## H. Assumptions
Caption-only. Complements `AO5aW01DKHo` (never-happen) and eval tapes. Keep 200 vs 3,000 as dissent.

## I. Questions
Did n8n later add thought signatures? What were the 10 10-K questions?

## J. Connections
SYSTEM SYNTHESIS → n8n-builder rule (validate before deploy); `ask-principal`; `golden-test-loop`.

## K. Future-Use
Use-case-eval + hidden-param-HTTP + send-then-crash as atoms.

## Steal / Operate-never

### Machine: eval the task; never tool-call a model that sends before it can ack
- **Epistemic:** SOURCE
- **Workflow / loop:** connect → expose knobs → score on your set → refuse tool-send if signatures drop → HITL mail
- **Questions / signals:** Does the node pass thought signatures? How many evals? Which docs version?
- **Qualify / frame / objections:** Preview-day tape. The steal is the crash class, not the crown.
- **Procedure:** D above.
- **Example that proves it:** lunch send + 400; 4.6 three-way tie.
- **Why it works:** Side-effects need an ack path.
- **Conditions / exceptions:** Dated preview. Hive stays Cursor+Grok.
- **Operate-never payload:** Gemini/n8n-cloud as hive; auto-mail; vendor benches as FACT; Plus-200 as FACT.
- **Hive run:** File send-then-crash next to Watchdog. Do not swap brains for a preview.
- **Source:** `Vb1SwBAn9cQ` @ UNKNOWN

### Operate-never
- Gemini 3 / n8n-cloud as hive. Tool-agent mail. Quote ScreenSpot / vending-bench / 200 as FACT. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Keep Plus-count wobble. File send-then-crash as a Librarian warning on vendor-day tapes. Hard steps HITL.
