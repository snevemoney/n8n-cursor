#!/usr/bin/env python3
from _hitl_dvl_writer import write_one

def src(claim, why, mech, ev, act, **kw):
    return {"concept": kw.pop("concept"), "claim": claim, "why": why, "mech": mech, "ev": ev, "act": act, **kw}

def ex(sit, act, why, out, les, name="On-tape run"):
    return {"name": name, "sit": sit, "act": act, "why": why, "out": out, "les": les}

TAKES = {}

TAKES["lokbsA5VXOk"] = {
    "title": "OpenAI Just Leveled Up n8n AI Agents (here's how it works)",
    "speaker": "Nate Herk | AI Automation",
    "kind": "long cut of Responses API short",
    "words": 2655,
    "A": [
        "Two agents, same questions (golf flag-stick rule + Bears record): one has Perplexity + Supabase tools; one has no tools/no system prompt — both answer because the OpenAI chat model has Responses API web+file search on. 'You are a helpful assistant' only.",
        "Needs n8n ≥1.118, OpenAI chat model v1.3 — not via OpenRouter yet. Built-ins: web, file, code interpreter; MCP possible but not shown. API key from platform.openai.com + billing, not ChatGPT.",
        "Web: context low/med/high; city/country/region; allowed domains. Off: World Series → cutoff June 2024. On: Dodgers 2025 vs Jays + cites + visual. Allowlist upai.com + GPT-4.1 fails (filter unsupported); GPT-5-mini correctly refuses (no Series on that domain).",
        "File search: vector store ID as array; filter required or error; max results. Golf PDF. OpenAI 10¢/GB/day even idle vs Gemini upload-only — he leans Gemini for metadata/cites; has not A/B tested retrieval. Default answer has no section cite unless prompted.",
        "Extra options: saved prompt ID, service tier, safety identifier, conversation ID (memory in OpenAI not n8n), prompt cache key, metadata, top logprobs (he doesn't understand). Plus CTA.",
    ],
    "atoms": [src(
        "Allowlisted web search is a real constraint — he proved it by failing on his own dead site. File search without a cite is incomplete.",
        "Built-in tools hide in the model; a 'no tools' agent can still browse/send-risk if the brain has them.",
        "Toggle Responses → allowlist/store → ask → require cites.",
        "On-tape: upai.com refuse; idle 10¢/GB/day; no default cite.",
        "Steal allowlist + cite-or-fail. Operate-never OpenAI memory/conversation-ID as hive brain, idle billed stores, code interpreter, Plus.",
        concept="Hidden built-in tools + allowlist proof",
    )],
    "C": ["A tool-less canvas can still have tools in the model — inspect the brain.", "Cheaper idle (Gemini) matters if stores sit.", "He will say when he has not tested."],
    "D": ["Inspect whether Responses/web/file/code are on even if the agent shows no tools.", "Set allowlist. Require a cite. Don't leave billed stores idle.", "Keys from the API console, not chat — still a secrets/pay card.", "Do not enable code interpreter. Do not use OpenAI conversation memory as ours."],
    "E": [ex("World Series on allowlisted upai.com", "Model says it cannot find it on that domain", "Prove the filter", "Correct refuse", "Constraint works; sports $ not ours")],
    "F": ["If the agent has no tools listed → still check the chat-model toggles.", "If no cite → fail the answer for outbound.", "If a store sits unused → money leak.", "10¢/GB/day UNVERIFIED as our price."],
    "G": ["Field assumes no-tools means safe. He shows the brain still searches."],
    "H": ["Bears 8-3 / Dodgers 2025 / 10¢ / 1.118 UNVERIFIED or on-tape.", "OpenAI/Gemini/Plus on-tape."],
    "I": ["What does the required filter JSON actually constrain?", "MCP via extra coding — send risk?"],
    "J": ["Short: `QrJhdTbK3TU`. Gemini: `KVFfApQZhE4`.", "SYSTEM SYNTHESIS → `info-gain-cite` · `ask-principal` (keys/pay)."],
    "K": ["Hidden-tool inspection as a default HITL check. Keep."],
    "machines": [{
        "name": "Inspect the brain toggles; allowlist + cite-or-fail",
        "loop": "open the model node → list built-ins → allowlist or store ID → ask → require cite → Evens if outbound",
        "qs": "Is web/file/code on? Which domains? Idle store billing?",
        "qf": "No-tools on the canvas is not safe. Conversation-ID memory is not our wiki.",
        "proc": "No OpenAI install. No code interpreter. No Plus. Keys are a card.",
        "ex": ex("Tool-less agent answers Bears + rule 17", "Responses API on the model", "Looks like magic", "Same answers + cites from the web", "Hidden tools are the blast radius"),
        "why": "He designed the A/B so you see the brain, not the canvas.",
        "never": "OpenAI as hive. Idle billed stores. Code interpreter. Conversation memory in a vendor. Quote 10¢ as FACT. Plus.",
        "hive": "`info-gain-cite` · `ask-principal` · `send-removed`",
    }],
    "L": "Hidden built-ins are a send/browse risk. ACTION = inspect toggles; REJECT vendor memory and billed idle stores. Clients parked.",
}

