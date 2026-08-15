# Librarian — rXpHzWXjHrw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Build Agents INSTANTLY with n8n's Native Text to Workflow Builder
**Channel:** Nate Herk | AI Automation
**Kind:** short (~1:52 / ~475 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Build n8n agents with words: asked for an AI newsletter workflow every morning at 7 a.m. using Tavily and Perplexity to research top five trending AI/tech stories.
2. He specified chat model and tools so it would not throw a random HTTP request.
3. Builder searched nodes, got details, different structure; can request changes; he tests one-shot prompting and approves the plan.
4. Setup guide: configure email, Tavily key, Perplexity, Anthropic, Gmail.
5. Config: Tavily key in HTTP body; Perplexity connected; merge appends results; newsletter writer agent.
6. User message: create HTML newsletter from research; start with headers; title field.
7. System prompt "pretty short" — he expected more detail: "expert newsletter writer specializing in AI and tech news."
8. Run: Tavily+Perplexity research → writer → Gmail. Output "looks cool"; sources clickable to real articles; one from YouTube; one TechCrunch.
9. CTA: full breakdown.
Gap: whether send was HITL. Timestamp UNKNOWN. Tavily / Perplexity / Anthropic / Gmail / n8n on-tape.

## B. Atomic Knowledge

### Name the tools or you get random HTTP
- **Claim:** Tell the builder the chat model and tools or it will invent a random HTTP request.
- **Reasoning:** One-shot text-to-workflow still needs a tool list.
- **Mechanism:** Words include schedule + Tavily + Perplexity + model → builder searches nodes → plan → approve.
- **Evidence:** "tell it exactly what chat model I wanted to use and the different tools ... so it didn't just try to throw together a random HTTP request."
- **Conditions:** n8n text-to-workflow
- **Exceptions:** He still got a short system prompt he disliked
- **Action:** File name-the-tools; park the builder as hive
- **Confidence:** high as his rule
- **Source:** `rXpHzWXjHrw` @ UNKNOWN
- **Epistemic:** SOURCE

### Short system prompt is a miss he noticed
- **Claim:** Writer system prompt was shorter than he expected; he still ran it.
- **Reasoning:** Approve-the-plan ≠ prompt quality.
- **Evidence:** "I would have expected this to be a little more detailed."
- **Conditions:** One-shot approve
- **Exceptions:** Output still had clickable sources
- **Action:** Persist the miss; do not flatten "it looks cool" over the thin prompt
- **Confidence:** high
- **Source:** `rXpHzWXjHrw` @ UNKNOWN
- **Epistemic:** SOURCE

### Sources you can click
- **Claim:** Output included sources that open real articles (YouTube + TechCrunch).
- **Reasoning:** Cite-the-page is the useful receipt.
- **Evidence:** "sources down below ... click on and it takes us to real articles"
- **Action:** File clickable sources as the stop; Gmail send is operate-never without HITL
- **Confidence:** high as demo
- **Source:** `rXpHzWXjHrw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Words can scaffold a graph if tools are named. One-shot approve is a test, not a religion. Thin prompt is a known gap. Sources make the newsletter checkable.

## D. Procedures
1. State schedule + research tools + model by name.
2. Review plan; optionally request changes; approve to test one-shot.
3. Fill keys (Tavily, Perplexity, Anthropic, Gmail).
4. Inspect writer user/system prompts.
5. Run; click sources.
Avoid: hive auto-Gmail. Signals: merge append; short system prompt; clickable sources.

## E. Examples
**7 a.m. newsletter one-shot:** Situation — wants morning AI/tech newsletter. Action — name Tavily+Perplexity+model; approve plan; run. Reasoning — avoid random HTTP. Outcome — HTML + YouTube/TechCrunch sources; prompt thinner than expected. Lesson — name tools; inspect prompt; cite sources; send HITL.

## F. Decision Rules
- If tools are unnamed → expect random HTTP.
- If system prompt is thinner than you'd write → do not call the builder done.
- If sources do not click to real pages → fail the receipt.
- Refuse: auto-Gmail; n8n-cloud; Tavily/Perplexity as hive.

## G. Contrarian
Against "just say build a newsletter" without naming tools. Against treating one-shot approve as finished craft.

## H. Assumptions
Theirs: 7 a.m. + Gmail is the product (send risk). Ours: teaser of `TDHFkKSTJ30` / `a5sJNwfZ528`. Falsifier: a run with fake sources. Do not flatten with `0Ujdys4LqNs` (manual vs builder).

## I. Questions
Was Gmail send automatic? Did he edit the short prompt later? Long-tape quality bar?

## J. Connections
SYSTEM SYNTHESIS → `TDHFkKSTJ30`; `a5sJNwfZ528`; `0Ujdys4LqNs`; `info-gain-cite` (clickable sources); `send-removed`.

## K. Future-Use
Name-the-tools + inspect-generated-prompt as atoms for any text-to-workflow tape.

## Steal / Operate-never

### Machine: name tools, approve plan, inspect prompt, click sources
- **Epistemic:** SOURCE
- **Workflow / loop:** words include model+tools → builder plan → approve/request changes → inspect system prompt → run → checkable stop = sources click to real pages (send stays HITL)
- **Questions / signals:** Did it invent HTTP? Is the prompt detailed enough? Do sources resolve?
- **Qualify / frame / objections:** "Instantly" is the hook; he still expected a thicker prompt
- **Procedure:** Tavily HTTP body + Perplexity + merge + writer
- **Example that proves it:** 7 a.m. top-five AI/tech → HTML + YouTube/TechCrunch links
- **Why it works:** named tools constrain the graph; sources make output checkable
- **Conditions / exceptions:** n8n builder on-tape; short prompt miss
- **Operate-never payload:** auto-Gmail; n8n-cloud; Tavily/Perplexity as hive
- **Hive run:** `send-removed` · `info-gain-cite` · `channel-walk`
- **Source:** `rXpHzWXjHrw` @ UNKNOWN

### Operate-never
- Auto-send Gmail. n8n text-to-workflow as hive builder. Tavily/Perplexity/Anthropic as stack.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File name-the-tools and the thin-prompt miss as two atoms. Clickable sources are the cite bar. Do not flatten "looks cool" over the miss.
