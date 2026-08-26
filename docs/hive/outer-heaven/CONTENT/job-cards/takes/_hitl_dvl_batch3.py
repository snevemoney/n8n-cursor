#!/usr/bin/env python3
from _hitl_dvl_writer import write_one

def src(claim, why, mech, ev, act, **kw):
    return {"concept": kw.pop("concept"), "claim": claim, "why": why, "mech": mech, "ev": ev, "act": act, **kw}

def ex(sit, act, why, out, les, name="On-tape run"):
    return {"name": name, "sit": sit, "act": act, "why": why, "out": out, "les": les}

TAKES = {}

TAKES["J_jswzXhYJA"] = {
    "title": "GPT 5.6 Sol Made This Entire Video",
    "speaker": "Nate Herk | AI Automation (plus on-tape Soul narrator)",
    "kind": "short walk-away video + Nate coda",
    "words": 1137,
    "A": [
        "Cold open: he gave GPT-5.6 Soul one prompt, walked away; video looks/sounds like Nate. Soul (in Codex Ultra) claims it controlled every word, cut, motion graphic, QC.",
        "Soul narrator: OpenAI Saul/Soul Broadley July 9; Ultra coordinates four agents; needed 11 Labs, HeyGen, Hyperframes. Benches: Terminal Bench 91.9% Ultra vs 85.6% 5.5; browse 92.2% — UNVERIFIED. 13-task local test 97% / 7 wins 5 ties 1 loss — does not prove it wins everything.",
        "Voice: script chunks <60s for clone consistency; 11 Labs authorized voice; HeyGen avatar; browser automation to force Avatar V because API would not lock the engine; Hyperframes mapped visuals to phrases; kept avatar visible.",
        "Break-own-work: separate agents inspect frames, entrances/exits, text-out-of-frame, avatar never disappears, claims vs release notes. Fail → fix → re-render → review.",
        "SOURCE: 'Nate supplied one prompt and authorized his voice and avatar. He did not record, edit, or review this before you did.'",
        "Nate coda: 3M tokens / 2.5h suspicious; log inspect → ~9 extra agents, ~450M tokens, main ~86M, ~$300 if API — UNVERIFIED. Ultra overthinks/over-delegates; he usually will not move effort above high. Vague prompt + delegation + verification; then iterate/skills/feedback. Like/subscribe.",
    ],
    "atoms": [src(
        "A walk-away production can publish a clone-voice video the human never reviewed.",
        "He authorized voice/avatar and skipped review. Ultra multiplied tokens via extra agents.",
        "One prompt → Ultra delegates → 11Labs/HeyGen/Hyperframes → self-QC → upload-ready without Nate review.",
        "Direct: he did not review this before the audience did. Coda: Ultra over-delegates; don't go above high.",
        "Steal chunk-voice + fail-frame-rerender + effort-cap. Operate-never walk-away publish / clone-voice without Evens / Ultra-as-default.",
        concept="Walk-away clone video is publish without HITL",
    )],
    "C": ["Holding the outcome while tools change is the model's job; holding publish is the human's — he skipped it.", "More effort ≠ better; Ultra can be waste.", "Benches are partial; a finished video is the test he prefers."],
    "D": [
        "If clone voice is used: authorize, then Evens watches the cut before upload.",
        "Chunk TTS <60s. Fail-frame loop is OK as QC, not as auto-upload.",
        "Cap effort at high. Inspect logs before believing token UI.",
        "11Labs / HeyGen / Codex / Soul stay on-tape.",
    ],
    "E": [ex("One prompt, walk away", "Ultra + clone voice + avatar + Hyperframes + self-QC", "Show Soul long-horizon", "Video posted; Nate says he did not review it first", "Self-QC is not Evens")],
    "F": ["If the human has not watched the cut → do not upload.", "If effort is Ultra → expect over-delegate; card the spend.", "If token UI and logs disagree → believe neither as FACT.", "If clone voice is authorized → still a publish card."],
    "G": ["Field celebrates one-prompt YouTube. He did it — this desk treats that as the incident, not the SKU."],
    "H": ["$300 / 450M / 3M / 91.9% / 97% all UNVERIFIED.", "Vendor names on-tape. 'Saul' vs 'Soul' ASR noise."],
    "I": ["Did YouTube get the file without a human click? Tape says he didn't review.", "What was the one prompt?"],
    "J": ["Sibling walk-away: `ONmaDdOBGig` Fable. QC analog: `golden-test-loop` · `click-live-site`.", "SYSTEM SYNTHESIS → `ask-principal` on publish.", "Kill: other AI vendors as stack."],
    "K": ["Fail-frame QC for Creative later. Unassigned. Clone-voice policy later if Evens asks."],
    "machines": [{
        "name": "Chunk + fail-frame QC (publish stays HITL)",
        "loop": "prompt → produce → chunk voice → render → inspect frames vs a checklist → fix → Evens watches → publish card → stop",
        "qs": "Did Evens watch? Effort cap? Clone authorized? Spend?",
        "qf": "Walk-away is not a quality argument. Self-QC is not APPROVE.",
        "proc": "No Codex/Soul/11Labs/HeyGen install. No Ultra default. No upload from 'done.'",
        "ex": ex("Soul video", "Nate did not review before audience", "One prompt", "Finished YouTube file", "That sentence is the never"),
        "why": "He names the skip. The skip is why this desk exists.",
        "never": "Walk-away publish. Clone-voice live. Ultra spend without a card. Quote $300/450M as FACT. Install Soul/Codex.",
        "hive": "`ask-principal` · `golden-test-loop` · `click-live-site` · `clip-factory`",
    }],
    "L": "Exhibit A for publish-without-review. ACTION = REJECT upload until Evens watches. Token/bench numbers UNVERIFIED. Clients parked. No vendor install.",
}

