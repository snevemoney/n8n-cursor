#!/usr/bin/env python3
from _hitl_dvl_writer import write_one

def src(claim, why, mech, ev, act, **kw):
    return {"concept": kw.pop("concept"), "claim": claim, "why": why, "mech": mech, "ev": ev, "act": act, **kw}

def ex(sit, act, why, out, les, name="On-tape run"):
    return {"name": name, "sit": sit, "act": act, "why": why, "out": out, "les": les}

TAKES = {}

TAKES["ZAaxx3qyT8g"] = {
    "title": "Claude Code Just Got an Agent Dashboard",
    "speaker": "Nate Herk | AI Automation",
    "kind": "feature walkthrough",
    "words": 2123,
    "A": [
        "Four Claude Code agents in one Agent View. Arrow/click into a session; yellow = needs input (approve plan or feedback); green = done.",
        "Replaces many VS Code terminal tabs + end-of-session recap. CLI-only; he pushes terminal over the friendlier extension. Left arrow = view; right = enter; `/bg` parks a session; type a task in the view to spawn; `claude --bg` from another directory for multi-project.",
        "`/goal` = Codex/Ralph-like loop until an objective; can run hours/overnight. Subjective '3D monster fighting game' is a bad goal; want a metric (Karpathy auto-research analog). Research preview: slow machine, truncated prompts, wrap in quotes.",
        "Ctrl-X twice kills. Space replies from the view: session asks to save two projects / LinkedIn post — he says no, demo only.",
        "If you don't see the value you aren't running Claude as an OS. CTA: 2.5h AIOS course.",
    ],
    "atoms": [src(
        "A yellow 'needs input' row is the HITL surface. Overnight `/goal` without a metric is a spend/publish risk.",
        "He refuses a LinkedIn-save from the dashboard. Subjective goals are the wrong /goal.",
        "Spawn/watch/need-input/reply-or-kill.",
        "On-tape: yellow needs input; space-reply 'no' to save LinkedIn; /goal overnight.",
        "Steal needs-input + metric-goal. Operate-never Claude dashboard, overnight unattended publish, auto-save LinkedIn.",
        concept="Needs-input is the card; overnight goal is not",
    )],
    "C": ["One pane over many tabs is ops hygiene, not autonomy.", "If you aren't multi-session you aren't using it as an OS — sales line for the course.", "CLI has more power; power is not permission."],
    "D": [
        "If a session needs input, that is a card (approve plan / reject save / kill).",
        "If /goal is used, name an objective metric. No overnight unattended on send/publish tools.",
        "Reply 'no' is allowed from a dashboard analog — silence is not yes.",
        "Claude Code / Codex stay on-tape. No 2.5h course buy.",
    ],
    "E": [ex("Session asks to save LinkedIn post", "He hits space and says no, demo only", "Needs input", "Session continues without save", "Dashboard reply is HITL")],
    "F": ["If status is needs-input → do not background it away.", "If /goal is subjective → refuse or rewrite to a metric.", "If overnight → no credentials that can send/post.", "Ctrl-X is reversible only if nothing shipped."],
    "G": ["Field wants unattended OS. He still stops to approve a plan and to refuse a LinkedIn save."],
    "H": ["Research preview bugs. Course length 2.5h UNVERIFIED.", "Monster-game /goal is a joke that the model called too ambiguous."],
    "I": ["Can Agent View approve a deploy?", "Does /goal stop on a publish file?"],
    "J": ["Siblings: `xsAOpqjebOo` needs approval; `ONmaDdOBGig` /goal gym-publish.", "SYSTEM SYNTHESIS → `input-required-gate` · `hive-spawn-desks` · `ask-principal`."],
    "K": ["Needs-input status as a Grok Bot analog. Unassigned."],
    "machines": [{
        "name": "One pane: needs-input → card (no overnight publish)",
        "loop": "spawn slice → watch status → if needs input, five-field card → if done, Evens reviews → stop",
        "qs": "Approve plan? Save/post? Kill? Is there a metric?",
        "qf": "Overnight /goal with social/save tools is a no.",
        "proc": "Cursor Tasks, not Claude Agent View. No LinkedIn save. No course checkout.",
        "ex": ex("LinkedIn save prompt in the view", "Reply no from the pane", "Demo", "Not saved", "The no is the steal"),
        "why": "He already treats yellow as 'waiting on me.' We keep that and forbid unattended world-actions.",
        "never": "Claude Code OS. Overnight /goal that can post. Auto-save LinkedIn. Buy the AIOS course.",
        "hive": "`input-required-gate` · `ask-principal` · `hive-spawn-desks` · `golden-test-loop`",
    }],
    "L": "Yellow/needs-input maps to ACTION/WHY/AGENT/RISK/REVERSIBILITY. Overnight loops with post/save = REJECT. Clients parked. No Claude.",
}

