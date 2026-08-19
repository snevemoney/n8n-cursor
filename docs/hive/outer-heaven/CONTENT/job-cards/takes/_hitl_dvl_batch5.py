#!/usr/bin/env python3
from _hitl_dvl_writer import write_one

def src(claim, why, mech, ev, act, **kw):
    return {"concept": kw.pop("concept"), "claim": claim, "why": why, "mech": mech, "ev": ev, "act": act, **kw}

def ex(sit, act, why, out, les, name="On-tape run"):
    return {"name": name, "sit": sit, "act": act, "why": why, "out": out, "les": les}

TAKES = {}

TAKES["EuzYhzB0vbI"] = {
    "title": "Finally. Agent Loops Clearly Explained.",
    "speaker": "Nate Herk | AI Automation",
    "kind": "explainer + demos",
    "words": 3673,
    "A": [
        "Four looping agents: productive or a cool demo? Tweets: stop prompting; design loops (Boris Cherny, Peter Steinberg/Steinberger). Loop = trigger + action + stop. He rejects the 'meta agent infers loops from your vibe / you're falling behind' reading as the prescription.",
        "Loop engineering = replace yourself as the prompter. Recursive goal: objective (not subjective) + verification. 24/7 swarms scale bugs; he uses cadence + event actions; 24/7 does not help his knowledge work.",
        "Research loop: ~45 sources → HTML ~V7 via screenshot-review until 'done.' Reason → act → observe until checkable done (cake-fork). Outsource the feedback loop so attempt one lands higher. Shapes: solo (what he uses most) · maker-checker · manager+helpers. Most tasks do not need a massive architecture — one terminal + a good prompt.",
        "Matthew Berman Loop Library + `/goal`: (a) 10 thumbnails vs Mr Beast rubric, top 3 improve, iterate strongest — 27 min; 'until satisfied' is a weak done; want X metric = Y; scores were subjective; dedicated scorer sub-agent would help. (b) Three.js plane, open browser, iterate — 37 min; still not see-through. (c) Abbey Road in HTML/CSS, no image gen; stop if average ≥9, hard cap 8; final looks nothing like the photo.",
        "Before you build: what does done mean + how will it check (visual / functional / play the level / tone). Tools must match the check. What works: checkable goal, hard stop, good tools, memory, separate checker, plan first, logging, cost that makes sense. 12h+ often useless; he likes ~35 min–a couple hours, or overnight 4–8h then a human iterates. Hyperframes 'one shot' was a loop. Steinberger 10x does not apply to every role. Skool slide deck + audit CTA.",
    ],
    "atoms": [
        src("A loop is trigger + action + checkable stop. 'Until satisfied' and 'I'm done' are not stops on send/book/publish.",
            "He names cake-fork as the test and then shows Abbey still failing a ≥9 with a hard cap.",
            "Define done + check → iterate → human reviews the artifact.",
            "On-tape: until-satisfied is an issue; Abbey ≥9/cap 8 still ugly; overnight then human iterates.",
            "Steal checkable stop + hard cap. Operate-never unattended I'm-done on a world action.",
            concept="Checkable stop, then Evens"),
        src("24/7 fleets scale bugs. Cadence and event triggers are enough for knowledge work.",
            "He does not run around-the-clock swarms; falling-behind tweets are false for his job.",
            "Cadence or event → loop with a cap → human morning-after.",
            "On-tape: 24/7 not helpful; 4–8h overnight then he iterates.",
            "Steal cadence/event. Operate-never 24/7 auto-money.",
            concept="Cadence ≠ 24/7 swarm"),
    ],
    "C": ["Most tasks do not need a loop architecture.", "Loops get you closer, not 100%.", "Other people's 10x is not your operate.", "Self-grade is a smell — he wants a separate scorer."],
    "D": [
        "Write done as X metric = Y plus a hard cap.",
        "Match tools to the check (browser screenshot vs tone vs tests).",
        "Prefer solo loop. Maker-checker if the score is subjective.",
        "Overnight only as experiment; morning human pass. No send/book/publish in the loop.",
        "Do not join Skool for the deck.",
    ],
    "E": [ex("Abbey Road in HTML, stop ≥9 or 8 passes", "Screenshot each version", "Objective-ish done", "Cap hit; looks nothing like the photo", "The check ran; the artifact still needs Evens")],
    "F": ["If done is 'satisfied' / '100% confident' → rewrite or refuse.", "If the loop can send/post → strip those tools.", "If 12h+ with no artifact improvement → kill.", "If a tweet says you're falling behind → ignore."],
    "G": ["Field starts fleets because Cherny/Steinberger said loops. He says that 10x is role-specific and 24/7 is often theater."],
    "H": ["45 sources, V7, 27/37 min, ≥9, 10x, Skool UNVERIFIED or on-tape.", "Claude Code / Berman library on-tape."],
    "I": ["What is a good thumbnail metric that is not a vibe score?", "Did any overnight loop ever send?"],
    "J": ["SYSTEM SYNTHESIS → `coverage-loop` (trigger/act/checkable stop) · `golden-test-loop` · `ask-principal`.", "Siblings: `ZAaxx3qyT8g` /goal; `ONmaDdOBGig` 100% confident."],
    "K": ["Maker-checker as Watchdog analog. Keep. Fleet theater never."],
    "machines": [{
        "name": "Trigger + action + checkable stop + hard cap (world-action still HITL)",
        "loop": "name metric + cap → run solo or maker-checker → observe → if cap or metric, stop → Evens reviews → send/publish card if any",
        "qs": "What is done? How does it check? Cap? Can it send?",
        "qf": "I'm-done is not APPROVE. Until-satisfied is a no. 24/7 swarm is a no.",
        "proc": "coverage-loop dry-run only. No Claude. No Skool. No overnight with Send.",
        "ex": ex("Thumbnail /goal until satisfied", "He names that done as the issue", "Want X=Y", "27 min pack", "Pack is not a post"),
        "why": "He already has our spine: stop condition + verify. He still lets the intern say done. We add Evens.",
        "never": "Unattended I'm-done on send/book/publish. 24/7 auto-money. Quote 10x/45 sources as FACT. Skool dump. Claude /goal overnight with social tools.",
        "hive": "`coverage-loop` · `golden-test-loop` · `ask-principal` · `input-required-gate`",
    }],
    "L": "This is the loop-doctrine tape. ACTION = require metric+cap; REJECT I'm-done and 24/7 swarms. Thumbnails/Abbey/plane are not publish. Clients parked.",
}