TAKES["ONmaDdOBGig"] = {
    "title": "Claude Fable 5 Made This Entire Video By Itself.",
    "speaker": "Nate Herk | AI Automation (plus on-tape Fable narrator)",
    "kind": "walk-away video + Nate coda",
    "words": 1364,
    "A": [
        "Opened Claude Fable, /goal, went to the gym, came back to a finished video. Avatar/voice/script all Claude; he never saw a frame while it was made.",
        "Fable 5 = first Mythos-class on a paid plan (was security-partner locked). Stripe months→days; 50M-line Ruby day migration; screenshot→web app; Pokémon Fire Red on raw screens; file memory + Slay the Spire 3× Opus 4.8 — all UNVERIFIED vendor/story.",
        "Price $10/$50 per M tokens UNVERIFIED. How: read announcement, fact-check, voice playbook from his transcripts; 11Labs clone in <60s chunks (drift); HeyGen Avatar 5 (Playwright when API lacked it); FFmpeg stitch; word-level timing; GSAP/HTML in Hyperframes; frame review until pass.",
        "Nate: copy-the-prompt will not match — he has Hyperframe skills. Doesn't need Fable; could replicate with Sonnet now that the skill exists. Session ~1h, ~380–400k tokens, max plan, sub-agents not Fable. Ate ~40% of $200/month in one hour — be careful. 'Done, ready to upload.'",
        "Goal prompt (paraphrase): stop only when 100% confident; YouTube reputation risk; after build, dynamic workflow to visually verify motion timing, bounds, aesthetic, fully vetted video. HeyGen even copied his outro.",
    ],
    "atoms": [src(
        "A /goal that says 'stop when 100% confident' plus reputation-risk context still produced a ready-to-upload without him watching.",
        "He warns the run ate ~40% of a $200 plan and that copy-prompt without his skills will not reproduce.",
        "/goal + gym → research/script/voice/avatar/edit/verify → 'ready to upload.'",
        "On-tape: never saw a frame; 40% of plan; ready to upload; stop-when-confident instruction.",
        "Steal verify-workflow + reputation-in-the-goal. Operate-never gym-publish / 100%-confident as Evens / Fable as stack.",
        concept="/goal confidence is not Evens",
        conf="low on $ and benches — UNVERIFIED",
    )],
    "C": ["Context (why it matters / reputation) steers /goal better than a dry objective — and can still skip the human.", "Skills already in the repo are the real moat, not the model name.", "Max effort + verify agents burn the plan."],
    "D": [
        "Put reputation risk in the goal so QC is stricter — then still require Evens to watch.",
        "Chunk voice <60s. Frame-verify. Do not treat 'ready to upload' as upload.",
        "If a run will burn a large % of a monthly cap → money card first.",
        "Claude/Fable/11Labs/HeyGen on-tape only.",
    ],
    "E": [ex("Gym + /goal", "Fable builds and self-verifies a YouTube video", "Show Mythos-class long horizon", "Ready to upload; 40% of $200 plan", "Ready-to-upload is the never")],
    "F": ["If the agent says done/ready to upload → card, do not publish.", "If copy-prompt is offered → refuse; skills won't transfer.", "If $200 plan % is large → stop the next run.", "100% confident is a model state, not APPROVE."],
    "G": ["Field wants walk-to-the-gym autonomy. He did it and then warned about the bill — this desk holds both publish and pay."],
    "H": ["$10/$50 per M, $200 plan, 40%, 400k tokens, Stripe/Pokémon/Slay claims UNVERIFIED.", "Mythos/Glasswing on-tape."],
    "I": ["Did he actually upload this cut or only show it?", "Which Hyperframe skills were load-bearing?"],
    "J": ["Sibling: `J_jswzXhYJA` Soul walk-away. Mythos explain: `dYrrEKXtttk`.", "SYSTEM SYNTHESIS → `ask-principal` · `golden-test-loop` · `paid-slice` (spend)."],
    "K": ["Reputation-in-the-goal as QC language. Keep. Gym-publish never."],
    "machines": [{
        "name": "Goal + verify loop (upload stays HITL; spend stays HITL)",
        "loop": "write goal with reputation context → produce → visual verify → Evens watches + sees spend → publish/pay cards → stop",
        "qs": "Did Evens see a frame? What % of the plan? Ready-to-upload?",
        "qf": "Gym time is not a gate. 100% confident is not a gate.",
        "proc": "No Fable/Claude Code. No 11Labs. No auto-upload. Money card before a max-effort verify farm.",
        "ex": ex("Went to the gym", "Came back to a finished video", "One /goal", "40% of monthly plan", "The bill is the second never"),
        "why": "He put verify in the goal and still skipped himself. We steal verify and add Evens.",
        "never": "Walk-away publish. Quote $200/40%/$10/$50 as FACT. Install Fable. Treat ready-to-upload as publish.",
        "hive": "`ask-principal` · `golden-test-loop` · `clip-factory`",
    }],
    "L": "Two cards: publish (watch the cut) and pay (token burn). /goal confidence is REJECT as approver. Clients parked. No Claude Code.",
}