TAKES["kB9iMD0EjT8"] = {
    "title": "How to Use Your Claude Code Projects in Codex in 5 Mins",
    "speaker": "Nate Herk | AI Automation",
    "kind": "portability howto",
    "words": 2202,
    "A": [
        "Stuck in Claude Code, handed to Codex, solved, same project. Claude wants CLAUDE.md + .claude; Codex wants agents.md + .codex + .agents.",
        "Shared knowledge (docs, refs, scripts) is the same. Tool-specific: instruction file name, config folder, skills path. Skills markdown+YAML are the same; sub-agents markdown vs TOML. Codex sub-agents do not auto-invoke.",
        "Three layers: shared knowledge / skills / tool-specific config. Convert via NL: 'I built this in Claude; make agents.md from CLAUDE.md, .codex, skills in .agents, agents in .codex; research both docs.' Maintain both instruction files when one changes.",
        "HTML cheat sheet built by both; they can overwrite the same file — be careful. Session-handoff skill: summary, active files, decisions, next steps — paste into the other tool. Try both; pay two subs if you can; tool-agnostic if Claude is down. Terminal over extensions. Skool for HTML + handoff skill.",
    ],
    "atoms": [src(
        "Portability is shared files plus a handoff note. Two agents on one file can clobber.",
        "He already said the hour-move win in `-nG-9vlSkho`; this is the mechanism.",
        "Shared wiki → dual instruction files → handoff paste. Do not dual-write live.",
        "On-tape overwrite warning + session-handoff + Skool CTA.",
        "Steal shared-folder + handoff. Operate-never Codex/Claude install, dual-write prod, two-sub pay, Skool.",
        concept="Shared knowledge, tool-specific wrappers, one writer at a time",
    )],
    "C": ["Master one CLI and the other is a rename. Strengths differ; lock-in is the sin.", "AI can convert configs if you ask it to read both docs."],
    "D": [
        "Keep a vendor-neutral folder of decisions/refs.",
        "If two tools are open, do not edit the same file.",
        "Handoff = write a note, then the next human/agent reads it.",
        "Do not pay a second sub this session. Do not join Skool.",
    ],
    "E": [ex("HTML file styled by Claude, Codex restored lost value", "Both touched the same file", "Unstuck", "Works if you're careful", "Overwrite is the risk")],
    "F": ["If CLAUDE.md changes → update the portable twin only if we had one; we don't install Codex.", "If two agents share a file → lock or split.", "If Claude is down → Cursor still works; do not buy Codex for that story."],
    "G": ["Field picks a religion. He wants agnostic wrappers."],
    "H": ["5 minutes in the title UNVERIFIED. Skool free pack.", "Hermes named as whatever-comes-next."],
    "I": ["What are the five beginner trip-ups he didn't read?", "Does handoff include secrets?"],
    "J": ["SYSTEM SYNTHESIS → `-nG-9vlSkho` portability · `wiki-ingest` · `context-docs` · `session-bootstrap`.", "Stack stays Cursor+Grok."],
    "K": ["Handoff note format for desk switches. Keep."],
    "machines": [{
        "name": "Shared folder + handoff note (one writer)",
        "loop": "write vendor-neutral wiki → if switching desks, write handoff (files/decisions/next) → next desk reads → stop",
        "qs": "Who owns the file? Did we dual-write? Secrets in the note?",
        "qf": "Two paid CLIs is a no. Skool is a no.",
        "proc": "No Codex/Claude. Handoff is markdown in the repo. Evens if pay.",
        "ex": ex("Stuck in Claude", "Handoff paste into Codex", "Unstuck", "10-second fix claim", "Handoff stolen; Codex not installed"),
        "why": "Shared knowledge is the moat. Wrappers are disposable. Overwrite is the accident.",
        "never": "Install Codex/Claude. Pay two subs. Dual-write live. Join Skool. Quote 5 minutes as FACT.",
        "hive": "`wiki-ingest` · `context-docs` · `session-bootstrap` · Cursor + Grok",
    }],
    "L": "Portability is already our repo. ACTION = REJECT second-CLI pay. Handoff notes between Cursor desks are allowed. Clients parked.",
}

