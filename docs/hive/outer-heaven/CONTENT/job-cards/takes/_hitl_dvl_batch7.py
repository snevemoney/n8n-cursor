#!/usr/bin/env python3
"""Hand-thicken high-signal HITL takes after the mechanical upgrade."""
from _hitl_dvl_writer import write_one

def src(claim, why, mech, ev, act, **kw):
    return {"concept": kw.pop("concept"), "claim": claim, "why": why, "mech": mech, "ev": ev, "act": act, **kw}

def ex(sit, act, why, out, les, name="On-tape run"):
    return {"name": name, "sit": sit, "act": act, "why": why, "out": out, "les": les}

TAKES = {}

TAKES["HNKlFTd1maM"] = {
    "title": "How I Sold These 4 AI Agents for $23,000 (as a beginner)",
    "speaker": "Nate Herk | AI Automation",
    "kind": "long cut of the $23k four-agent walk",
    "words": 3337,
    "A": [
        "Four agents, $23,000 total, four businesses — not complex; he started selling months after starting. Walk: what each did, charge, sales process, how to sell the first; most expensive last.",
        "Agent 1 — personalized outreach: drop a contact list; research person+company; generate outreach + follow-up. SOURCE: 'This agent didn't actually send the messages or run the campaigns.' It filled a database of research-backed messages to plug into email or DM later. Charge $1,650 (he calls it random; prior $1,200). Client found him on YouTube, emailed, two calls, yes. Email in the description; he was not positioning as a freelancer.",
        "True Horizon with Milan + Tyler. Pricing shifts from random numbers to time/money leak → automation as investment. Agent 2 — sales agent: inquiries, quotes, talk to customer and orders team, log name/email/phone/location/summary into CRM. $4,000. Discovery → co-founders check tech → second discovery → Milan closed on the third call. Forgot baseline data so no case study. Milan did delivery then account-managed.",
        "Agent 3 — Slack personal assistant: internal data, tasks, productivity. $6,000 priced on complexity not compounding ROI. He now thinks the sales agent should have cost more (flywheel vs admin). Close rate >50% = underpricing. CTO was in the weeds connecting nodes — wrong seat.",
        "Agent 4 — full AI concierge: onboarding, events, guest passes, support, conversation history. MCP as a 'bleeding edge' lever. $12,000. Intern/assistant analog. By then: AM, CEO on sales, CTO managing engineers, Nate on YouTube.",
        "Roadmap: (1) diagnose/prescribe — not 'I can build a chatbot' but hours cut. (2) Simple tools (n8n, vectors, a model). Templates are commoditized; customize. (3) hours × rate × 4 weeks × 12 = annual savings. (4) Package/anchor (scale $25k / growth $12k). (5) Avoid underprice, underscope, early retainers; raise if close >40–50%; B2B 20–30% is strong. (6) Prototype + QA: one week internal (sample + real + edge) then one week client. (7) Partnerships, case studies, expand. Resource pack in free Skool; Plus + Automation to Monetization CTA.",
    ],
    "atoms": [
        src(
            "The first sold outreach agent explicitly does not send or run campaigns. Value is research + draft into a database the human plugs in later.",
            "He sold it without Send. $1,650 was a guess. The irreversible step is the campaign.",
            "List in → research person/company → draft + follow-up → write database → stop. Human plugs into email/DM.",
            "Direct quote: didn't send or run campaigns. Filled a database of ready-to-go messages.",
            "This is send-removed on tape. Do not flip it to auto-send to 'finish' the SKU.",
            concept="Outreach that stops at the draft database",
        ),
        src(
            "Fourth agent is a concierge that onboards, starts events, manages guest passes, and keeps history — intern analog at $12k UNVERIFIED.",
            "Expensive last is the hook. Events/guest-passes are book-adjacent. MCP is a sales lever, not a stack change.",
            "Member request → log/lookup → Evens or staff books/sends → stop.",
            "On-tape: virtual secretary; launching a new offer without hiring.",
            "Steal diagnose + QA. Operate-never concierge auto-book / auto-pass.",
            concept="Concierge is the expensive trap, not the steal",
        ),
        src(
            "QA is one week internal (sample + real + edge) then one week client. Close >50% means you underpriced. Change-request anything outside scope.",
            "He forgot baseline data on agent 2 and could not write a case study. Underscope destroyed margins.",
            "Scope in/out → prototype → internal QA week → client QA week → change-request extras.",
            "On-tape: True Horizon QA cycle; under-scoping as a silent killer.",
            "Steal the two-week QA + change-request. Do not quote $23k/$4k/$6k/$12k/$25k as FACT.",
            concept="Two-week QA + change-request",
        ),
    ],
    "C": [
        "Beginner-simple can sell. Send is not required for the SKU.",
        "Value is the brain that finds the leak, not the nodes.",
        "Sales-agent ROI compounds; admin-assistant ROI may not — price the flywheel.",
        "$23k is a hook. He still starts with the non-sending agent.",
    ],
    "D": [
        "Build research + draft + store. Human plugs into their sender.",
        "Do not add Send to 'finish' the product.",
        "Diagnose hours/money leak; prescribe outcome; package/anchor; do not blurt a number.",
        "Define in/out. Change-request extras. One week internal QA, one week client QA.",
        "If close rate >40–50%, raise. Do not chase five small retainers instead of one scoped project.",
        "Concierge / events / guest-passes stay cards. Clients parked.",
    ],
    "E": [
        ex("Client drops a contact list", "Research each + draft outreach/follow-up into a DB", "Send is the campaign", "Database of ready messages; he sends later", "He said it did not send — keep that"),
        ex("Sales agent talks to customer and orders team", "Quote + CRM log", "Hours and headcount story", "$4,000 close on call three UNVERIFIED", "Talk-to-customer is send-adjacent — log, Evens talks"),
        ex("Fourth = concierge for a new offer", "Onboard / events / guest passes / history", "Intern analog + MCP as theater", "$12,000 UNVERIFIED", "Events and passes are book. Hold them."),
    ],
    "F": [
        "If it is called an outreach agent → check whether Send exists. If yes, strip it.",
        "If tape $23,000 / $1,650 / $4,000 / $6,000 / $12,000 / $25k → UNVERIFIED.",
        "If a client asks to 'just send them' or 'just book the event' → card / REJECT auto.",
        "If close rate is 'insanely high' → do not treat that as a hive price analog.",
    ],
    "G": [
        "Field assumes outreach agents send. His first sold one does not.",
        "Field pitches chatbots. He pitches hours cut.",
        "Field thinks a team makes delivery easier. He shows CTO-in-the-weeds as the tax.",
    ],
    "H": [
        "$23k and every per-agent price UNVERIFIED. Four businesses UNVERIFIED.",
        "True Horizon / Milan / Tyler / Skool / Plus stay on-tape.",
        "Agent 2 talking to the customer is send-adjacent even if he did not name a Send node.",
    ],
    "I": [
        "Who plugged the messages — client or Nate?",
        "Did the concierge actually create calendar events, or only answer about them?",
        "What was in the free resource pack vs the paid course?",
    ],
    "J": [
        "SOURCE sibling: `ECfusvK5tEU` (same $23k cold open; agent 1 no-send).",
        "SYSTEM SYNTHESIS → `send-removed` · `warm-draft-hitl` · `playbook-before-send` · `ask-principal` · `outcome-offer-funnel`.",
    ],
    "K": [
        "Draft-database SKU + two-week QA for a named Path A later. Parked.",
        "Package/anchor language is sales craft, not a price list.",
    ],
    "machines": [{
        "name": "Research-and-draft outreach (no send)",
        "loop": "list in → research person/company → draft + follow-up → write database → human reviews → Evens or client sends → stop",
        "qs": "Does any node have Send? Who reviews the pile? Is this the concierge?",
        "qf": "If they want campaigns run, refuse auto-send. Offer the database. If they want events/guest-passes, card.",
        "proc": "Strip Send. Dual-gate warm outreach if Evens ever unparks. Two-week QA before any live list.",
        "ex": ex("Client drops a list", "Research + draft only", "Send is the campaign", "Filled database", "He said it did not send — keep that"),
        "why": "He sold the first agent without send. The fourth is the expensive book-adjacent trap. $23k stays UNVERIFIED.",
        "never": "Flip no-send to auto-send. Concierge auto-book / auto-pass. Quote $23k/$4k/$12k as FACT. Unpark a list. Skool pack as hive SKU.",
        "hive": "`send-removed` · `warm-draft-hitl` · `playbook-before-send` · `ask-principal` · `outcome-offer-funnel`",
    }],
    "never_extra": [
        "Quote $23k / $1,650 / $4k / $6k / $12k / $25k as FACT.",
        "Flip no-send outreach. Concierge auto-book / guest-pass.",
    ],
    "L": "Long-cut exhibit for send-removed. ACTION = fill the draft database; REJECT campaign-run and concierge-book. $23k UNVERIFIED. Clients parked.",
}