TAKES["i4Q8wHZNPBU"] = {
    "title": "The AI Second Brain Lie (Obsidian + Claude Exposed)",
    "speaker": "on-tape operator (not Nate; anti-hype)",
    "kind": "talking-head teardown",
    "words": 1529,
    "A": [
        "Feed is full of Obsidian+Claude 'alive brain' / Jarvis demos and fake MRR staircases (30k→100k→150k→550k→700k→200k→15k).",
        "Founder friend stopped selling to set up Obsidian because 'Claude has no brain otherwise.' Graph animate is theater: nodes say readme↔file, no business insight. Same as VS Code files; Obsidian has no in-pane Claude chat he saw. Cloud vault ≈ Notion.",
        "Viral Reddit: 300k saw 'I don't understand the hype / agentic OS.' Cost is time on a trending unnecessary tool.",
        "What moved his needle: automations — Skool posting, invoices/payouts → Drive → bookkeeping, n8n workflows in one agency-OS folder, SaaS ideas, strategy, agency site. No graph.",
        "Jarvis voice brief (1.2M views / 8400 signups / 45 shorts — UNVERIFIED demo): top comment 'how much are you spending for the update?' Voice AI expensive unless replacing a real person (clinic injections — he calls that a good case). Prefer a short text update.",
        "Second brain: as many no-token automations as possible; use AI to build the automation, then let code run. Day 7 already 74% of agentic-coding limit. Careful prompting. Offers a future deep dive.",
    ],
    "atoms": [src(
        "A folder of automations that run without an agent is the second brain. The pretty graph is not.",
        "Voice OS is a spend unless it replaces a human in a real role. Fake MRR is a reason to distrust the genre.",
        "Hype graph → waste time; folder + no-token jobs → bookkeeping/posts/site in one place.",
        "On-tape: graph is nonsense; 74% limit by day 7; Skool auto-post as his 'value' example.",
        "Steal folder-not-graph + cheap automations. Operate-never Obsidian theater, Jarvis, Skool auto-post, fake MRR as proof. His Skool post is a never we still learn from.",
        concept="Folder + no-token jobs, not a living graph",
    )],
    "C": ["Time on trending tools is the real cost.", "AI should write the automation; the automation should not be an agent every morning.", "Voice is for replacement of a costly human role, not a status demo."],
    "D": [
        "Put work in a folder. Skip the graph.",
        "Prefer code/cron that downloads receipts over an agent that narrates them.",
        "If voice is proposed, ask what human it replaces. Clinic-class maybe; morning brief no.",
        "Do not auto-post Skool. Do not chase MRR screenshots.",
    ],
    "E": [ex("Friend stopped selling to animate Obsidian", "He calls the graph nonsense; uses a folder of automations instead", "Hype vs needle", "Invoices to Drive to bookkeeper; burned 74% limits by day 7", "Cheap jobs stolen; Skool auto-post rejected")],
    "F": ["If the demo is a graph animation → ignore.", "If MRR jumps on a thumbnail → UNVERIFIED / likely fake.", "If a job can be code without tokens → do not use an agent.", "If voice brief is for vanity stats → REJECT."],
    "G": ["Field sells agentic OS as Obsidian+Claude. He says that is misleading and VS Code/folder is enough."],
    "H": ["300k Reddit, 74%, 1.2M views, MRR ladder all UNVERIFIED.", "Skool/Claude/Obsidian on-tape.", "Speaker ≠ Nate — still learn globally."],
    "I": ["What is his actual invoice parser?", "Does 'provision n8n from the folder' include send?"],
    "J": ["SYSTEM SYNTHESIS → `wiki-ingest` · `context-docs` · steal-sheet kill 8k-node Obsidian theater.", "SYSTEM SYNTHESIS → `invoice-email-automation` (download, not agent-narrate).", "Voice: `ask-principal`."],
    "K": ["No-token-first rule for hive OS. Keep."],
    "machines": [{
        "name": "Folder of cheap automations (no graph, no Jarvis, no auto-post)",
        "loop": "name a repeating job → if it can be code/cron, build that → AI used once to write it → run without tokens → Evens if send/post",
        "qs": "Does this need an agent every time? Is there a graph for show? Does it post?",
        "qf": "Living brain / Jarvis is a no. Fake MRR is a no.",
        "proc": "Hive already has packets + wiki. Do not install Obsidian. Do not auto-post Skool. Voice brief REJECT unless Evens names a clinic-class replace.",
        "ex": ex("Invoice/payout download to Drive", "Code, not a daily agent", "Save tokens", "Bookkeeper gets files", "Cheap job stolen; Skool post not operated"),
        "why": "He burned 74% of a limit on agentic coding by day 7. The lesson is spend discipline + no theater.",
        "never": "Obsidian graph OS. Jarvis voice. Skool auto-post. Quote MRR ladder as FACT. Claude as hive brain.",
        "hive": "`wiki-ingest` · `invoice-email-automation` · `ask-principal` · `send-removed`",
    }],
    "L": "Upgrade knowledge: second-brain hype is a time tax. ACTION = REJECT graph/Jarvis/auto-post. Invoice-to-folder is stealable as a cheap job. Clients parked. His Skool is not ours.",
}

