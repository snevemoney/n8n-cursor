# Big Boss — rXpHzWXjHrw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Short (PACKET: 1:52, 475 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt`. Visual-only gaps: text-to-workflow plan, node search, HTTP-to-Tavily body, Perplexity node, merge, newsletter-writer prompts, Gmail HTML, source links (YouTube, TechCrunch). ASR: Tavi/Tavly/Tavali, Perplexi, end/n8n.

Beats, in order:

1. Hook: “build n8n AI agents with just your words.”
2. Prompt: AI newsletter every morning at 7 a.m.; use Tavily and Perplexity to research the top five trending AI/tech stories.
3. Constraint he added: tell it exactly which chat model and tools, so it “didn’t just try to throw together a random HTTP request.”
4. Builder: searched nodes, got details, produced a “different workflow structure.” He can request changes.
5. He tests one-shot: **approves the plan** without requesting changes.
6. Output includes a setup guide: configure email, Tavily API key, Perplexity, Anthropic, Gmail, “stuff like that.”
7. Inspect: Tavily key would sit on an HTTP node and pass in the body. Perplexity: he already connected the account. Merge node appends results. Newsletter writer agent next.
8. Prompts: user message = “create an HTML newsletter from the following research data,” start with headers, title slot. System prompt “pretty short” — he “would have expected this to be a little more detailed.” Text: “You are an expert newsletter writer specializing in AI and tech news.”
9. Run: Tavily + Perplexity research → writer → he opens Gmail.
10. Review: “this one looks cool”; sources below, clickable, “real articles”; one source is a YouTube video; one is TechCrunch AI.
11. CTA: play button to the full breakdown.

Off-topic / not skipped: disappointment at a short system prompt; YouTube-as-source surprise; 7 a.m. schedule named, not proven on this run.

## B. Atomic Knowledge

### Name the tools in the brief or you get random HTTP
- **Claim:** If you specify chat model and tools (Tavily, Perplexity), the builder searches real nodes instead of inventing a generic HTTP request.
- **Reasoning:** One-shot text-to-graph will guess. Names pin the graph.
- **Mechanism:** Spoken constraint → node search → “different workflow structure.”
- **Evidence:** He states the fear (“random HTTP”) and the fix (name the tools). He still ends up with HTTP for Tavily (key in the body) — so “not random” ≠ “no HTTP.”
- **Conditions:** The named nodes exist in the palette. Keys still required (setup guide).
- **Exceptions:** He does not show the unnamed-prompt fail on this short (the thing he is avoiding).
- **Action:** Steal “name the tools.” Do not treat text-to-workflow as magic. Cursor + Grok only.
- **Confidence:** high for his rule; medium that unnamed always goes HTTP
- **Source:** `rXpHzWXjHrw` @ UNKNOWN — “didn’t just try to throw together a random HTTP request”
- **Epistemic:** SOURCE

### Approve the plan is a gate; inspect prompts anyway
- **Claim:** He can request changes; he one-shots approve. Then he reads user + system prompts and finds the system side thin.
- **Reasoning:** Plan-approve ≠ prompt-quality. A short “expert newsletter writer” line is a smell he names.
- **Mechanism:** Approve → setup guide → open nodes → read prompts → run.
- **Evidence:** “I would have expected this to be a little more detailed.” He runs it anyway.
- **Conditions:** Human can open the agent node. If they only approve the plan, they ship the thin prompt.
- **Exceptions:** He does not rewrite the system prompt on this short.
- **Action:** Plan gate + prompt inspection are two stops. Thin prompt is a fail even if the HTML “looks cool.”
- **Confidence:** high
- **Source:** `rXpHzWXjHrw` @ UNKNOWN — “approve this plan” / “system prompt, which is pretty short”
- **Epistemic:** SOURCE

### Sources you can click are the newsletter receipt
- **Claim:** The Gmail HTML includes sources that open real articles (YouTube, TechCrunch).
- **Reasoning:** A pretty newsletter without clickable sources is a vibe. He is more excited about the links than the copy.
- **Mechanism:** Merge research → writer → Gmail. He clicks.
- **Evidence:** Spoken clicks. Article quality **UNVERIFIED**. 7 a.m. cron not shown on this run.
- **Conditions:** Writer actually emits links from the merge, not hallucinated URLs.
- **Exceptions:** He does not compare Tavily vs Perplexity contributions. Merge “appends.”
- **Action:** Done = opened a source. “Looks cool” is 70%.
- **Confidence:** high that he clicked; low that sources match “top five trending”
- **Source:** `rXpHzWXjHrw` @ UNKNOWN — “sources down below… click on and it takes us to real articles”
- **Epistemic:** SOURCE

