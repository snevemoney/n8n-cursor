# Publishing Engine — Nate 82 upgrades (UNTESTED)

**Cluster:** GTM  
**Desk:** `publishing-engine`  
**Source IDs:** `SHORTLIST-year-agents.md` (82 only).  
**Honesty:** Existing `takes/{id}/publishing-engine.md` (all 82) + packet LEARNED as needed. Caption-only. Timestamps UNKNOWN.  
**Status:** UNTESTED. Parts, not a newsletter/UGC/media-army clone. Do not auto-install `SKILL.md`. No LESSONS merge.  
**Clients:** parked. No new `icp_id`.  
**Tape $:** UNVERIFIED.  
**Stack:** Cursor + Grok. One channel deep. Proof-first packaging for HITL preview.

## Operate-never (this desk)

- Publish / schedule live / paid boost stay Evens.
- Auto-send newsletter. Auto-post X / TikTok / Instagram. Cameo someone else’s face.
- Sora / NanoBanana / Poppy / Base44 / Kie mills. Republish Nate. Clone-voice.
- Quote RPM / tape $ / 6× cheaper as our price. Mass-DM / account farms.
- 24/7 content swarm. Codex saved-login publisher.

## Upgrades (UNTESTED)

### UPG-pe-01 Approve-before-newsletter

**What changed:** Linear research → sections → editor HTML → **send off to you for human approval**. Multi-agent is the costume. The gate is the steal.  
**HITL:** Evens approves. Evens sends. Weekly trigger is a cadence-send only if activated — we do not activate.

**Capability**
```
CAPABILITY: Draft letter to a human
GOAL: niche query → three researched bits → styled HTML → Evens
OBSERVED WORKFLOW (speech): research topics → deeper research → write sections → editor HTML → human approval before send
```

**Implementation (caption-only)**  
- Tools: three AI nodes, linear. Tavily / Open Router / n8n on-tape.  
- Trigger: schedule (speech).  
- State: pinned research so a later break does not re-pay the model (`0Ujdys4LqNs`).  
- Guardrails: “send it out to your email list” is publish. Do not ship his graph. Do not stand up a mill.

**Primitive:** observe cadence → retrieve → write → edit → **wait**.  
**Business leverage:** If Evens wants a weekly proof letter, the sentence names the niche + a clicked archive, not “multi-agent.”  
**Evidence:** `pxzo2lXhWJE` · `0Ujdys4LqNs`  
**Dissent:** VIEW A — field would send. VIEW B — he stops for approval, then names the list. Keep the gate; refuse the list-send.  
**Status:** UNTESTED

### UPG-pe-02 Three previews → human pick → then (maybe) one piece

**What changed:** Media “army” produces three stills. He picks preview one. “Team will figure it out” is not a checkable stop. Log errors; confirm before final render. Connecting X/TT/IG is publish.  
**HITL:** Evens picks. Evens publishes. Public-share Drive before post is never.

**Capability**
```
CAPABILITY: N-proofs then a human
GOAL: named job → three stills → one pick → one video (extras untrusted)
OBSERVED WORKFLOW (speech): name the file → N stills → human pick → ask for the piece; a second text-only extra is unsolicited
```

**Implementation (caption-only)**  
- Tools: Telegram + Drive namer + creative editor (on-tape).  
- Trigger: a named creative job.  
- State: file name (human) + three URLs + pick index.  
- Guardrails: unsolicited second attempt = don’t ship the extra (`IlNwjnIzrOo`).

**Primitive:** generate N → human classify/pick → one act → wait.  
**Business leverage:** `clip-factory` support already; this is the pick-gate, not an army SKU.  
**Evidence:** `IlNwjnIzrOo` · `jBanaNBY-sM`  
**Dissent:** VIEW A — army can post. VIEW B — he also asks before final. Hive operates VIEW B only.  
**Status:** UNTESTED

### UPG-pe-03 Still-lock (end frame matches the source)

**What changed:** UGC proof is not “Sora can do anything.” Proof is font / words / logo in the last frame matching the source still.  
**HITL:** Publish never. No Sora/Kie mill. No cameo.

**Capability**
```
CAPABILITY: Still-lock QA
GOAL: product still → clip → pass only if end frame matches
OBSERVED WORKFLOW (speech): still-in → UGC-out; done when product-near-camera matches the still
```

**Implementation (caption-only)**  
- Tools: image-to-video on-tape. Settings `unobserved`.  
- Trigger: a product still Evens names.  
- State: source still + last frame + pass/fail.  
- Guardrails: generated UGC is a clip, never a testimonial (`uC5tDwGhyVA` comms take).

**Primitive:** observe still → generate → compare expected → retry or escalate.  
**Business leverage:** Same verify-after-act as browser QA (`CB5bG4mvnS0`) — creative seat.  
**Evidence:** `uC5tDwGhyVA` · `Vm8QOo9MiC4` · `UT_Ek_tmeVA` (unreadably wrong pack text = fail; fix source before re-roll)  
**Status:** UNTESTED

### UPG-pe-04 Relabel: scheduled idea queue, not an “agent”

**What changed:** The $1,200 “agent” (UNVERIFIED) was a thrice-morning idea generator in the client’s voice for LinkedIn nurture. He later admits it was a workflow. Human publishes.  
**HITL:** Evens publishes. No LinkedIn avatar farm.

**Capability**
```
CAPABILITY: Cadence idea queue
GOAL: brand/tone → N morning ideas → human picks and posts
OBSERVED WORKFLOW (speech): schedule ×3 → on-brand ideas → (he) human publishes
```