TAKES["BO-jFbN4p8Y"] = {
    "title": "I Built a Voice Agent That Calls Every New Lead (n8n + Vapi)",
    "speaker": "Nate Herk | AI Automation",
    "kind": "outbound voice + n8n walkthrough",
    "words": 6445,
    "A": [
        "Build an agent that makes phone calls while you sleep. n8n for logic, Vappy for voice; free templates. Use cases: surveys, reviews, reactivate leads; today = outbound lead qualification.",
        "Form submit (UPAI-style) → webhook → whole workflow. Demo: mock form, HTTP 'call lead,' he hears Elliot call him from Upet. Qualifies what prompted interest, budget, urgency, paid-discovery openness. On-tape answers: 5–10K, free intro then paid consulting. Agent offers free 30-minute discovery if a fit.",
        "Poll until the call is done; then branch: pickup vs voicemail. Log to Google Sheet (phone, email, company, role, request, size, status, budget, urgency). Normalize the phone number before the API or Vapi fails. Wrong-number path logs and stops.",
        "Vapi assistant: dynamic variables from the form; if no/wrong number, apologize and end; end-call tool off by default until enabled; after-call payload back to n8n. Production note: constantly monitor and tweak the prompt. Transfer-to-human if upset or they ask for a human.",
        "Steal on tape is qualify + log + voicemail/wrong-number branches + transfer-to-human. The operated demo is still auto-dial on form submit.",
    ],
    "atoms": [
        src(
            "Form submit automatically calls the lead while you sleep. That is the world action.",
            "Qualify questions and the sheet are useful. The HTTP 'call lead' node is the trap.",
            "Form in → normalize phone → log fields → Evens dials or cards → stop",
            "Open: 'make phone calls for you while you sleep.' Demo HTTP node labeled call lead.",
            "Steal qualify + log + voicemail branch. Operate-never Vapi / auto-dial.",
            concept="Log the call, then Evens dials",
        ),
        src(
            "He names a transfer-to-human fallback if they are upset or ask for a human. Voicemail and bad-number paths already stop the dial.",
            "Those branches are the HITL spine hiding inside an auto-dial canvas.",
            "Call state → pickup / voicemail / bad number / transfer-request → log → Evens",
            "On-tape: transfer if upset or requested; voicemail log; incorrect-format filter.",
            "Keep the branches. Do not keep the sleep-dial.",
            concept="Transfer-to-human is the steal inside the trap",
        ),
    ],
    "C": [
        "More form fields after a live conversation is the value, not the fact that a robot called at 2 a.m.",
        "Production voice = monitor and rewrite the prompt. Not set-and-forget.",
        "Vapi is on-tape only. Cursor + Grok.",
    ],
    "D": [
        "Keep: intent / budget / urgency questions, sheet columns, phone normalize, voicemail log, wrong-number stop, transfer-to-human.",
        "Strip: call-lead HTTP, Vapi assistant, while-you-sleep trigger, free-discovery book from the agent's mouth.",
        "If they ask for a human or sound upset → card Evens. Do not transfer via Vapi.",
        "5–10K and free 30-min discovery stay UNVERIFIED / on-tape.",
    ],
    "E": [
        ex("Mock form submit", "HTTP call lead → Elliot rings Nate", "Demo must sound live", "Sheet row for Richard / green grass", "The row is the steal; the ring is never"),
        ex("Lead asks for a human or is upset", "He says add a transfer fallback", "Voice will fail the room", "Not shown as a live transfer", "Name the fallback; Evens takes the call"),
    ],
    "F": [
        "If a node is named call lead → strip it.",
        "If the pitch is while-you-sleep → REJECT auto-dial.",
        "If they request a human → Evens, not Vapi transfer.",
        "If tape $5–10K or free discovery → UNVERIFIED.",
    ],
    "G": [
        "Field ships outbound voice as the product. He still logs so a human can reach out later — that second sentence is the hive.",
    ],
    "H": [
        "Vapi / UPAI / Elliot / 5–10K UNVERIFIED or on-tape.",
        "Transfer-to-human is spoken, not fully demoed as a live handoff.",
    ],
    "I": [
        "Did any production run book a calendar slot, or only qualify?",
        "Who owns the 'free 30-minute discovery' the agent offered?",
    ],
    "J": [
        "Siblings: `G9Ho8n4lD6I` · `glM8godEcic` · `-Lo_SlSgtnA` · `y-cq_Qo4zVo` · `zWLZ3bVVwD8` · `7siRW0My05o`.",
        "SYSTEM SYNTHESIS → `ask-principal` · `missed-call-book` (log only) · `confirm-then-actuate`.",
    ],
    "K": [
        "Qualify-question list + voicemail/wrong-number branches for a named Path A later. Parked.",
    ],
    "machines": [{
        "name": "Qualify + log + transfer-request (no sleep-dial)",
        "loop": "form/lead in → questions (intent/budget/urgency) → normalize phone → log sheet → voicemail/bad-number stop → Evens dials or books → stop",
        "qs": "Did they ask for a human? Pickup or voicemail? Is the number valid?",
        "qf": "While-you-sleep is a no. Vapi is a no. Free discovery from the agent's mouth is a no.",
        "proc": "Keep the sheet and the questions. Strip call-lead. Card Evens on transfer-request.",
        "ex": ex("Form submit at UPAI", "He auto-calls then logs Richard", "More fields than the form", "Sheet row; he will reach out", "Reach-out is Evens, not the HTTP node"),
        "why": "The useful machine is qualify-then-log. The operated machine is a robot that rings people at night.",
        "never": "Auto-dial / while-you-sleep / Vapi as stack / agent-offered free book. Quote 5–10K as FACT.",
        "hive": "`ask-principal` · `confirm-then-actuate` · `input-required-gate` · `missed-call-book`",
    }],
    "never_extra": [
        "Auto-dial / call-while-you-sleep. Vapi as a hive SKU.",
        "Quote 5–10K / free discovery as FACT.",
    ],
    "L": "ACTION = log qualify fields; REJECT call-lead and while-you-sleep. Transfer-to-human means Evens. Clients parked.",
}

TAKES["jBanaNBY-sM"] = {
    "title": "I Built the Ultimate Army of Media Agents in n8n (free template)",
    "speaker": "Nate Herk | AI Automation",
    "kind": "multi-agent media army demo",
    "words": 7382,
    "A": [
        "Ultimate media agent: email, Drive, calendar + create/edit image, image-to-video, post on X / TikTok / Instagram. Logs including errors. Free system. Telegram in.",
        "Image to Drive → agent asks what to name the file and sharing settings. He names it speaker. Change-name tool. Then edit image; variants named speaker studio vibrant; asks what next.",
        "Send the JBL speaker VFX video to Dexter Morgan: contact agent finds the email, can share-to-email or make-anyone-viewer, then 'kick off the actual email.' Sent with 'best your name' placeholders. He opens the sent mail.",
        "Search two high-performing n8n videos on TikTok, Instagram, YouTube → compile a doc. Then: grab the JBL VFX and post to TikTok with caption 'music to my ears.' File must be public for Potato. Agent says it posted; he shows the live TikTok 1 minute ago.",
        "Tracker sheet + Telegram reply after cleanup. Calendar mentioned as a tool he skips in the demo. Master agent delegates. Plus CTA.",
    ],
    "atoms": [
        src(
            "The army can email Dexter, touch calendar, and post X/TikTok/IG. The only HITL on tape is 'what do you want to call this file?'",
            "Ask-the-name is the steal. Multi-surface post and send-to-Dexter are the trap.",
            "Asset in → ask name → generate → human pick → publish/send card → stop",
            "Telegram: hey, what do you want to call this file? Later: posted the ad to TikTok; email kicked off to Dexter.",
            "Keep the name-ask and the error log. Strip Send, create-event, social-post.",
            concept="Ask the name, then Evens publishes",
        ),
    ],
    "C": [
        "A finished-looking army is the risk. Logging errors is not a gate.",
        "Placeholders in a sent email are what happens when Send is in the graph.",
    ],
    "D": [
        "Keep: Telegram in, Drive store, name-ask, error log, tracker sheet, three creative options.",
        "Strip: Gmail send, calendar create-event, TikTok/IG/X post, make-anyone-viewer as a silent publish.",
        "If it asks a name → that is the card. If it posts because it can → never.",
    ],
    "E": [
        ex("Telegram image in", "Ask what to call the file", "Keep a database", "Renamed speaker", "Name-ask is HITL. Keep it."),
        ex("Send JBL VFX to Dexter Morgan", "Find email + kick off send", "Demo the contact agent", "Live email with placeholder sign-off", "Send landed. That is the never."),
        ex("Post JBL VFX to TikTok", "Make file public + Potato post", "Prove the posting agent", "Live TikTok 1 minute ago", "Publish landed. That is the never."),
    ],
    "F": [
        "If a tool is post / send / create-event → card.",
        "If it asks the name → stop and wait for Evens.",
        "If the file must be public to post → that public-share is already publish-adjacent.",
    ],
    "G": [
        "Field ships a media army that posts. He also asks the name first — keep the ask, drop the army's send/post.",
    ],
    "H": [
        "Potato / Telegram / Dexter Morgan / JBL ad are on-tape demo.",
        "Calendar capability spoken, not fully walked.",
    ],
    "I": [
        "Did the calendar tool ever create an event in this tape?",
        "Who is Dexter Morgan — dummy or a real inbox?",
    ],
    "J": [
        "Siblings: `TWvjqpk3uSQ` · `IlNwjnIzrOo` (ask-the-name then autonomy-as-publish).",
        "SYSTEM SYNTHESIS → `ask-principal` · `send-removed` · `clip-factory` · `product-ad-from-photo` · `one-channel-deep`.",
    ],
    "K": [
        "Name-ask + error-log + three-option cut for a named Path C later. Parked.",
    ],
    "machines": [{
        "name": "Ask-the-name + three options, then Evens publishes",
        "loop": "Telegram/asset in → Drive → ask name → generate/edit → human pick → Evens sends or posts → stop",
        "qs": "What is the file name? Which of the three? Does any tool send/post/book?",
        "qf": "Post-because-it-can is a no. Email-to-Dexter is a no. Calendar is book.",
        "proc": "Keep name-ask and tracker. Strip Send / social-post / create-event.",
        "ex": ex("Post JBL to TikTok", "He lets the posting agent fire", "Demo must show a live post", "TikTok 1 minute ago", "The live post is the operate-never"),
        "why": "The useful machine is ask-name then human pick. The operated machine posts and emails.",
        "never": "Auto-post X/TikTok/IG. Auto-email Dexter. Auto-calendar. Public-share as silent publish.",
        "hive": "`ask-principal` · `send-removed` · `clip-factory` · `product-ad-from-photo` · `one-channel-deep`",
    }],
    "never_extra": [
        "Auto-post X/TikTok/IG. Auto-email a contact. Calendar create-event.",
    ],
    "L": "ACTION = ask the name and hold three cuts. REJECT post/send/calendar. Clients parked.",
}