### Setup guide is a secrets list, not a finish line
- **Claim:** After generate, you still need email, Tavily key, Perplexity, Anthropic, Gmail.
- **Reasoning:** Words build the graph. Keys make it run. Pay/secrets stay HITL.
- **Mechanism:** Setup guide in the builder output.
- **Evidence:** Spoken list. He had Perplexity already connected.
- **Conditions:** Every named vendor is a secret or an account.
- **Exceptions:** None on tape.
- **Action:** Treat the guide as a never-install list for us. Do not paste keys from a YouTube.
- **Confidence:** high
- **Source:** `rXpHzWXjHrw` @ UNKNOWN — “configure our email address… Tavly API key, Perplexity, Anthropic, Gmail”
- **Epistemic:** SOURCE

## C. Mental Models

- **Words can build the graph** if you name the parts. **SOURCE**
- **Random HTTP is the failure mode** of unnamed prompts. **SOURCE**
- **One-shot approve is a test**, not a religion — he mentions request-changes and skips it. **SOURCE**
- **Thin system prompt is a disappointment he will still run.** Demo > rewrite. **SOURCE**
- **Clickable sources beat prose.** **SOURCE**
- **7 a.m. is the product; this run is manual.** **INFERENCE**
- **“Just your words” is the magnet; the setup guide is the bill.** **INFERENCE**

## D. Procedures

1. **Write the job** with schedule + sources + count (7 a.m., Tavily+Perplexity, top five).
2. **Name models and tools** in the same brief so the builder cannot invent a mystery HTTP.
3. **Read the plan.** Request changes or approve. Approving is a gate, not a skip.
4. **Read the setup guide** as a secrets/pay list. Stop. Do not buy those keys from this tape.
5. **Open the writer node.** If the system prompt is one sentence, fail or thicken it before a real send.
6. **Manual run first.** Do not trust the 7 a.m. cron from a short.
7. **Open Gmail. Click two sources.** “Looks cool” is not the stop. Do not send to a list.

**Qualify / frame:** text-to-workflow magnet. Newsletter is a prop. Auto-send at 7 a.m. is operate-never.
**Objections:** “Just your words” — he also named tools, approved a plan, and held five vendor accounts. “Real articles” — two clicked, “top five trending” unproven.
**Avoid:** n8n builder / Tavily / Perplexity / Anthropic / Gmail-send as hive OS. Cursor + Grok only.
**When to change:** if the plan inserts unnamed HTTP, reject. If sources 404, fail the writer.

## E. Examples

**Situation:** He wants a morning AI newsletter.  
**Action:** One paragraph naming Tavily, Perplexity, 7 a.m., top five; builder searches nodes; he approves the plan.  
**Reasoning:** Names prevent random HTTP.  
**Outcome:** A graph + setup guide. Tavily still sits on HTTP with key in body — specified HTTP, not random.  
**Lesson:** Name the tools. Implicit rule: “no random HTTP” is not “no HTTP.”

**Situation:** He inspects the writer.  
**Action:** Reads user message (HTML from research, headers, title) and a one-line system prompt; says he expected more; runs anyway.  
**Reasoning:** Curiosity > rewrite on a short.  
**Outcome:** A “cool” mail.  
**Lesson:** Thin prompt is a named smell. Implicit rule: approve-plan ≠ approve-prompt.

**Situation:** Mail lands.  
**Action:** He clicks sources; YouTube + TechCrunch open.  
**Reasoning:** Links are the receipt.  
**Outcome:** Two real pages (on his telling). “Top five” and 7 a.m. unproven.  
**Lesson:** Click sources. Implicit rule: a YouTube in an AI newsletter is allowed on his tape — we still do not publish.

## F. Decision Rules

- If the brief omits tool names → expect junk HTTP; rewrite the brief.
- If the plan looks fine → still open the system prompt.
- If the system prompt is one role sentence → do not send.
- If the HTML looks cool → click sources anyway.
- If the setup guide lists keys → HITL / do not install from the tape.
- If a cron is in the prompt → prove it on a clock, not on a manual run.
- Optimize: named tools, two gates (plan, prompt), two clicked sources.
- Refuse: 7 a.m. auto-send; Anthropic/Tavily install; quote “just words” as zero-config.

## G. Contrarian

- Against “AI builder, no thinking” — he pins tools on purpose.
- Against trusting the generated system prompt (he calls it short).
- Against canvas-only craft as the only way (the hook is words).
- Field assumes one-shot = done. He inspects nodes after approve.

## H. Assumptions

