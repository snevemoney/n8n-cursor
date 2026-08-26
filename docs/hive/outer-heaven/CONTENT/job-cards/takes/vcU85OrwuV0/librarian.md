# Librarian — vcU85OrwuV0
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vcU85OrwuV0/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vcU85OrwuV0/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** How Anthropic Engineers Actually Prompt Fable 5
**Channel:** Nate Herk | AI Automation
**Kind:** video (~2569 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Fable 5 “back.” Strongest he has used. Distilled Anthropic Fable-5 prompting docs + X + engineers into **six habits**. Price: 2× Opus, $10/M in $50/M out (UNVERIFIED). Promotional period: up to 50% of weekly limits at no extra cost, then credits; ends **July 7** (~6 days, includes July 4). Works desktop / VS Code / Claude Code; `/model` shows Fable.
2. **Sponsor (HyperAgent / Airtable):** models are yes-men; he built a Slack-drop council (skeptical investor / competitors / stress-test numbers) with real browsers; afternoon build; free credits CTA. On-tape vendor — not hive.
3. Six habits, tagged any-model vs Fable-specific:
   1. **Why** (any): intent so it connects to the right files; email-delay example + OS context.
   2. **Negative prompt** (any): docs themselves say do-nots (“act when you have info; don’t add features; simplest thing”). Intern frame. Example: deliverable is assessment — report and stop; don’t fix/send/edit/delete until I say go. He used to think negative prompts lost to positive specificity; lately they work.
   3. **Act once you have enough** (any): he **no longer always starts in plan mode**; custom “plan until ready.” Doc: hard tasks run minutes at high effort. Effort: high default; X-high for capability-sensitive; med/low routine. Fable-low ≈ Opus X-high/max and cheaper. Fable for everything is overkill; he guesses you need Fable **5–15%** of the time (UNVERIFIED), especially on credits.
   4. **Prove it** (any, “most important”): before “done,” point to the result; only report evidenced work; say unverified plainly. Bake into skills/agents/`CLAUDE.md`, not a tag at the end of every prompt.
   5. **Stop asking it to show reasoning** (Fable-specific): a standing “explain your reasoning” in the system prompt can **refuse and silently hand to Opus 4.8**. Jailbreak/Mythos-lite safety: hacking / dangerous bio / reveal private reasoning → silent Opus route. API returns the model name; otherwise you may not notice. Cheaper than Fable if it routes — still a capability drop.
   6. **Say less** (Fable): short instruction steers if the environment is good; not a contradiction with “give the why” — why ≠ bloat. “Lead with the outcome, keep it simple, pause only when the work truly needs me.”
4. Read the docs. Next: agent-loop verification tape.
Gap: the prompting page. Timestamp UNKNOWN. Claude/HyperAgent/Skool on-tape.

## B. Atomic Knowledge

### Six Fable habits; #5 is the landmine
- **Claim:** Why + don’ts + act-when-enough + prove-it + no-show-reasoning + say-less. Standing “explain your reasoning” can silently demote Fable→Opus.
- **Reasoning:** Fable follows short clear direction; safety buckets (hack/bio/private reasoning) route down; plan-mode-always is outdated for him.
- **Mechanism:** Bake prove-it and don’ts into `CLAUDE.md`/skills; match effort; reach for Fable rarely (his 5–15%).
- **Evidence:** Doc quotes; `/model` “Fable is back”; silent-route description.
- **Conditions:** Promo to July 7; then credits. API shows the demote; chat may not.
- **Exceptions:** Why is still required; say-less is not no-context.
- **Action:** Steal the six. File $10/$50 and 5–15% UNVERIFIED. Do not operate HyperAgent. Do not ask models to reveal hidden reasoning as a habit.
- **Confidence:** high as a prompt doctrine; silent-route is his read of docs
- **Source:** `vcU85OrwuV0` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** he abandoned always-plan-mode
- **Speech ≠ behavior:** sponsor council vs “say less”

## C. Mental Models
Fable is a rented expensive teacher. Safety will silently swap the model. Intern don’ts. Trust is baked verification, not a vibe.

## D. Procedures
1. State why + audience + don’ts + “report and stop until I say go.”
2. Act when enough; do not default to plan mode or X-high.
3. Require a pointed proof before “done”; put it in the standing file.
4. Do not put “explain your reasoning” in a Fable system prompt.
5. Keep standing instructions short; put the why in the task.
Avoid: Fable-for-everything; HyperAgent; $ as FACT; jailbreak/bio prompts.

## E. Examples
**Assessment-only intern:** Situation — problem description. Action — “report what you find and stop; don’t fix/send/edit/delete until go.” Outcome — (prescribed). Lesson — negative prompt = HITL hard step.

**Silent Opus:** Situation — show-reasoning / safety bucket. Action — Fable routes to Opus without a toast (chat). Outcome — cheaper, dumber. Lesson — capability can drop invisibly.

## F. Decision Rules
- IF the task is routine → not Fable; low/med effort.
- IF you used to always plan-mode → drop it unless the task is capability-sensitive.
- IF you want reasoning traces on Fable → do not put it in the system prompt.
- IF it says done → demand the proof artifact.
- Refuse: $10/$50 as FACT; HyperAgent; Claude as hive; malicious/bio asks.

## G. Contrarian
Against always-plan-mode (he taught it before). Against more-context-always. Against “show your reasoning” as a standing rule on Fable.

## H. Assumptions
July 7 / 50% weekly / prices are his read. Complements `XTBWVVcF3Pk` (gates + routing) and `dYrrEKXtttk` (SKU). Sponsor is not a method.

## I. Questions
How often does silent-route actually fire on normal work? Is 5–15% measured?

## J. Connections
SYSTEM SYNTHESIS → `XTBWVVcF3Pk`; `dYrrEKXtttk`; `pbrln2TVeh4` (prove it); hive HITL (don’t send until go).

## K. Future-Use
Six habits + silent-demote + intern-don’ts as atoms.

## Steal / Operate-never

### Machine: why + don’ts + act-when-enough + prove + no-trace-on-Fable
- **Epistemic:** SOURCE
- **Workflow / loop:** why + negative constraints → gather until enough → act at matched effort → pointed proof → checkable stop = evidence artifact or a plain “unverified”
- **Questions / signals:** Do I need Fable at all? Did I ask for private reasoning? Is plan mode cargo-cult?
- **Qualify / frame / objections:** Intern don’ts; say-less ≠ no-why.
- **Procedure:** D above.
- **Example that proves it:** “Don’t fix/send until go”; silent Opus.
- **Why it works:** Strong models over-act and over-bloat; safety will swap the SKU.
- **Conditions / exceptions:** Promo window; API vs chat visibility of demote.
- **Operate-never payload:** HyperAgent; $10/$50 as FACT; Skool guide; jailbreak/bio; Claude as hive; send/edit/delete without go.
- **Hive run:** `ask-principal` (don’t send until go). Cursor + Grok.
- **Source:** `vcU85OrwuV0` @ UNKNOWN

### Operate-never
- HyperAgent/Airtable as hive. Quote token $ as FACT. Ask for private reasoning / bio / hacking. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File intern-don’ts (“report and stop”) as Librarian HITL language. File silent-demote as a speech≠meter risk on other stacks too. No sponsor wiki.
