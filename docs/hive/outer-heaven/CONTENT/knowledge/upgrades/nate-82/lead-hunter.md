# Lead Hunter — Nate 82 upgrades (UNTESTED)

**Cluster:** GTM  
**Desk:** `lead-hunter`  
**Source IDs:** `SHORTLIST-year-agents.md` (82 only). No Fazio. No outside-82 Nate.  
**Honesty:** Synthesized from existing `takes/{id}/lead-hunter.md` (all 82 present) + packet LEARNED when a take already pointed there. Caption-only. Timestamps UNKNOWN. Clicks/APIs/prompts = `transcript-implied` or `unobserved`.  
**Status:** UNTESTED. Parts, not a Nate clone. Do not auto-install `SKILL.md`. Do not merge `LESSONS-FROM-TAPE.md`.  
**Clients:** parked. No new `icp_id`. No `HUNT_LOG`. No Path A this write.  
**Tape $:** UNVERIFIED. Not a price analog.  
**Stack:** Cursor + Grok. On-tape vendors stay on-tape.

## Operate-never (this desk)

- Send / pay / deploy / book / publish stay Evens.
- Auto-dial, sleep-call, Vapi, mass-DM, dentist-50 scrape, OTP/IG farms.
- MUST-score a raw 50. Unpark Normand. Quote tape $ / student counts as FACT.
- Install Codex / Claude / n8n-cloud / Vapi / Hermes / instance MCP.
- Hunt “first-dollar AI agency” or his niche menu (agencies / RE / ecom / coaches / dental / HVAC).

## Upgrades (UNTESTED)

### UPG-lh-01 Draft-DB, not a campaign

**What changed:** The sold “outreach agent” stops at a filled database of research-backed drafts. The human owns the sequence.  
**HITL:** Evens (or the named human) sends. Nothing auto-DMs.

**Capability**
```
CAPABILITY: Research-and-draft queue
GOAL: inbound list → ready drafts in a store (no send)
OBSERVED WORKFLOW (speech): list in → research person + company → write outreach + follow-up → write DB → human plugs into their sequence
```

**Implementation (caption-only)**  
- Tools: list + research + draft writer + a table/DB. Settings `unobserved`.  
- Trigger: “drop in a contact list” (`transcript-implied`).  
- State: row = contact + research + two messages.  
- Guardrails: “didn’t actually send the messages or run the campaigns” (`ECfusvK5tEU`, `HNKlFTd1maM`).  
- Hive already: `send-removed` · `list-anneal-funnel` · `ask-principal`.

**Primitive:** observe row → retrieve context → draft → write state → **wait**.  
**Business leverage:** Personalized outreach hours without owning send risk. $1,650 / $23k UNVERIFIED.  
**Evidence:** `ECfusvK5tEU` · `HNKlFTd1maM`  
**Dissent:** VIEW A — later voice tapes celebrate auto-call (`BO-jFbN4p8Y`). VIEW B — first paid shape is draft-not-send. Do not merge.  
**Reproduce:** Dry-run drafts on a parked list Evens names. Missing: his research prompt (`unobserved`).  
**Status:** UNTESTED

### UPG-lh-02 Thicken the row — no sleep-dial

**What changed:** A form is thin. Qualify adds why-now / how-soon / budget / intent. The hive keeps the questions and refuses the overnight caller.  
**HITL:** Human callback. Book stays Evens. Dial never.

**Capability**
```
CAPABILITY: Form-row thicken
GOAL: name/phone/email/company → logged extras a human can use
OBSERVED WORKFLOW (speech): form → (he) immediate voice call → poll transcript → log motivation, urgency, budget, intent → human outreach later
```

**Implementation (caption-only)**  
- Tools named on tape: form + phone normalize + Vapi + transcript poll. **Vapi stay on-tape.**  
- Trigger: form submit (`transcript-implied`).  
- State: thin form fields + extra qualify columns.  
- Guardrails: hive take = steal the Qs; “call every new lead while you sleep” is the desk never.