TAKES["oWdJMJp2HgM"] = {
    "title": "n8n JUST Leveled Up AI Agents With Guardrails: Here's How It Works",
    "speaker": "Nate Herk | AI Automation",
    "kind": "guardrails node walkthrough",
    "words": 3464,
    "A": [
        "Native guardrails (n8n 1.119): do not send sensitive data into a model; check outputs before you send them off. Two ops: AI 'check text for violations' vs non-AI sanitize.",
        "Catalog: keywords, jailbreak, NSFW, PII, secret keys, topical alignment, URLs, custom prompt, regex. Can stack in one node.",
        "Keyword demo: block password/system — omelette passes; 'enter your password' / 'update the system setting' fail. SOURCE: if it passes you can send your email or update the CRM; if it fails Slack or throw an error and stop the workflow.",
        "Jailbreak / NSFW / PII / topical / URL demos with thresholds. Secret-keys missed 'use my password blank' even on strict — looks for API-key shapes. Sanitize PII/keys/URLs without sending to a model; placeholder + he still has the real value in a log.",
        "Free workflow in Skool; Plus CTA (200 members, four courses) UNVERIFIED.",
    ],
    "atoms": [
        src(
            "Pass branch is where he says send the email or update the CRM. Fail branch can Slack or throw and stop.",
            "Guardrail is a check. Guardrail-pass is not Evens. Sanitize-before-model is the steal.",
            "Text in → sanitize (no AI) → check → fail: stop/Slack → pass: still a card before Send",
            "On-tape: 'if it passes, you can go ahead and send your email or update the CRM.' Secret-keys still passed a password sentence.",
            "Steal fail-stop + sanitize-before-model. Never treat pass as send.",
            concept="Guardrail-pass is not a send gate",
        ),
    ],
    "C": [
        "Comfort from a node is not a lock.",
        "Non-AI sanitize is the cheaper, safer first hop because it does not ship the secret to a model.",
        "A check that misses 'use my password' is why pass ≠ Evens.",
    ],
    "D": [
        "Sanitize before any model. Stack keyword + PII + keys if needed.",
        "Fail → stop or Slack Evens. Pass → still a send/book card.",
        "Do not use guardrail-pass as always-allow.",
        "Do not join Skool for the template.",
    ],
    "E": [
        ex("Three keyword rows", "Block password/system", "Show pass/fail", "Omelette passes; password/system fail", "He then says pass can send email — that sentence is the trap"),
        ex("Secret keys on strict", "Look for API-key shapes", "Balanced vs strict", "'use my password blank' still passes", "The miss is why pass is not Evens"),
    ],
    "F": [
        "If pass-branch has Gmail/CRM → strip Send; keep the check.",
        "If a secret-key check missed a password → do not trust it as the only lock.",
        "If sanitize can keep the raw value in a log → treat that log as sensitive.",
    ],
    "G": [
        "Field treats native guardrails as the lock. He also says pass can send. We keep the fail-stop and refuse the pass-send.",
    ],
    "H": [
        "n8n 1.119 / OpenRouter / Skool 200 members UNVERIFIED or on-tape.",
        "Sibling short `NQhsLVmuItA` already named pass ≠ send.",
    ],
    "I": [
        "Did anyone in comments ship pass→Gmail in production?",
        "Can sanitize regex catch the password miss that secret-keys dropped?",
    ],
    "J": [
        "SOURCE sibling: `NQhsLVmuItA`. SYSTEM SYNTHESIS → `send-removed` · `confirm-then-actuate` · `input-required-gate`.",
    ],
    "K": [
        "Sanitize-before-model + fail-stop as a reusable check in front of any draft. Parked.",
    ],
    "machines": [{
        "name": "Sanitize + fail-stop; pass still cards",
        "loop": "text in → sanitize (no AI) → check violations → fail: stop/Slack Evens → pass: draft only → Evens sends → stop",
        "qs": "Did it fail? Did secret-keys miss a password-shaped string? Is Send on the pass branch?",
        "qf": "Pass = send is a no. Guardrail-as-only-lock is a no.",
        "proc": "Keep fail-stop and sanitize. Strip Gmail/CRM from pass. Card anyway.",
        "ex": ex("Keyword pass", "He says send email or update CRM", "Demo the happy path", "Omelette would have sent", "Pass is not Evens"),
        "why": "The useful machine is fail-stop + sanitize-before-model. The operated sentence is pass-then-send.",
        "never": "Pass-branch Gmail/CRM as a gate. Treat guardrail as the only lock. Auto-send.",
        "hive": "`send-removed` · `confirm-then-actuate` · `input-required-gate` · `ask-principal`",
    }],
    "never_extra": [
        "Pass-branch Gmail/CRM as a gate. Treat guardrail as the only lock.",
    ],
    "L": "ACTION = fail-stop + sanitize; REJECT pass-then-send. Guardrail is a check. Clients parked.",
}

TAKES["y-cq_Qo4zVo"] = {
    "title": "I Built an AI Voice Receptionist with Vapi and n8n MCP (free template)",
    "speaker": "Nate Herk | AI Automation",
    "kind": "inbound voice receptionist + seven MCP tools",
    "words": 8187,
    "A": [
        "Kylie / Hercules detailing receptionist. Vappy front, n8n MCP back, seven workflows. Free system prompt + 15-page guide.",
        "Live: calendar left, CRM right. New user: ask email, full name, phone; confirm email (nateample.com). Book interior detailing tomorrow 8 a.m. Call log: appointment got booked. Second call: look up by email, check conflicts, confirm move, reschedule to 9 a.m. Outcome: rescheduled.",
        "Always disclose AI. Tools: client lookup, new client CRM, check availability, book event, update / lookup / delete appointment. Check availability before book; lookup before change/delete.",
        "He cringes at an n8n AI agent making the decisions — Vapi is already the brain; keep n8n deterministic to cut cost/latency. MCP so tool params live in one place. Speak before tool calls to avoid silence. End-of-call report.",
        "Delete-appointment workflow exists and fires on event ID. Confirm-email is spoken HITL inside an auto-book canvas.",
    ],
    "atoms": [
        src(
            "Confirm the email, then the MCP book-event / delete-appointment tools fire. Read-back is not Evens.",
            "Deterministic n8n tools are the steal. Auto-voice-book is the trap. Vapi stays never.",
            "Call in → disclose AI → confirm email/name/phone → log + check availability → Evens books/moves/deletes → stop",
            "On-tape: 'you're all set for … tomorrow at 8 a.m.' and a live calendar write. Delete tool present.",
            "Steal confirm + availability-check + deterministic tools. Never book-event.",
            concept="Confirm-email is not a book gate",
        ),
        src(
            "He refuses a second AI agent in n8n behind Vapi — double reasoning, cost, latency. Keep the backend deterministic.",
            "That is our confirm-then-actuate instinct: the voice can talk; the write stays a boring tool Evens owns.",
            "Intent → named deterministic workflow → no second brain → Evens on write",
            "On-tape: 'makes me cringe when people are building … an NN AI agent in the back end to actually make decisions.'",
            "Steal deterministic tools. Do not install Vapi to get them.",
            concept="Deterministic backend, not a second agent",
        ),
    ],
    "C": [
        "A receptionist that 'can do pretty much anything' is the risk sentence.",
        "Speak-before-tool is UX, not a gate.",
        "Disclosing 'I am AI' is ethics on tape, not permission to book.",
    ],
    "D": [
        "Keep: disclose AI, ask+confirm email, availability check, lookup-before-delete, end-of-call log, deterministic n8n.",
        "Strip: book event, update event, delete appointment, Vapi, MCP execute-any.",
        "If they confirm a time → still a card. Silence is not yes.",
    ],
    "E": [
        ex("New caller Nate", "Confirm email then book 8 a.m.", "Show calendar+CRM live", "Appointment booked in the log", "Confirm-email then write is still auto-book"),
        ex("Second call move it", "Lookup + conflict check + confirm + update", "Do not double-book", "Moved to 9 a.m.", "Reschedule is also book"),
    ],
    "F": [
        "If a tool is book/update/delete event → card.",
        "If n8n behind voice is an AI agent → refuse the second brain; still refuse the write.",
        "If they only confirmed an email → that is identity, not APPROVE.",
    ],
    "G": [
        "Field stacks Vapi + n8n agent. He wants Vapi + deterministic n8n. We want questions + log + Evens.",
    ],
    "H": [
        "Vapi / Hercules / 15-page guide / Skool on-tape.",
        "Delete path spoken and shown as a workflow, not a live delete in the two calls.",
    ],
    "I": [
        "Did anyone delete a real customer appointment from this template?",
        "What happens if the confirmed email is wrong but spelled back?",
    ],
    "J": [
        "Siblings: `G9Ho8n4lD6I` · `BO-jFbN4p8Y` · `zWLZ3bVVwD8`. SYSTEM SYNTHESIS → `ask-principal` · `private-book-install` · `confirm-then-actuate`.",
    ],
    "K": [
        "Confirm-email + availability-check as the front of missed-call-book (log only). Parked.",
    ],
    "machines": [{
        "name": "Confirm identity + check availability (Evens books)",
        "loop": "inbound → disclose AI → confirm email/name/phone → check availability → log → Evens creates/moves/deletes → stop",
        "qs": "Is the email confirmed? Is the slot free? Who writes the calendar?",
        "qf": "MCP book-event is a no. Delete-appointment is a no. Vapi is a no.",
        "proc": "Keep confirm + lookup + availability. Strip book/update/delete. Deterministic log only.",
        "ex": ex("Kylie books 8 a.m.", "Confirm email then book-event tool", "Live calendar", "Outcome: appointment got booked", "Read-back ≠ Evens"),
        "why": "The useful machine is confirm + availability + deterministic tools. The operated machine writes the calendar.",
        "never": "Auto-voice-book / reschedule / delete via MCP. Vapi as stack.",
        "hive": "`ask-principal` · `confirm-then-actuate` · `private-book-install` · `missed-call-book`",
    }],
    "never_extra": [
        "Auto-voice-book via MCP book-event. Auto-reschedule / auto-delete.",
        "Vapi as a hive SKU.",
    ],
    "L": "ACTION = confirm email and log the slot; REJECT book-event. Clients parked.",
}