TAKES["4OOS96i2gfI"] = {
    "title": "AI Agents Are Overused. Here’s What to Build Instead",
    "speaker": "Nate Herk | AI Automation",
    "kind": "framework",
    "words": 2461,
    "A": [
        "Hundreds of agents/workflows = hundreds of mistakes. Four-layer pyramid: (1) custom GPT / Claude project / Gem — reactive intern, you must be in the loop; his setup-guide sticky after each n8n tutorial. (2) no-AI workflow — deterministic if/then, can run while you sleep (meeting done, 6am). (3) AI workflow — fixed order, AI for write/classify (email → support/finance/priority/promo). (4) AI agent — goal + tools + exceptions; cost/complexity/maintenance rise as you climb.",
        "Be a problem solver, not an agent builder. Often the answer is a simple automation, a project, or an existing SaaS. ~50% of business automations need no AI (UNVERIFIED). Don't start a first business install at the agent layer.",
        "Marketing Telegram agent: autonomy to pick tools, but each tool is a fixed workflow — hybrid. Decision tree: in the loop every time? → GPT. 100% logic? → workflow. Fixed order? → AI workflow. Else agent.",
        "Support exception: read → KB → reply looks like a workflow, but sometimes 0 KB searches or 5 — then agent. He still ends at 'respond to the email.' Plus community 3,000 + courses CTA.",
    ],
    "atoms": [src(
        "Start at the lowest layer that solves the problem. Agents are the expensive top.",
        "His own support example still replies — that payload is operate-never even when the tree says agent.",
        "Three questions → pick a layer. Climb only with evidence.",
        "On-tape tree + 50% no-AI + support reply path.",
        "Steal the pyramid and the three questions. Operate-never auto-reply, Plus/Skool, start-at-agent.",
        concept="Lowest layer that works; reply still HITL",
    )],
    "C": ["People ask for AI; the job is the root problem and a quick cheap win.", "You don't know what you don't know — layers can move after runs.", "Autonomy over a set of fixed tools is often enough."],
    "D": [
        "Ask: must a human be in every time? Are steps 100% logic? Is order fixed?",
        "Default no-AI. Add a classify step only if keywords fail.",
        "If the path replies to a customer → send-removed regardless of layer.",
        "Do not join Plus. Do not start a Path A at the agent layer.",
    ],
    "E": [ex("Setup guide after every YouTube template", "Custom GPT he iterates in-chat vs a brittle automation", "Needs revision loop", "Faster in the GPT", "In-the-loop is a feature")],
    "F": ["If they ask for an agent first → walk the tree.", "If 50% no-AI → try a filter before a model.", "If support 'respond' is on the canvas → card.", "If Plus 3,000 is the close → ignore."],
    "G": ["Field starts at agents. He says that is the common issue he coaches."],
    "H": ["Hundreds / thousands / 50% / 3,000 UNVERIFIED.", "Plus/Skool on-tape."],
    "I": ["When does he demote an agent after feedback?", "Does the support graph actually send?"],
    "J": ["SYSTEM SYNTHESIS → `slice-build` · `inbox-to-task-routing` · `outcome-offer-funnel` · `send-removed`.", "Sibling classify: `9mqsVK6Iqoc`."],
    "K": ["Pyramid as a default scoping card. Keep."],
    "machines": [{
        "name": "Three questions → lowest layer (send still a card)",
        "loop": "name the problem → in-loop? logic? fixed order? → pick GPT/workflow/AI-workflow/agent → if outbound, strip Send → Evens",
        "qs": "Must we be in the loop? Is it black-and-white? Does it email the customer?",
        "qf": "I need an agent is not a spec. Existing SaaS may win.",
        "proc": "Start cheap. No Plus. No auto-reply.",
        "ex": ex("Email classify", "AI workflow not a free agent", "Keywords fail", "Four buckets", "Router stolen; reply never"),
        "why": "Cost and maintenance climb the pyramid. Most first installs don't need the top.",
        "never": "Start-at-agent. Auto-reply support. Quote 50%/3,000 as FACT. Join Plus.",
        "hive": "`slice-build` · `inbox-to-task-routing` · `send-removed` · `ask-principal`",
    }],
    "L": "Put the three questions on scoping cards. Support reply remains REJECT. Plus CTA is never. Clients parked.",
}

