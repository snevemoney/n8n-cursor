# Consultant — 3QclAjmu5Tw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/3QclAjmu5Tw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/3QclAjmu5Tw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Claude usage-limits / SpaceX compute talk. Beats: Anthropic×SpaceX to raise compute; Code with Claude 2026 SF/London/Tokyo extra days. Quarter of outages from demand>compute. Immediate: double Claude Code 5-hour rate limits (Pro/Max/Team); remove peak-hours reduction; raise Opus API limits (input was 30k/min; output 8k→80k/min — he says ~16% on one slide and 10× on output; treat as UNVERIFIED mix). Also: they had blocked new Pro from Claude Code (Max only) and banned using the sub for Open Claude / Hermes (ToS + maybe load). Other compute: Amazon, Google, Broadcom, Microsoft, Nvidia, FluidStack; Goldman/Blackstone JV day before — enterprise + international. Managed agents (webhooks, auto-dreaming, multi-agent) mentioned, not covered. Why it matters: people hit walls on Pro→Max still. Lowest API tiers got the biggest multiples; he analogizes 500k input/min ≈ 370 pages vs ~20 before. SpaceX: 300 MW, 220k Nvidia GPUs; interest in **orbital** gigawatts because terrestrial power/water/community has a ceiling. Builder list: (1) retest workflows that died on rate limits — client LinkedIn infographic, 3 months later a new image model, he called back; (2) if you were Haiku/Sonnet-saving, you may use more Opus, still manage context; (3) 1M context more usable on API; Claude Code behind prod less suicidal; (4) multi-agent (five sub-agents × 50k) more viable; (5) direction: 5+ year compute, Claude Code flagship (little Cowork talk), community electricity-hike commitments as trust. Next: token/session-limit video. No VTT. UNKNOWN. ~2483 words.

## B. Atomic Knowledge

### Retest the thing that died on a limit or a model
- **Claim:** A client infographic he would not stand behind became buildable after a new image model three months later; he called them back.
- **Reasoning:** A wall can be compute or model quality. Both move.
- **Mechanism:** Keep a list of “not yet” jobs → when a limit or model changes, retest → then call.
- **Evidence:** “3 months later, new image model dropped. I tested it out, it worked. I called him up and then we built it out”
- **Conditions:** LinkedIn infographic client. SpaceX-limits day as the prompt for the list.
- **Exceptions:** Calling back is a send. Limits/GPU counts UNVERIFIED. Claude/SpaceX on-tape.
- **Action:** Steal the not-yet list + retest. Do not call a parked client. Do not install Claude because limits doubled.
- **Confidence:** high as a habit
- **Source:** `3QclAjmu5Tw` @ UNKNOWN — “Sometimes it's worth revisiting old projects.”
- **Epistemic:** SOURCE
### More limit is not a reason to stop managing context
- **Claim:** He says treat yourself to more Opus if you were starving the session, and immediately says context management still matters; double usage can hide sloppy loops.
- **Reasoning:** A wider hose still empties the tank if you leave the tap open (`dYrrEKXtttk`).
- **Mechanism:** If limits move, retest — do not turn on overnight multi-agent by default.
- **Evidence:** “context management is still going to be really, really important.”
- **Conditions:** Builder advice after the announcement.
- **Exceptions:** 5-hour double / 8k→80k mix may be slide-garbled.
- **Action:** Do not celebrate a vendor limit as a strategy. Stack stays Cursor+Grok.
- **Confidence:** high as a warning
- **Source:** `3QclAjmu5Tw` @ UNKNOWN — “you might be able to push some of those workflows… it doesn't affect your session limit as much”
- **Epistemic:** SOURCE


## C. Mental Models

He is translating a compute press release into builder todos. He is sympathetic to Anthropic’s demand math (idle GPUs waste money too). He is curious about orbital compute as a story, not a plan. He still points at his own token-hygiene videos. Cowork vs Code is a product-politics aside.

## D. Procedures

On-tape: retest old walls; maybe spend more Opus; watch context. Ours: keep a not-yet list; do not retest on Claude; do not call anyone; orbital GPUs are future-use fiction.

## E. Examples

**Situation:** Limits doubled after a SpaceX compute deal. **Action:** He lists five builder implications and a callback story. **Outcome:** Watch-next on tokens. **Lesson:** Walls move; hygiene stays. Implicit rule: he would not ship the infographic until he would post it himself.

## F. Decision Rules

If you would not post it, you do not have a product (his infographic bar). If the only change is a vendor limit, that is not a client KPI. If someone wants orbital compute in a scope, fail.

## G. Contrarian

Field default: more limit = more agents overnight. He still preaches context. Field default: dead projects stay dead. He calls back after a model move.

## H. Assumptions

300 MW / 220k GPUs / 8k→80k / 16% / $20 Pro UNVERIFIED. Claude/SpaceX/Hermes on-tape. Callback = send. Pair `-nG-9vlSkho` (sample/habit).

## I. Questions

Did the infographic client stay? What is “auto dreaming” on managed agents (he deferred)?

## J. Connections

**SYSTEM SYNTHESIS:** Pair `dYrrEKXtttk` (don’t loop just because you can). Maps to `golden-test-loop` (retest) + `ask-principal` (any callback). Infographic bar = skeptical-customer.

## K. Future-Use

Unassigned: a written not-yet list with the wall that killed it; “would I post this?” as an accept test.

## Steal / Operate-never

### Machine: Not-yet list → retest when the wall moves → human still has to like it
- **Epistemic:** SOURCE
- **Workflow / loop:** Write down jobs that died on a limit or a model → when something real changes, retest → only proceed if you would stand behind the output → any client callback is HITL
- **Questions / signals:** What wall killed it? Would I post/send this? Are we only excited because a vendor doubled a limit?
- **Qualify / frame / objections:** Qualify: there was a failed attempt with a named reason. Frame: walls move. Objection: “limits are gone, turn on five agents” — context still matters.
- **Procedure:** Keep the list. Do not install Claude. Do not call a parked client.
- **Example that proves it:** LinkedIn infographic: not confident → new image model → retest → he called and built.
- **Why it works:** A dead project is information. A limit change is not a strategy by itself.
- **Conditions / exceptions:** Vendor numbers UNVERIFIED. Callback is send.
- **Operate-never payload:** Install Claude because limits doubled. Quote GPU/MW as FACT. Call a parked client. Scope orbital compute.
- **Hive run (existing skills only):** `golden-test-loop` · `ask-principal` · `warm-draft-hitl`
- **Source:** `3QclAjmu5Tw` @ UNKNOWN


### Operate-never
- Install Claude / celebrate a doubled session as a strategy.
- Quote 300 MW / 220k GPUs / 8k→80k as FACT.
- Call a parked client because a model or limit moved.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “what do I do with doubled limits?” Felt problem is not SpaceX. Do not re-open a parked Path A because Opus can talk longer.

**Four-blank:** None from a rate-limit blog.

**Skeptical-customer:** Orbital GPUs are smash. Clients parked.