**His:** Tavily+Perplexity is the right research pair; merge-append is enough; a thin expert-role prompt will write; clickable = true; 7 a.m. will just work; Gmail is the destination.

**Ours:** 475 words. Source quality and “top five trending” **UNVERIFIED**. Domain-specific: his newsletter demo. Auto-send operate-never.

**Falsifiers:** Unnamed prompt would have used the same nodes (his constraint unused). Sources are SEO junk. Writer hallucinated links. Cron double-sends.

**Disagreement (keep labeled):** Hive will not operate n8n text-to-workflow or a 7 a.m. blast. The **name-the-tools**, **plan-then-prompt**, and **click-the-sources** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What does the unnamed-prompt graph look like? Claimed, not shown.
- Sibling longs `TDHFkKSTJ30` / `a5sJNwfZ528` — confirm bind.
- Why is Tavily HTTP-with-key-in-body if a Tavily node exists? Not explained.
- Did 7 a.m. ever fire? Not on this short.

## J. Connections

- **SYSTEM SYNTHESIS** → `nQtogLs_dlg` (Perplexity + send). Here he clicks sources; there he tours headings.
- **SYSTEM SYNTHESIS** → `golden-test-loop` / `info-gain-cite`: keep only opened sources.
- **SYSTEM SYNTHESIS** → `one-channel-deep`: spaced posts, HITL publish — not a 7 a.m. blast.
- **SYSTEM SYNTHESIS** → `ask-principal`: keys, send, publish.
- **SYSTEM SYNTHESIS** → doctrine 6: “looks cool” rejected.
- Do not start a newsletter ICP.

## K. Future-Use

- “Name the tools in the brief” as a Forge intake line (unassigned).
- Thin system prompt as a Watchdog fail (unassigned).
- Setup-guide-as-secrets-list for HITL (unassigned).
- YouTube-as-newsletter-source as a Librarian provenance note (unassigned).

## Steal / Operate-never

### Machine: Name tools → approve plan → inspect prompt → click sources (no 7 a.m. send)
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (recurring digest idea) → brief with schedule + count + **named** tools/models → read plan → approve or request changes → treat setup guide as a secrets never-list → open writer prompts → fail one-line system prompts for real send → manual run → open mail → click ≥2 sources → Evens publishes or we stop. No cron send.
- **Questions / signals:** “Did we name the tools?” “Is this random HTTP?” “How long is the system prompt?” “Did a source open?” “Is anyone blasting at 7 a.m.?”
- **Qualify / frame / objections:** Text-to-workflow magnet. Objection: “just your words” — names + keys + inspect. Objection: “looks cool” — 70%.
- **Procedure:** D steps 1–7. Checkable stops: (1) tools named, (2) plan gated, (3) prompt read, (4) sources clicked, (5) no auto-send.
- **Example that proves it:** 7 a.m. top-five brief → approve → thin prompt noted → Gmail with YouTube + TechCrunch links. Lesson: names and clicks are the machine; the cron is the never.
- **Why it works:** Unnamed builders hallucinate nodes. Unread prompts stay thin. Unclicked sources are decoration. Conditions: palette has the nodes; a human who opens Gmail. Exceptions: unnamed fail not shown; Tavily still HTTP; he ran on a thin prompt.
- **Conditions / exceptions:** Cursor + Grok only (n8n / Tavily / Perplexity / Anthropic stay on tape). Clients parked. No tape $.
- **Operate-never payload:** 7 a.m. auto-send; install those vendors; “just words” as zero-config; newsletter hunt.
- **Hive run (existing skills only):** `slice-build` · `golden-test-loop` · `info-gain-cite` · `one-channel-deep` (HITL) · `ask-principal` · `wiki-ingest` (provenance) · `agent-job-card`.
- **Source:** `rXpHzWXjHrw` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- 7 a.m. auto-send / Gmail blast
- Install n8n-cloud / Tavily / Perplexity / Anthropic / Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- Quote any $ as FACT; new `icp_id` / unpark Normand / newsletter hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not approve a 7 a.m. blast because TechCrunch opened.

- **Done** on a words-to-graph teach: tools named + plan gated + prompt read + sources clicked + send off. “Looks cool” is not done.
- **Delegate without being asked:** Forge rejects random HTTP and one-line system prompts; Watchdog clicks sources; Publishing does not ship; I do not buy five vendor keys.
- **Skeptical review:** “Just your words” hid a setup guide. I will not treat text-to-workflow as the hive OS.
- **One system this take:** named-brief → inspect → click. Not a morning newsletter product.
- Live hunt stays parked. I do not rotate to “AI newsletter for consultants.”