TAKES["3QclAjmu5Tw"] = {
    "title": "Claude Just Solved Session Limits",
    "speaker": "Nate Herk | AI Automation",
    "kind": "news commentary",
    "words": 2483,
    "A": [
        "Anthropic × SpaceX compute; Code with Claude 2026 SF/London/Tokyo extra days. Quarter of outages from demand > compute.",
        "Effective immediately (on-tape): double Claude Code 5-hour limits (Pro/Max/Team); remove peak-hours reduction; Opus API rate limits up (he cites 30k→ much more input; 8k→80k output/min on a tier — UNVERIFIED). Also buying Amazon/Google/Broadcom/MS/Nvidia/Fluidstack; Goldman/Blackstone JV day before; 300 MW / 220k GPUs / orbital gigawatts interest — UNVERIFIED.",
        "Aside: TOS block on using the sub for OpenClaw/Hermes might also have been compute defense.",
        "Managed agents (webhooks, auto-dreaming, multi-agent) mentioned, not covered.",
        "Builder implications: (1) retest workflows that died on rate limits — LinkedIn infographic client, 3 months later new image model, he called and built; (2) maybe use Opus more if you were Haiku-rationing — context still matters; (3) 1M context more usable on API; (4) Claude Code behind production routines now that limits doubled; (5) multi-agent (five sub-agents × 50k) more viable.",
        "Signals: 5+ year compute bet; Claude Code flagship (not Cowork); community electricity-hike cover as trust play. Next: token-management video.",
    ],
    "atoms": [src(
        "A limit wall moving is a reason to retest, not a reason to auto-post or put Claude on production routines.",
        "He already has the LinkedIn-infographic story: he would not ship until the image model was good enough — then he called the client.",
        "Compute deal → higher limits → retest old jobs.",
        "On-tape: double 5h; LinkedIn wait-then-call; production-routines now 'viable.'",
        "Steal wait-until-the-model-is-good + retest. Operate-never Claude production routines, LinkedIn auto-post, quote MW/GPUs as FACT.",
        concept="Retest when the wall moves; do not promote to prod send",
    )],
    "C": ["Outages were demand, not your prompting. Compute is the scarce thing.", "Closed models feel fast because someone else's GPUs. Space GPUs are a story, not a plan.", "He is willing to call a client back when the tech catches up — that is a human send."],
    "D": [
        "If a job failed on limits, retest in a sandbox. Do not enable send.",
        "Do not put hive jobs on Claude Code routines because limits doubled.",
        "If an image model was not postable, wait; Evens calls the client — we do not.",
        "SpaceX/orbital is on-tape sci-fi. No pay.",
    ],
    "E": [ex("LinkedIn infographic not good enough", "Waited ~3 months, new model, called the client, built", "Don't ship ugly", "Later shipped (on-tape)", "The call is HITL; the wait is the steal")],
    "F": ["If limits double → not a send permit.", "If a routine would share a session with knowledge work → still a spend card.", "If 300 MW / 80k TPM appear → UNVERIFIED.", "Managed-agent webhooks/auto-dreaming → later tape, assume send risk."],
    "G": ["Field treats limit-up as 'go autonomous.' He also says put routines on Claude Code — this desk refuses that half."],
    "H": ["All MW/GPU/token/limit numbers UNVERIFIED.", "SpaceX partnership claims on-tape.", "Dates 2026 event."],
    "I": ["What are managed-agent webhooks/auto-dreaming?", "Did the LinkedIn job auto-post?"],
    "J": ["SYSTEM SYNTHESIS → `golden-test-loop` (retest) · `ask-principal` (client call / publish).", "Sibling limits: `-nG-9vlSkho`."],
    "K": ["Wait-then-retest library. Keep. Orbital compute = future-use trivia."],
    "machines": [{
        "name": "Retest in sandbox when a wall moves (no prod routine, no auto-post)",
        "loop": "old job failed → wall may have moved → sandbox retest → if good, Evens decides to call/build/send → stop",
        "qs": "Did we retest without Send? Is this a client call? Production routine?",
        "qf": "Treat-yourself-to-Opus is not a hive change. Space GPUs are not a SKU.",
        "proc": "No Claude. No LinkedIn send. No production agentic loop on a vendor sub.",
        "ex": ex("Infographic not postable", "Wait, retest, call client", "Quality bar", "Built later", "Call/send stay HITL"),
        "why": "He would not give the client something he wouldn't post. That bar is the machine. The later 'routines on Claude Code' line is the trap.",
        "never": "Claude production routines. Auto-post LinkedIn. Quote 300MW/220k GPUs/80k TPM as FACT. SpaceX as stack.",
        "hive": "`golden-test-loop` · `ask-principal` · `send-removed` · Cursor + Grok",
    }],
    "L": "Limit news is not a stack change. ACTION = REJECT Claude routines and LinkedIn send. Steal the wait-until-it's-postable bar. Clients parked. No call to his client analog.",
}


def main():
    n = 0
    for vid, t in TAKES.items():
        write_one(vid, t)
        n += 1
        print("wrote", vid)
    print("batch4", n)


if __name__ == "__main__":
    main()