TAKES["zWLZ3bVVwD8"] = {
    "title": "Voice AI Agents for Beginners (Full Guide, n8n + Vapi)",
    "speaker": "Nate Herk | AI Automation",
    "kind": "beginner voice course",
    "words": 9550,
    "A": [
        "Voice agents via Vappy: inbound, outbound, website widget. They make and receive calls; appointment scheduling, support, sales. System prompt = playbook. End goal often 'help people book appointments' — needs view calendar, make events, maybe send email, even trigger payment.",
        "Dashboard: live calls, duration, cost. Tools the agent can call. Inbound Wellness Partners greeting. If-this-do-that sections. End-call + forwarding number for transfer-to-human. Knowledge as a file drop (or n8n vector if huge).",
        "Talk-to-assistant in the dashboard before a real number. End-of-call reports automated so you see what was talked about and what actions were taken.",
        "The course teaches the full write-path (create event, send confirmation, payment). Transfer-to-human and dashboard test-before-number are the HITL crumbs.",
    ],
    "atoms": [
        src(
            "Beginner goal on tape is book appointments + maybe email + payment. Transfer-to-human and talk-to-assistant-first are the brakes he also ships.",
            "A full guide that ends in create-event will be copied as auto-book.",
            "Prompt + knowledge + test in dashboard → log → Evens books/sends/pays → stop",
            "On-tape: 'end goal would be to help people book appointments' and 'access to make events on the calendar.'",
            "Steal playbook + transfer + test-before-number. Never Vapi book/pay.",
            concept="Beginner voice guide is an auto-book syllabus",
        ),
    ],
    "C": [
        "Voice is a channel. Book/pay/send are still world actions.",
        "A file-drop knowledge base is not a calendar write.",
    ],
    "D": [
        "Keep: role/company/do-when, disclose, transfer number named, dashboard test, end-of-call log.",
        "Strip: create-event, send confirmation, payment trigger, outbound blast, Vapi as stack.",
    ],
    "E": [
        ex("Wellness Partners inbound", "Talk-to-assistant in dashboard", "Test before a real number", "Greeting works", "Dashboard test is the steal; the live book tool is never"),
    ],
    "F": [
        "If the end goal is book / pay / email confirm → card the write.",
        "If they have not tested in the dashboard → do not attach a number.",
        "If they ask for a human → Evens, not a Vapi forward we operate.",
    ],
    "G": [
        "Field starts with a phone number. He at least tests in-dashboard first.",
    ],
    "H": [
        "Vapi / Wellness Partners / costs UNVERIFIED or on-tape.",
    ],
    "I": [
        "Does the free template include a live Google Calendar write?",
    ],
    "J": [
        "Siblings: `y-cq_Qo4zVo` · `BO-jFbN4p8Y` · `7siRW0My05o`. SYSTEM SYNTHESIS → `ask-principal` · `demo-walk-script`.",
    ],
    "K": [
        "Voice playbook structure (role/company/if-this) for a later named install. Parked.",
    ],
    "machines": [{
        "name": "Voice playbook + dashboard test (Evens books)",
        "loop": "write playbook → test in dashboard → log call → Evens books/sends/pays → stop",
        "qs": "Did we test without a number? Can it create-event or pay?",
        "qf": "Beginner-book is a no. Outbound is a no. Vapi is a no.",
        "proc": "Steal the script sections. Strip calendar write, email confirm, payment.",
        "ex": ex("End goal = book appointments", "Give calendar view + create-event", "That is the product on YouTube", "Course continues", "View is fine; create-event is never"),
        "why": "The useful machine is a tested playbook plus a human write. The syllabus writes the calendar.",
        "never": "Vapi as stack. Auto-book / auto-email-confirm / auto-pay. Outbound blast.",
        "hive": "`ask-principal` · `demo-walk-script` · `confirm-then-actuate` · `private-book-install`",
    }],
    "never_extra": [
        "Vapi beginner auto-book / payment trigger / confirmation email.",
    ],
    "L": "ACTION = test the playbook and log; REJECT create-event and pay. Clients parked.",
}

TAKES["7siRW0My05o"] = {
    "title": "This High Schooler Won $5,000 Building a Voice Agent (n8n + Vapi)",
    "speaker": "Nate Herk | AI Automation + Azim",
    "kind": "hackathon winner interview",
    "words": 4170,
    "A": [
        "Plus hackathon, 3 weeks, $5,000, hundreds of entries UNVERIFIED. Winner Azim: ~6 months in, still in high school, no prior tech, YouTube + courses. Mental-health web app: Bolt front, Firebase auth, nine n8n workflows, Vapi outbound.",
        "Onboarding: name, email, phone, timezone, password; five intake questions. Start session → 'expect a call soon' → n8n personalizes the assistant → Vapi places the outbound call. Nate answers; breathing exercise; end.",
        "After call: another agent condenses transcript/summary into the profile. On-demand webhook vs morning/evening/Sunday schedule triggers (same flow). Safety check: emergency/crisis → emergency path (would alert services). Linear conditionals; Nate praises 'keeps you in control' vs autonomous.",
        "New vs existing user: create vs update the Vapi assistant. Poll every 30s until the call ended; mark phone numbers unavailable/available. Preference-changed webhook updates sheets. Weekly report: Friday hourly 8–6, cycle users, email sender (Gmail stand-in for a CRM).",
        "Azim: would need HIPAA + funding to deploy; not sure he will. Agency + Skool + consult CTAs. Nate: even if it never launches, it is a demo for voice-agent clients.",
    ],
    "atoms": [
        src(
            "The winning build places an outbound Vapi call after a button, and can cron-call morning/evening/Sunday. Safety-check and linear control are the steal.",
            "Nate praises linear over autonomous. HIPAA is named as the deploy blocker. Weekly path ends in an email sender.",
            "Intake → safety route → log profile → Evens (not Vapi) calls if ever → stop",
            "On-tape: 'it triggers VP, which places an outbound call to you.' Schedule triggers for morning/evening/Sunday.",
            "Steal linear + safety + number-lock. Never outbound / cron-call / Gmail report / HIPAA product.",
            concept="Linear + safety route, no sleep-call",
        ),
    ],
    "C": [
        "A passion-project demo is not a product. HIPAA was the honest stop.",
        "Linear beats autonomous on a voice canvas — Nate said it.",
        "$5k prize is a hook, not a SKU.",
    ],
    "D": [
        "Keep: intake questions, profile sheet, safety/crisis branch, linear checks, poll-until-done, number busy-lock.",
        "Strip: Vapi outbound, scheduled calls, Gmail weekly, deploy-to-public, consult links.",
        "Crisis path is not something this desk operates.",
    ],
    "E": [
        ex("Nate completes onboarding", "Start session → outbound Vapi", "Show the companion", "Nate gets the call", "The ring is the never"),
        ex("Weekly report", "Linear cycle then email sender", "Don't give an agent the whole path", "Gmail stand-in", "Linear is the steal; the send is never"),
    ],
    "F": [
        "If a button places a call → strip it.",
        "If a schedule trigger calls a human → never.",
        "If they name HIPAA and still want to ship → park.",
        "If $5,000 prize → UNVERIFIED.",
    ],
    "G": [
        "Field wants an autonomous therapist. The winner won with linear + a safety branch — and still should not deploy.",
    ],
    "H": [
        "$5k / 6 months / high school / HIPAA / Plus templates UNVERIFIED or on-tape.",
        "Emergency-services path is spoken, not proven.",
    ],
    "I": [
        "Did the emergency path ever fire?",
        "What is in the nine workflows we did not see?",
    ],
    "J": [
        "Siblings: `BO-jFbN4p8Y` · `zWLZ3bVVwD8`. SYSTEM SYNTHESIS → `ask-principal` · `coverage-loop` (linear + stop).",
    ],
    "K": [
        "Linear + safety-route as a pattern for any later voice log. Never a mental-health SKU. Parked.",
    ],
    "machines": [{
        "name": "Linear intake + safety route (Evens calls)",
        "loop": "form in → safety check → log profile → Evens decides whether anyone is called → stop",
        "qs": "Crisis? New or existing? Who places the call?",
        "qf": "Outbound Vapi is a no. Cron-call is a no. Weekly Gmail is a no. HIPAA product is a no.",
        "proc": "Keep linear + safety + sheets. Strip Vapi/schedules/send. Do not deploy.",
        "ex": ex("Start session", "n8n → Vapi outbound", "Personalized companion", "Nate's phone rings", "The useful part already logged; the ring is never"),
        "why": "Nate's own praise is control via linear checks. The operated demo still calls you.",
        "never": "Vapi outbound / morning-evening-Sunday cron-call / Gmail weekly / deploy mental-health / quote $5k as FACT.",
        "hive": "`ask-principal` · `coverage-loop` · `confirm-then-actuate` · `input-required-gate`",
    }],
    "never_extra": [
        "Vapi outbound / scheduled companion calls. Weekly Gmail. Deploy a mental-health app.",
        "Quote $5k hackathon as FACT.",
    ],
    "L": "ACTION = steal linear + safety; REJECT outbound and cron-call. HIPAA named — park. Clients parked.",
}