TAKES["c0kaKxM2pHg"] = {
    "title": "The Skill That 10x’d My Claude Code Projects",
    "speaker": "Nate Herk | AI Automation",
    "kind": "skill walkthrough",
    "words": 1854,
    "A": [
        "Hard part of an AI OS is extraction — same model (Opus 4.8) + no taste/voice/decisions = same output. Discovery/scoping questions annoy clients but move 80%→95% success (UNVERIFIED %).",
        "Skill 'grill me' (Matt Pocock, 4–5 sentences): interview relentlessly; walk the design tree; recommend an answer; one question at a time; if the codebase can answer, look there instead. A skill can be a prompt you refuse to retype.",
        "His fork: checkpoint after every answer into `brainstorms/` markdown (Q&A log, decisions, highlights) because a 1h+ grill fills the window and he was manually saying 'write this to a doc.'",
        "End of packaging grill: skill notices packaging guide + skill lack the new nuance → asks to update both → he says yes. Also grilled 'everything about the business.' Flags gaps that need a real stakeholder.",
        "Chart: old way 70%→75% per iteration to ~95% never 100%. Grill-me aims ~90% on iteration one. Axe: 6 hours, 4 sharpening.",
        "CTA: Pocock version or his free Skool classroom. Demo: 'grill me about applying AI internally in a safe way that won't damage the business' → capture file + open flags.",
        "Re-grill when a breakthrough happens. Like/subscribe.",
    ],
    "atoms": [src(
        "Relentless one-at-a-time questions plus a checkpoint file beat a 5-minute dump.",
        "The skill asks to update docs; the human says yes. Gaps that need a stakeholder get flagged, not invented.",
        "Ask → answer → write brainstorms/ → next question → optional update of skill/guide on yes.",
        "On-tape Pocock prompt + his checkpoint fork + stakeholder flags + Skool CTA.",
        "Steal grill+checkpoint. Operate-never Skool join, auto-update live skills, 10x/95% as FACT. Claude on-tape.",
        concept="Grill then checkpoint; do not invent stakeholder knowledge",
    )],
    "C": ["First-try dump is never enough. Sharpen the axe.", "Skills stay living; 100% is a lie because the business moves.", "Safe internal AI is a grill topic — damage-the-business is in the prompt."],
    "D": [
        "One question at a time. Recommend an answer. Search the repo before asking.",
        "After each answer, write the file. Flag humans you must ask.",
        "Do not update a skill/guide until Evens says yes.",
        "Do not join Skool for the file. Recreate the 5-line prompt locally if needed — do not auto-write SKILL.md this session.",
    ],
    "E": [ex("Packaging process in his head", "Grill + checkpoint; skill asks to update guide+skill; he says yes", "Dump was not enough", "Docs better; flags for other operators", "Yes is HITL on the update")],
    "F": ["If a 5-minute dump is the plan → refuse; grill.", "If the model wants to update a skill → card.", "If a flag names a stakeholder → ask that human, do not guess.", "10x in the title → UNVERIFIED."],
    "G": ["Field ships a skill from a dump. He interviews until shared understanding."],
    "H": ["80/95/70/90% and 10x UNVERIFIED.", "Skool / Claude / Pocock on-tape."],
    "I": ["How does it know to stop? 'Until you feel shared knowledge.'", "Does checkpointing survive a /clear?"],
    "J": ["SYSTEM SYNTHESIS → `session-bootstrap` · `discovery-spiced-constraint` · `context-docs` · `agent-job-card`.", "Do not auto-write SKILL.md (steal-usecases rule)."],
    "K": ["Grill-me as a parked packet name mapping to session-bootstrap. Keep."],
    "machines": [{
        "name": "Relentless interview + checkpoint file (skill update is HITL)",
        "loop": "invoke grill → one Q → answer → write brainstorms/ → flag unknowns → Evens approves any skill/guide write → stop",
        "qs": "Can the repo answer this? Who is the stakeholder? Update the skill?",
        "qf": "A 5-minute dump is not shared understanding. Skool is not required.",
        "proc": "Local markdown only. No Skool. No Claude. No silent SKILL.md rewrite.",
        "ex": ex("Packaging grill", "Checkpoint then ask to update both docs", "Window would forget", "He said yes", "The yes is the gate"),
        "why": "He added checkpoint because the long grill was losing answers. That is wiki-ingest mid-interview.",
        "never": "Join Skool. Auto-write skills. Quote 10x/95% as FACT. Grill a parked client.",
        "hive": "`session-bootstrap` · `context-docs` · `discovery-spiced-constraint` · `ask-principal`",
    }],
    "L": "Steal the interview+checkpoint. ACTION on any skill rewrite = Evens. Do not download from Skool. Safe-internal-AI prompt is our kind of grill — still no send. Clients parked.",
}

