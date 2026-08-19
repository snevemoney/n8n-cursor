#!/usr/bin/env python3
"""HITL DVL takes for the 7 transcript-only packets (not in the 139)."""
from _hitl_dvl_writer import write_one

def src(claim, why, mech, ev, act, **kw):
    return {"concept": kw.pop("concept"), "claim": claim, "why": why, "mech": mech, "ev": ev, "act": act, **kw}

def ex(sit, act, why, out, les, name="On-tape run"):
    return {"name": name, "sit": sit, "act": act, "why": why, "out": out, "les": les}

def src_path(vid):
    return f"docs/hive/outer-heaven/CONTENT/watch-later/packets/{vid}/transcripts/full.txt"

TAKES = {}

TAKES["-zL_trhnQaI"] = {
    "title": "So You Learned Claude, Now What?",
    "speaker": "Nate Herk | AI Automation",
    "kind": "caption ingest · transcripts/full.txt",
    "words": 4636,
    "source": src_path("-zL_trhnQaI"),
    "gaps": "Caption-only. Timestamps UNKNOWN. Visual/click UNObserved. Do not invent UI.",
    "A": [
        "Claude skill alone is nothing long-term; tools swap every year. Paid gigs moved: one chatbot → automation agencies → agents → agentic. People glued to the old phase race to the bottom. Gartner $202B agentic 2026 UNVERIFIED.",
        "McKinsey: ~88% orgs use AI, ~1/3 real projects UNVERIFIED. Next value is who decides what to build, why, and whether it worked. Consultant = doctor; builder = pharmacist. Clients know what hurts, not what they need. Consulting market past $64B by 2028; ~30% projects abandoned; ~6% good at AI UNVERIFIED.",
        "Two roads, same job: independent long-term partner (not a scrappy agency selling automations) vs in-house AI person. Diagnose → prescribe → prove. IBM 76% CAIO is giant enterprises (2,000 CEOs, median $5.8B) — he caveats; mid-size still open. Six-figure titles spoken UNVERIFIED.",
        "Nate: Goldman side-research felt too slow → freelance → True Horizon past $100k/mo then exit UNVERIFIED → education/community 400k UNVERIFIED. Not an engineer. Winners prove business results, not tutorial hours. Why hire you over the person who watched the same YouTube?",
        "Four viewers: hobby (monetize to validate + fund tokens), aspiring entrepreneur, employee leveling up, owner consulting their own business as first client. AI-consultant label expires (Excel accountant / internet marketer).",
        "Do not quit. Do not build a personal brand. Wrong move = automate work that is not a constraint (a week to save 20 minutes nobody was waiting on). Rule: constraint first, KPI second, build third.",
        "Four steps: audit your role → one small project in one corner as a case study → pattern-recognize problems → formalize the role from the inside. Alan: 15-year email dev, team let go, n8n + Claude Code, built in public (two YouTube + LinkedIn), recruiter asked 'what have you built?', sent links, skipped HR, Head of AI at 15-person Young. Close is free Skool + resource guide.",
    ],
    "atoms": [
        src("Constraint first, KPI second, build third. Automating a non-constraint is a week to save 20 minutes nobody waited on.",
            "Anyone can say they built an agent. Almost nobody can say they moved a named number.",
            "Name the leak + the number → one-corner build → prove → Evens sends/deploys/formalizes",
            "On-tape: constraint first, KPI second, build third; one little corner; Alan sent links.",
            "Steal the order. Hold send of links, live corner deploy, formalize-the-seat mail, and first consultant outreach.",
            concept="Constraint then KPI then card"),
        src("Alan won on links to proof, not a tutorial résumé. Recruiter question was 'what have you built?'",
            "Send-the-links is still send. Two YouTube channels are publish. Formalize-from-inside is a proposal Evens sends.",
            "Proof folder → Evens sends links / posts / proposes → stop",
            "On-tape: she just sent links; skip HR; go to CEO.",
            "Steal checkout-proof as a folder. Never auto-send LinkedIn / recruiter / portfolio.",
            concept="Proof folder, Evens sends"),
    ],
    "C": [
        "The tool is temporary. The doctor/pharmacist split is the job.",
        "Own business as first client is Path C practice, not a hunt.",
        "AI-consultant as a label expires; the edge is proof.",
    ],
    "D": [
        "Audit the role for constraints, not repetitive busywork. Write the KPI before the build.",
        "One corner. Sandbox first. Live cutover is a card.",
        "Draft the proof links. Evens sends. Evens posts LinkedIn. Evens proposes the seat.",
        "Do not quit. Do not start an agency because the tape named the phase. Do not join Skool.",
    ],
    "E": [
        ex("Alan applies Head of AI", "Recruiter: what have you built?", "Proof beats résumé", "She sent links; skipped HR", "The folder is the steal; the send is Evens"),
        ex("Non-constraint task", "Spend a week automating it", "Looks like AI work", "Saved 20 minutes nobody waited on", "No KPI = no card worth sending"),
    ],
    "F": [
        "If they say I built an agent → ask which number moved.",
        "If implement-in-one-corner touches mail/pay/customers → deploy card.",
        "If tape $100k/mo / $202B / 76% / 400k → UNVERIFIED.",
        "If Claude/n8n named as stack → on-tape only.",
    ],
    "G": [
        "Field starts an agency or quits. He says do not quit, do not brand, consult from inside or as a partner.",
    ],
    "H": [
        "All market/pay/job-count figures UNVERIFIED. True Horizon exit UNVERIFIED. Claude Code on-tape.",
    ],
    "I": [
        "What was in Alan's links — live prod or demos?",
        "Did the one-corner implement ever send company mail?",
    ],
    "J": [
        "SYSTEM SYNTHESIS → `paid-slice` · `slice-build` · `golden-test-loop` · `ask-principal` · `session-bootstrap` · `outcome-offer-funnel`.",
        "Sibling: `diY71x7GUjI` (zero to Head of AI). Do not merge LESSONS.",
    ],
    "K": [
        "Constraint-KPI-then-build as the in-house Path C. Parked. No new icp.",
    ],
    "machines": [{
        "name": "Constraint + KPI + one-corner proof (Evens sends/deploys)",
        "loop": "audit constraint → name KPI → one-corner build → prove → Evens sends links / deploys / proposes → stop",
        "qs": "What number? Is the corner live mail/pay? Who sends the links?",
        "qf": "Agency SKU is a no. Auto-LinkedIn is a no. Quit-job is a no. Skool is a no.",
        "proc": "Keep the four steps. Card every world action. Clients parked.",
        "ex": ex("What have you built?", "Alan sent links", "Proof", "Head of AI at Young", "Draft the packet; Evens presses send"),
        "why": "He already has our spine: named number before build. Send/deploy/formalize stay HITL.",
        "never": "Auto-send portfolio/LinkedIn/recruiter. Auto-deploy the corner. Auto-book sales/boss. Quote $100k/mo/$202B/76%/400k as FACT. Claude as stack. New icp.",
        "hive": "`paid-slice` · `slice-build` · `golden-test-loop` · `ask-principal` · `session-bootstrap`",
    }],
    "never_extra": [
        "Start an AI agency / sell automations as the SKU.",
        "Auto-send LinkedIn / recruiter / portfolio. Auto-publish two YouTube channels.",
        "Quote $100k/mo · $202B · $64B · 170M jobs · 56% premium · 400k · IBM 76% as FACT.",
    ],
    "L": "ACTION = constraint + KPI + proof folder; REJECT send/deploy/formalize. $ UNVERIFIED. Clients parked.",
}