**Primitive:** incoming event → collect thin → **human** thicken → update state → wait.  
**Business leverage:** Stops annealing a 50 that is only a name and a phone.  
**Evidence:** `BO-jFbN4p8Y` · `-Lo_SlSgtnA`  
**Dissent:** VIEW A — he auto-calls to get the extras. VIEW B — hive: human callback asks prompted-now + how-soon. Same questions, opposite actuator.  
**Status:** UNTESTED

### UPG-lh-03 Three questions before “we need an agent”

**What changed:** Inbound that says “agent” is a qualify card, not a hunt. Cheapest layer that hits the named done. Agent last.  
**HITL:** No 50 from this card. No dentist scrape (`3GAxd90fEE4` / `AO5aW01DKHo` worked examples stay never).

**Capability**
```
CAPABILITY: Layer-chooser on inbound
GOAL: “we need an agent” → L1 GPT / L2 no-AI / L3 fixed-AI-path / L4 agent
OBSERVED WORKFLOW (speech): in the loop every time? → 100% logic? → order fixed? → else agent
```

**Implementation (caption-only)**  
- Tools: none required. Decision tree is speech.  
- Trigger: inbound language “agent” / “AI.”  
- State: named problem + chosen layer.  
- Guardrails: ~50% of first automations need no AI — UNVERIFIED as a rate; steal the question, not the %.

**Primitive:** classify request → pick cheapest layer → act only if Evens opens a hunt.  
**Business leverage:** Drops agent-SKU rows from a 50 before MUST.  
**Evidence:** `4OOS96i2gfI`  
**Dissent:** VIEW A — many year tapes sell the agent as the SKU. VIEW B — this tape: problem-solver, agent last. Keep both.  
**Status:** UNTESTED

### UPG-lh-04 Cite-or-don’t-trust on prospect research

**What changed:** A number about a company is not usable until it cites quote + page (or the sheet filter a human would use). Question type picks the retrieval.  
**HITL:** Do not mail chunk-math. Do not hunt RAG-template buyers.

**Capability**
```
CAPABILITY: Gold-question research
GOAL: claim about a prospect → cited span or abstain
OBSERVED WORKFLOW (speech): name the question → pick filter/SQL/whole/vector → answer must show document/page/quote
```

**Implementation (caption-only)**  
- Tools: file/web retrieve. Vendor (Pinecone / Gemini File Search / OpenAI store) stay on-tape.  
- Trigger: a research ask on a row.  
- State: question type + method + citation or “can’t find.”  
- Guardrails: upload ≠ indexed (`KVFfApQZhE4`). Domain allow-list; idle store bills (`lokbsA5VXOk`). Vectors scramble order (`ZwQ8rJhVCr4`). Highest-week from chunks can be locally true and globally false (`kOKavHnlPik`).

**Primitive:** observe question → classify type → retrieve matching shape → verify cite → act or abstain.  
**Business leverage:** Stops hallucinated personalization (the thing that makes a draft unsendable).  
**Evidence:** `kOKavHnlPik` · `ZwQ8rJhVCr4` · `QojPKL96Dx4` · `KVFfApQZhE4` · `Fu6vOfzFmcw`  
**Dissent:** VIEW A — drop-file “5 minutes” magnets. VIEW B — no highlights = fake Nike quote (`QojPKL96Dx4`).  
**Status:** UNTESTED

### UPG-lh-05 Similar-build inbound, not spray

**What changed:** First paid work arrived because a public build looked like the buyer’s problem and an email sat in the description — not because he advertised paid work.  
**HITL:** Do not blast. Do not open a 50 of “people who watched Nate.” Path C only if Evens names it.

**Capability**
```
CAPABILITY: Artifact-inbound
GOAL: public similar-build → they write you → scope calls → yes/no
OBSERVED WORKFLOW (speech): post the build for fun → email in description → inbound → couple of calls → scope → yes
```

**Implementation (caption-only)**  
- Tools: public post + reachable email. Clicks `unobserved`.  
- Trigger: stranger recognizes their analog.  
- State: inbound thread + scoped job.  
- Guardrails: no freelancer banner on the origin tapes. Later space is crowded (do not treat 2024 inbound as 2026 law).

