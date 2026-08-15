#!/usr/bin/env python3
"""Write 17 desk knowledge-use reproduce + THINK/BEHAVE/TRICKS/USE cards."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/hive/outer-heaven/CONTENT/job-cards/takes/_knowledge-use"
OUT.mkdir(parents=True, exist_ok=True)

COMMON = """
Status: UNTESTED
Protocol: desk-wiki-before-work + last-mile tape wire 2026-08-14
**Stack:** Cursor + Grok Bot. `cursor-ide-browser` on Cursor. Grok Bot browser on Grok. Do not call the other host's MCP.
**Hard step:** send / pay / deploy / book / publish = Evens.
**Tape $:** UNVERIFIED. Caption-only. Visual/click UNKNOWN unless `watch.json`.
**Clients:** parked. No new `icp_id`. Do not unpark Normand.

## Operate-never (all desks)
Claude Code / Cowork / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus · Path A hunt · invent clicks · quote tape $ as FACT
"""

CARDS = {
    "big-boss": f"""# Big Boss — knowledge-use 2026-08-14
{COMMON}

## Reproduce — `dark-factory` (Cole `eecUhBpTz_g`)
- **GOAL:** spec/PRD in → reviewed + validated code sitting in a ticket queue (not auto-deployed).
- **Do:** Own the queue labels + priority (fix → review → next accepted → triage). Name cadence; `hosted-neq-scheduled` default no new host. mission.md may **reject** a spec.
- **Tools:** `dark-factory` · `checkable-stop` · `hosted-neq-scheduled` · `observe-pane`
- **DONE-CHECK:** one ticket accepted or rejected with a written why. CAP: 1 spec. COST: this session.
- **BLOCKED:** auto-merge / 30-min cron host — Evens must name WAKE.

## Reproduce — `plan-mode-objective` (Chase `U6k4MeVks_Y`)
- **GOAL:** a fuzzy dump becomes a plan with unknown-unknowns asked, then a named skill if the run wins.
- **Do:** Demand plan-first + “what am I not thinking?” Do not smash Recommended. `/goal` only with objective done-when.
- **Tools:** `skill-from-session` · `session-bootstrap` · `checkable-stop`

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Cole — autonomy is earned by the harness; the agent may correct you. Chase — global instructions are a high bar; leave blank. Ty — opportunity is cost-relative (kill vs Autoplay).
- **BEHAVE:** Cole speech≠behavior: “out of the loop” vs escalate-sometimes. Chase watches the context ring (~30% new-chat). Brock splits specialists instead of one omni-bot.
- **TRICKS:** mission.md out-of-scope so the factory can reject. Skill-creator from session history. Priority order written, not vibes.
- **USE:** Before any loop, write DONE-CHECK + CAP + COST. Yellow = `ask-principal`. Do not flatten Cole/Chase/Ty into one boss personality.
""",
    "hitl-operator": f"""# HITL Operator — knowledge-use 2026-08-14
{COMMON}

## Reproduce — `specialist-handoff` (Brock `lRUpu2-KtGQ`)
- **GOAL:** invoice/inbox drafts exist; **you** do not send.
- **Do:** Pass ≠ send. Strip Gmail send from any specialist prompt (`send-removed`).
- **Tools:** `specialist-handoff` · `send-removed` · `confirm-then-actuate` · `sanitize-in-check-out`
- **DONE-CHECK:** draft artifact on disk + send stripped. CAP: 1 thread.
- **BLOCKED:** live Gmail send — HITL leftover.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Brock’s honest path is draft-then-human. Cole’s factory still escalates sometimes.
- **BEHAVE:** Speech≠behavior on “send on my behalf” vs “I send it myself.” Keep both. Do not pick the hook.
- **TRICKS:** Demo emails so you don’t leak real invoices (he said). Sanitize-in before the model.
- **USE:** Any specialist that mentions send → strip. Card the resume (`input-required-gate`).
""",
    "communications-manager": f"""# Communications Manager — knowledge-use 2026-08-14
{COMMON}

