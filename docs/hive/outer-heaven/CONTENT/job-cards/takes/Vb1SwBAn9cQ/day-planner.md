# Day Planner — Vb1SwBAn9cQ
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Vb1SwBAn9cQ/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Vb1SwBAn9cQ/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: Gemini 3 Pro preview (on tape 2025-11-18) over **API in n8n** — not Studio games. Beats: AI Studio free preview vs paid API; same ~1M in / 64k out as 2.5; 3 Pro costs more; benches vs Sonnet 4.5 / GPT 5.1 (UNVERIFIED); ScreenSpot Pro ~2×; Vending Bench 2 ~5.5k vs Sonnet ~3.9k (UNVERIFIED). n8n: Gemini node (audio/doc/image/video) vs chat-model vs Open Router (one bill). Thinking level low/high (medium soon); n8n UI missing thinking-level — only max tokens / temp / topK / topP / safety. Demos: 121-page Apple 10-K in the system prompt; Gemini builds n8n JSON (Fireflies → research brief; daily AI-deal scout that emails only if deals, else log). Builder used **outdated HTTP 1.1** + Open Router from a stale prompt. Close: **thought signatures** — tool fires (email sent), second hop errors “missing thought signature”; native Gemini and Open Router both fail; n8n must pass the field back. Skool / Plus. Caption-only. Timestamp UNKNOWN. Clients parked.

## B. Atomic Knowledge
### Tool can fire before the second hop; do not swap every agent to a new brain
- **Claim:** Gemini 3 tool-calling needs an encrypted thought signature on the return trip. n8n’s Gemini / Open Router nodes drop it. The lunch email still sent; the model then 400s. A builder with stale n8n docs emits deprecated HTTP 1.1 and the wrong chat model.
- **Reasoning:** “It works” on the first tool is not “the agent is safe.” Eval-then-pick + thinking-level as a cost cap beat a model-drop morning.
- **Mechanism:** Name the job → compare models on that job → pin thinking-level / max tokens → verify every generated node → never auto-send from the first hop.
- **Evidence:** “the tool works correctly… we get an error… function call is missing a thought signature.” / “all of these are being sent.”
- **Conditions:** One headed test with a fake recipient, send-removed.
- **Exceptions:** Studio games / 121-page paste / Plus courses = magnet. Benches stay UNVERIFIED.
- **Action:** Steal fail-closed-after-tool + 70%-verify-the-JSON + if-no-deals-do-nothing. Do not Gemini. Do not Open Router. Do not Fireflies.
- **Confidence:** high as the second-hop fail.
- **Source:** `Vb1SwBAn9cQ` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (speech)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** thought-signature 400 on native + Open Router; HTTP 1.1 from stale knowledge
- **Speech ≠ behavior:** “build anything” vs tool-call broken on the return trip

## C. Mental Models
New-model morning ≠ swap-all-agents. Priority: one eval, then CUT. Uncertainty: benches / “most intelligent.”

## D. Procedures
1. Do not paste a 10-K into every turn — name the question first.
2. If a builder emits JSON, pin + verify each node (model, HTTP version, keys).
3. Deal-scout shape: log every day; email only if a skeptical check is true.
4. Before swapping a chat model, run one headed tool-call and watch the *second* hop.
5. Thinking-level / max tokens are the cost cap, not Ultra.
Avoid: Gemini; Open Router; Tavily; Fireflies; auto-send; Skool; unpark.

## E. Examples
**Lunch email:** Situation → “send lunch to nateample.com.” Action → tool sends, then 400. Reasoning → signature missing. Outcome → inbox already hit. Lesson → first hop can spend.

**Deal scout:** Situation → daily discounts. Action → structured `discounts found` true/false + sheet log. Reasoning → no-deal = do nothing. Outcome → email only on true. Lesson → steal the if, not the hunt.

## F. Decision Rules
- IF the tool can send/pay/book → send-removed until Evens.
- IF the builder used old docs → assume wrong node versions.
- IF thinking-level is missing in the UI → do not treat the node as “full Gemini 3.”
- IF benches look 2× → UNVERIFIED; do not schedule a swap.

## G. Contrarian
Rejects “plug 3 Pro into all my agents.” Field: new-era title. He: it doesn’t quite work for tools yet.

## H. Assumptions
Theirs: n8n will add thought signatures. Ours: we never install Gemini. Falsifier: a headed send that already left. Survivorship: one preview week.

## I. Questions
Same Fireflies brief as `KGXFkUlBHxw`? Same builder-stale-docs as `TDHFkKSTJ30`?

## J. Connections
- SYSTEM SYNTHESIS → `EthxaDswUFo` (don’t pay 10 for a 5) · `a5sJNwfZ528` (70%+verify) · `X80ljdCPM_U` (eval-then-pick).

## K. Future-Use
Second-hop test. If-no-signal-do-nothing. Unassigned: Gemini as hive.

## Steal / Operate-never

### Machine: eval-then-pick → cap thinking → verify generated JSON → watch the second hop
- **Epistemic:** SOURCE
- **Workflow / loop:** name one job → run one headed tool-call → confirm return trip → only then keep the model
- **Questions / signals:** Did the tool already fire? Is HTTP 1.1 in the JSON? Is thinking-level even in the node?
- **Qualify / frame / objections:** “New era” is the fail. Second-hop green is the pass.
- **Procedure:** No Gemini. No Open Router. No Fireflies. No auto-email.
- **Example that proves it:** Situation → lunch send. Action → tool works, model 400s. Reasoning → signature dropped. Outcome → email already gone. Lesson → steal the watch, not the swap.
- **Why it works:** The inbox is checkable; a bench slide is not.
- **Conditions / exceptions:** Clients parked. Tape $ / benches UNVERIFIED.
- **Operate-never payload:** Gemini; Open Router; Tavily; Fireflies; quote ScreenSpot / Vending as FACT; Skool; unpark.
- **Hive run (existing skills only):** `golden-test-loop` · `coverage-loop`.
- **Source:** `Vb1SwBAn9cQ` @ UNKNOWN

### Operate-never
- Gemini / Open Router / Fireflies / Tavily / Skool / auto-send / quote benches as FACT / unpark.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as second-hop-before-swap. Clients parked.