**Primitive:** publish proof (HITL) → wait → classify inbound → draft reply → Evens sends.  
**Business leverage:** Hunt skipped; inbound is a parked Path C shape.  
**Evidence:** `5IM27lbCwjM` · `8C6iCpJ9HPo` · `HNKlFTd1maM`  
**Dissent:** VIEW A — `tDGiWn0flK8` close is “make your first dollar building AI automations” (hunt bait). VIEW B — origin is inbound-on-similar, not a first-dollar 50.  
**Status:** UNTESTED

### UPG-lh-06 Lookup the row before any draft

**What changed:** Before writing to a known sender, fetch the keyed row. Do not dump the table into context. Calculator for math, not the LLM.  
**HITL:** Draft only. Send never. Do not buy n8n tables.

**Capability**
```
CAPABILITY: Keyed-context draft
GOAL: inbound from known contact → slice of their row → draft
OBSERVED WORKFLOW (speech): Gmail in → get-rows where email equals sender → agent sees the slice → draft
```

**Implementation (caption-only)**  
- Tools: table get-rows + calculator. Native n8n tables on-tape (lock-in).  
- Trigger: mail from a known address.  
- State: keyed row; date filters only if the prompt states the string format (`transcript-implied`).  
- Guardrails: hundreds of rows in context = cost + hallucination. Invite/dentist demos stay never (`lcNN3X9gXls`).

**Primitive:** incoming event → lookup → draft → wait.  
**Business leverage:** Personalization that is retrieved, not invented.  
**Evidence:** `QCjMBOEhpLE` · `NWbh5ZoEHkA` (calc for numbers)  
**Status:** UNTESTED

### UPG-lh-07 Outcome + ask-back — never the dentist 50

**What changed:** Agentic brief = name the steak, let the runner ask what it needs. His worked example (Chicago dentist scrape + outreach sheet) is operate-never.  
**HITL:** No scrape. No send. No new list from this tape.

**Capability**
```
CAPABILITY: Outcome-then-clarify
GOAL: fuzzy ask → one clarifying Q → named done
OBSERVED WORKFLOW (speech): speak the problem → agent asks back → (he) scrape dentists / write outreach / dump sheet
```

**Implementation (caption-only)**  
- Tools: NL brief. Scrape/outreach nodes stay on-tape and off.  
- Trigger: “build me an agentic workflow.”  
- State: outcome sentence + answered Qs.  
- Guardrails: steal ask-back; refuse the 50.

**Primitive:** observe ask → ask-back → (stop unless Evens names a hunt).  
**Business leverage:** Better briefs. Not a new ICP.  
**Evidence:** `tDGiWn0flK8` · `3GAxd90fEE4` · `AO5aW01DKHo`  
**Dissent:** VIEW A — tape uses dentist outreach as the teach. VIEW B — hive anneals Path B lists we already own; we do not open his.  
**Status:** UNTESTED

## SYSTEM_UPGRADE_CANDIDATE (not a Lead Hunter skill)

Do not assign these as hunt machines. See `CLUSTER-gtm.md`.

| id | type | discovery | evidence |
|----|------|-----------|----------|
| `SU-nate82-observe-pane` | Agent infrastructure | Yellow = needs-input; operator sees idle vs working vs approve | `ZAaxx3qyT8g` · `xsAOpqjebOo` · `62Rfe1w9NBc` |
| `SU-nate82-sanitize-failstop` | Agent infrastructure | Non-AI sanitize in; fail stops or pages; test the “password” row | `oWdJMJp2HgM` · `NQhsLVmuItA` |
| `SU-nate82-instance-mcp-never` | Never (loaded gun) | Instance MCP can search + execute any workflow including send | `mPflFTQUCGk` · `9IzGe0BBj_c` · `5p5cV0yVDvQ` |

## Reproduce / generalize / improve (desk)

1. **Reproduce:** Draft-DB + thicken-Qs + cite-or-abstain on a list Evens names. Dry-run only.  
2. **Generalize:** Same wait-before-send primitive already powers `warm-draft-hitl`. Do not wire a second mailer.  
3. **Improve:** Do not “improve” by auto-send or sleep-dial. Hive spine stays `send-removed` · `ask-principal`.