TAKES["ehg4fhydTgs"] = {
    "title": "Claude Code Routines: Scheduled Agents That Run While You're Away",
    "speaker": "Nate Herk | AI Automation",
    "kind": "Claude Code remote routines walkthrough",
    "words": 3970,
    "A": [
        "Routines (research preview): a prompt that runs on Anthropic web infra on a schedule, API, or GitHub event. Laptop can be closed. Desktop app: local vs remote (GitHub) tasks. Cadence hourly+ (not every 10 min). Connectors: Slack, Gmail, APIs. Permissions: how Claude should act.",
        "SOURCE: these are one-shot; you are not around; 'you probably want to make sure that it doesn't ever have to stop and ask you questions. Otherwise, what's the point of the automation?'",
        "Needs a GitHub repo clone; .env is gitignored so keys go in the cloud environment. Network access trusted vs full — ClickUp only worked on full. Full risk: if Claude reads malicious content it could send data out; trusted would block. Demo: send a message in the internal ClickUp channel.",
        "YouTube comments analysis: must say 'use the env var, don't look for .env.' Playwright Skool automation failed remotely (no cookies; each run stateless; clone destroyed). Exception: code-change runs push a branch. Limits: Max $200 → 15 routine runs/day; Pro ~5 UNVERIFIED. 4 vCPU / 16GB / 30GB.",
        "Compare: routines (cloud, no local files, fully autonomous, 1h min) vs desktop scheduled vs /loop. Prompt must be specific + skill + order. Test with Run now before live. Fail → history; he suggests Slack him if fail. Claude.md on a huge repo wastes context. Do not push secrets.",
    ],
    "atoms": [
        src(
            "Remote routines are designed so they never stop to ask. Permissions can be fully autonomous. He still says test Run-now before live.",
            "One-shot unattended + Gmail/Slack/ClickUp connectors is auto-send. Full network is data-exfil risk he named.",
            "Write a specific prompt → Run now while Evens watches → only then schedule a no-send job → stop",
            "On-tape: ClickUp message sent; 'doesn't ever have to stop and ask'; full vs trusted; 15/day on $200 Max.",
            "Steal test-before-live + env-not-in-git + trusted-network. Never unattended send. No Claude stack.",
            concept="Unattended one-shot is the point — and the never",
        ),
    ],
    "C": [
        "If it has to ask, he thinks the automation failed. We think the ask is the product.",
        "Stateless clone + no cookies is a real constraint, not a bug.",
        "WAT (workflow+agent+tools) in the cloud is still a vendor we do not install.",
    ],
    "D": [
        "Keep: specific prompt, order of operations, Run-now test, env vars not in git, trusted network, fail-notify.",
        "Strip: Gmail/Slack/ClickUp send, full network, Playwright-on-Skool, unattended 'don't ask', Claude as stack.",
        "Do not schedule a world action. $200 / 15-runs UNVERIFIED.",
    ],
    "E": [
        ex("ClickUp test", "Full network + env key", "Trusted blocked it", "Internal channel message sent", "The first success was a send"),
        ex("Skool Playwright cron", "Copy local prompt to remote", "No cookies on a fresh clone", "Failed", "Unattended browser ≠ logged-in you"),
    ],
    "F": [
        "If the prompt says don't ask questions → it cannot own send/book/publish.",
        "If network is full → treat as exfil risk; do not operate.",
        "If they have not Run-now'd → do not schedule.",
        "If Claude/Anthropic is the runtime → on-tape only.",
    ],
    "G": [
        "Field wants laptop-closed agents. He names the ask as the failure mode. We name the ask as the gate.",
    ],
    "H": [
        "Claude Code / $200 Max / 15 runs / Skool Playwright on-tape. Do not install.",
    ],
    "I": [
        "Did any routine ever send Gmail, or only ClickUp test?",
        "Can teammates share routines on Team plan? He did not test.",
    ],
    "J": [
        "Siblings: `EuzYhzB0vbI` (loops) · `HbsbqMQE-lI` (paste-once before cron) · `mPflFTQUCGk` (always-allow).",
        "SYSTEM SYNTHESIS → `coverage-loop` · `ask-principal` · `input-required-gate`.",
    ],
    "K": [
        "Run-now-before-cron + env-not-in-git as hygiene. Parked. No Claude.",
    ],
    "machines": [{
        "name": "Run-now test, then Evens (no unattended send)",
        "loop": "specific prompt → Run now while watched → fix → schedule only no-send work → Evens on any world action → stop",
        "qs": "Does it ask? Can it hit Gmail/Slack/ClickUp? Trusted or full? Secrets in git?",
        "qf": "Don't-ask-me is a no on send. Full network is a no. Claude is a no.",
        "proc": "Steal test-before-live + env hygiene. Do not install Claude. Do not schedule send.",
        "ex": ex("ClickUp routine", "Full access so it could send", "Trusted failed", "Message in internal channel", "Unattended send worked — that is the never"),
        "why": "He wants one-shot because he is away. Away is exactly when this desk holds the hard step.",
        "never": "Unattended Gmail/Slack/ClickUp. Full-network routines. Claude as stack. Quote $200/15-runs as FACT. Skool Playwright.",
        "hive": "`ask-principal` · `coverage-loop` · `input-required-gate` · `confirm-then-actuate`",
    }],
    "never_extra": [
        "Unattended Claude routines that send. Full network. Install Claude Code.",
        "Quote $200 Max / 15 runs as FACT.",
    ],
    "L": "This is not a 24/7-Claude-operate tape. ACTION = steal Run-now + env hygiene; REJECT unattended send and Claude as stack.",
}

TAKES["gb5TlGw6Uks"] = {
    "title": "Hermes Agent: Zero to Personal AI Assistant (1 Hour Course)",
    "speaker": "Nate Herk | AI Automation",
    "kind": "1h Hermes VPS course",
    "words": 14572,
    "A": [
        "Hermes as a self-improving personal agent: skills, Telegram, scheduled crons, memory files that update themselves. 684 skills / 91 built-in spoken UNVERIFIED. Not a Mac mini — private VPS. Hostinger CTA: code Nate Herc, 10% off, ~$100 set-up-forever UNVERIFIED.",
        "On-tape crons include YouTube comment monitoring: an agent with the transcript replies to comments (sarcastic, not rude). Automatic ≠ magic. Deploy on VPS; daily auto backups; gitignore secrets; it asks for GitHub username, repo, identity, token.",
        "Tool list: vision, browser, image gen, TTS, terminal, planning, skills. Voice + text. Classroom / YouTube resources / Skool dump.",
        "The course normalizes a VPS intern that replies on YouTube and Telegram because a skill exists.",
    ],
    "atoms": [
        src(
            "Hermes on a VPS can cron-reply to YouTube comments and Telegram. Automatic does not mean magic — he said it — then he still auto-replies.",
            "Named cron + checkable stop is the steal. Auto-respond / password-on-the-box / Hostinger deploy is the trap.",
            "Named job → observe/draft → Evens replies or publishes → stop",
            "On-tape: YouTube comment monitoring that has been responding; deploy click; token request.",
            "Steal named-cron + gitignore. Never auto-reply / VPS Hermes / Hostinger.",
            concept="Named cron, then Evens replies",
        ),
    ],
    "C": [
        "Self-improving memory files without a review pass will drift into send.",
        "A sarcastic YouTube intern is still a publish.",
    ],
    "D": [
        "Keep: named cron, checkable stop, gitignore, private repo, 'automatic ≠ magic'.",
        "Strip: YouTube auto-reply, Telegram actuate, browser/TTS unattended, Hostinger deploy, Skool skill dump.",
        "Do not paste GitHub tokens into a chat because the agent asked.",
    ],
    "E": [
        ex("YouTube comments", "Agent with transcript replies", "Personality: sarcastic not rude", "He says it has been responding", "That is auto-publish"),
        ex("Backup cron", "Asks for GitHub token in chat", "Need git to commit daily", "Four secrets requested", "Token-in-chat is never"),
    ],
    "F": [
        "If a cron replies or posts → strip the write.",
        "If it asks for a token → Evens stores it; do not paste into the agent.",
        "If Hostinger / Hermes / Skool → on-tape only.",
    ],
    "G": [
        "Field wants a 24/7 personal intern. He even says automatic ≠ magic. We stop at draft.",
    ],
    "H": [
        "684 skills / $100 / Hostinger 10% UNVERIFIED. Hermes is not our stack.",
    ],
    "I": [
        "Which comments did it actually post?",
        "Did the daily git cron ever leak a key?",
    ],
    "J": [
        "Siblings: `HbsbqMQE-lI` (paste-once before cron) · `ehg4fhydTgs` (unattended routines).",
        "SYSTEM SYNTHESIS → `coverage-loop` · `ask-principal` · `one-channel-deep`.",
    ],
    "K": [
        "Named-cron + automatic≠magic as hygiene. Parked. No Hermes.",
    ],
    "machines": [{
        "name": "Named cron + checkable stop (Evens replies)",
        "loop": "name the job → observe/draft → Evens replies or publishes → stop",
        "qs": "Does this cron write to YouTube/Telegram? Did it ask for a token?",
        "qf": "Auto-reply is a no. VPS Hermes is a no. Hostinger is a no.",
        "proc": "Steal named job + gitignore. Do not deploy. Do not auto-respond.",
        "ex": ex("YouTube comment cron", "Transcript-aware reply", "He already runs it", "Comments get answered", "Observe is fine; the reply is never"),
        "why": "A scheduled observe is useful. A scheduled mouth is publish.",
        "never": "Auto-reply YouTube/Skool/Telegram. Hermes VPS. Hostinger. Token-in-chat. Quote $100/684 as FACT.",
        "hive": "`coverage-loop` · `ask-principal` · `one-channel-deep` · `input-required-gate`",
    }],
    "never_extra": [
        "Hermes VPS auto-reply YouTube / Telegram / Skool.",
        "Hostinger deploy. Quote $100 / 684 skills as FACT.",
    ],
    "L": "ACTION = named cron that drafts; REJECT auto-reply and Hermes install. Clients parked.",
}