TAKES["0YXjEzFfft8"] = {
    "title": "Get RICH in the A.I. Revolution (2026)",
    "speaker": "MoreMozi",
    "kind": "caption ingest · transcripts/full.txt",
    "words": 12802,
    "source": src_path("0YXjEzFfft8"),
    "gaps": "Caption-only. Timestamps UNKNOWN. Visual/click UNObserved.",
    "A": [
        "Three pieces: AI hygiene, workflows (SOP = prompt), then AI assets / data sources. Hygiene: new chat per new topic; iterate in the same window (fourth answer beats the first); verify facts and figures; outsource typing not thinking; the idea is still the alpha.",
        "Repeated work gets a prompt repository. Time-study in 15-minute blocks. Store by role (tabs) or paste the prompt in a recurring calendar block. Update when outputs stop being good.",
        "Three folders: business context, SOP / prompt repo, data sources (tweets, emails, sales recordings, VSLs, FAQs, support, website copy, ads). AI sounds like the internet unless you train it on work you already did.",
        "Leverage ≠ automation. True automation never gets checked and never breaks — he says uncommon. Mosey Minute 60–90 → 15–20 min; ~20% of ACQ advisory; half-day/month for 16 emails (4x). Tweets 1.5h/day → 90 min/week. YouTube 2h → 15 min, ~40% lead flow. 6,000 tweets as the bank. $ UNVERIFIED.",
        "Recipe: get assets, star-separate them, upload, long prompt (role / task / rules / output). Short prompt → long slop. Prompt chains: 10 winning calls → gold script; past newsletters + a new idea; failed calls → objection playbook; style analyzer (not 'sound like me'); transcripts → VSL / YouTube / shorts / lead magnet / follow-up that books calls (email and SMS).",
        "11–14 chain: offer architect → sales page → call script → VSL. Close is ACQ AI + free 0–$100M 10-stage roadmap (enter your info). GPT / Gemini / Grok on tape. Repeated work also names send emails and send voicemails.",
    ],
    "atoms": [
        src("Three folders + a long prompt + Evens. He said the idea is the alpha and he still edits. Automation that never gets checked is the trap he named.",
            "SOP=prompt is a job card. Follow-up that books is send+book. ACQ close is a lead magnet.",
            "Folders → long prompt → draft → Evens verifies → Evens sends/publishes/books → stop",
            "On-tape: new chat per topic; verify facts; follow-up that books calls (email and SMS); enter your info for the roadmap.",
            "Steal hygiene + three folders + gold-script draft. Never auto-send/SMS/book. No ACQ/GPT stack.",
            concept="Three folders, then Evens"),
    ],
    "C": [
        "Leverage is a human still in the loop. Automation that never gets checked is the never.",
        "Get-rich is the title. The operable lesson is verify + idea-is-alpha.",
    ],
    "D": [
        "New chat per topic. Iterate in-window. Verify facts. Do not outsource thinking.",
        "Keep three folders. Long prompt: role/task/rules/output.",
        "Gold script and objection playbook stay drafts. Evens sends. Evens books.",
        "Do not enter info into ACQ. Do not install GPT/Gemini.",
    ],
    "E": [
        ex("10 winning calls", "Chain into a gold script", "Booking bam fam", "Script exists", "Playbook-before-send; Evens still sends"),
        ex("Follow-up that books", "Email and SMS from transcripts", "Close the loop", "Books calls", "That sentence is send+book"),
    ],
    "F": [
        "If the chain ends in send/SMS/book → card.",
        "If they outsource thinking → reject.",
        "If 20% / 4x / 6,000 / $100M → UNVERIFIED.",
    ],
    "G": [
        "Field wants never-checked automation. He said that is uncommon and the idea is still the alpha.",
    ],
    "H": [
        "All leverage % and tweet counts UNVERIFIED. ACQ / Hormozi on-tape. Caption-only.",
    ],
    "I": [
        "Did any chain auto-SMS a real list on camera?",
    ],
    "J": [
        "SYSTEM SYNTHESIS → `session-bootstrap` · `wiki-ingest` · `agent-job-card` · `playbook-before-send` · `golden-test-loop` · `clip-factory`.",
        "Sibling: `rMf-JuikR-Q` (same speaker, workflow-not-role).",
    ],
    "K": [
        "Three-folder vault + SOP-is-prompt. Parked. No ACQ SKU.",
    ],
    "machines": [{
        "name": "Three folders + long prompt (Evens sends/books)",
        "loop": "new chat → folders → long prompt → verify → Evens sends/publishes/books → stop",
        "qs": "Did we verify facts? Does the chain SMS or book?",
        "qf": "Never-checked automation is a no. ACQ roadmap is a no. Auto-book follow-up is a no.",
        "proc": "Keep hygiene + folders + gold-script draft. Strip send/SMS/book. No vendor install.",
        "ex": ex("Follow-up that books calls", "Email and SMS from the chain", "Close", "Books", "Draft the follow-up; Evens sends"),
        "why": "He named verify and idea-is-alpha. He still closes on book-a-call. We keep the first and refuse the last.",
        "never": "Auto-send email/SMS/voicemail. Auto-book. Auto-publish VSL/ads. ACQ AI. Quote 20%/4x/6,000/$100M as FACT.",
        "hive": "`session-bootstrap` · `wiki-ingest` · `playbook-before-send` · `golden-test-loop` · `ask-principal`",
    }],
    "never_extra": [
        "Auto-send email / SMS / voicemail. Follow-up that books. ACQ AI / 0–$100M magnet.",
        "Quote 20% / 4x / 6,000 tweets / $100M as FACT.",
    ],
    "L": "ACTION = folders + verify + draft; REJECT send/SMS/book. Get-rich $ UNVERIFIED. Clients parked.",
}

