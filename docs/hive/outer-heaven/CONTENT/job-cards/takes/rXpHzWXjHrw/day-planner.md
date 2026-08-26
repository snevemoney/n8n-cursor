# Day Planner — rXpHzWXjHrw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short: n8n text-to-workflow. Beats: NL “newsletter every morning at 7am” using Tavily + Perplexity for top five AI/tech stories; he specifies chat model + tools so it does not invent a random HTTP; it searches nodes, proposes a structure, he can request changes; he **one-shot approves**; setup guide (email, Tavily, Perplexity, Anthropic, Gmail keys); Tavily key in HTTP body; Perplexity connected; merge append; writer agent — user msg = HTML from research, start with headers; system prompt he finds **too short** (“expert newsletter writer…”); run → Gmail; looks cool; sources clickable (YouTube + TechCrunch). CTA to full (`TDHFkKSTJ30`). Timestamp UNKNOWN. 7am send is the weekday collision.

## B. Atomic Knowledge
### Name the model and tools or it will invent HTTP
- **Claim:** If you do not name the chat model and tools, the builder throws a random HTTP request.
- **Reasoning:** Constraint the generator.
- **Mechanism:** NL + named tools → node search → plan → approve.
- **Evidence:** “so it didn’t just try to throw together a random HTTP request.”
- **Conditions:** Text-to-workflow exists.
- **Exceptions:** A human-built graph does not need this warning.
- **Action:** Name tools on the ask. Approve is a human beat — he one-shots it; we should not on a send path.
- **Confidence:** high.
- **Source:** `rXpHzWXjHrw` @ UNKNOWN
- **Epistemic:** SOURCE

### Short system prompt is a miss he names
- **Claim:** He expected a more detailed writer prompt; it was “pretty short.”
- **Reasoning:** Generator under-specified the writer.
- **Mechanism:** Open the system prompt after approve.
- **Evidence:** “I would have expected this to be a little more detailed.”
- **Conditions:** You open the node.
- **Exceptions:** A short prompt that still cites sources may be enough — he still shows sources.
- **Action:** Open the prompt before a 7am cron. Do not approve-and-forget.
- **Confidence:** high he flagged it.
- **Source:** `rXpHzWXjHrw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Words-to-graph is the unlock. He still inspects keys, merge, and prompt. Priority: show a real Gmail output with sources. 7am every morning is automatic-first. Uncertainty: whether the 7am trigger is armed.

## D. Procedures
1. NL ask names model + tools.
2. Read the plan. Do not one-shot approve on a send/cron.
3. Open the writer prompt. If thin, rewrite.
4. Check sources on a headed run.
5. 7am send = never from this desk.
Avoid: Tavily/Perplexity/Anthropic keys from this desk; morning auto-Gmail.

## E. Examples
**7am newsletter one-shot:** Situation → NL newsletter cron. Action → name Tavily+Perplexity; approve; run; Gmail with sources. Reasoning → words-to-graph. Outcome → pretty letter + YouTube/TechCrunch links. Lesson → steal named-tools + open-the-prompt; never the 7am send.

## F. Decision Rules
- If the generator might invent HTTP → name the tools.
- If the system prompt is thinner than expected → fail ready.
- If the trigger is 7am Gmail → CUT / HITL.

## G. Contrarian
Rejects “just say newsletter and let it wire HTTP.” Also quietly rejects his own one-shot approve — he still inspects.

## H. Assumptions
Theirs: one-shot + short prompt is demo-good. Ours: 7am send is a CUT collision; keys in HTTP body are a leak risk. Falsifier: sources are hallucinated. Survivorship: one pretty Gmail.

## I. Questions
Full `TDHFkKSTJ30`? Is 7am armed? Key-in-body vs credential?

## J. Connections
- SYSTEM SYNTHESIS → `TDHFkKSTJ30` · `0Ujdys4LqNs` / `pxzo2lXhWJE` (newsletter) · `morning-day-plan` (7am is CUT if it sends).

## K. Future-Use
Named-tools-in-the-ask + open-the-prompt. Unassigned builder.

## Steal / Operate-never

### Machine: name tools → read plan → open prompt → headed sources; cron-send HITL
- **Epistemic:** SOURCE
- **Workflow / loop:** NL with named tools → inspect plan → inspect prompt → headed run + click sources → Evens decides any morning send
- **Questions / signals:** Did it invent HTTP? Is the prompt thin? Is 7am a send?
- **Qualify / frame / objections:** One-shot approve on a cron is the fail.
- **Procedure:** Headed only. No keys from this desk. No 7am Gmail.
- **Example that proves it:** Situation → 7am newsletter NL. Action → named tools, approve, thin prompt, pretty Gmail. Reasoning → words-to-graph. Outcome → sources click. Lesson → inspect prompt; do not arm 7am.
- **Why it works:** Named tools prevent random HTTP; a thin prompt is visible if you open it.
- **Conditions / exceptions:** Teaser. Long tape owns the builder. Clients parked.
- **Operate-never payload:** 7am auto-Gmail; keys in chat/body; Tavily/Perplexity as SKUs.
- **Hive run (existing skills only):** `morning-day-plan` · `send-removed` · `ask-principal`.
- **Source:** `rXpHzWXjHrw` @ UNKNOWN

### Operate-never
- Arm a 7am send cron.
- Paste API keys.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as named-tools + open-the-prompt (no 7am send). Clients parked.
