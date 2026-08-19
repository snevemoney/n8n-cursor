# Forge — rXpHzWXjHrw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
n8n text-to-workflow teaser (long `TDHFkKSTJ30`). Beats: “build with just your words” → ask: AI newsletter every morning 7am, Tavily + Perplexity, top five AI/tech stories → he specifies **chat model and tools** so it doesn’t invent a random HTTP → it searches nodes, gets details, proposes a structure → you can request changes → he **one-shot approves the plan** → setup guide: email, Tavily key, Perplexity, Anthropic, Gmail → Tavily key in HTTP body → Perplexity connected → merge append → newsletter-writer agent → user message: HTML from research, start with headers, title field → system prompt **short** (“I would have expected this to be a little more detailed”) — expert newsletter writer, AI/tech → run → Gmail: looks cool, sources including a YouTube and TechCrunch. Play-button. Timestamp UNKNOWN.

## B. Atomic Knowledge

### Name the tools or you get a random HTTP
- **Claim:** He told it which chat model and tools so it wouldn’t “throw together a random HTTP request.”
- **Reasoning:** Text-to-workflow will invent nodes if you don’t constrain.
- **Mechanism:** Words include vendor names → planner searches those nodes.
- **Evidence:** Opening.
- **Conditions:** n8n builder.
- **Exceptions:** He still one-shot approves.
- **Action:** Steal named-tool constraint. Do not one-shot approve. Do not auto-send the letter.
- **Confidence:** high.
- **Source:** `rXpHzWXjHrw` @ UNKNOWN
- **Epistemic:** SOURCE

### Approve is a gate; the prompt may be thin
- **Claim:** He could request changes; he approves; then notices the writer system prompt is thinner than he wanted.
- **Reasoning:** One-shot plan ≠ quality prompt.
- **Mechanism:** Plan → approve → inspect nodes → run → open Gmail.
- **Evidence:** “Pretty short. I would have expected…”
- **Conditions:** Happy-path sources appeared.
- **Exceptions:** Thin prompt still produced a pretty letter this once.
- **Action:** Inspect the system prompt before approve. Pretty mail is not a ship.
- **Confidence:** high.
- **Source:** `rXpHzWXjHrw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Words can draft a graph. Approval is supposed to be the brain. A setup guide (keys) is part of the output. Thin prompts hide inside generated graphs.

## D. Procedures
1. State cadence + named tools + model. 2. Read the plan. 3. Reject thin prompts. 4. Configure keys HITL. 5. Run once. 6. Open the mail. 7. Do not leave it on 7am send.

## E. Examples
**Situation:** 7am AI/tech newsletter.  
**Action:** Constrain Tavily+Perplexity; approve; run; open Gmail.  
**Reasoning:** Avoid random HTTP.  
**Outcome:** Pretty HTML + real-looking sources; thin writer prompt.  
**Lesson:** Inspect the prompt inside the generated node.

## F. Decision Rules
- If tools aren’t named → expect junk HTTP.
- If you haven’t read the system prompt → don’t approve.
- If the graph sends Gmail → HITL / remove send.

## G. Contrarian
Field one-shots text-to-workflow and ships. He almost does, then admits the prompt is thin.

## H. Assumptions
Sources are real. Falsifier: 7am send of a hallucinated digest.

## I. Questions
Long-tape edit-after-approve? Same newsletter as `0Ujdys4LqNs` / `pxzo2lXhWJE`?

## J. Connections
SYSTEM SYNTHESIS: `TDHFkKSTJ30` long. `a5sJNwfZ528` AI builder. `0Ujdys4LqNs` pin-the-plan. `send-removed`. `slice-build` (don’t one-shot).

## K. Future-Use
“Name the tools in the brief” as a Forge intake line.

## Steal / Operate-never

### Machine: named tools in the words → inspect prompt → approve ≠ send
- **Epistemic:** SOURCE
- **Workflow / loop:** write cadence+tools → read plan → read system prompt → thicken or reject → dry run → open output → stop
- **Questions / signals:** Random HTTP? Prompt one sentence?
- **Qualify / frame / objections:** “Just your words” is the hook.
- **Procedure:** No 7am auto-Gmail. No n8n builder as a hive install.
- **Example that proves it:** He approved one-shot, then found a thin writer prompt.
- **Why it works:** Constraining tools prevents invented nodes. Inspecting prompts prevents pretty-dumb letters.
- **Conditions / exceptions:** Generated graph still needs keys (HITL).
- **Operate-never payload:** Text-to-workflow mill; auto-send; Anthropic/Tavily because the guide said so.
- **Hive run:** `slice-build` + `ask-principal`.
- **Source:** `rXpHzWXjHrw` @ UNKNOWN

### Operate-never
- One-shot approve to prod. Auto-send 7am.
- New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not one-shot a newsletter graph. If words draft a plan, I read the prompt inside. Send stays off. Deploy HITL.