TAKES["B4p9O2P2a3c"] = {
    "title": "5 Claude AI Side Hustles You Can Run While Working Full-Time",
    "speaker": "Shane Hummus",
    "kind": "caption ingest · transcripts/full.txt",
    "words": 4311,
    "source": src_path("B4p9O2P2a3c"),
    "gaps": "Caption-only. Timestamps UNKNOWN. Visual/click UNObserved. On-screen prompts not copied as hive SKUs.",
    "A": [
        "Five Claude side hustles on a lunch break / weekends. Shane: pharmacist, hated the job by month three; lunch-break thing 'has made me over $10 million'; people he's worked with 'over $100 million' UNVERIFIED. Named receipts for each hustle.",
        "Hustle 1: describe an app in English, Claude writes the software. Do not say build me an app — interview you first (what it does, who, one core feature) before a line of code. Max: 28 apps in 8 months, $200 → $10k/mo, reuse ~90% code UNVERIFIED. Clone a working app 1% better / 1% different — copy the idea, not the app. Mid-roll: free YouTube live + niche validator (ChatGPT as well as Claude skills).",
        "Hustle 2: teach what you already do; record once. Lisa Collum binders → $1.9M profit; English with Lucy AdSense $10–29k/mo and $400k/mo; Physics Wallah $5.2B UNVERIFIED. Give Claude the 10 boring questions people ask you, rank by search, write the first script in your words.",
        "Hustle 3: guide a decision you already made (scar / story). Isaiah: 8k subs / $32k profit in 2 months UNVERIFIED. Kevin Hunter (Homework Guy) = car-desk advice + book-a-call site. Shane wrote career/degree scripts on pharmacy lunch breaks, recorded weekends.",
        "Hustle 4: hired robot — one repetitive job a business pays a human for, charge monthly. Nate Herk $23k; ALO/Powers Diamond Dozen $66k then sold $150k (CNBC-docs claim) UNVERIFIED. Don't start with the pizza place; go after businesses already online. If plumbers already buy websites, sell websites better.",
        "Hustle 5: explain the system your job lives in, not how to do the job. Nurse Jen / Nurse Julie. Film the everyone-knows-that that would make an outsider angry. Close: every hustle needs traffic; YouTube is the distribution. 1:1 mentorship / book a call / ~5 seats / 18% acceptance. Claude / Claude Code / ChatGPT on tape.",
    ],
    "atoms": [
        src("Interview before a line of code. One core feature. Ten boring questions → script in your words. Evens still records and still publishes.",
            "Screenshot-the-prompt-and-ship is the trap. Book-a-call close is book. Hired-robot that writes the five replies is still send.",
            "Interview → one slice → draft → Evens records/sends/publishes → stop",
            "On-tape: make Claude interview you first; Kevin Hunter book-a-call; writing the same five replies as a product.",
            "Steal interview-before-write + 10-questions draft + plumbers-already-buy-sites. Never auto-book coaching. Never auto-send the five replies. No Claude.",
            concept="Interview, then a card, then Evens"),
    ],
    "C": [
        "Lunch-break is a time box, not a permission to spray 28 apps.",
        "Demand you can see (plumbers already buy sites) beats a pizza-place agent.",
    ],
    "D": [
        "Interview unknowns before execute. One core feature. Do not 28-app mill.",
        "Ten questions → script draft. Evens records. Evens publishes.",
        "Hired robot: draft the five replies. Evens sends. Monthly charge is pay — HITL.",
        "Do not book Shane's call. Do not install Claude. No new icp.",
    ],
    "E": [
        ex("Build me an app", "He says interview first", "Context before code", "Maps screens after questions", "session-bootstrap on tape"),
        ex("Kevin Hunter", "Book-a-call site", "Guide a decision", "Call is the close", "Advice draft is steal; book is never"),
    ],
    "F": [
        "If they skip the interview → reject execute.",
        "If hired-robot includes send/reply → card.",
        "If $10M / $23k / $5.2B / 18% → UNVERIFIED.",
    ],
    "G": [
        "Field ships 28 apps. He also says interview first and copy the idea 1% — we keep interview + one slice.",
    ],
    "H": [
        "Every named receipt UNVERIFIED. Claude on-tape. Caption-only prompts not copied as SKUs.",
    ],
    "I": [
        "Did Max's 28 apps have a real checkout on camera?",
    ],
    "J": [
        "SYSTEM SYNTHESIS → `session-bootstrap` · `slice-build` · `clip-factory` · `one-channel-deep` · `ask-principal`.",
        "Nate $23k is UNVERIFIED here; see `HNKlFTd1maM` (no-send outreach).",
    ],
    "K": [
        "Interview-before-write + 10-questions script. Parked. No YouTube-coach icp.",
    ],
    "machines": [{
        "name": "Interview + one slice + draft (Evens ships)",
        "loop": "interview unknowns → one core feature → draft script/app → Evens records/sends/publishes → stop",
        "qs": "Did it interview? Is this a 28-app mill? Does the robot send?",
        "qf": "Auto-book coaching is a no. Auto-send five replies is a no. Claude is a no.",
        "proc": "Keep interview + 10 questions. Strip send/book/publish. Plumbers-already-buy-sites is Path A parked.",
        "ex": ex("Hired robot", "Same five replies monthly", "Charge a fraction of a human", "Send is the product", "Draft the five; Evens sends"),
        "why": "Interview-before-write is our bootstrap. The hustles still end in publish/book/send.",
        "never": "Auto-book Shane/Kevin. Auto-publish YouTube. Auto-send hired-robot replies. 28-app mill. Quote $10M/$23k/$5.2B as FACT. Claude as stack.",
        "hive": "`session-bootstrap` · `slice-build` · `clip-factory` · `one-channel-deep` · `ask-principal`",
    }],
    "never_extra": [
        "Auto-book coaching. Auto-publish. Hired-robot auto-reply. 28-app spray.",
        "Quote $10M / $100M / $10k/mo / $23k / $5.2B / 18% as FACT.",
    ],
    "L": "ACTION = interview + one-slice draft; REJECT book/publish/send. Clients parked.",
}