## Reproduce — `specialist-handoff` inbox + invoice
- **GOAL:** morning triage briefing + invoice **draft** + attach, no send.
- **Do:** Name inbox vs invoice. Written handoff sentence. Event WAKE ≠ daily schedule.
- **Tools:** `specialist-handoff` · `inbox-to-task-routing` · `invoice-email-automation` · `filter-then-llm` · `send-removed`
- **DONE-CHECK:** one draft reply + one briefing list. CAP: 1 day of mail (read).
- **BLOCKED:** ClickUp install / Gmail send / Firecrawl buy.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Split brains keep style (PDF) and triage separate.
- **BEHAVE:** He created demo emails. We do not invent a ClickUp.
- **TRICKS:** Reference PDF for invoice style. Group chat only after two specialists exist.
- **USE:** Draft in his-style-from-a-file. Evens sends.
""",
    "lead-hunter": f"""# Lead Hunter — knowledge-use 2026-08-14
{COMMON}

## Reproduce
- **GOAL:** none this pass. Clients parked.
- **Do:** IGNORE/NO_ACTION on Path A. FDE tape is **not** a hunt ICP. Ty tape is **not** a pred-market ICP.
- **Tools:** `catalog-demand-match` → REFUSE / ASK
- **DONE-CHECK:** no new `icp_id`. CAP: 0 hunts.
- **BLOCKED:** parked by operator 2026-08-14.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Tim’s “smaller door first” is labor advice, not a client list. Ty copies a working category — we do not mint that category.
- **BEHAVE:** Do not unpark Normand because a tape mentioned “real business.”
- **TRICKS:** none to run as a hunt.
- **USE:** If someone asks for FDE clients → point at `forward-deployed-gap` career/delivery gym.
""",
    "product-gtm": f"""# Product GTM — knowledge-use 2026-08-14
{COMMON}

## Reproduce — `checkout-in-one-sitting` (Ty `I7mpF7_pnPM`)
- **GOAL:** Path C thin offer + checkout **proof** (card-test), not a waitlist-only demo.
- **Do:** Clock includes tease + site + checkout + launch. Narrow span. $1 = card, not revenue. Kill vs hive-os if Evens says the main machine is dearer.
- **Tools:** `checkout-in-one-sitting` · `paid-slice-funnel` · `outcome-offer-funnel` · `website-offer-funnel` (router → Path C)
- **DONE-CHECK:** offer sentence + pay-path checklist written. CAP: 1 Path C slice.
- **BLOCKED:** Stripe live / DNS / publish — Evens. Dry-run = preview smoke only.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Sell/audience before the repo. Distribution > build in 2026 (his claim).
- **BEHAVE:** Lazy launch X died; second post copied a working 16k structure + face. IG flopped. He still killed vs Autoplay.
- **TRICKS:** ≤10y ICP span; URL in comments; 48h count cards; trust gut when the draft feels off.
- **USE:** Write the clock with distro on it. Do not call $1 “revenue.” `ask-principal` on kill/pursue.
""",
    "researcher": f"""# Researcher — knowledge-use 2026-08-14
{COMMON}

## Reproduce — last-mile on every tape
- **GOAL:** A–K + six extractions + WIRE or labeled merge + one named workflow + THINK/BEHAVE/TRICKS/USE.
- **Do:** Read entire `full.txt`. Remap-as-done forbidden. `offline-plate-vs-world` = classify only (Bilawal).
- **Tools:** `deep-video-learning` · `capability-acquisition` · `workflow-compiler` · `multimodal-youtube-learning`
- **DONE-CHECK:** LEARNED has TBTU; workflow md+json exists. CAP: packets with captions this pass.
- **BLOCKED:** 476 without captions; billed vision.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Jack — research the number you did not say. Bilawal — physics is approximated, not computed; look for the failure class.
- **BEHAVE:** Caption-only = sequence-from-speech. Do not invent Firecrawl/Higgsfield clicks.
- **TRICKS:** Enrich after the script names the claim (`filter-then-llm`).
- **USE:** Every number in a graphic is sourced or dropped.
""",
    "librarian": f"""# Librarian — knowledge-use 2026-08-14
{COMMON}