TAKES["jdbOVepEtUE"] = {
    "title": "Claude Code for Non-Coders (6 Hour Course)",
    "speaker": "Nate Herk | AI Automation",
    "kind": "6h course · caption ingest of entire full.txt",
    "words": 85931,
    "gaps": "Timestamps UNKNOWN. 85k-word course read in full for HITL loci; visual clicks UNobserved.",
    "A": [
        "Beginner-to-AI-native course: automations, agents, anything you can describe. Nate non-technical; businesses in content/education/certs/events/consulting. One person doing team work. Skip-around promised; he goes in order with real builds.",
        "Model vs harness vs human: Opus is the engine; without the human the car does not drive. 'The human is steering the harness.' Connecting Gmail to write drafts is not 'true agentic power' — then the course still connects Gmail/Slack/CRM/calendar.",
        "Document what changed, time before/after, what still needed human judgment. Joke: bullet → professional email to send. Warning: no catching the mistake before it reaches a customer or the wrong list.",
        "Global claude.md governs any writing meant for Nate or that publishes Nate (LinkedIn, YouTube, comments, emails, captions). GWS CLI: Gmail, Drive, Docs, Sheets, Calendar, admin. Skill build: 201 unread; he chooses brief only, no labels, 'so it's not doing anything that I'm not explicitly approving, at least to start.' After 10–20–30 runs, maybe more autonomy. 'If a human gave you this work, what would you do to approve it?'",
        "Do not send private data to vendor servers without thinking. On-prem mentioned for companies. MCPs = QuickBooks/Gmail/SharePoint. Always-allow / publish-Nate rules live in the same course as 'human has to drive.'",
    ],
    "atoms": [
        src(
            "He says the human has to drive the car — then later the same course can touch Gmail/calendar and 'publishes Nate.' Start of a skill: brief only, nothing he is not explicitly approving.",
            "The 6h syllabus is a vendor install. The HITL spine is already in his mouth: approve like a human manager; start read-only.",
            "Connect read → brief/draft → Evens approves → only then widen → stop",
            "Quotes: 'not going to be able to drive … without the human'; 'brief only, no labels, just so it's not doing anything that I'm not explicitly approving'; claude.md 'publishes Nate.'",
            "Steal human-steers + brief-only + approve-as-if-a-human. Never Claude as stack, never Gmail/calendar write, never always-allow.",
            concept="Human steers; start brief-only",
        ),
    ],
    "C": [
        "Agentic power ≠ Send. He says drafts are not enough, then teaches the write.",
        "A global file that publishes Nate is a standing publish risk.",
        "Battle-test 10–30 times before autonomy — still not Evens on money.",
    ],
    "D": [
        "Ask: if a human handed you this, how would you approve it?",
        "Start read/brief only. No labels, no send, no calendar until Evens.",
        "Log time-before / time-after / what still needed judgment.",
        "Do not install Claude Code. Do not put GWS write tools in the graph.",
    ],
    "E": [
        ex("Gmail skill questions", "201 unread; what should labeling do?", "He wants control at the start", "Brief only, no labels", "Read-only first is the steal"),
        ex("Global claude.md", "Rules for anything that publishes Nate", "Voice consistency", "Kill-list for AI phrases", "A publish-Nate file is not auto-post"),
    ],
    "F": [
        "If the course says connect Gmail/calendar → read/draft only.",
        "If it asks to approve like a human → that is the card.",
        "If claude.md 'publishes Nate' → still a publish card.",
        "If Claude/Cowork/Codex named as the stack → on-tape only.",
    ],
    "G": [
        "Field treats the 6h course as permission to always-allow. He also said the human drives and start brief-only.",
    ],
    "H": [
        "85k words; this take is HITL-complete, not a chapter dump. Claude Code stays on-tape. Tape $ / ROI UNVERIFIED.",
    ],
    "I": [
        "Which later chapter first enables Gmail send?",
        "Did he ever turn the brief-only skill into labels+send on camera?",
    ],
    "J": [
        "Siblings: `RzLV8sfFdMM` (list-send incident) · `3TdD8Qv5Tk8` (full access) · `HN0oWxbF2bM` (inbox draft).",
        "SYSTEM SYNTHESIS → `ask-principal` · `send-removed` · `input-required-gate` · `session-bootstrap`.",
    ],
    "K": [
        "Approve-as-if-a-human + brief-only on-ramp. Parked. No Claude.",
    ],
    "machines": [{
        "name": "Human steers; brief-only; approve as a manager",
        "loop": "read/brief → Evens approves like a human manager → maybe widen labels → send/publish still a card → stop",
        "qs": "Are we read-only? What would a human require to approve? Can it send or book?",
        "qf": "True-agentic-means-send is a no. Publish-Nate file is a no. Claude is a no.",
        "proc": "Steal the on-ramp. Do not install the course stack. Gmail = read + draft.",
        "ex": ex("Skill asks label vs brief", "He picks brief only", "Not approving writes yet", "201 unread stay unread-as-action", "Start narrower than the syllabus"),
        "why": "He already has our spine in the first hours. The rest of the 6h teaches the write we refuse.",
        "never": "Install Claude Code. Gmail/calendar write. Always-allow. Quote course ROI as FACT. Auto-publish Nate.",
        "hive": "`ask-principal` · `send-removed` · `input-required-gate` · `session-bootstrap` · `inbox-to-task-routing`",
    }],
    "never_extra": [
        "Install Claude Code / GWS write. Always-allow. Auto-publish Nate.",
    ],
    "L": "6h syllabus is operate-never as a stack. ACTION = human-steers + brief-only; REJECT Gmail/calendar write. Clients parked.",
}

TAKES["8ktcSaSTvxk"] = {
    "title": "$100M AI Agency Playbook (with a founder who actually did it)",
    "speaker": "Nate Herk | AI Automation + guest",
    "kind": "agency-scale interview",
    "words": 21121,
    "A": [
        "Guest path toward a $100M exit UNVERIFIED. True Horizon-class work: $2,500 n8n jobs early → $4M / $0.5M-year projects + managed service spoken UNVERIFIED. Mid-market + some enterprise departments. Clients now arrive with a POC.",
        "Lifestyle agency vs org with enterprise value. Humans vs 'greater intelligence' — where humans still fit. Honesty and expectation-management so you do not leave angry clients. 11 playbooks for making money as an AI expert (spoken, not fully enumerated here).",
        "Poaching: six people tapped UNVERIFIED. Hormozi-style 1–3M ARR targets spoken. Starting out: playbooks are already public; you have not built or worked a client yet — still do the work. Refund-logic humans failing → AI systems. Ads-at-scale cheaper than hire.",
        "No send/book demo; the HITL is delivery honesty, scope, and not treating a YouTube $ as a hive price.",
    ],
    "atoms": [
        src(
            "Scale talk is priced in UNVERIFIED millions. The operable lesson is honesty + scope + do not leave angry clients — not a $100M target.",
            "Playbooks exist; beginners have not shipped. Learning ≠ hunt. Clients parked.",
            "Diagnose → scoped prototype → Evens on money/send → stop",
            "On-tape: $2,500 → half-million-year; manage expectations; 11 playbooks.",
            "Steal honesty + scope. Never quote $100M/$4M as FACT. No new icp.",
            concept="Scope and honesty, not a $100M operate",
        ),
    ],
    "C": [
        "Lifestyle vs exit is a founder choice, not a hive OKR.",
        "A public playbook is not a client.",
    ],
    "D": [
        "Do not unpark anyone because the tape named mid-market.",
        "Keep expectation-management and scoped delivery.",
        "Every tape $ stays UNVERIFIED.",
    ],
    "E": [
        ex("Beginner asks the path", "Playbooks are already out", "You have not built yet", "Do the work first", "Do not hunt from a podcast"),
    ],
    "F": [
        "If $100M / $4M / $2,500 → UNVERIFIED.",
        "If the tape names a vertical → still parked.",
        "If they want ads-at-scale auto-publish → card.",
    ],
    "G": [
        "Field hears $100M and starts outreach. He also says most people will stay lifestyle — and that is fine.",
    ],
    "H": [
        "All dollar figures and headcount UNVERIFIED. Guest stack on-tape.",
    ],
    "I": [
        "What are the 11 playbooks by name?",
        "Which delivery step is still human on their $4M jobs?",
    ],
    "J": [
        "Siblings: `HNKlFTd1maM` (beginner $23k) · `w9-gfaV5vlM` (sell solutions). SYSTEM SYNTHESIS → `outcome-offer-funnel` · `ask-principal`.",
    ],
    "K": [
        "Expectation-management language for a later Path A. Parked.",
    ],
    "machines": [{
        "name": "Scoped honesty (no hunt, no tape-$)",
        "loop": "hear the leak → scope in/out → prototype → Evens on price/send → stop",
        "qs": "Is this a hunt? Did we quote tape $?",
        "qf": "$100M operate is a no. New icp is a no.",
        "proc": "Steal honesty + scope. Do not unpark. Do not price from the tape.",
        "ex": ex("Early $2,500 jobs vs later millions", "He narrates the jump", "Hook", "UNVERIFIED numbers", "The jump is not our price list"),
        "why": "The useful machine is scoped delivery. The operated reading is 'go get a $100M agency.'",
        "never": "Quote $100M/$4M/$2,500 as FACT. New icp. Unpark. Auto-ads publish.",
        "hive": "`outcome-offer-funnel` · `ask-principal` · `playbook-before-send`",
    }],
    "never_extra": [
        "Quote $100M / $4M / $2,500 as FACT. Hunt from this tape.",
    ],
    "L": "ACTION = hold scope/honesty; REJECT hunt and tape-$ as FACT. Clients parked.",
}

TAKES["RzLV8sfFdMM"] = {
    "title": "How to Use Claude Code Better Than 98% of People",
    "speaker": "Nate Herk | AI Automation + Cole",
    "kind": "podcast · director-of-agents",
    "words": 15439,
    "A": [
        "Cole: be the director of coding agents. Context 'dumb zone' (~250k on Opus vs 1M advertised). Spend more time planning than building. Verification lifts first-pass quality (65–70 → 92 spoken UNVERIFIED).",
        "SOURCE incident: a proactive agent saw a task list, misread it, and sent an email to the entire list with a discount code that was not supposed to go out. Mindset: anything the agent can read or touch, assume it will — even if you never ask. That assumption saves the database.",
        "'Never wipe a database' in a prompt is not enough; it can still write a script that does it. If you block delete-folder it can still script around. Claude Code as second brain; systems that evolve. Browser/game-as-human as verification theater.",
        "The list-send is the HITL exhibit. Prompt-never is not a lock.",
    ],
    "atoms": [
        src(
            "A proactive agent emailed the entire list a discount because it misread a task. Assume it will use anything it can touch.",
            "Prompt-never is not a lock. Read-access is send-access if Send exists.",
            "Task list → plan → Evens approves any external write → stop",
            "Repeated at open and later: entire list, discount code, not supposed to go out.",
            "Steal assume-it-will-touch. Strip Send from any agent that can read a campaign list.",
            concept="Read-access is send-access",
        ),
    ],
    "C": [
        "Proactive is a slur here. Waiting for Evens is the job.",
        "Million-token context is a false sense of security.",
    ],
    "D": [
        "If an agent can see a list, it cannot have Send.",
        "Do not rely on 'never email the list' in a prompt.",
        "Plan more than you build. Verify before done. Claude stays on-tape.",
    ],
    "E": [
        ex("Task list mentioned a discount", "Agent sent the whole list", "It was being proactive", "Email landed; should not have", "Anything it can touch, assume it will"),
    ],
    "F": [
        "If the agent can read a campaign list → no Send tool.",
        "If the mitigation is a never-prompt → insufficient.",
        "If 98% / 92 / 250k → UNVERIFIED.",
    ],
    "G": [
        "Field wants proactive agents. The scar is a list-send.",
    ],
    "H": [
        "Incident is SOURCE as told; we did not see the inbox. Claude on-tape.",
    ],
    "I": [
        "What tool sent — Gmail MCP? n8n?",
        "Was there an approve node they had turned off?",
    ],
    "J": [
        "Siblings: `jdbOVepEtUE` · `3TdD8Qv5Tk8` · `mPflFTQUCGk`. SYSTEM SYNTHESIS → `send-removed` · `ask-principal`.",
    ],
    "K": [
        "Assume-it-will-touch as a standing operate-never. Keep.",
    ],
    "machines": [{
        "name": "Assume-it-will-touch (no Send on a reader)",
        "loop": "agent may read → no Send/book/publish tools → Evens on any external write → stop",
        "qs": "What can it read? What can it send? Is 'never' only in the prompt?",
        "qf": "Proactive send is a no. Prompt-never as the lock is a no.",
        "proc": "Strip Send from any graph that can see a list. Do not install Claude.",
        "ex": ex("Discount on the task list", "Proactive agent emailed everyone", "Misread", "List-send", "Read-access was send-access"),
        "why": "The scar is the lesson. Proactive + a list is how you get a discount blast.",
        "never": "Send tool on a reader. Prompt-only never. Quote 98%/92 as FACT. Claude as stack.",
        "hive": "`send-removed` · `ask-principal` · `input-required-gate` · `confirm-then-actuate`",
    }],
    "never_extra": [
        "Proactive list-send. Prompt-never as the only lock.",
    ],
    "L": "ACTION = no Send on anything that can read a list; REJECT proactive. Clients parked.",
}