TAKES["FHsY924cEAk"] = {
    "title": "10 Things Every Smart YouTuber Does IMMEDIATELY After Uploading (With AI)",
    "speaker": "Shane Hummus",
    "kind": "caption ingest · transcripts/full.txt",
    "words": 4536,
    "source": src_path("FHsY924cEAk"),
    "gaps": "Caption-only. Timestamps UNKNOWN. Visual/click UNObserved.",
    "A": [
        "After publish, the next ~10 minutes matter. Audit the title first: searchable keyword near the front (on-base) + attractive hook (homepage home run). Score click and SEO; five rewrites; pick one that does both — Moneyball, not keyword-stuff. $477k AdSense / 1M+ subs UNVERIFIED.",
        "Paste the transcript into a description prompt. Money links above the fold; SEO block just under (newspaper). Chapters from a timestamped transcript; tease, don't spoil; uncheck auto-chapters; A/B timestamps — some niches lose watch time. Tags ~30 seconds; save in upload defaults once.",
        "Pinned comment = open a conversation + point to the link. Pin the second it goes live. First hour: reply on this video and other videos (red-dot party). He stopped on the 1.5M channel; still tells new/small channels; you could hire someone to reply. Brother Zach replied until 800k views UNVERIFIED.",
        "Community / post tab the second it goes live: intrigue copy + drop the thumbnail. Early watches are the heat signal. First-hour replies: screenshot comments → Claude draft → copy-paste; keep the thread going (reply to the reply).",
        "Repurpose: timestamped transcript → three clip moments → editor / Descript / Opus → Shorts / IG / TikTok. Human still cuts. Thumbnail text: four words max, cover-the-title test, do not repeat the title; pick the two number-gaps that fight. End screen: tell them the next video every time (Netflix autoplay).",
        "Close is live training + 3–5 coaching spots + Sean $500k-month case study UNVERIFIED. Only book the call if you're very serious.",
    ],
    "atoms": [
        src("Pack the post-upload, then Evens ships. Uncheck auto-chapters. Five title rewrites is a pick, not a publish. Screenshot → draft reply is not auto-comment.",
            "First-hour party is Evens in the chair. Hire-to-reply and paste-and-fire are the trap. Cover-the-title is a preview test.",
            "Transcript → title/desc/chapters/clips drafts → Evens pins/replies/posts/publishes → stop",
            "On-tape: pin the second it goes live; screenshot comments into Claude; three clip suggestions; uncheck automatic chapters.",
            "Steal Moneyball title + three clips + cover-the-title. Never auto-pin/comment/reply/publish. No Claude/Opus stack.",
            concept="Post-upload pack, Evens ships"),
    ],
    "C": [
        "A system after upload is hygiene. A bot that sounds human in the first hour is publish.",
        "He stopped the party at 1.5M — the machine is for small channels, still HITL.",
    ],
    "D": [
        "Score title click+SEO. Do not grab the first rewrite. Cover-the-title on a preview.",
        "Uncheck auto-chapters. A/B timestamps. Tags once in defaults.",
        "Draft pin + community + three clips. Evens posts. Evens replies.",
        "Do not book Shane. Do not hire a reply farm. Do not install Claude/Descript/Opus.",
    ],
    "E": [
        ex("Title audit", "Five rewrites, pick both jobs", "Moneyball", "He does not grab the first", "Pick is the steal; live title edit is publish"),
        ex("First-hour comments", "Screenshot → Claude draft → paste", "Sounds human", "Thread continues", "Draft is steal; paste-as-Evens is never if unattended"),
    ],
    "F": [
        "If auto-chapters / auto-pin / auto-reply → never.",
        "If cover-the-title fails → fix before live party.",
        "If $477k / 800k / $500k-month → UNVERIFIED.",
    ],
    "G": [
        "Field pastes the first rewrite and ghosts. He stays for the first hour — as a human.",
    ],
    "H": [
        "AdSense / sub / Sean $ UNVERIFIED. Caption-only. Prompts not copied as SKUs.",
    ],
    "I": [
        "Which niches lost watch time with timestamps?",
    ],
    "J": [
        "SYSTEM SYNTHESIS → `clip-factory` · `one-channel-deep` · `click-live-site` · `ask-principal`.",
        "Sibling: `B4p9O2P2a3c` (same closer).",
    ],
    "K": [
        "Post-upload pack as clip-factory hygiene. Parked.",
    ],
    "machines": [{
        "name": "Post-upload pack, then Evens ships",
        "loop": "publish already happened → draft title/desc/chapters/pin/clips → Evens applies/replies → stop",
        "qs": "Auto-chapters on? Who pastes the reply? Who posts the community tab?",
        "qf": "Auto-comment/pin/reply is a no. Book-the-coaching-call is a no.",
        "proc": "Keep Moneyball + three clips + cover-the-title. Evens in the first hour. No vendor.",
        "ex": ex("Pinned comment + first hour", "Claude drafts; he says pin when live", "Party signal", "Red-dot notifications", "Evens pins; a bot does not"),
        "why": "The useful machine is a 10-minute pack. The operated machine comments as you.",
        "never": "Auto-pin / auto-comment / auto-reply / auto-publish Shorts. Hire-to-spam. Quote $477k/$500k as FACT. Claude/Opus as stack.",
        "hive": "`clip-factory` · `one-channel-deep` · `click-live-site` · `ask-principal`",
    }],
    "never_extra": [
        "Auto-pin / auto-comment / auto-reply / auto-publish clips.",
        "Quote $477k AdSense / 1.5M / $500k-month / 800k as FACT.",
    ],
    "L": "ACTION = draft the post-upload pack; REJECT auto-pin/comment/publish. Clients parked.",
}

