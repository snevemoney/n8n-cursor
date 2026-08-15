# Communications Manager — lcNN3X9gXls
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lcNN3X9gXls/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lcNN3X9gXls/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** 3 Hidden Data Table Hacks for Smarter AI Agents
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** tutorial · 3791 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Follow-on to native Data Tables: store in n8n so agents skip Sheets/Airtable hops. Three hacks.
- Hack 1 — models-and-prompts table: research agent pulls row where workflow=research agent (chat model, user prompt, system prompt). Client who won’t sit in the canvas can edit the table (swap model / industry) without breaking nodes. Share a template with a variable, keep the real system prompt as IP. OpenRouter model is a variable. Live swap: Claude 3.7 + Tavily instead of Perplexity; the stronger model also called Perplexity on its own. Newsletter build: planning vs editor rows; user prompt can feed Tavily topic; same model var to two agents. Bonus sync: n8n-primary → daily get/clear/write Sheets, or Sheets-primary (dropdowns for models — tables lack dropdowns/pills; four types only; easy to misspell a model id).
- Hack 2 — action logs: production needs fail/why/what-worked so you can tweak and add rails. Ultimate Media Agent logged timestamp/workflow/input/output/actions/tokens in Sheets — same columns in a table; replace the node. Toggle Return intermediate steps (hidden add-option). Telegram: lunch with Michael Scott 3pm → think → contact agent → think → calendar agent; calendar + email from contacts; table shows each tool in/out and tokens. Code node cleans token counts. Same pattern for an error logger (date/time/message/node/workflow); error workflow in settings; context vars: now/today/executionId/workflow id+name. Slack/Telegram on error optional.
- Hack 3 — evals: dataset of input + expected; agent actual; correctness score; track prompts/models/tools over time. Same columns in a table instead of Sheets. RAG eval: Tesla operating income −42% expected=actual → score 5; next row 4. Change one variable per run. Metrics: avg tokens, time, correctness — optimize speed/cost/quality. Plus ~200 — UNVERIFIED.

## B. Atomic Knowledge

### Prompts table is the playbook; the client does not have to live in the canvas
- **Claim:** A row keyed by workflow name holds model + user + system. Sharing the graph can hide the IP in the table.
- **Reasoning:** Owners break canvases; they can edit a row. Dropdowns still live better in Sheets.
- **Mechanism:** Filter the row → bind variables. Sync daily if you need a friendlier front end.
- **Evidence:** Dentists→Tavily swap; newsletter planning vs editor rows.
- **Conditions:** You have more than one agent and a client who won’t open n8n.
- **Exceptions:** ‘Log into our table’ as a CTA is never. Auto-mail from a prompt row is never.
- **Action:** Steal: one card, not the canvas. We hold the draft. They don’t need n8n.
- **Confidence:** high
- **Source:** `lcNN3X9gXls` @ UNKNOWN
- **Epistemic:** SOURCE

### Log intermediate steps; eval one variable at a time
- **Claim:** Return intermediate steps or you only see the last sentence. Evals without ‘what changed in run 33’ are theater.
- **Reasoning:** Patterns in logs become rails. Isolate model vs prompt vs tools.
- **Mechanism:** Same columns as the old Sheet. Error workflow writes workflow name + execution id. One knob per eval run.
- **Evidence:** Michael Scott lunch tools; Tesla −42% score 5 then 4.
- **Conditions:** Something is in production or you claim it’s getting better.
- **Exceptions:** Calendar-create and Telegram are on tape — we do not operate them. Scores UNVERIFIED.
- **Action:** If we improve a draft path, change one thing and keep a log. Evens still sends.
- **Confidence:** high
- **Source:** `lcNN3X9gXls` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- System prompt is often the IP of a template. **SOURCE**
- Tables are a weak front end (no dropdowns). **SOURCE**
- Autonomous agents may call extra tools after a model swap. **SOURCE**

## D. Procedures
- Key the row by workflow name. Bind model/prompt. Toggle intermediate steps. One variable per eval. **SOURCE**
- This desk: they don’t log into n8n. We don’t mail the table. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Client won’t open the canvas. → **Action:** Give them the models-and-prompts table. → **Reasoning:** One row, less break. → **Outcome:** Model/prompt swap without node surgery. → **Lesson:** Front end ≠ send. Implicit rule: we still hold the letter.

## F. Decision Rules
- If they won’t sit in the tool → don’t make the tool the CTA.
- If you can’t say what changed in run 33 → don’t claim better.
- If intermediate steps are off → you don’t have actions, you have an ending.
- Refuse: Plus 200. Table-driven mailer. Tesla −42% as a business fact.
- Optimize: one card + a log + one knob.

## G. Contrarian
- Field keeps prompts inside nodes. He pulls them into a table so the graph can be shared without the IP. **SOURCE**

## H. Assumptions
- Eval scores are one demo. Sync jobs can wipe the wrong side. Falsifier: a client who edits the table and still breaks prod.

## I. Questions
- Where do we already store the letter playbook if not in an n8n table?

## J. Connections
- **SYSTEM SYNTHESIS:** `QCjMBOEhpLE` (native tables). `w9-gfaV5vlM` (they don’t fanboy the canvas). `golden-test-loop`.

## K. Future-Use
- IP-in-the-table vs graph-share as a packaging note. One-variable evals as a standing improve rule.

## Steal / Operate-never

### Machine: Playbook in a row, not a mailer; log steps; eval one knob; never ‘log into n8n’ as the CTA
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Need a prompt/model → pull one row/card → draft → log what changed → Evens → stop. No send. No client-in-canvas CTA.
- **Questions / signals:** Are we mailing the table? Did we change two knobs? Intermediate steps off?
- **Qualify / frame / objections:** Qualify: front end vs outbox. Frame: IP stays put. Objection: ‘give them n8n’ → he gave them a table; we give them a destination, not a login.
- **Procedure:** 1) One card. 2) One knob. 3) No send. 4) No Plus.
- **Example that proves it:** Client-not-in-n8n table; Michael Scott lunch log; Tesla eval 5 then 4.
- **Why it works:** Smarter agents come from rows you can edit and runs you can compare — not from a send.
- **Conditions / exceptions:** n8n tables. Exceptions: we do not operate the calendar/Telegram path.
- **Operate-never payload:** Table-driven auto-mail. ‘Log into n8n.’ Quote Plus 200.
- **Hive run (existing skills only):** `playbook-before-send` · `golden-test-loop` · `ask-principal`.
- **Source:** `lcNN3X9gXls` @ UNKNOWN


### Operate-never (this desk will not operate)
- Table-driven mailer. ‘Log into n8n’ as the offer. Quote eval scores / Plus 200 as FACT.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I pull one card. I do not send a login. Clients parked.