TAKES["w9-gfaV5vlM"] = {
    "title": "Stop Selling AI Agents, Sell AI Solutions Instead",
    "speaker": "Nate Herk | AI Automation",
    "kind": "sales framework (long cut of the short)",
    "words": 3377,
    "A": [
        "Stop selling agents/workflows; diagnose business problems; use AI to solve them. Goldman BI: automation is old; 'AI' is a neon sign. Flashy multi-agent YouTube wins views; practical low-view builds had the ROI. First $1,200 sold as hours saved on content, not 15 nodes. Businesses care about time, money, focus. Taxi/medicine analogies. Template packs $5k/month-for-$200 are a race to the bottom. LinkedIn bot: agent-name dies; qualified-leads-without-ads lives.",
        "Framework: diagnose → solve → value → price. Onboarding example: 5h/week → 80% → 200h × $50 = $10k → charge $3k. Reno: hammer vs +$50k. Call questions: where losing time? what should run itself?",
        "Step 1: pick a niche (agencies, RE, ecom, coaches, dental/HVAC, SaaS) — weekly repeat, can pay fast, you speak the language. Step 2: 5–10 informational interviews; open: 15 min quantify bottleneck, no pitch unless they ask. LRP: listen, repeat, poke (whose hours, hourly, error rate, copy-paste pay, 9–noon interrupts, refunds/churn, one weekly fire). Ranked pains with numbers.",
        "Step 3: prototype not production — 15 min map (trigger/steps/data/outputs/done) + 1h n8n click-through + 15 min 3-min Loom with camera on. Don't multi-agent, five vendors, or build a platform for Tuesday's bottleneck. Outcome: a demo video you can send to other nurtured leads.",
        "Step 4: time × hourly × 60% automate → fraction price; value ≠ your hours ($1200 / 2h = $600/h story). Scope: objective, in/out, timeline, client duties, payment. Underscope was his #1 early mistake.",
        "Step 5: stack proof. Free/cheap for testimonials or money-back if it doesn't deliver the discussed value. First 3–5 = paid practice. Later $1–2k up to $30k+ UNVERIFIED. Collect before/after; case studies; 'I've helped three like you.' Skool resource + Plus One Person AI Agency / 2,000 people CTA.",
    ],
    "atoms": [
        src("Sell diagnose→solve→value→price, not the graph. LRP on the call.",
            "Buyers buy time/money/focus. Neon-AI is attention, not the product.",
            "Questions → numbers → fraction price → scoped proposal.",
            "On-tape LRP + two diagnosis questions + $3k-of-$10k script.",
            "Steal LRP + fraction frame. All $ UNVERIFIED. No hunt this session.",
            concept="LRP then fraction-of-value"),
        src("A 90-minute prototype + camera Loom is the artifact. Sending that Loom to a nurture list is still send.",
            "He names the outcome of step 3 as a demo video you can send.",
            "Map → rough build → Loom → Evens sends if ever.",
            "Direct: 'demo video that you can send to some of your other nurtured leads.'",
            "Steal the 90-min prototype. Operate-never auto-send / unpark a list.",
            concept="Prototype Loom; send stays HITL"),
    ],
    "C": ["Flashy YouTube ≠ highest ROI builds.", "People hire a face, not a faceless screen.", "Early optimize for reps/proof, not the $1200.", "Don't overengineer Tuesday."],
    "D": [
        "LRP: listen, repeat the pattern, poke hours/errors/money/focus/trigger.",
        "Niche filters: weekly repeat, pay-fast, language fit.",
        "90 min: 15 map / 60 build / 15 Loom on camera.",
        "Write scope in/out/done/payment before a number.",
        "Money-back or cheap-for-proof is a policy Evens would have to choose — not this session.",
        "No pitch unless they ask — and we are not interviewing anyone this session.",
    ],
    "E": [ex("First $1200 content workflow", "Pitched hours saved not 15 nodes", "Outcome not graph", "Sold (on-tape)", "Frame stolen; $ UNVERIFIED; no send")],
    "F": ["If the next step is 'send the demo to nurtured leads' → card / parked.", "If $50/hr $3k $30k appear → UNVERIFIED.", "If Plus/Skool is the close → ignore.", "If they want a LinkedIn send-bot → refuse send, keep research+draft."],
    "G": ["Field sells agent packs. He sold hours. He also tells you to mail the Loom — we hold that mail."],
    "H": ["All dollar/hour/%/2,000-member figures UNVERIFIED.", "Goldman / Plus / Skool on-tape.", "Clients parked — do not run step 2."],
    "I": ["What is in the Skool one-pager?", "Did money-back ever get used?"],
    "J": ["Shorts: `wk8KV280fbg` · `YF0XPMXLHOA` · `5IM27lbCwjM`.", "SYSTEM SYNTHESIS → `outcome-offer-funnel` · `discovery-spiced-constraint` · `demo-walk-script` · `playbook-before-send` · `send-removed`."],
    "K": ["LRP question list for a named Path A later. Parked."],
    "machines": [{
        "name": "Diagnose (LRP) → 90-min prototype → Evens prices/sends",
        "loop": "if Evens names a client: LRP questions → map+POC+Loom → fraction math → scoped card → Evens sends/prices → stop",
        "qs": "Whose hours? Hourly? Errors? One fire? Does the Loom go to a list?",
        "qf": "No pitch unless they ask. No nurture blast. No LinkedIn send-bot.",
        "proc": "This session: learn only. Clients parked. No 5–10 interviews. No Plus.",
        "ex": ex("Step 3 outcome is a Loom to send", "He says send to nurtured leads", "Proof artifact", "That's still send", "Artifact stolen; send rejected"),
        "why": "The useful machine is diagnosis + a clickable POC. The irreversible machine is the list-send and the invoice.",
        "never": "Auto-send Loom/nurture. Unpark/hunt niches. Quote $1200/$3k/$30k/money-back as FACT. Join Plus/Skool. Free work as a hive policy without Evens.",
        "hive": "`outcome-offer-funnel` · `discovery-spiced-constraint` · `demo-walk-script` · `playbook-before-send` · `ask-principal`",
    }],
    "L": "Long-cut of the outcome short. LRP sits on a future Path A card. ACTION this session = do not interview, do not send the Loom. Money-back is a pay/policy card for Evens only. Clients parked.",
}