TAKES["I7mpF7_pnPM"] = {
    "title": "Watch Me Build & Sell an AI SaaS in 10 hours",
    "speaker": "Ty Chen",
    "kind": "caption ingest · transcripts/full.txt",
    "words": 7720,
    "source": src_path("I7mpF7_pnPM"),
    "gaps": "Caption-only. Timestamps UNKNOWN. Visual/click UNObserved. Deploy clicks spoken, not invented.",
    "A": [
        "Challenge: real product + real checkout + strangers pay in 10 hours total (build + brand + site + marketing). Not a waitlist or beta. Tools: laptop, $10/mo Abacus Chat LLM, Stripe. He films the miss if it misses. Sell/audience first: X post the night before (~400 followers).",
        "Product = AI analyzer for Koshi / Polymarket; name Polymind; Canva logo; Abacus clones a site + Stripe. Copy not too similar. Offer: ICP 25–34 US (he narrows Gemini's 18–34); $1 / 7 days; refund the dollar if not profitable. Do not stack X posts inside 3 hours.",
        "GoDaddy domain + DNS + deploy. He tests checkout → login → dashboard, then a live screenshot analyze, then an overnight Seoul temperature bet to see if it works. Next day: list personal + business network; DM first. Copy viral X posts (hook + photo + URL in comments). School (~700) + one IG reel. No paid ads.",
        "48h: two $1 trials. Last X post >1,000 views (outlier for 400 followers). School few comments. IG reel ~400 views, flop. One payer named Steve Pan — business network, already trades that category.",
        "He kills Polymind on opportunity cost vs Autoplay (AI-implementation business). Same signal = yes if starting from zero. Close: sold before it worked; vibe-coded site/workflow in under an hour; coaching / book-a-call CTA. 16yo $100k/mo hook UNVERIFIED.",
    ],
    "atoms": [
        src("Real checkout in one sitting is the proof. $1 is a signal, not revenue. He DMs the warm net one name at a time, then kills the SKU on opportunity cost.",
            "Betting helper is operate-never. Mass-DM and book-a-call coaching are never. Abacus/Stripe-from-chat is deploy.",
            "Announce constraint → thin checkout → Evens tests pay path → Evens DMs one name → Evens kills or keeps → stop",
            "On-tape: real checkout that real people will be paying for; send a quick message to the first person; Steve Pan; I would not be sitting here thinking about killing it if starting from zero — he still kills it.",
            "Steal checkout-proof + one-channel (X) + warm-net-first + kill-on-cost. Never Polymind/betting. Never mass-DM. Never Abacus deploy. Never book-a-call.",
            concept="Checkout-proof, then Evens (kill or keep)"),
    ],
    "C": [
        "Sold-before-it-worked is a constraint, not a license to spray.",
        "X did the work; IG flopped — one channel deep.",
        "Two $1 trials from a warm name is not a stranger-pay miracle.",
    ],
    "D": [
        "Announce the clock before the build. Thin V1 + real checkout. Evens tests pay path.",
        "Warm network first, one name. Do not mass-DM. Do not stack posts inside 3 hours.",
        "Kill vs keep is Evens. Do not book Ty's call. Do not install Abacus. No new icp.",
    ],
    "E": [
        ex("10-hour clock", "X the night before, then checkout", "Sell first", "Two $1 trials; Steve Pan from business net", "Checkout is the steal; the SKU is never"),
        ex("Opportunity cost vs Autoplay", "He kills Polymind", "Same signal would keep it from zero", "Killed", "ask-principal on keep/kill"),
    ],
    "F": [
        "If checkout is waitlist-only → not this machine.",
        "If they spray School/X/IG → stop at the channel that worked.",
        "If $1 / two payers / $100k/mo → UNVERIFIED.",
        "If betting / Polymarket → never as a hive SKU.",
    ],
    "G": [
        "Field hides the miss. He films it and then kills a working checkout for a better business.",
    ],
    "H": [
        "Two payers / 400 followers / 1,000 views UNVERIFIED as ours. Abacus / Stripe / GoDaddy on-tape. Caption-only deploy.",
    ],
    "I": [
        "Did the Seoul overnight bet ever settle on camera?",
        "Was the second $1 also warm-net?",
    ],
    "J": [
        "SYSTEM SYNTHESIS → `checkout-proof` · `paid-slice` · `one-channel-deep` · `playbook-before-send` · `ask-principal`.",
        "Already cited on steal-sheet; this desk still writes A–L. Do not emit atoms.",
    ],
    "K": [
        "Checkout-in-one-sitting + kill-on-opportunity-cost. Parked. No betting SKU.",
    ],
    "machines": [{
        "name": "Real checkout + warm-one + kill/keep (Evens)",
        "loop": "announce → thin checkout → Evens tests pay → Evens DMs one name → Evens kills or keeps → stop",
        "qs": "Is checkout real? Warm or spray? Who deploys? Who kills?",
        "qf": "Polymind/betting is a no. Mass-DM is a no. Abacus talk-to-deploy is a no. Book-a-call is a no.",
        "proc": "Steal the clock + checkout + one-channel + one-name. Evens on pay/DM/deploy/kill.",
        "ex": ex("First person on the list", "Send a quick message", "Warm net", "Steve Pan paid $1", "One-name is the steal; the send is Evens"),
        "why": "Stranger-pay was the challenge; the receipt was a warm trader. Proof still matters. The SKU does not.",
        "never": "Betting/Koshi/Polymarket SKU. Mass-DM. Auto-deploy GoDaddy+Stripe. Auto-book coaching. Quote $1/two payers/$100k/mo as FACT. Abacus as stack.",
        "hive": "`checkout-proof` · `paid-slice` · `one-channel-deep` · `playbook-before-send` · `ask-principal`",
    }],
    "never_extra": [
        "Polymind / betting helper as a hive SKU. Mass-DM. Talk-to-deploy Stripe.",
        "Quote $1 / two payers / 16yo $100k/mo as FACT. Book Ty's call.",
    ],
    "L": "ACTION = checkout-proof + one-name draft; REJECT deploy/DM-spray/book. Kill/keep is Evens. Clients parked.",
}