TAKES["-nG-9vlSkho"] = {
    "title": "Anthropic Just Dethroned OpenAI. Here's What Happens Next.",
    "speaker": "Nate Herk | AI Automation",
    "kind": "commentary",
    "words": 1874,
    "A": [
        "Article: Anthropic passed OpenAI in business adoption (April). Same morning: Altman tweets 2 months free Codex for companies switching from Claude Code (30-day try). ~45 min later Claude: weekly limits +50% through July 13.",
        "He is making a Codex vs Claude Code video later. Frame: 'free sample phase.' $200/month Claude output vs $5–15k engineer — UNVERIFIED. Orgs would feel pain if agents vanished.",
        "INFERENCE he labels: you are not the customer, you are the training data. They need adoption + data more than $200. Altman old tweet: losing money on Pro. API would be 5–25× subscription — UNVERIFIED.",
        "Adoption numbers 3.8% / 34.4% vs 2.9% / 32.3% UNVERIFIED. Article: Anthropic incentives misaligned (more tokens / expensive models). People say Claude got worse; compute stability issues.",
        "Pattern: land grab → habit → competition thins → reset (Facebook ads, AdWords, Uber, DoorDash, Netflix, AWS) — he says not exact. Joke: he will not charge per YouTube video.",
        "Advice: use the sample; he does not fully agree with 'use it like crazy' because open-source gets cheaper. Build portable projects that can move Codex → Claude Code → Hermes → OpenClaw in ~an hour if one vendor vanishes.",
        "Close: maybe $200 is 12–24 months of deception from real prices — he says he does not know that is true. Don't panic; try both. Unclear what 'company' qualifies for free Codex.",
    ],
    "atoms": [src(
        "Vendor promos are a land grab. The durable move is a portable project, not a cheaper month.",
        "He separates article metrics (cited) from his deception-price opinion (not fact).",
        "Two tweets → free-sample thesis → portability rule.",
        "On-tape: 'you're not the customer, you are the training data' as feeling, not fact; portability win condition.",
        "Steal portability + epistemic humility. Operate-never install Codex/Claude/Hermes/OpenClaw. Quote adoption % / $200 as FACT.",
        concept="Portable project beats vendor war",
        ep="SOURCE on portability; INFERENCE labeled by him on training-data",
    )],
    "C": ["Overwhelm/panic is the wrong read of a promo war; it's a blessing to try both — still not our stack.", "Habits should survive a vendor disappearing.", "He invites disagreement; he is not claiming 100% fact except the metrics he read."],
    "D": [
        "Do not panic-switch stack.",
        "If a project cannot move in an hour, it is too coupled — fix that in Cursor, not by buying both vendors.",
        "Label tape $ and adoption % UNVERIFIED.",
        "Do not sign up for free Codex as a 'company.'",
    ],
    "E": [ex("Two promo tweets the same morning", "He writes a free-sample + portability note instead of picking a winner", "Avoid overwhelm", "Use both / move in an hour", "Portability stolen; we still pick Cursor+Grok only")],
    "F": ["If a vendor offers free months → not a reason to install.", "If a project is glued to one CLI → treat as risk.", "If he says 'I don't know if that's true' → keep it opinion.", "If $200 vs $15k engineer → UNVERIFIED."],
    "G": ["Field picks a side in the war. He picks portability and admits uncertainty."],
    "H": ["All adoption %, $200, 5–25×, 12–24 month deception UNVERIFIED or opinion.", "Hermes/OpenClaw named as future hops — still not ours."],
    "I": ["What qualifies as a company for free Codex? He doesn't know.", "What does 'move in an hour' include — secrets, prompts, evals?"],
    "J": ["SYSTEM SYNTHESIS → stack rule Cursor+Grok. `slice-build` portable folders.", "Sibling pricing promo: `dYrrEKXtttk` Fable window."],
    "K": ["Portability hour-test as a future hive check. Unassigned."],
    "machines": [{
        "name": "Portable folder (ignore the promo war)",
        "loop": "vendor tweets → do not install → ask 'can this repo move in an hour?' → if no, decouple → stop",
        "qs": "Are we coupled to one CLI? Is this a pay event?",
        "qf": "Free month is not APPROVE. Training-data thesis is not a hunt.",
        "proc": "Stay on Cursor+Grok. No Codex/Claude signup. No OpenClaw.",
        "ex": ex("Codex free vs Claude +50% limits", "Write portability rule", "Don't panic", "Hour-move win", "Win is ours without their CLIs"),
        "why": "He says the win is surviving a vendor disappearing. We already chose a stack; we steal the win condition.",
        "never": "Install Codex/Claude/Hermes/OpenClaw. Quote 34.4% / $200 / 12–24 months as FACT. Pay to 'try both.'",
        "hive": "Cursor + Grok · `slice-build` · `ask-principal` (no pay)",
    }],
    "L": "No signup card except REJECT. Steal portability as a reason to keep hive work in the repo, not a vendor CLI. Clients parked.",
}