TAKES["bWhjRLX0jpo"] = {
    "title": "Building a $1B Fintech Startup In Montreal | EP 1",
    "speaker": "Montreal fintech founders (Ben / Luke / editor) — not Nate",
    "kind": "vlog",
    "words": 2318,
    "A": [
        "Credit-card-in-his-head gag. Weekly draw Sunday 20:00; they missed a 19:55 simulator test — slip to next weekend.",
        "Free animation pack for tickets/winner/payout; 'create a new account under a different email' for platform limits; they say they'll respect copyright.",
        "PostHog setup; startup discount (incorporated 2y10d, emailed, still got it); merch. Wealthsimple waitlist name → LinkedIn reach-out → meeting planned. Editor origin: McGill poker, $150 down, hired as dev then growth.",
        "Security tried to kick them from a 24/7 space. Face ID sign-in bug on camera. 'I should not be showing our API keys' — zooms the key. 20:00 launch-week test; weekly $100 guaranteed (most matches, tie random); $10k if match all seven. Editor forgets they already filmed PostHog.",
    ],
    "atoms": [src(
        "A vlog can leak API keys and a waitlist-to-LinkedIn outreach in the same episode.",
        "Sunday 20:00 is a checkable clock they missed because they started at 19:55.",
        "Clock test → fail → slip a week. Key on camera. LinkedIn to a waitlist exec.",
        "On-tape: API key shown; LinkedIn to Wealthsimple; 19:55 miss.",
        "Steal clock-plus-rehearsal. Operate-never show keys, auto-book the meeting, new-email ToS dodge, lottery SKU.",
        concept="Rehearse the clock; never show the key",
    )],
    "C": ["They narrate process in public, including mistakes.", "Growth hire came from a poker table, not a hunt funnel we should copy this session.", "$1B in the title is aspiration."],
    "D": [
        "If a weekly job has a hard clock, rehearse before the minute.",
        "If an API key is on screen → rotate (theirs). Ours never get filmed.",
        "Waitlist → LinkedIn is outreach — parked.",
        "Do not create extra vendor accounts to dodge limits.",
    ],
    "E": [ex("Sunday 20:00 draw test", "Call at 19:55, not enough time", "Need seconds on the clock", "Slip a week", "Rehearse earlier")],
    "F": ["If a key is visible → secrets card.", "If LinkedIn to a named exec → send card / parked.", "If 'new email to dodge limits' → REJECT.", "If $100/$10k lottery → not a hive SKU."],
    "G": ["Field would cut the key leak. They left it in — we treat that as the lesson."],
    "H": ["$1B / $100 / $10k / $150 poker UNVERIFIED.", "Wealthsimple name is a person — do not hunt.", "Betting-adjacent weekly draw — steal-sheet kill betting helpers."],
    "I": ["Did they rotate the key?", "What is the product legally?"],
    "J": ["SYSTEM SYNTHESIS → secrets are Tier-3 · `ask-principal` · `playbook-before-send`.", "Kill: betting / prediction as SKU. Montreal is our city — still parked."],
    "K": ["Clock-rehearsal for any Sunday job. Unassigned. Lottery never."],
    "machines": [{
        "name": "Rehearse the hard clock; keys never on camera",
        "loop": "name the deadline → dry-run early → if fail, slip → never film secrets → outreach is a card",
        "qs": "When is the clock? Is a key visible? Is this a send?",
        "qf": "Waitlist celebrity is not a reason to unpark. New-email limit dodge is a no.",
        "proc": "No PostHog as ours. No LinkedIn send. No lottery product.",
        "ex": ex("API key on the desk", "He says he should not show it, camera zooms", "Vlog", "Key leaked", "That's the never"),
        "why": "The useful machine is the missed 20:00 rehearsal. The payload is the leak and the LinkedIn.",
        "never": "Show secrets. Auto-send LinkedIn. Book the Wealthsimple meeting. Lottery/betting SKU. Extra-email ToS dodge. Unpark Montreal hunt because the vlog is local.",
        "hive": "`ask-principal` · `playbook-before-send` · secrets as Tier-3",
    }],
    "L": "Local vlog, clients still parked. ACTION = REJECT key-on-camera and LinkedIn. Steal the early clock rehearsal. Not a Path A. No book.",
}

