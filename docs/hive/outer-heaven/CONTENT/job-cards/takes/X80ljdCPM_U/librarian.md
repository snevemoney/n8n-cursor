# Librarian — X80ljdCPM_U
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/X80ljdCPM_U/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/X80ljdCPM_U/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Build ANYTHING with Claude Sonnet 4.5 and n8n AI Agents
**Channel:** Nate Herk | AI Automation
**Kind:** video (~4440 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Sonnet 4.5 (2025-09-29): coding/agents/workflows/computer-use. Shawn Ward / IGENT: **30+ hours** autonomous coding (UNVERIFIED). Family: Haiku cheap/fast, Sonnet balance, Opus max $. Same $ as Sonnet 4; “more bang.” Context **200k** (Vellum: others 1M; GPT-5 400k; Claude enterprise/beta maybe 1M). SWE-bench **77–82%**; leads coding/computer-use/finance on a slide (UNVERIFIED). Finance/medicine/law/STEM vs older Claude (orange bars). Still: you bring SME, tools, context. HITL: “AI should automate… you should be there for **human approval and feedback loops**.” Trust creep **60→70→80%** (UNVERIFIED). n8n + better coder = lower barrier (he has no coding background).
2. Connect: Anthropic node + console key (billing). Native Sonnet 4.5 **bad request** (`top_p` −1 / temperature) — Sonnet 4 works. Workaround: **OpenRouter** (he prefers one bill + usage). Hello works.
3. **No-prompt HTML email** “low-quality sleep”: GPT-4.1 concise; Sonnet colorful/detailed (35% adults, 7–9h — UNVERIFIED); GPT-5 more “report” + sources — he **prefers GPT-5** here.
4. **Eval / 10-K jam:** Apple 10-K ~121p, **<100k** tokens, “you are helpful” + whole PDF. GPT-5 **4.2/5**; Sonnet **4.3**. n=10 “way too small”; want ~100–200. OpenRouter shows Sonnet **1M** context (vs 200k console) but **~$0.30** vs GPT-5 **~$0.10–0.12** per ~90–96k-token run (UNVERIFIED). Same $ → he’d pick Sonnet; else ask if 0.1 correctness is worth 2×. Extra models (Sonnet 4, Gemini Flash, 4o, 3.5, DeepSeek R1) all “pretty high” — pick **family × use case**, not a king.
5. **Tools, no system prompt** (only now()): fat tool-belt fails argument parse. **Sub-agent** graph (Perplexity + contact + email) sends Michael Scott a voice-agent brief. Single email tool works; three tools (Tavily + email + calendar lunch 2pm Bob) works. Fat belt “overwhelmed”; group tools into specialists. HTML-vs-text made the dog/cat mail ugly.
6. Habit: start 4o/5, hypothesize a better model, **eval**. “Hard to say king.” Plus 2,500 (UNVERIFIED).
Gap: SWE slide, 10-K Qs. Timestamp UNKNOWN. Claude/OpenRouter/n8n/Plus on-tape. Auto-email/calendar = operate-never.

## B. Atomic Knowledge

### Eval the use case; HITL stays; too many tools is a fail
- **Claim:** 4.5 is not a hive OS. Native node can be broken on day one — route around it. n=10 is a demo, not a crown. OpenRouter context/price ≠ console. Zero-prompt can write HTML and call tools until the belt is too fat — then split into sub-agents. Approval/feedback is the keep sentence.
- **Reasoning:** Same $ as Sonnet 4 is a marketing line; 2× vs GPT-5 on a 10-K jam is the real fork. Benches and 30h quotes are UNVERIFIED.
- **Mechanism:** OpenRouter brain → no-prompt bake-off → jam-eval → tool-count bake-off.
- **Evidence:** top_p bug; GPT-5 email win; 4.3 vs 4.2; fat-belt parse fail; sub-agent send.
- **Conditions:** 77–82% / 30h / 60–80% / $0.30 UNVERIFIED. n=10.
- **Exceptions:** He still liked Sonnet’s color HTML.
- **Action:** File HITL sentence + n=10-is-not-a-crown + split-the-belt. Do not install Claude/OpenRouter. Do not auto-send the demo mail.
- **Confidence:** high as a model-pick machine
- **Source:** `X80ljdCPM_U` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** native 4.5 bad request; fat tool parse
- **Speech ≠ behavior:** “build anything” / “smartest yet” vs GPT-5 email win and “hard to say king”

## C. Mental Models
Family × use case. Trust creep is not a send-gate. Workaround the broken native node. Sub-agents are a tool-count fix.

## D. Procedures
1. If the vendor node 500s, try a router — don’t declare the model dead.
2. Bake-off the actual artifact (email/HTML), not the launch blog.
3. Jam-eval with n≫10 before paying 2×.
4. Start with few tools; split into specialists when parse fails.
5. Keep a human on send/calendar.
Avoid: Claude as hive; 30h/77% as FACT; auto-email; Plus.

## E. Examples
**Native vs OpenRouter:** Situation — hello 400s. Action — same model via router. Outcome — works. Lesson — harness bug ≠ model.

**Fat belt:** Situation — contacts+mail+… Action — parse error. Outcome — sub-agent graph works. Lesson — count the tools.

## F. Decision Rules
- IF n=10 → do not crown a king.
- IF 2× $ for +0.1 → say so; don’t hide it.
- IF the belt parse-fails → specialists, not a longer prompt.
- Refuse: Claude as hive; 30h as FACT; auto-send.

## G. Contrarian
Against “4.5 is the new king.” Against native-Anthropic-or-nothing.

## H. Assumptions
Complements `EthxaDswUFo` / `QCjMBOEhpLE`. Caption-only.

## I. Questions
Did the top_p bug ship-fix? What were the 10 10-K questions?

## J. Connections
SYSTEM SYNTHESIS → `EthxaDswUFo`; `a5sJNwfZ528`; `ask-principal`.

## K. Future-Use
HITL-keep + n-too-small + split-the-belt + router-workaround as atoms.

## Steal / Operate-never

### Machine: bake-off the artifact; eval n≫10; split tools; keep HITL
- **Epistemic:** SOURCE
- **Workflow / loop:** connect (router if native breaks) → same prompt two models → score the artifact and the $ → add tools until it fails → split → checkable stop = a scored eval and a human still on send
- **Questions / signals:** Console or router context? How many tools? n=?
- **Qualify / frame / objections:** No king; family × use case.
- **Procedure:** D above.
- **Example that proves it:** GPT-5 email; 4.3 vs 4.2; fat-belt fail.
- **Why it works:** Launch benches don’t pay the 10-K token bill.
- **Conditions / exceptions:** All benches/$ UNVERIFIED.
- **Operate-never payload:** Claude as hive; 30h/77% as FACT; auto-email/calendar; Plus.
- **Hive run:** Same bake-off on Cursor+Grok. Do not add Sonnet.
- **Source:** `X80ljdCPM_U` @ UNKNOWN

### Operate-never
- Claude/Sonnet as hive. Quote 30h/77–82% as FACT. Auto-send. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File the HITL sentence next to ask-principal. Do not switch the hive model.