TAKES["dYrrEKXtttk"] = {
    "title": "Claude Mythos is Finally Here.",
    "speaker": "Nate Herk | AI Automation",
    "kind": "launch commentary",
    "words": 2023,
    "A": [
        "Fable 5 everywhere today; Mythos 5 Glasswing-only. Both $10 in / $50 out per M, 2× Opus UNVERIFIED. Fable on Pro/Max/Team/enterprise at no extra until June 22; June 23 usage credits; they hope to restore when capacity allows. They filed to go public / not profitable / giving models away cheaper than cost — his read.",
        "Play Fable hard for ~2 weeks. /model after update. Blog: Mythos-class above Opus; Mythos preview April via Glasswing; Mythos 5 = Fable 5 with cyber safeguards lifted for Glasswing/US-gov defenders. Preview was 5× Opus; this is 2× — not full capability. His older prediction: no public Mythos button; capability bakes into Opus quietly — he says that aged well.",
        "Models are neutral; human intent. Mythos cyber strongest but dual-use. Benches jump vs Opus 4.8 / GPT 5.5 UNVERIFIED; he no longer trusts SWE-Bench Pro (deep SWE debunk). Agentic loops: vendors want token burn; most knowledge work does not need always-on loops; open-ended prompt begs a session-limit hit.",
        "Opus 4.8 X-high ≈ Fable low (cheaper) — his mapping. Excited for knowledge-work OS + vision verify (edit video, decks, sites). Don't regurgitate the blog. Watch the June 22 cliff.",
    ],
    "atoms": [src(
        "A safer public twin (Fable) and an unsafeguarded twin (Mythos) are the same weights with different gates.",
        "Always-on agent loops are what the vendor wants; most work does not need them.",
        "Promo window → then credits. Loops → session limit.",
        "On-tape: Glasswing-only Mythos; don't loop just to loop; June 22 cliff.",
        "Steal loop-discipline + treat vendor 'autonomous longer' as a spend warning. Operate-never Mythos/Fable/Claude Code. No cyber-unsafeguarded model.",
        concept="Same model, different gate; loops are a spend",
    )],
    "C": ["Safety gate is a product, not a footnote.", "Bench slides are salt; vision-for-verify is what he actually wants.", "He is fine being clowned for a prediction if the structure holds."],
    "D": [
        "Do not run always-on loops because the blog says the model can.",
        "Do not apply for Glasswing. Do not lift cyber safeguards.",
        "Promo windows are not a reason to install.",
        "If someone says 'don't prompt, loop' → ask whether the job needs it.",
    ],
    "E": [ex("Mythos-class launch", "He separates Fable (public, gated) from Mythos (defenders, safeguards lifted)", "Don't wait for a Mythos button", "Play Fable 2 weeks (his advice)", "We do not play; we steal the gate idea")],
    "F": ["If the model is unsafeguarded → never ours.", "If a loop has no checkable stop → REJECT.", "If June 22 / $10/$50 appear → UNVERIFIED dates/prices.", "If SWE-Bench is the pitch → he already discarded it."],
    "G": ["Field waits for a Mythos button or starts loop-farms. He predicted a quieter bake-in and warns loops are a bill."],
    "H": ["All $ and benches UNVERIFIED. Glasswing/US-gov on-tape.", "Dates may be stale at ingest."],
    "I": ["What did deep SWE debunk exactly?", "Is Fable-low actually cheaper in the product UI?"],
    "J": ["Siblings: `ONmaDdOBGig` walk-away Fable; `lkR6mvqQQlk` 'is Mythos coming?'; `-nG-9vlSkho` sample phase.", "SYSTEM SYNTHESIS → `coverage-loop` (checkable stop, not always-on)."],
    "K": ["Vendor 'can run longer' → spend warning library. Keep."],
    "machines": [{
        "name": "No loop without a checkable stop (ignore the launch cliff)",
        "loop": "vendor launch → do not install → if a loop is proposed, name the stop → Evens if spend/publish → stop",
        "qs": "Is this Fable or unsafeguarded Mythos? What is the stop? Who pays after the promo?",
        "qf": "Longer autonomy is a no. Glasswing is a no.",
        "proc": "Cursor+Grok. Coverage-loop only with a scored stop. No Claude Code.",
        "ex": ex("Blog says work autonomously longer", "He says most knowledge work doesn't need it", "Token incentive", "Session limit if you open-end it", "Stop stolen; model not installed"),
        "why": "He names the incentive. Incentive is why loops must stay HITL.",
        "never": "Claude/Fable/Mythos. Lifted cyber gates. Always-on loops. Quote $10/$50/benches as FACT. Play-the-2-weeks as a hive task.",
        "hive": "`coverage-loop` · `ask-principal` · Cursor + Grok",
    }],
    "L": "Launch tapes do not change the stack. ACTION = REJECT install and always-on loops. Same-weights-different-gate is a mental model for classifiers ≠ Evens. Clients parked.",
}


def main():
    n = 0
    for vid, t in TAKES.items():
        write_one(vid, t)
        n += 1
        print("wrote", vid)
    print("batch3", n)


if __name__ == "__main__":
    main()