## Reproduce — index the new machines
- **GOAL:** desks load owns-X / never-Y + these reproduce cards before work.
- **Do:** Persist never-lists. Index `seedance-site` · `dark-factory` · `skill-from-session` · `checkout-in-one-sitting` · `specialist-handoff`. Chase raw→wiki→index.md = `wiki-ingest` / `desk-wiki-before-work` (same file-shape; 8k Obsidian already dissent).
- **Tools:** `desk-wiki-before-work` · `wiki-ingest` · `skill-from-session` · `knowledge-architecture`
- **DONE-CHECK:** 17 `_knowledge-use/{{slug}}.md` exist. CAP: this pass.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Chase — wrapper isn’t the value; skill map + indexes are.
- **BEHAVE:** Do not stand up a second Obsidian.
- **TRICKS:** index.md at every folder level (Karpathy shape, already on wiki-ingest).
- **USE:** Before spawn, the desk reads this folder.
""",
    "creative-studio": f"""# Creative Studio — knowledge-use 2026-08-14
{COMMON}

## Reproduce — `seedance-site` (Zubair `gt8k4bA01Mo`)
- **GOAL:** one continuous ≤30s 720p plate + award refs, ready for Forge wrap.
- **Do:** 1–3 Awwwards refs. Name signature motion. Connector on before prompt. Reject stitched shorts.
- **Tools:** `seedance-site` · `motion-grade-pipeline` · `cinematic-recipe` (3-ref bible; labeled dissent vs frame-scrub)
- **DONE-CHECK:** plate path on disk + ref list. CAP: 1 plate. COST: Higgsfield already on desk.
- **BLOCKED:** Seedance generate if Higgsfield unauthorized — ASK. OAuth clicks unobserved.

## Reproduce — `claude-design-motion` (Jack `RDytbVDzMF4`)
- **GOAL:** one graphic on a spoken beat with a sourced number.
- **Do:** `script-beat-motion`. Font lock. One icon style. Research or drop unsourced numbers.
- **Tools:** `script-beat-motion` · `filter-then-llm` · `higgsfield-ae-vectors` (still only)
- **DONE-CHECK:** file on disk + beat timestamp. Publish HITL.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Zubair — taste from award sites, not the model. Jack — slop is default chrome; uniqueness is imported assets.
- **BEHAVE:** Zubair “one prompt” vs pack+MCP. Jack spends the tape on what Claude cannot do (fonts/icons/Lottie).
- **TRICKS:** 720p as load feature. CTA roast is Forge’s, but you fail the plate if stitched.
- **USE:** Lock font + one pack before generating. Do not sell Genie as a landing (`offline-plate-vs-world`).
""",
    "consultant": f"""# Consultant — knowledge-use 2026-08-14
{COMMON}

## Reproduce — `fde-career` delivery shape (Tim `vLlIBT0HSSc`)
- **GOAL:** name the demo≠mess gap and a measured messy-install plan (Path C / us, or parked replica). Not a hunt.
- **Do:** `forward-deployed-gap`. List legacy / data / compliance / process. One number. Their language.
- **Tools:** `forward-deployed-gap` · `mcp-on-private-demo` (preview connectors ≠ living in their prod — dissent)
- **DONE-CHECK:** GAP sentence + PROOF line (or NONE). CAP: 1 gym. Book HITL.
- **BLOCKED:** named client — parked.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Models are not the product; value in the mess is. Clarify before solve.
- **BEHAVE:** He recommends DataCamp (operate-never buy). Customer skills get the offer.
- **TRICKS:** Resume magic = measured before/after, not a todo app. 45-min vague case: clarify, decompose aloud, business words.
- **USE:** Write the gap in their words. Do not apply to labs.
""",
    "forge": f"""# Forge — knowledge-use 2026-08-14
{COMMON}

## Reproduce — `seedance-site`
- **GOAL:** preview URL where scroll scrubs one continuous plate and a CTA is visible before scroll.
- **Do:** Wrap frames. `prefers-reduced-motion` → poster. Roast via `click-live-site` + `verify-after-browser`.
- **Tools:** `seedance-site` · `cinematic-recipe` · `slice-build` · `click-live-site`
- **DONE-CHECK:** preview path + roast card (ACT/EXPECTED/OBSERVED). CAP: 1 page. Deploy HITL.
- **BLOCKED:** localhost:4995 on tape ≠ our host. Higgsfield OAuth unobserved.

