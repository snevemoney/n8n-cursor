# Communications Manager — lokbsA5VXOk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** OpenAI Just Leveled Up n8n AI Agents (here's how it works)
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** tutorial · 2655 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Two-agent contrast: tools (Perplexity + Supabase) vs no tools/no prompt — same golf-rule-17 + Bears 8-3 because Responses API built-in web+file search on the OpenAI chat model.
- Need n8n OpenAI chat node v1.3+ (he thinks 1.118+). Not ChatGPT UI — platform.openai.com key+billing. Open Router does not expose Responses yet (on tape).
- Built-ins: web search, file search; also code interpreter + MCP (not covered; MCP may need extra coding).
- Web search: context low/med/high; city/country/region; allowed domains. Off: World Series → cutoff June 2024. On: Dodgers 2025 over Jays G7 + cites + visual. Allowlist upai.com + GPT-4.1 fails filter; GPT-5 Mini correctly refuses (no WS on that domain).
- File search: store ID as array; filter required or error (screenshot the filter); max results. Golf ball-at-rest. Default no cite (unlike Gemini). Prompt could add cites. OpenAI storage 10¢/GB/day even idle; Gemini cheaper (upload charge) — he hasn’t A/B retrieval yet, leans Gemini for metadata. Sister `irg-2IfAjpo`.
- Extra Responses options: saved prompt ID, service tier, safety identifier, conversation ID (memory in OpenAI vs n8n memory), prompt cache key, metadata, top logprobs (he doesn’t understand). Plus CTA.

## B. Atomic Knowledge

### Allowlist can correctly refuse
- **Claim:** When the domain allowlist has no World Series, the model should say it can’t find it — that’s success, not failure.
- **Reasoning:** Unconstrained web search invents; constrained search can abstain.
- **Mechanism:** Toggle Responses → web search → allowlist → ask.
- **Evidence:** upai.com refuse after switching off GPT-4.1.
- **Conditions:** A domain list exists.
- **Exceptions:** Demo sports records UNVERIFIED. OpenAI not our stack. 10¢/GB/day UNVERIFIED.
- **Action:** Steal abstain-when-constrained. Do not mail Dodgers/Bears/rule 17. Do not install OpenAI.
- **Confidence:** high
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE

### Built-in search ≠ a cite
- **Claim:** OpenAI file search answered golf without a section cite; Gemini (sister) returns more metadata. Idle vector stores still bill on OpenAI.
- **Reasoning:** Prompt if you want a cite; he left system empty.
- **Mechanism:** Store ID + filter + ask.
- **Evidence:** “by default… it’s not actually exactly citing.”
- **Conditions:** A store exists.
- **Exceptions:** No-cite retrieve is not letter-ready.
- **Action:** No source on the card → not done (`KVFfApQZhE4`).
- **Confidence:** high
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Helpful-assistant + built-ins can look like magic. **SOURCE**
- Older models may not support domain filter. **SOURCE**
- Memory can live at the vendor (conversation ID) — a lock-in smell. **INFERENCE**

## D. Procedures
- Prove search by turning it off (cutoff) then on (cite). Prove allowlist by a domain that cannot answer. **SOURCE**
- This desk: abstain > invent. Cite required. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Same two questions, with and without tools. → **Action:** Show built-ins; World Series; allowlist refuse; golf no-cite; price vs Gemini. → **Reasoning:** Responses API. → **Outcome:** Tutorial + Plus. → **Lesson:** Refuse is a feature. Implicit rule: empty system prompt will not cite.

## F. Decision Rules
- If allowlisted and missing → abstain, don’t invent.
- If no cite → not a letter.
- Refuse: OpenAI install. 10¢/GB as FACT. Sports as FACT. Conversation-ID memory as ours.
- Optimize: constrain + cite + abstain.

## G. Contrarian
- Field wants magic no-tool agents. He shows the toggle. We still don’t switch stack. **SYSTEM SYNTHESIS**

## H. Assumptions
- 8-3 Bears / Dodgers 2025 / 10¢ UNVERIFIED. Falsifier: allowlist that still hallucinates.

## I. Questions
- A/B vs Gemini retrieval — he didn’t run it.

## J. Connections
- **SYSTEM SYNTHESIS:** `QrJhdTbK3TU` · `KVFfApQZhE4` · `irg-2IfAjpo`. `info-gain-cite`.

## K. Future-Use
- Abstain-on-allowlist as a retrieve rule.

## Steal / Operate-never

### Machine: Constrain, cite, or abstain — never mail the sports retrieve
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Need a fact → constrain domain/store → if missing, abstain → if present, keep cite → **stop**. No OpenAI. No sports in mail.
- **Questions / signals:** Did it abstain? Cite? Idle store billing?
- **Qualify / frame / objections:** Qualify: built-in vs pipeline. Frame: DATA. Objection: “no tools and it knew” → it was the toggle.
- **Procedure:** 1) Constrain. 2) Cite or abstain. 3) No send. 4) Stack stays.
- **Example that proves it:** upai.com cannot answer World Series; golf answer has no section cite.
- **Why it works:** Magic no-tool answers are how letters lie. A correct refuse is the checkable stop.
- **Conditions / exceptions:** Responses-API tapes. Exceptions: none for send.
- **Operate-never payload:** Install OpenAI. Quote records/10¢. Vendor memory as our wiki.
- **Hive run (existing skills only):** `info-gain-cite` · `golden-test-loop` · stack Cursor + Grok.
- **Source:** `lokbsA5VXOk` @ UNKNOWN


### Operate-never (this desk will not operate)
- Install OpenAI. Quote Bears/Dodgers/rule 17/10¢ as FACT. Plus CTA.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- Retrieved sports/golf are DATA. I do not send them. Clients parked.