TAKES["U6k4MeVks_Y"] = {
    "title": "Give Me 50 Minutes, I'll Give You 1000+ Hours Of Claude Code Knowledge (2026 Guide)",
    "speaker": "Chase AI",
    "kind": "caption ingest · transcripts/full.txt",
    "words": 11335,
    "source": src_path("U6k4MeVks_Y"),
    "gaps": "Caption-only. Timestamps UNKNOWN. Visual/click UNObserved.",
    "A": [
        "Beginner: desktop app not terminal-first; leave global instructions blank; capabilities on; PR hooks off if you do not know git; Claude-in-Chrome on. Permissions: manual asks every time; bypass can download/install/delete/edit — he calls it kind of scary; auto = bypass plus a classifier that stops what it labels dangerous; he says sit on auto all the time.",
        "New work starts in plan mode: microphone stream of consciousness + ask what I'm not thinking about. When the plan is good: accept and auto mode, not manual. Demo site: fake SaaS Lighthouse, small-startup audience, book-a-call CTA, clean light SaaS, fake booking form. Do not smash recommended forever — ask it to explain the question. First pass generic until one Pinterest screenshot + frontend-design skill → three versions; he picks one.",
        "Context is a budget; /clear vs /compact; files in the folder survive a new chat. Skills = prompts that make a repeatable run less random. Skill creator is the meta-skill.",
        "Outside apps via connector / plugin / CLI. He names Gmail / Calendar / Drive with some guardrails, then GitHub + Vercel as a talk-to-deploy pipeline: create the repo, attach hosting, live vercel.app URL, later just tell it to push without opening either dashboard.",
        "Long work: /goal needs an objective done-when (Ralph-like). Loop = trigger + task + success + log (7am brief that scrapes YouTube / Twitter / Reddit / Gmail). Graph = nested micro-loops, usually overkill. Ultra / deep-research can spawn 100+ sub-agents. 1000+ hours / $20/$100/$200 / 6M tokens UNVERIFIED. Close is Chase AI Plus / masterclass. Codex / ChatGPT / Gemini / Obsidian on tape.",
    ],
    "atoms": [
        src("Plan + ask-unknowns is the steal. Sit-on-auto and accept-and-auto-mode are always-allow. Talk-to-deploy Vercel is deploy. Book-a-call CTA on Lighthouse is book. Classifier is not Evens.",
            "He named bypass as scary and then told beginners to sit on auto. /goal without an objective done-when will declare live as success.",
            "Dump + plan + unknowns → Evens accepts → three versions → Evens picks → no Vercel/Gmail write → stop",
            "On-tape: accept and auto mode or else; talk-to-deploy; Gmail/Calendar/Drive; book-a-call CTA; slashgoal needs success defined.",
            "Steal plan-ask-unknowns + three-versions + objective done-when. Never Claude auto/bypass. Never talk-to-deploy. Never Gmail send.",
            concept="Plan then card, not sit-on-auto"),
    ],
    "C": [
        "Babysitting is this desk. Auto is the course's mature move.",
        "Files surviving /clear is local reversibility, not undo for a public URL.",
    ],
    "D": [
        "Plan mode. Ask what I'm not thinking about. Ask it to explain recommended.",
        "Three versions. Evens picks. Preview ≠ domain.",
        "Objective done-when before any loop. Do not sit on auto. Do not accept-and-auto.",
        "Do not install Claude. Do not Vercel-from-chat. Do not Gmail send.",
    ],
    "E": [
        ex("Lighthouse plan ready", "Accept and auto mode", "Save babysitting", "Page builds; book-a-call CTA", "The accept is the never"),
        ex("Deploy this", "GitHub + Vercel from chat", "Talk-to-deploy", "Live vercel.app", "Public URL is deploy"),
    ],
    "F": [
        "If auto / bypass / accept-and-auto → REJECT on any send/deploy/book graph.",
        "If /goal success is it's live → rewrite the done-when.",
        "If $20/$100/$200 / 1000 hours / 100+ agents → UNVERIFIED.",
    ],
    "G": [
        "Field sits on auto because the 50-minute guide said so. He also said bypass is scary and /goal needs an objective.",
    ],
    "H": [
        "Claude Code / Vercel / Gmail on-tape. Caption-only. Do not invent the dashboard clicks.",
    ],
    "I": [
        "Did the 7am loop ever send Gmail, or only scrape?",
    ],
    "J": [
        "Siblings: `3TdD8Qv5Tk8` (full access) · `ONmaDdOBGig` (/goal) · `mPflFTQUCGk` (always-allow).",
        "SYSTEM SYNTHESIS → `session-bootstrap` · `input-required-gate` · `golden-test-loop` · `ask-principal`.",
    ],
    "K": [
        "Plan-ask-unknowns + objective done-when. Parked. No Claude.",
    ],
    "machines": [{
        "name": "Plan + unknowns + three versions (no auto-deploy)",
        "loop": "stream-of-consciousness → ask unknowns → Evens accepts plan → three versions → Evens picks → stop",
        "qs": "Auto or manual? Can it hit Vercel/Gmail/Calendar? What is done-when?",
        "qf": "Sit-on-auto is a no. Talk-to-deploy is a no. Book-a-call CTA live is a no. Claude is a no.",
        "proc": "Steal plan + three-pick + objective. Do not install. Do not deploy. Classifier ≠ Evens.",
        "ex": ex("Accept and auto mode", "He tells beginners to hit it", "Bypass is scary but auto is fine", "Live page + book CTA", "The pause is the product"),
        "why": "He already has session-bootstrap and golden-test in his mouth. The course then kills the ask.",
        "never": "Claude auto/bypass. Talk-to-deploy Vercel. Gmail send. /goal until live. Quote $20/$100/$200/1000h/6M tokens as FACT. Chase Plus.",
        "hive": "`session-bootstrap` · `input-required-gate` · `golden-test-loop` · `ask-principal` · `slice-build`",
    }],
    "never_extra": [
        "Sit-on-auto / bypass / accept-and-auto. Talk-to-deploy. Gmail send.",
        "Quote 1000+ hours / $20/$100/$200 / 6M tokens as FACT. Install Claude Code.",
    ],
    "L": "ACTION = plan + unknowns + pick; REJECT auto and talk-to-deploy. Clients parked.",
}