## Reproduce — `dark-factory`
- **GOAL:** one spec → one bite of code + hidden hold-outs Watchdog can run. Level 3.
- **Do:** PRD first. Three files. Builder never reads hold-outs. Do not fill GRADE.
- **Tools:** `dark-factory` · `session-bootstrap` · `skill-from-session` (if the run wins)
- **DONE-CHECK:** bite on a branch + hold-out file Watchdog-only. CAP: 1 spec.
- **BLOCKED:** auto-deploy / Claude marketplace.

## Reproduce — `plan-mode-objective`
- **GOAL:** plan + explain options + files in a folder + optional named skill.
- **Do:** `skill-from-session`. New chat in the same folder if context rots. Watchdog grades.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Cole — not vibe; engineer the harness. Chase — explain-don’t-recommend or you have no moat. Zubair — connector on before prompt.
- **BEHAVE:** Cole had “a ton of rejections.” Chase picks V1 of three. Zubair roasts after wrap.
- **TRICKS:** factory rules stricter than global; bite-size. Blank global instructions.
- **USE:** One system per session (`slice-build`). Preview ≠ prod.
""",
    "personal-cfo": f"""# Personal CFO — knowledge-use 2026-08-14
{COMMON}

## Reproduce
- **GOAL:** flag tape $ as UNVERIFIED; no analog pricing.
- **Do:** Cole token-burn / Chase $20/$100/$200 / Ty $1×2 / Zubair $10k = not our price.
- **Tools:** `token-receipt` (if a billed run) · route large spend to HITL
- **DONE-CHECK:** no tape $ copied into an offer. CAP: this pass.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Ty — $1 is a card-test. Chase — effort is not linear (xhigh→ultra ~1% for 5× $ spoken).
- **BEHAVE:** Do not move money.
- **TRICKS:** none to operate.
- **USE:** Stamp UNVERIFIED on any tape dollar that lands in a brief.
""",
    "wealth-manager": f"""# Wealth Manager — knowledge-use 2026-08-14
{COMMON}

## Reproduce
- **GOAL:** no new SKU from tapes. Opportunity-cost language only.
- **Do:** Ty kill-vs-Autoplay is a **decision rule**, not a portfolio product.
- **DONE-CHECK:** no wealth product minted. CAP: 0.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Opportunity isn’t good/bad alone; cost of pursuit is.
- **BEHAVE:** Gmail never on this desk.
- **TRICKS:** none.
- **USE:** If Evens asks “keep Polymind-shaped Path C?” → point at Money Desk + `ask-principal`.
""",
    "money-desk": f"""# Money Desk — knowledge-use 2026-08-14
{COMMON}

## Reproduce — `checkout-in-one-sitting` score
- **GOAL:** score a Path C card-test without calling it revenue.
- **Do:** 48h: count cards. PASS/HOLD on margin stays ours (`pricing-margin-roi-guardrails`). Tape $ UNVERIFIED.
- **Tools:** `checkout-in-one-sitting` · `token-receipt` · `catalog-demand-match`
- **DONE-CHECK:** one line: cards=N · not revenue. CAP: 1 Path C slice.
- **BLOCKED:** Stripe live / refunds — Evens.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Two $1 + semi-viral is a go **if you have nothing**; no if a main machine is dearer.
- **BEHAVE:** Steve Pan (network/investor) ≠ stranger PMF. Keep the mismatch.
- **TRICKS:** Dual smoke preview **and** domain (already paid-slice).
- **USE:** Never quote YouTube income as ours.
""",
    "publishing-engine": f"""# Publishing Engine — knowledge-use 2026-08-14
{COMMON}

## Reproduce — `claude-design-motion`
- **GOAL:** package beat graphics next to a timed script. Do not publish.
- **Do:** `script-beat-motion` + `clip-factory` package only. Insert/schedule = Evens.
- **Tools:** `script-beat-motion` · `voice-script-from-operator` · `one-channel-deep`
- **DONE-CHECK:** files on disk. CAP: 1 script.