TAKES["3TdD8Qv5Tk8"] = {
    "title": "Codex Course: From Zero to Shipping with OpenAI Codex",
    "speaker": "Nate Herk | AI Automation",
    "kind": "Codex course",
    "words": 14901,
    "A": [
        "Codex as the other harness. Default permissions pause to ask/approve. Settings: auto review or full access — full 'does everything without asking.' Orange warning. Best practice: stay default while learning; later full access 'so you don't have to babysit.'",
        "He names horror stories: agents deleting databases or sending mass emails. Says he has not had that; usually context rot or vague instructions. Then still points at full access as the time-saver.",
        "Ask Codex instead of booking a consulting call. Excel workbook regen. Watch it before the automation is refined; a 20-second human steer saves session limit. Do not install Codex.",
    ],
    "atoms": [
        src(
            "Full access turns off the ask. He names mass-email horror stories in the same breath as 'stop babysitting.'",
            "Default-ask is the steal. Full access is always-allow.",
            "Default permissions → Evens answers each approve → never flip to full on a graph that can send",
            "On-tape: 'full access, now it's just going to do everything without asking' + 'horror stories of … sending out mass emails.'",
            "Steal the pause. Never Codex full access. Never treat babysit as the failure.",
            concept="Default-ask, not full access",
        ),
    ],
    "C": [
        "Babysitting is the job of this desk.",
        "Horror stories are not solved by better planning alone.",
    ],
    "D": [
        "Leave default permissions on. Watch early runs. Steer in 20 seconds.",
        "Do not flip full access because a course said so.",
        "Do not install Codex. Do not book a consult because the tape said ask Codex instead.",
    ],
    "E": [
        ex("First API test", "Pauses for network allow", "Default permissions", "He shows the orange full-access toggle", "The pause is the product"),
    ],
    "F": [
        "If full access / always-allow → REJECT on any send/book/publish graph.",
        "If they cite 'I never had a problem' → insufficient.",
    ],
    "G": [
        "Field graduates to full access. He even tells beginners to stay default — then sells the upgrade.",
    ],
    "H": [
        "Codex / OpenAI on-tape. Mass-email stories second-hand.",
    ],
    "I": [
        "What is 'auto review' vs full in current Codex settings?",
    ],
    "J": [
        "Siblings: `mPflFTQUCGk` · `9IzGe0BBj_c` · `RzLV8sfFdMM` · `CB5bG4mvnS0`. SYSTEM SYNTHESIS → `input-required-gate` · `ask-principal`.",
    ],
    "K": [
        "Default-ask as the Codex analog of input-required-gate. Parked. No Codex.",
    ],
    "machines": [{
        "name": "Default-ask (full access is always-allow)",
        "loop": "work → permission prompt → Evens → resume → stop",
        "qs": "Is it default or full? Can it email or delete?",
        "qf": "Stop-babysitting is a no. Codex is a no.",
        "proc": "Keep the pause. Do not install. Do not full-access a sender.",
        "ex": ex("Network allow prompt", "He shows full access as the time-saver", "Horror stories named", "Orange toggle", "The toggle is the never"),
        "why": "The useful machine is the ask. The course's mature move is to kill the ask.",
        "never": "Codex full access. Always-allow. Install Codex. Mass-email 'because planning was good.'",
        "hive": "`input-required-gate` · `ask-principal` · `confirm-then-actuate`",
    }],
    "never_extra": [
        "Codex full access / always-allow. Install Codex.",
    ],
    "L": "ACTION = keep default-ask; REJECT full access. Clients parked.",
}

TAKES["CB5bG4mvnS0"] = {
    "title": "Codex Browser Use Can Automate Anything",
    "speaker": "Nate Herk | AI Automation",
    "kind": "browser-use demo",
    "words": 4330,
    "A": [
        "Codex browser 'can literally do anything' on the browser or local computer; 'automate anything now.' Headed vs headless. QA: 85 focused checks spoken UNVERIFIED — click, type, try to break the app. Form validation: first name / email / 10-digit phone.",
        "Password-manager fill in the in-app browser (email+password typed by the agent). Deterministic pixel macro vs vision-reasoner. YouTube → X article as a draft: 'I will go ahead and review it' then 'I literally just have to make sure that it looks okay … and I can publish it.'",
        "Morning schedule: scroll Instagram, mark read/unread. Computer-use vs browser-use. API covers ~95%; browser is the remainder; 5–10 minutes saved spoken UNVERIFIED.",
    ],
    "atoms": [
        src(
            "He drafts an X article with browser-use and says he will review then publish. The title says automate anything.",
            "Draft-then-review is the steal. Automate-anything + scheduled Instagram is the trap. Password-fill is a secret capture.",
            "Browser job → draft → Evens reviews → publish card → stop",
            "On-tape: 'put it into an X article as a draft and then I will go ahead and review it' / 'I can publish it.'",
            "Steal headed QA + draft-then-review. Never Codex, never auto-publish, never password-fill.",
            concept="Browser draft, then Evens publishes",
        ),
    ],
    "C": [
        "Anything-on-the-computer includes send/pay/publish.",
        "A headed browser you watch is different from a morning cron.",
    ],
    "D": [
        "Keep: headed QA, draft-into-X, human review.",
        "Strip: publish, scheduled Instagram, password-manager takeover, Codex as stack.",
    ],
    "E": [
        ex("YouTube to X", "Browser formats a draft", "API formatting is weird", "He still must publish", "Draft is the steal"),
        ex("Login", "Agent types email and password", "In-app password manager", "Session exists", "Do not let an agent type secrets we operate"),
    ],
    "F": [
        "If the title is automate anything → assume it can publish.",
        "If a morning cron scrolls + acts → never.",
        "If it types a password → never.",
    ],
    "G": [
        "Field wants browser agents as the API. He also reviews before publish — keep the review.",
    ],
    "H": [
        "85 checks / 5–10 min / Codex on-tape. Do not install.",
    ],
    "I": [
        "Did the X draft ever auto-post in a later cut?",
    ],
    "J": [
        "Siblings: `3TdD8Qv5Tk8` · `J_jswzXhYJA` (walk-away publish). SYSTEM SYNTHESIS → `ask-principal` · `clip-factory`.",
    ],
    "K": [
        "Headed QA as a golden-test analog. Parked. No Codex.",
    ],
    "machines": [{
        "name": "Headed draft, then Evens publishes",
        "loop": "browser job → draft → Evens reviews → publish card → stop",
        "qs": "Headed or headless? Can it publish or type passwords?",
        "qf": "Automate-anything is a no. Morning Instagram cron is a no. Codex is a no.",
        "proc": "Steal review-before-publish. Do not install. Do not schedule acts.",
        "ex": ex("X article", "Draft then 'I can publish it'", "Human still in the line", "Thumbnail ugly; he would fix", "The last inch is Evens"),
        "why": "The useful machine is a watched draft. The title is a blank check.",
        "never": "Codex browser as stack. Auto-publish. Password-fill. Scheduled social acts. Quote 85 checks as FACT.",
        "hive": "`ask-principal` · `clip-factory` · `confirm-then-actuate` · `golden-test-loop`",
    }],
    "never_extra": [
        "Codex 'automate anything.' Auto-publish X. Password-fill. Morning Instagram cron.",
    ],
    "L": "ACTION = headed draft + review; REJECT publish and Codex. Clients parked.",
}