TAKES["8C6iCpJ9HPo"] = {
    "title": "I built this AI Agent in 2 hours (and got paid $1200)",
    "speaker": "Nate Herk | AI Automation",
    "kind": "long cut of the $1200 short",
    "words": 2696,
    "A": [
        "Same cold open as `tNOk29fs_aY`: 2h, $1200, 30 min now, not actually an agent — 3× morning idea generator for LinkedIn brand/tone. Full-time, building for fun, ChatGPT for use cases, YouTube live-build to learn.",
        "No CTA in videos; email in description; ~200 views/week. Client emailed to talk / almost 'make a friend.' He was ready to build free for reps; client was excited about value so he threw a price; agreed immediately. Authenticity > expert pose. Views ≠ the goal; interested people are.",
        "Client paid for outcome not hours ($600/h story). Manual: hours/week of content he wasn't passionate about vs one-time build + small API. '10x return' UNVERIFIED. People don't care how you fix it.",
        "Start-over: share the journey (Medium/LinkedIn/Skool); be a doctor not a pharmacist (find where to implement); tools include teaching ChatGPT; Perplexity $20 replacing a research intern (on-tape wow). Prototype that fails beats perfect. Lean on their SME. Watch live inputs, collect edge cases, add guardrails. Price so at least two of time/money/quality improve. Example: $15k/mo save + 20h → $3k + $1k/mo UNVERIFIED. Website chatbot still news to SMBs. Skool doc CTA.",
    ],
    "atoms": [src(
        "Inbound from a tiny channel + a thrown price after they felt the value. The system is a scheduled idea pile, not a sender.",
        "He almost worked free; the price was a reaction to their excitement.",
        "Publish builds → email in description → call → optional price → 3× morning ideas → human posts.",
        "On-tape: no CTA, 200 views, almost free, then $1200; doctor not pharmacist.",
        "Steal inbound+doctor. Operate-never hunt, auto-post, quote $1200/$15k/$3k as FACT, Skool.",
        concept="Tiny inbound + idea pile; price after value is felt",
        conf="low on $ — UNVERIFIED",
    )],
    "C": ["Learning in public is enough. Expert pose is optional.", "Failing prototypes are the path.", "SME input is how they know you're on their team."],
    "D": [
        "Share the build. Put a reachable email. Do not spray a list.",
        "On a call: find the pain; lean on their expertise; throw a number only if Evens would.",
        "Ship a watched prototype; log breaks; add guardrails.",
        "Do not auto-post LinkedIn. Do not teach ChatGPT as a hive SKU. Do not join Skool.",
    ],
    "E": [ex("Client wanted a friend/call", "Almost free; threw $1200; yes", "Value felt on the call", "Sold a 3× morning workflow", "Call is HITL; $ UNVERIFIED")],
    "F": ["If views are 200 → still can inbound. Do not hunt.", "If they ask to collaborate free → Evens decides; we don't offer.", "If chatbot 'answers FAQs' → send-removed.", "If $15k/mo save → UNVERIFIED example."],
    "G": ["Field waits to be an expert / waits for viral. He sold at 200 views with no CTA."],
    "H": ["$1200 / 2h / 30m / 10x / $15k / $3k+$1k / $20 Perplexity UNVERIFIED.", "Space is different 8–9 months later — he says so."],
    "I": ["Did the workflow post or only generate?", "What guardrails did he add after live breaks?"],
    "J": ["Short: `tNOk29fs_aY`. Sibling $2600: `bxGE_LXPyAU`. Inbound: `5IM27lbCwjM`.", "SYSTEM SYNTHESIS → `one-channel-deep` · `outcome-offer-funnel` · `golden-test-loop` · `ask-principal`."],
    "K": ["Doctor-not-pharmacist for Path A later. Parked."],
    "machines": [{
        "name": "Learn-in-public inbound → idea pile (human posts, Evens prices)",
        "loop": "publish the build → inbound → diagnose → prototype → watch breaks → Evens prices/sends → stop",
        "qs": "Does it post? Did we watch live inputs? Who sets the number?",
        "qf": "No CTA-to-list. No free work without Evens. No chatbot auto-reply.",
        "proc": "Clients parked. No Skool. No $ as FACT.",
        "ex": ex("200 views, email in description", "Call, almost free, then a price", "Authenticity", "$1200 on-tape", "Inbound stolen; hunt/send never"),
        "why": "The sold object was hours back, not nodes. Posting and pricing stay human.",
        "never": "Auto-post. Auto-reply FAQ widget. Quote $1200/$15k as FACT. Unpark a list. Join Skool. Offer free work.",
        "hive": "`one-channel-deep` · `outcome-offer-funnel` · `golden-test-loop` · `ask-principal`",
    }],
    "L": "Long-cut of the $1200 short. ACTION = no hunt, no auto-post, no FAQ auto-reply. Steal inbound+watch-the-breaks. Clients parked.",
}