## Reproduce — Ty launch effort (part)
- **GOAL:** draft a launch post that is not half-assed. Do not post.
- **Do:** Copy a working structure + face/proof. URL in comments. `send-removed` on network.
- **BLOCKED:** publish / X / IG.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Jack — motion earns its place on a spoken beat. Ty — content > paid ads (his claim).
- **BEHAVE:** First lazy X died; he read the next post aloud. Trust gut when structure feels off.
- **TRICKS:** One font / one icon style. Don’t invent numbers.
- **USE:** Draft only. Evens publishes.
""",
    "day-planner": f"""# Day Planner — knowledge-use 2026-08-14
{COMMON}

## Reproduce — `specialist-handoff` meeting→tasks
- **GOAL:** notes → action items on **our** board (not a new Granola/ClickUp).
- **Do:** Classify WAKE 5pm-style as scheduled. Route agency vs YouTube-shaped lanes if Evens has them. Priority + due dates as a draft.
- **Tools:** `specialist-handoff` · `hosted-neq-scheduled` · `checkable-stop`
- **DONE-CHECK:** task list draft. CAP: 1 day. Calendar invite HITL.
- **BLOCKED:** Granola subscribe / ClickUp install.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Schedule ≠ event. Chase eternal jobs = skill + log + routine Evens names.
- **BEHAVE:** Phone brain-dump counts (he said). We do not buy Granola.
- **TRICKS:** Handoff sentence before the 5pm run.
- **USE:** `/loop` only if Evens names the interval.
""",
    "career-strategist": f"""# Career Strategist — knowledge-use 2026-08-14
{COMMON}

## Reproduce — `fde-career` gym (Tim)
- **GOAL:** one 45-min vague case dry-run scored. No employer send.
- **Do:** `forward-deployed-gap` + `interview-gym`. Clarify → decompose aloud → business language. STAR: ambiguity, cross-functional, failure, disagreement, impact.
- **Tools:** `forward-deployed-gap` · `interview-gym` · `context-docs`
- **DONE-CHECK:** case writeup + gaps. CAP: 1 gym. Send HITL.
- **BLOCKED:** DataCamp buy / lab applications / $300–500k as FACT.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Technical skills get you in; customer skills get the offer (hiring-guide line, unnamed).
- **BEHAVE:** “Fast path” vs “more difficult than I’m making it sound.” Keep both.
- **TRICKS:** Smaller door first (labor advice). Measured messy install on the resume.
- **USE:** Gym only. Do not email employers.
""",
    "watchdog": f"""# Watchdog — knowledge-use 2026-08-14
{COMMON}

## Reproduce — grade the new machines
- **GOAL:** GRADE on any dry-run of `seedance-site` / `dark-factory` / `checkout-in-one-sitting` / `script-beat-motion` / `forward-deployed-gap`.
- **Do:** `separate-verifier`. Hold-outs the builder must not see (`dark-factory`). CTA roast on live preview (`seedance-site`). Dual smoke preview≠domain (`checkout-in-one-sitting`).
- **Tools:** `separate-verifier` · `golden-test-loop` · `verify-after-browser` · `knowledge-audit` · `dark-factory`
- **DONE-CHECK:** GRADE filled by this desk only. CAP: 1 machine.
- **BLOCKED:** headed send/pay. Caption-only click tasks = gap, not coverage.

## THINK / BEHAVE / TRICKS / USE
- **THINK:** Cole — if the builder sees the exam, it studies the exam. Chase — models don’t grade themselves.
- **BEHAVE:** Jarvis-on-tape is a second grader; we already have this desk. Do not install Jarvis.
- **TRICKS:** New session, no shared plan. Merge≠ship.
- **USE:** If Forge writes GRADE, the path fails.
""",
}


def main() -> None:
    for slug, body in CARDS.items():
        (OUT / f"{slug}.md").write_text(body, encoding="utf-8")
    print(f"wrote {len(CARDS)} desk cards")


if __name__ == "__main__":
    main()
