# Researcher — rXpHzWXjHrw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/rXpHzWXjHrw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Text-to-workflow short. Beats: (1) “Build n8n agents with just your words.” (2) Prompt: morning 7am newsletter; Tavily + Perplexity; top five trending AI/tech stories; he specifies chat model + tools so it does not invent a random HTTP. (3) Builder searches nodes; different structure; you can request changes; he one-shots and **approves the plan**. (4) Setup guide: email, Tavily key, Perplexity, Anthropic, Gmail. (5) Tavily via HTTP body with API key; Perplexity connected; merge append; newsletter writer. (6) User msg: HTML newsletter from research; start with headers; title. (7) System prompt “pretty short” — he expected more: “expert newsletter writer specializing in AI and tech news.” (8) Run; Gmail; looks cool; sources clickable (YouTube + TechCrunch). (9) Play-button. Timestamp UNKNOWN. Long: `TDHFkKSTJ30`. Keys/vendors on-tape.

## B. Atomic Knowledge

### Name the tools or it will invent HTTP
- **Claim:** If you do not name the chat model and tools, the text-to-workflow builder may assemble a random HTTP request.
- **Reasoning:** He wanted Tavily + Perplexity specifically.
- **Mechanism:** Prompt includes tools → node search → plan → approve.
- **Evidence:** “so it didn't just try to throw together a random HTTP request.”
- **Conditions:** Builder can see the node catalog.
- **Exceptions:** Even with names, Tavily still landed as HTTP + key in body (he shows it).
- **Action:** Name tools; then inspect how keys are passed.
- **Confidence:** high as his fear and his result.
- **Source:** `rXpHzWXjHrw` @ UNKNOWN
- **Epistemic:** SOURCE

### Approve plan, then inspect the short prompt
- **Claim:** One-shot approve works enough to send a sourced HTML mail; he still flags the system prompt as thinner than expected.
- **Reasoning:** Setup guide + merge + writer; sources are real links.
- **Mechanism:** Approve → configure keys → run → open Gmail → click sources.
- **Evidence:** YouTube + TechCrunch links; “I would have expected this to be a little more detailed.”
- **Conditions:** Keys configured; he is willing to send to himself.
- **Exceptions:** Thin prompt may fail on a harder issue (not shown).
- **Action:** After approve: read system prompt + how secrets travel (HTTP body).
- **Confidence:** high for this run.
- **Source:** `rXpHzWXjHrw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Words-to-graph is a plan you approve, not magic. Secrets in HTTP bodies are visible in the tour (danger). Sources you can click are the quality bar. Short system prompts surprise him.

## D. Procedures
1. Prompt: cadence + named research tools + named model + “don’t invent HTTP.”
2. Review plan; approve or request changes.
3. Walk setup guide; put keys in credentials, not chat.
4. Inspect HTTP bodies for leaked keys.
5. Read the generated system prompt; thicken if thin.
6. Run; verify clickable real sources. Hive: do not send.

## E. Examples
- **Situation:** 7am AI/tech newsletter. **Action:** Name Tavily+Perplexity; approve; run. **Reasoning:** Avoid random HTTP. **Outcome:** HTML mail with YouTube + TechCrunch. **Lesson:** Plan-approve + source check. Implicit rule: “named tools” still produced Tavily-as-HTTP-with-key-in-body — inspect anyway.

## F. Decision Rules
- If text-to-workflow → name tools, then inspect bodies and prompts.
- If sources are not clickable/real → fail.
- Refuse: keys in chat or in committed HTTP; auto-send; quote “top five” as FACT.

## G. Contrarian
The “just words” title vs a setup guide of five credentials and a thin prompt he dislikes.

## H. Assumptions
7am cron would work (not proven). “2025 news” in other tapes — dates unverified. Key-in-body is acceptable to him for the demo (hive: never).
**Desk dissent:** Researcher marks key-in-HTTP-body as operate-never even though he demoed it.

## I. Questions
- Did he later thicken the prompt on the long tape?
- Is Tavily only available via HTTP in that builder?

## J. Connections
- **SYSTEM SYNTHESIS:** `TDHFkKSTJ30` long builder. `0Ujdys4LqNs` / `pxzo2lXhWJE` newsletter. `a5sJNwfZ528` AI builder 10x. `send-removed`.

## K. Future-Use
“Name the tools, then inspect the secret path” as an unassigned codegen review.

## Steal / Operate-never

### Machine: name-tools-approve-inspect-secrets-and-sources
- **Epistemic:** SOURCE + INFERENCE (secret path)
- **Workflow / loop:** specify model+tools → approve plan → inspect HTTP/key path + system prompt → run → click sources → HITL send
- **Questions / signals:** Random HTTP? Key in body? Prompt too thin? Sources real?
- **Qualify / frame / objections:** “Just words” → still a credential list.
- **Procedure:** D.
- **Example that proves it:** 7am newsletter; Tavily HTTP+key; short writer prompt; TechCrunch+YouTube sources.
- **Why it works:** Constrains the builder, then verifies the two failure modes (secrets, fake sources).
- **Conditions / exceptions:** One-shot demo. Vendors on-tape.
- **Operate-never payload:** Auto-send; key in HTTP/chat; n8n builder as hive SKU; new ICP.
- **Hive run:** `info-gain-cite` · `send-removed` · `ask-principal` · `golden-test-loop`
- **Source:** `rXpHzWXjHrw` @ UNKNOWN

**Operate-never**
- Commit keys. Auto-send. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Keep the dissent on key-in-body. Steal inspect-sources. No newsletter product.