TAKES["62Rfe1w9NBc"] = {
    "title": "I Can Actually Watch My AI Agents Work Now",
    "speaker": "Nate Herk | AI Automation",
    "kind": "long cut of the watch-agents short",
    "words": 2945,
    "A": [
        "Same demo as `xsAOpqjebOo`: two researchers + diagram; second terminal comment analysis; notification; sub-agent needs approval; idle when done; comment themes include API cost and first client with zero social proof. He kills the sessions to teach.",
        "Pixel Agents VS Code extension: pixel-art office over Claude Code activity logs (like his OpenClaw glance). Windows-only at taping; folder name cannot contain space or period (Herk 2.0 → herk-2). Drag to sidebar; +agent spawns character+terminal; layout/furniture; sessions folder; debug; sound vs hooks.",
        "Why: entertainment + glanceability + lure non-technical people (n8n visual analog). He wants n8n-style view of what is being built, not just that someone is walking. Parallel vs sub-agent vs teams (shared task list). Boris: ~5 terminal + ~10 web agents — UNVERIFIED.",
        "Security: publisher Pablo Deuca, verified, real cofounder, GitHub stars — he reviewed outbound/exfil/injection/deps/secrets/fs/remote scripts; claims nothing leaves the machine. Still: only install verified extensions.",
        "Real product he wants: what they're building, decisions, whether he'd agree — so humans can manage, stop before wrong, keep them from idle. Plus 3,000 CTA.",
    ],
    "atoms": [src(
        "Glanceable 'they're working' is not the gate. Needs-approval is. He wants to see decisions before he'd agree.",
        "A cute office can hide a send. Extension install is a trust event.",
        "Spawn → watch → approval pause → kill or continue.",
        "On-tape: needs approval; he audited the extension; wants stop-before-wrong.",
        "Steal needs-approval + stop-before-wrong. Operate-never Pixel Agents/Claude/OpenClaw, auto-reply comments, hunt from zero-social-proof.",
        concept="See the decision, not the sprite",
    )],
    "C": ["Managers keep agents on the path. Idle is a prompt to give more work — or to stop.", "Visual lure is how n8n won; coding agents lack it.", "He did a security pass and still says only verified extensions."],
    "D": [
        "If a sub-agent needs approval, that is a card.",
        "Do not install Pixel Agents / Claude Code / OpenClaw.",
        "Do not treat GitHub stars as a ship permit.",
        "Do not auto-reply YouTube comments. Do not hunt from comment pain.",
        "Kill sessions that have no checkable stop.",
    ],
    "E": [ex("Comment-analysis sub-agent", "Needs approval; he later kills the farm to teach", "Watch them", "Paused then killed", "Approval + kill are HITL")],
    "F": ["If the view only shows walking sprites → insufficient for send/deploy.", "If Windows-only / folder-name hacks → not our stack.", "If Plus 3,000 is the close → ignore.", "Boris 15 agents → UNVERIFIED, not a reason to fleet."],
    "G": ["Field wants the Tamagotchi office. He says the real product is decision visibility and a stop."],
    "H": ["1300 stars / 3,000 members / Boris 5+10 UNVERIFIED.", "His extension audit is one person's read, not ours.", "Windows-only may be stale."],
    "I": ["Did the audit miss anything?", "Can Pixel Agents click approve for you?"],
    "J": ["Short: `xsAOpqjebOo`. Dashboard: `ZAaxx3qyT8g`.", "SYSTEM SYNTHESIS → `input-required-gate` · `ask-principal` · `hive-spawn-desks`."],
    "K": ["Stop-before-wrong as the visual product we actually want. Keep. Sprites never."],
    "machines": [{
        "name": "Visible decision + approve/kill (no sprite OS)",
        "loop": "spawn a slice → if needs approval, card → Evens agrees or kills → stop",
        "qs": "What is it about to do? Would Evens agree? Can we kill it?",
        "qf": "Office skins are a no. Comment auto-reply is a no. Zero-social-proof hunt is a no.",
        "proc": "Cursor Tasks. No Claude/Pixel/OpenClaw. No Plus.",
        "ex": ex("Needs approval on comments", "Notification + yellow pause", "Don't silent-run", "He kills to teach", "Kill is allowed"),
        "why": "He names the real product: decisions you'd agree or disagree with. Sprites are not that.",
        "never": "Pixel Agents / Claude / OpenClaw. Auto-approve. Auto-reply comments. Unpark from comment research. Quote 3,000/Boris 15 as FACT.",
        "hive": "`input-required-gate` · `ask-principal` · `hive-spawn-desks`",
    }],
    "L": "Long-cut of the watch short. ACTION = needs-approval card; REJECT the office extension. Comment pain is not a hunt. Clients parked.",
}


def main():
    n = 0
    for vid, t in TAKES.items():
        write_one(vid, t)
        n += 1
        print("wrote", vid)
    print("batch6", n)


if __name__ == "__main__":
    main()