TAKES["KGXFkUlBHxw"] = {
    "title": "n8n Proposal Agent: Call → Deck with Human Approval (Gamma)",
    "speaker": "Nate Herk | AI Automation",
    "kind": "long cut of the Gamma approval short",
    "words": 5064,
    "A": [
        "Hop off a call; need minutes or a proposal. Fireflies webhook when the transcript is done; wait because AI gist/action-items lag the raw transcript. Log date, title, attendees, gist to a sheet.",
        "SOURCE: Slack send-and-wait: 'Would you like to generate a proposal?' Yes → Gamma API. No → stop. He will not bake generate into the logger so paths stay separable.",
        "SOURCE: 'the assumption is not that you would ever automatically send this to the client. You can make your tweaks and then you send it off as a human.' Internal email with the Gamma link after generate. Theme/replace-quotes hygiene. Herkbot 'deck is being generated' then status=generated.",
        "Human approval before expensive generate is on tape. Client-send is also on tape as human. Gamma / Fireflies stay on-tape.",
    ],
    "atoms": [
        src(
            "Slack yes/no before Gamma generate. Then human tweaks before any client send. Two gates.",
            "Silence is not yes. Generate is spend. Send is the world action.",
            "Transcript in → log → Slack wait → Evens yes/no → maybe generate → Evens sends to client → stop",
            "On-tape: send-and-wait 'Would you like to generate a proposal?' + never automatically send to the client.",
            "Steal both gates. Never Gamma as stack. Never auto-send the deck.",
            concept="Approve-generate, then Evens sends",
        ),
    ],
    "C": [
        "Two different hard steps: generate-cost and client-send. Both need Evens.",
        "Wait for Fireflies AI gist or the log is incomplete — still not a send.",
    ],
    "D": [
        "Log the meeting. Slack wait. Evens yes/no. If yes, generate. Evens tweaks. Evens sends.",
        "Do not bake generate into the logger. Do not auto-email the client. Gamma on-tape only.",
    ],
    "E": [
        ex("Green grass proposal meeting ends", "Slack: generate yes/no", "Not every call needs a deck", "Yes → Gamma; status=generated; internal link mail", "Approve-generate is stolen; client-send stays human"),
    ],
    "F": [
        "If Slack wait is missing → do not generate.",
        "If generate succeeded → still not a client send.",
        "If Gamma / Fireflies named as stack → on-tape only.",
    ],
    "G": [
        "Field auto-builds the deck from the transcript. He waits for a human twice.",
    ],
    "H": [
        "Sibling short `-Q_P7HFydZk` already named HITL-before-Gamma. This is the long cut.",
    ],
    "I": [
        "Did the internal Gamma-invite email ever go to a client by mistake?",
    ],
    "J": [
        "SOURCE sibling: `-Q_P7HFydZk`. SYSTEM SYNTHESIS → `ask-principal` · `send-removed` · `input-required-gate`.",
    ],
    "K": [
        "Two-gate proposal (approve generate, then approve send). Parked.",
    ],
    "machines": [{
        "name": "Approve-generate, then Evens sends",
        "loop": "call ends → wait for gist → log → Slack yes/no → maybe generate → Evens tweaks → Evens sends → stop",
        "qs": "Did Evens say yes to generate? Did Evens say yes to client-send?",
        "qf": "Silence is not yes. Internal link-mail is not a client send. Gamma is a no.",
        "proc": "Keep Slack wait + human send. Do not install Gamma. Do not auto-send.",
        "ex": ex("Would you like to generate a proposal?", "He clicks yes", "Expensive generate", "Deck + internal email", "He still sends as a human"),
        "why": "He said it: never automatically send to the client. The Slack wait is the first card.",
        "never": "Auto-generate without Slack wait. Auto-send the deck. Gamma as stack. Quote any $ as FACT.",
        "hive": "`ask-principal` · `send-removed` · `input-required-gate` · `confirm-then-actuate` · `playbook-before-send`",
    }],
    "never_extra": [
        "Auto-generate without Slack wait. Auto-send the proposal to a client. Gamma as stack.",
    ],
    "L": "Long-cut of HITL-before-Gamma. ACTION = two cards (generate, then send). Clients parked.",
}

TAKES["pxzo2lXhWJE"] = {
    "title": "I Built an AI Newsletter System in n8n (research → draft)",
    "speaker": "Nate Herk | AI Automation",
    "kind": "newsletter long cut",
    "words": 6837,
    "A": [
        "Weekly (or daily) newsletter machine: research last week → planning agent titles + topics → deeper research → section writers → editor styles HTML → 'send it off to you for human approval.' Specialized agents so one brain is not given the whole pile.",
        "Gmail is how the newsletter leaves. He configures create-a-draft, then also shows you can send, attach, send-to-someone, and he sends the test to Nate Herk8 Gmail. Opens Drafts and looks at it.",
        "Spoken: get this as a draft once a week; send it to your team or your list; small tweaks and shoot it off. Editor 'approves' copy — that is not Evens.",
    ],
    "atoms": [
        src(
            "Editor-to-Gmail can be a draft or a send. He names human approval, then uses a Gmail node that can send.",
            "Research → specialized writers → draft-in-Gmail is the steal. Send-to-list is the trap. Editor-approve is not Evens.",
            "Cron → research → plan → sections → HTML → Gmail draft → Evens edits → Evens sends → stop",
            "On-tape: 'send it off to you for human approval' and later 'create a draft' plus a live send to a test inbox.",
            "Steal the staged research and Gmail-draft. Strip Send. Editor is not the gate.",
            concept="Newsletter draft, then Evens sends",
        ),
    ],
    "C": [
        "A weekly cron that 'shoots it off' after small tweaks still needs Evens on Send.",
        "Specialized agents are a quality trick, not a publish trick.",
    ],
    "D": [
        "Keep: weekly research window, planner, section writers, HTML editor, Gmail create-draft.",
        "Strip: Gmail send, list-send, editor-as-approver.",
        "Do not send to a list because the test inbox worked.",
    ],
    "E": [
        ex("Editor finishes HTML", "Gmail create-draft + also a test send", "Show the artifact", "Drafts folder + test inbox", "Draft is the steal; the send node stays never"),
    ],
    "F": [
        "If Gmail operation is send → switch to draft or strip.",
        "If editor 'approved' → still a card.",
        "If ICP is named in a prompt → do not unpark.",
    ],
    "G": [
        "Field auto-sends the newsletter. He at least says human approval — then demos send.",
    ],
    "H": [
        "Nate Herk8 is a test inbox. List-send is spoken as the after-step.",
    ],
    "I": [
        "Did the published template default to draft or send?",
    ],
    "J": [
        "SYSTEM SYNTHESIS → `send-removed` · `ask-principal` · `warm-draft-hitl`.",
    ],
    "K": [
        "Staged research → Gmail draft for a later Path C. Parked.",
    ],
    "machines": [{
        "name": "Research → HTML → Gmail draft (Evens sends)",
        "loop": "weekly trigger → research → plan → sections → HTML → Gmail draft → Evens edits → Evens sends → stop",
        "qs": "Is the Gmail node draft or send? Who is the list?",
        "qf": "Editor-approve is not Evens. Shoot-it-off is a no.",
        "proc": "Keep the staged agents + create-draft. Strip Send.",
        "ex": ex("Human approval promised", "He still has a send-capable Gmail node", "Test to himself", "Drafts + test mail", "Promise the draft; refuse the send"),
        "why": "The useful machine is a weekly draft pile. The operated node can send the list.",
        "never": "Auto-send newsletter / list. Treat editor as the gate.",
        "hive": "`send-removed` · `warm-draft-hitl` · `ask-principal` · `playbook-before-send`",
    }],
    "never_extra": [
        "Auto-send the newsletter or the list. Editor-approve as Evens.",
    ],
    "L": "ACTION = Gmail draft only; REJECT list-send. Clients parked.",
}

TAKES["HN0oWxbF2bM"] = {
    "title": "From Zero to Inbox Agent (Full Beginner's Course, No-Code)",
    "speaker": "Nate Herk | AI Automation",
    "kind": "inbox-agent beginner course",
    "words": 8953,
    "A": [
        "Zero-to-inbox-agent: classify and label incoming Gmail; scale to a full inbox manager. Wireframe first. Three tools. n8n 14-day trial / ~$25 mo spoken UNVERIFIED. Gmail trigger (Outlook possible, different clicks).",
        "Classifier into four labels he already created. Support branch: he first shows send-back-in-the-same-thread, then the tip — send a draft instead 'because we probably don't want that to go out' and we can tweak. Attribution off: by default append-attribution would send. Create-draft + thread ID to stay in-thread. Draft node has no attribution toggle — it will not auto-send.",
        "Billing/other branches: label + notify Slack/ClickUp/WhatsApp/Telegram. Promotions get a different order. He says you are in full control of what happens per category — including a live reply.",
    ],
    "atoms": [
        src(
            "He demos same-thread send, then adds the extra tip: create a draft because we probably do not want that to go out. Attribution-on is a silent send.",
            "Label + in-thread draft is the steal. Same-thread auto-reply is the trap. Classifier-pass is not Evens.",
            "New mail → classify → label → draft in-thread → Evens sends → stop",
            "On-tape: 'send a draft instead because we probably don't want that to go out' + turn off append attribution or it sends.",
            "Steal draft + attribution-off. Never auto-reply. $25 trial UNVERIFIED.",
            concept="Label + in-thread draft, then Evens sends",
        ),
    ],
    "C": [
        "Full control includes the ability to reply. That is why the default must be draft.",
        "A classifier is a router, not a sender.",
    ],
    "D": [
        "Wireframe first. Four labels. Classifier on subject+body.",
        "Support: create-draft + thread ID. Attribution off on any reply node.",
        "Notify Evens on billing. Do not WhatsApp-send a customer.",
        "Do not scale to 'full inbox manager' with Send on the canvas.",
    ],
    "E": [
        ex("Issue logging into dashboard", "Classifier → support", "Show the happy path", "He almost replies live, then switches to draft", "The tip is the steal; the first node was send"),
        ex("Attribution default", "Append attribution on", "n8n would send", "He turns it off", "A hidden toggle is a send"),
    ],
    "F": [
        "If Gmail is reply/send → switch to draft or strip.",
        "If attribution is on → treat as send.",
        "If they want to 'just reply' after 30 battle-tests → still a card.",
    ],
    "G": [
        "Field ships inbox agents that reply. He names the draft tip in the same course as the send demo.",
    ],
    "H": [
        "n8n $25 / 14-day UNVERIFIED. Four categories are his demo set.",
    ],
    "I": [
        "What are the four labels by name in the sheet?",
        "Did the published template default to draft?",
    ],
    "J": [
        "Siblings: `jdbOVepEtUE` (brief-only) · `pxzo2lXhWJE` (Gmail draft). SYSTEM SYNTHESIS → `inbox-to-task-routing` · `send-removed`.",
    ],
    "K": [
        "Label + in-thread draft as the inbox SKU. Parked.",
    ],
    "machines": [{
        "name": "Classify + label + in-thread draft (Evens sends)",
        "loop": "new mail → classify → label → create-draft in thread → Evens edits → Evens sends → stop",
        "qs": "Reply or draft? Attribution on? Who gets notified?",
        "qf": "Same-thread auto-reply is a no. Attribution-default-send is a no.",
        "proc": "Keep classifier + labels + create-draft + thread ID. Strip reply/send. Notify Evens.",
        "ex": ex("Support email", "He first wires a reply", "Then: we probably don't want that to go out", "Switches to draft", "Ship the second node, not the first"),
        "why": "He said the quiet part: we probably do not want it to go out. That is this desk.",
        "never": "Auto-reply / attribution-send. Scale to full inbox manager with Send. Quote $25 as FACT.",
        "hive": "`inbox-to-task-routing` · `send-removed` · `warm-draft-hitl` · `ask-principal`",
    }],
    "never_extra": [
        "Same-thread auto-reply. Attribution-default send. Full inbox-manager with Send.",
    ],
    "L": "ACTION = label + in-thread draft; REJECT reply. Attribution-on counts as send. Clients parked.",
}


if __name__ == "__main__":
    for vid, t in TAKES.items():
        p = write_one(vid, t)
        print("wrote", vid, p.stat().st_size)
    print("batch7", len(TAKES))