**Implementation (caption-only)**  
- Tools: scheduler + writer.  
- Trigger: morning cadence.  
- State: idea rows.  
- Guardrails: drop list-rows that only say “agent” (`tNOk29fs_aY` lead-hunter future-use). Overkill-test first (`HbsbqMQE-lI`): if paste-and-get works, do not cron.

**Primitive:** cadence trigger → draft N → wait.  
**Business leverage:** Path C sentence names cadence + avatar outcome, not “agent.”  
**Evidence:** `tNOk29fs_aY` · `HbsbqMQE-lI`  
**Dissent:** VIEW A — title says agent + 2 hours + $1,200. VIEW B — speech: workflow, funny-simple, rebuild 30 min. Keep both; operate the workflow shape.  
**Status:** UNTESTED

### UPG-pe-05 Fixed-lane research + pin-while-building

**What changed:** Newsletter research uses a query that stays the same every run. Planner is prompted as a specialist. Pin the output so a downstream break does not re-run the model.  
**HITL:** Pin ≠ publish. Do not mail the three URLs.

**Capability**
```
CAPABILITY: Stable-query then pin
GOAL: same niche string → three summarized URLs → title + topics → pinned artifact
```

**Implementation (caption-only)**  
- Tools: research node + planner + pin. Vendor `unobserved`.  
- Trigger: weekly (speech).  
- State: pinned intermediate.  
- Guardrails: “AI adoption for small businesses” is *his* search string — not a list we mail.

**Primitive:** observe cadence → retrieve with a fixed query → write → pin → wait.  
**Business leverage:** Cheaper iteration. Also infrastructural — see `SU-nate82-pin-while-building`.  
**Evidence:** `0Ujdys4LqNs` · `pxzo2lXhWJE`  
**Status:** UNTESTED

### UPG-pe-06 Pain-then-outcome pack (not “multi-agent newsletter”)

**What changed:** The public pack names the destination (hours back, one clicked archive, one walkthrough), not the vehicle. Camera-on if it is a demo.  
**HITL:** Evens publishes. Play-button “full breakdown” is his magnet — ours is book/waitlist, not a YouTube dunk.

**Capability**
```
CAPABILITY: Outcome-labeled proof pack
GOAL: stolen machine → one showable card → optional HITL post
OBSERVED WORKFLOW (speech): spotlight pain; frame time/money/focus; taxi = destination not Prius
```

**Implementation (caption-only)**  
- Tools: existing `one-channel-deep` · `outcome-offer-funnel`.  
- Trigger: Evens names a pack.  
- State: sentence + artifact + CTA (waitlist/book).  
- Guardrails: similar-build inbound is a parked Path C surface (`5IM27lbCwjM`). Do not spray.

**Primitive:** name pain → attach one proof → HITL publish → wait.  
**Business leverage:** Flashy multi-agent videos win views; practical wins money (`w9-gfaV5vlM`). Do not use view-count as offer-quality.  
**Evidence:** `wk8KV280fbg` · `w9-gfaV5vlM` · `5IM27lbCwjM` · `8C6iCpJ9HPo`  
**Dissent:** VIEW A — he still posts flashy agent titles because they perform. VIEW B — he tells operators to sell solutions. Content ≠ offer. Keep both.  
**Status:** UNTESTED

### UPG-pe-07 Inspect the words on the pack before it is proof

**What changed:** A pretty composite with an unreadable ingredients line is not done. Blame source + thin prompt, then fix the source before re-roll. Human-name the file before combine.  
**HITL:** Publish never. No Telegram-ad send. No public-URL a face (`7UNsK9LoORo`).

**Capability**
```
CAPABILITY: Readable-pack stop
GOAL: creative pass only if a stranger can read the words
OBSERVED WORKFLOW (speech): locate source file → edit → judge likeness AND words; ask-name instead of today’s date
```

**Implementation (caption-only)**  
- Tools: image edit + Drive name. NanoBanana on-tape.  
- Trigger: a combine/edit job.  
- State: human file names + pass/fail on text.  
- Guardrails: command-edit then folder judge.

**Primitive:** name asset → act → observe text → fail → patch source → retry → wait.  
**Business leverage:** Walkthrough a stranger can read, not a “Photoshop AI” SKU.  
**Evidence:** `UT_Ek_tmeVA` · `TWvjqpk3uSQ` · `7UNsK9LoORo`  
**Status:** UNTESTED

## SYSTEM_UPGRADE_CANDIDATE (not a Publishing skill)

| id | type | discovery | evidence |
|----|------|-----------|----------|
| `SU-nate82-pin-while-building` | Agent infrastructure | Pin expensive upstream so a later break does not re-run | `0Ujdys4LqNs` |
| `SU-nate82-verify-after-act` | Agent infrastructure | Compare expected (still / screenshot / cite) after the act | `uC5tDwGhyVA` · `CB5bG4mvnS0` |
| `SU-nate82-observe-pane` | Agent infrastructure | One board: working / yellow-needs-input / done | `ZAaxx3qyT8g` · `xsAOpqjebOo` |

## Reproduce / generalize / improve (desk)

1. **Reproduce:** Approve-before-send pack + three-preview pick + still-lock check. Draft only.  
2. **Generalize:** Same N-proofs → human pick can later feed clip-factory. Do not wire X/TT/IG.  
3. **Improve:** Do not improve by auto-post or a 24/7 swarm.