TAKES["rMf-JuikR-Q"] = {
    "title": "Why AI Agents Will Replace Your Next Hire",
    "speaker": "MoreMozi",
    "kind": "caption ingest · transcripts/full.txt",
    "words": 3031,
    "source": src_path("rMf-JuikR-Q"),
    "gaps": "Caption-only. Timestamps UNKNOWN. Visual/click UNObserved.",
    "A": [
        "Belief shift: stop roles-based growth (hire an editor) and go workflow-based. That editor was going to do four or five things; each thing is a workflow; one agent per thing. Every business is action → action — he sketches ~120 from inbound lead to turf. If you cannot draw the business as one linear workflow, how do you have a business.",
        "Their content machine: idea from School / trends search → match a competency list → AI templated 7-step script → packaging (headlines / thumbs) → production → one click.",
        "Mistake: AI can't do what a human can, or expect a machine to work with no training. Train it like a human. A role is ~16 activities; take one at a time; keep updating the prompt the way you'd update an editor.",
        "Hormozi hotline demo: transcript → speaker segments (AB / AC / AD) → ~10 conversations → start at the highest-tension moment → strip ums → keep only the insight points → export. That is the editor workflow.",
        "Agencies get lucrative for people who can operationalize getting customers (demand is infinite; PMF is not the question). Vague language fails (be more charismatic); break it into observable toddler-level behaviors. The machine never forgets.",
        "Start big (idea → script → shoot → edit → post), then each word becomes six actions until you cannot reduce — then automate. High-leverage hire: AI automation person who sits next to teams and duct-tapes; ~$150k UNVERIFIED. Full dev team on tape. Prioritize expectation-setting, CAC expectations, brand controllables (pattern detection; off brand must be black-and-white).",
        "Home services / brick-and-mortar: back office (invoicing, receivables, lead nurture) is now. Voice is almost there; text is there. Someone asks about off-hours voice auto-attendant. Exclusive gym ~$10k/yr / 400 members had a chat UX that answered hours/prices and never asked for info. Next 12–24 months he says UX / CRM click-paths disappear into talk-to-agent. Fax-machine law firms still make money; humans + better tech win; he is not an alarmist. Humanoid / Optimus on tape.",
    ],
    "atoms": [
        src("One irreducible workflow, then a card, then Evens — not hire an agent that talks. The gym answered hours/prices and never asked for info. Lead nurture is now and text is there are width of drafts, not Send.",
            "Roles → workflows is a job card. One-click post is publish. Voice auto-attendant is book/dial. $150k hire UNVERIFIED.",
            "Draw the map → one irreducible slice → draft → Evens posts/sends/books → stop",
            "On-tape: one click; never asked for my information; voice auto-attendant; lead nurture that's now.",
            "Steal decompose + observable behavior + hotline-tension clip + gym-should-have-captured. Never auto-voice/nurture/book/post.",
            concept="Irreducible workflow, then Evens"),
    ],
    "C": [
        "Replace-the-next-hire is the title. The operable lesson is one job per agent and toddler-level observables.",
        "He is not an alarmist — fax-machine firms still make money. Learning ≠ hunt.",
    ],
    "D": [
        "Draw the linear map. Decompose until you cannot reduce. One activity per agent. Update the prompt like training a human.",
        "Hotline → tension clip draft. Evens ships. Gym chat must ask for info — capture is a card, not a voice that books.",
        "Back-office drafts (invoice/receivable) stay HITL on send/pay. Do not auto-attendant. No new icp.",
    ],
    "E": [
        ex("Exclusive gym chat", "Hours and prices; never asked for info", "Slick UX", "No lead captured", "private-book-install leak — ask, then Evens"),
        ex("Hormozi hotline", "Segment → highest tension → export", "What an editor would do", "Clip file", "clip-factory; human still posts"),
    ],
    "F": [
        "If they hire a role → split into workflows first.",
        "If voice auto-attendant / lead nurture send → card.",
        "If $150k / $10k gym / 400 members / 120 actions → UNVERIFIED.",
        "If one-click post → publish card.",
    ],
    "G": [
        "Field hears replace your next hire and buys a voice bot. He also said train it like a human and the gym forgot to capture.",
    ],
    "H": [
        "$150k / gym $ UNVERIFIED. School / Hormozi on-tape. Caption-only.",
    ],
    "I": [
        "What are the four or five editor workflows by name?",
    ],
    "J": [
        "SYSTEM SYNTHESIS → `interview-to-desk` · `agent-job-card` · `slice-build` · `golden-test-loop` · `clip-factory` · `private-book-install` · `ask-principal`.",
        "Sibling: `0YXjEzFfft8` (same speaker, SOP=prompt).",
    ],
    "K": [
        "Roles-to-workflows + gym-capture leak. Parked. No hire-icp.",
    ],
    "machines": [{
        "name": "One irreducible workflow, then Evens (no voice-book)",
        "loop": "draw map → one activity → train like a human → draft → Evens posts/sends/books → stop",
        "qs": "Can we draw it? Did the gym ask for info? Is nurture a send?",
        "qf": "Auto-voice attendant is a no. One-click post is a no. Replace-the-hire as a SKU is a no.",
        "proc": "Keep decompose + observables + tension-clip. Strip send/book/publish. Capture ask is a card.",
        "ex": ex("Gym chat", "Answered hours/prices, never asked for info", "Slick", "No lead", "Ask for the name; Evens books"),
        "why": "Workflow-not-role is the steal. Talk-to-agent that books is the title's trap.",
        "never": "Auto-voice / auto-nurture / auto-book / one-click post. Quote $150k/$10k/400 as FACT. New icp. Claude as stack.",
        "hive": "`interview-to-desk` · `slice-build` · `golden-test-loop` · `clip-factory` · `private-book-install` · `ask-principal`",
    }],
    "never_extra": [
        "Auto-voice attendant / auto-nurture / auto-book. One-click post.",
        "Quote $150k hire / $10k gym / 400 members as FACT.",
    ],
    "L": "ACTION = one workflow + capture-ask; REJECT voice-book and one-click post. Clients parked.",
}

if __name__ == "__main__":
    for vid, t in TAKES.items():
        p = write_one(vid, t)
        print("wrote", vid, p.stat().st_size)
    print("batch9", len(TAKES))