TAKES["XTBWVVcF3Pk"] = {
    "title": "How I Make Opus Think Like Fable (5 easy steps)",
    "speaker": "Nate Herk | AI Automation",
    "kind": "model-routing",
    "words": 2472,
    "A": [
        "Spent 'a few thousand' UNVERIFIED on Fable credits. Model is not the moat: Karpathy + Sonnet 3.7 beats a beginner + Fable because of instruction/systems/loops.",
        "Dynamic workflows: all-Fable vs Fable+Opus vs Fable+Sonnet — results about the same, Fable-all costs exponentially more. Keep the process, not the model.",
        "Treat the expensive model as teacher/officer, not workhorse: extract how it thinks; cheaper models execute. Leaked Fable system prompt (on-tape): memory ≠ current knowledge — verify; implied file ≠ file exists; address ambiguous query then ask; one question max; acknowledge misses; effort 1 / 3–5 / 5–10 by depth.",
        "Blog chart: Fable-low ≈ Opus-high. Higher effort can overthink and get worse. Extract the Fable method into a skill ('Fable mode') so Opus/Sonnet can run it. Loved deliverable → ask what it thought / how it proved it → skill.",
        "Five gates: scoping, evidence, attacking (devil's advocate / unknowns), verifying before declaring done, reporting/calibrating. Fable plans + thinks what can go wrong; Sonnet executes and reports back — same quality, cheaper. Skill in free Skool; he says you can build it yourself. Routing table: cost / intelligence / taste; delegate Codex/open-source. Test: Opus orchestrator + Haiku scouts ~3× cheaper, same result. Close: we don't own models; own processes/systems; maybe hardware/local. Fable will leave subs and 'come back' — UNVERIFIED.",
    ],
    "atoms": [src(
        "Keep the process (five gates), not the expensive model. Verify before done. Higher effort can make it worse.",
        "All-Fable and Fable+Sonnet matched; Opus+Haiku matched 3× cheaper.",
        "Teacher extracts method → skill with five gates → cheap workers → verify-exists.",
        "On-tape: scoping/evidence/attacking/verifying/reporting; 3× cheaper same result.",
        "Steal five gates + routing table. Operate-never Fable/Claude/Skool skill download, quote thousands/3× as FACT.",
        concept="Five gates + cheap workers",
    )],
    "C": ["Intelligence without a system loses to a weaker model with a system.", "Officer vs employee is a routing metaphor.", "Leaked prompts are research, not something we paste into prod."],
    "D": [
        "Ask: does this task need the expensive brain or a written process?",
        "Verify files exist. Do not trust memory.",
        "One clarifying question max after a first pass.",
        "Do not install Fable. Do not pay 'a few thousand' to play.",
    ],
    "E": [ex("All-Fable vs Fable+Sonnet dynamic workflows", "Same quality, Fable-all much more spend", "Routing", "Keep the process", "Spend is the never")],
    "F": ["If results match on a cheaper model → do not pay up.", "If a file is implied → check it exists.", "If a prompt was leaked → do not paste it as ours.", "Effort default → consider a lower tier first."],
    "G": ["Field maxes the new model. He uses it as a teacher and then demotes."],
    "H": ["Few thousand / exponentially more / chart scores UNVERIFIED.", "Leak may be unauthorized — we do not reproduce the prompt body.", "Claude/Fable on-tape."],
    "I": ["What are the remaining named five steps after the chart?", "Did he publish the extracted process as a skill?"],
    "J": ["SYSTEM SYNTHESIS → `golden-test-loop` · `slice-build` · Cursor+Grok (we already refuse the vendor).", "Sibling loops: `EuzYhzB0vbI`."],
    "K": ["Teacher-then-cheap-execute as a spend control. Keep."],
    "machines": [{
        "name": "Expensive brain writes the process; cheap run + verify-exists",
        "loop": "hard task → optional teacher pass → write process → cheaper execute → check files/facts exist → Evens if send/spend",
        "qs": "Do we need the expensive model? Does the file exist? What effort?",
        "qf": "All-expensive swarm is a no. Leaked prompt as prod is a no.",
        "proc": "Stay on Cursor+Grok. No Fable credits. No leak-paste.",
        "ex": ex("Fable-all vs mixed", "Same artifact, higher bill", "Routing", "Process kept", "Bill is HITL"),
        "why": "He measured same output for more money. That is the routing proof.",
        "never": "Fable/Claude as stack. Quote thousands as FACT. Paste leaked system prompts. Auto-upgrade effort.",
        "hive": "`golden-test-loop` · `ask-principal` (spend) · Cursor + Grok",
    }],
    "L": "Five gates (scope/evidence/attack/verify/report) are stealable as a card checklist. ACTION = REJECT Fable spend and Skool skill grab. We already own processes in the repo. Clients parked.",
}


def main():
    n = 0
    for vid, t in TAKES.items():
        write_one(vid, t)
        n += 1
        print("wrote", vid)
    print("batch5", n)


if __name__ == "__main__":
    main()
