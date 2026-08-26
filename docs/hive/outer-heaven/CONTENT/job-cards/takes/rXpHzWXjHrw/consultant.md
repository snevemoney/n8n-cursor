# Consultant — rXpHzWXjHrw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Text-to-workflow teaser (long `TDHFkKSTJ30`). Beats: he asks for a 7am AI newsletter using Tavily + Perplexity for top five trending AI/tech stories, and he specifies chat model + tools so it does not invent a random HTTP. Builder searches nodes, returns a plan; he can request changes; he one-shot approves. Setup guide: email, Tavily, Perplexity, Anthropic, Gmail keys. Graph: Tavily HTTP with key in body, Perplexity, merge append, newsletter writer. User message: HTML newsletter from research, start with headers; system prompt short (“expert newsletter writer…”) — he expected more detail. Run → Gmail: looks cool, sources (YouTube + TechCrunch) clickable. CTA to the long. No VTT. UNKNOWN. ~475 words.

## B. Atomic Knowledge

### Name the tools or the builder will invent HTTP
- **Claim:** He specifies the chat model and tools so the text-to-workflow builder does not assemble a random HTTP request.
- **Reasoning:** Unconstrained “build me a newsletter” is how you get mystery nodes.
- **Mechanism:** Prompt includes schedule + research tools + model → review plan → approve.
- **Evidence:** “it didn't just try to throw together a random HTTP request.”
- **Conditions:** n8n agent builder. Tavily/Perplexity named.
- **Exceptions:** Even named tools still produced Tavily-as-HTTP with the key in the body.
- **Action:** Name tools. Then read the graph for secrets-in-body and thin prompts.
- **Confidence:** high
- **Source:** `rXpHzWXjHrw` @ UNKNOWN — “tell it exactly what chat model I wanted to use and the different tools”
- **Epistemic:** SOURCE
### Approve is not the same as a good system prompt
- **Claim:** He approves the plan; the writer’s system prompt is shorter than he wanted.
- **Reasoning:** One-shot approve ships a thin expert-role line.
- **Mechanism:** Read the system prompt before the first real send.
- **Evidence:** “I would have expected this to be a little more detailed.”
- **Conditions:** After approve, he inspects.
- **Exceptions:** He still runs it and likes the look.
- **Action:** Thin prompt is a fail for a skeptical buyer even if the HTML is pretty.
- **Confidence:** high
- **Source:** `rXpHzWXjHrw` @ UNKNOWN — “system prompt, which is pretty short”
- **Epistemic:** SOURCE
### Sources in the email are the toddler check
- **Claim:** The output includes clickable sources (YouTube, TechCrunch).
- **Reasoning:** A pretty newsletter without sources is a slop letter.
- **Mechanism:** Run → open Gmail → click sources.
- **Evidence:** On-tape: sources down below, real articles.
- **Conditions:** One run. Auto-Gmail.
- **Exceptions:** Sources can be weak or wrong. Send is still send.
- **Action:** Require sources. Keep send HITL.
- **Confidence:** high as a check; operate-never on auto-Gmail
- **Source:** `rXpHzWXjHrw` @ UNKNOWN — “we've got our sources down below… real articles”
- **Epistemic:** SOURCE


## C. Mental Models

He likes one-shot text-to-graph. He is not naive: he names tools, he inspects the prompt, he notices HTTP-with-key. He still approves fast and sends to Gmail. He is teaching the builder, not a client outcome.

## D. Procedures

1. Specify schedule, tools, model. 2. Read the plan. 3. Read every credential surface (key in body). 4. Read the system prompt. 5. Run to a draft, not a send. 6. Click sources. Avoid: one-shot approve + Gmail.

## E. Examples

**Situation:** 7am AI/tech newsletter from Tavily+Perplexity. **Action:** Text-to-workflow; approve; inspect; run to Gmail. **Outcome:** Pretty HTML + sources. **Lesson:** Name tools; still audit prompt and secrets. Implicit rule: he expected a longer system prompt and said so.

## F. Decision Rules

If tools are unnamed, reject the plan. If the API key is in the HTTP body, fail hygiene. If the system prompt is one sentence, do not send. If Gmail is next, HITL.

## G. Contrarian

Field default: let the builder pick everything. He specifies tools. Field default: trust approve. He still opens the prompt.

## H. Assumptions

Auto-Gmail. Keys in body. Anthropic/Tavily/Perplexity on-tape. One pretty run. Long `TDHFkKSTJ30`.

## I. Questions

Did he fix the thin prompt on the long? Who rotates the key that was in the body?

## J. Connections

**SYSTEM SYNTHESIS:** Long `TDHFkKSTJ30`. Pair `0Ujdys4LqNs` / `pxzo2lXhWJE`. Maps to `golden-test-loop` + `warm-draft-hitl` + `info-gain-cite`.

## K. Future-Use

Unassigned: “name the tools” as a builder prompt clause; key-in-body as a security fail; thin-prompt fail.

## Steal / Operate-never

### Machine: Specify tools → audit plan/prompt/secrets → draft with sources (no send)
- **Epistemic:** SOURCE
- **Workflow / loop:** Write schedule + named tools + model → review plan → inspect HTTP/secrets + system prompt → run to a draft → click sources → human sends or kills
- **Questions / signals:** Did it invent HTTP? Is the key in the body? Is the system prompt one line? Did we send?
- **Qualify / frame / objections:** Qualify: they want a clock. Frame: builder is a drafter of graphs. Objection: “one-shot it” — he approved and still found a thin prompt.
- **Procedure:** Name tools. Fail key-in-body. Fail thin prompt. No auto-Gmail.
- **Example that proves it:** 7am newsletter builder; Tavily HTTP with key in body; short writer prompt; pretty mail with sources.
- **Why it works:** Named tools reduce mystery nodes. Audit still catches secrets and slop prompts. Sources are the check.
- **Conditions / exceptions:** One run. Vendors. Send on tape.
- **Operate-never payload:** Auto-send. Install Tavily/Perplexity/Anthropic. One-shot approve to prod.
- **Hive run (existing skills only):** `golden-test-loop` · `warm-draft-hitl` · `info-gain-cite` · `ask-principal`
- **Source:** `rXpHzWXjHrw` @ UNKNOWN


### Operate-never
- Auto-send the newsletter.
- One-shot approve a graph that has a key in the body or a one-line system prompt.
- Install the on-tape research vendors.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “build agents with just your words.” Felt problem is not a 7am newsletter. Do not text-to-workflow a parked client.

**Four-blank after constraint:** Toddler stop = named tools + sources clicked + human send.

**Skeptical-customer:** Pretty HTML is smash. Clients parked.
