# Big Boss — vcU85OrwuV0
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vcU85OrwuV0/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vcU85OrwuV0/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long-ish (PACKET: 10:44, 2,569 words, captions `en-orig`). Title on PACKET: “How Anthropic Engineers Actually Prompt Fable 5.” Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: Fable docs, effort/cost chart vs Opus 4.8, and the HyperAgent Slack council are described, not seen. Speaker: Nate Herk.

Beats, in order:

1. Hook: Fable 5 is back; strongest he has used; he built a second brain / AI OS on it. Distilled **six** habits from X, Anthropic engineers, and the official prompting doc so you do not burn tokens.
2. Cost: **double Opus** — **$10 / $50** per million in/out **UNVERIFIED.** Not always on the Claude plan. **Promotional period:** up to **50%** of weekly limits at no extra cost, then usage credits. Promo ends **July 7** (~6 days, includes July 4 weekend). Works in desktop, VS Code, Claude Code. `/model` shows Fable.
3. **HyperAgent sponsor** (Airtable team): yes-man problem. He built a council — personas, each on its own Claude + browser. Drop an idea in Slack; skeptical investor / competitors / numbers; receipts, not “looks great, Nate.” Built in an afternoon. Free credits in the description.
4. Fable follows **short, clear** direction; feels like it understands. Six habits, tagged any-model vs Fable-specific:
   1. **Give the why** (any). Intent lets it connect to the right files. Not “write an email about the delay” → who it’s for, what they need, bigger task. Second brain / OS should pull the right context files.
   2. **Negative prompt** (any — he now likes it). Models predict the next word and get creative. Docs: act when you have info; recommend but don’t do X; don’t add features; simplest thing that works. Intern frame: “deliverable is your assessment. Report and **stop**. Don’t fix, send, edit, or delete until I say go.” He used to find negatives weaker; lately they work. (Conflicts `q5lg3npxjAc` “tell it what to do, not what not to do” — keep labeled.)
   3. **Let it act once it has enough** (any). He rarely uses Claude Code plan mode now. Own plan-until-ready. Docs: hard tasks run many minutes at high effort (gather, build, self-verify). **Match effort:** high default; X-high for capability-sensitive; medium/low for routine. Fable on **low** can look like Opus 4.8 on X-high/max and be **cheaper** (chart on tape). Using Fable for everything is overkill — reach for it **~5–15%** of the time, especially on usage credits.
   4. **Make it prove it** (any, “most important”). Models lie about done. Bake verification loops so you trust more (still check). “Before you tell me it’s done, point to the result that proves it. Only report work you can show evidence for. If it isn’t verified, say so.” Put this in skills / agents / CLAUDE.md, not only at the end of one prompt.
   5. **Stop asking it to show its reasoning** (**Fable-specific**). A standing “explain your reasoning” in the system prompt can **refuse** and **hand the task to Opus 4.8**. Fable is a lesser Mythos-5 with jailbreak/safety rails; hacking / dangerous bio / reveal-private-reasoning can **silently route** to Opus. API shows the model name; UI may not. Routing to Opus is cheaper than paying Fable rates — still a surprise.
   6. **Say less, not more** (Fable). Short instruction steers if the environment (context, tools, skills) is good. Not a contradiction with why: why ≠ bloat. “Lead with the outcome, keep it simple, pause only when the work truly needs me” beats a numbered rule dump.
5. Close: read the doc; sibling video on agent-loop verification; like.

Off-topic / not skipped: promo calendar; HyperAgent Slack; Mythos-5 parent; silent Opus downgrade.

## B. Atomic Knowledge

### Expensive brain is a rare reach, not a default
- **Claim:** Fable is double Opus and may fall off the included plan after a promo. He would reach for it **~5–15%** of the time. Fable-low can match Opus-high/max cheaper (chart). Using it for everything is overkill, especially on usage credits.
- **Reasoning:** Effort × model is the cost surface. Routine work does not need the top decimal.
- **Mechanism:** High default; X-high for sensitive; low/medium for routine. Promo 50% weekly cap, then credits. Ends July 7 on tape.
- **Evidence:** $10/$50 per million **UNVERIFIED.** Chart described, not seen.
- **Conditions:** You have a cheaper default. Exceptions: hive will not buy Fable; steal the 5–15% rule for whatever expensive brain we already have.
- **Action:** Doctrine #11. Do not put the expensive model on grunt.
- **Confidence:** high as a rule; low on the chart and $.
- **Source:** `vcU85OrwuV0` @ UNKNOWN — “you probably more realistically only need to reach for Fable like 5 to 15% of the time”
- **Epistemic:** SOURCE

### Why + stop-rules + prove-it is the prompt OS
- **Claim:** Give intent (why / who / bigger task). Tell it what **not** to do (no send/fix/delete until go; no extra features). When it has enough, act — stop endless plan. Before “done,” point at evidence or say it is unverified. Put these in the standing files, not one-off chats.
- **Reasoning:** Fable is better at short direction **if** the environment holds context. Bloat fights that. Sycophant builders will “fix” without being asked.
- **Mechanism:** Intern assessment vs intern-with-send. Own plan-until-ready instead of vendor plan mode. Verification loops in CLAUDE.md / skills.
- **Evidence:** Docs quotes he reads aloud; email-delay example; “report what you find and stop.”
- **Conditions:** Standing files exist. Exceptions: `q5lg3npxjAc` prefers do-not-don’t — both tapes are SOURCE; do not flatten.
- **Action:** Job cards: why, never-send, prove-it. HITL already removed send. Bake prove-it so 70% cannot call itself done.
- **Confidence:** high
- **Source:** `vcU85OrwuV0` @ UNKNOWN — “Don’t fix, send, edit, or delete anything until I say go” / “point to the result that proves it”
- **Epistemic:** SOURCE

### Fable will silently demote you if you ask for its reasoning
- **Claim:** Standing “explain your reasoning,” plus hacking / dangerous bio / reveal-private-reasoning, can route Fable → Opus 4.8 **without a UI flag** (API may show the name).
- **Reasoning:** Fable is a lesser Mythos-5 with extra rails. Jailbreak fear. You may think you are on Fable and pay/behave like Opus.
- **Mechanism:** Safety check before answer; silent handoff.
- **Evidence:** He states it; no on-tape capture of a handoff event.
- **Conditions:** Fable-specific. Exceptions: we will not run Fable; the general lesson is **hidden model swap**.
- **Action:** Watchdog: if the worker’s behavior suddenly changes, ask which model actually ran. Do not put “show your chain of thought” as a standing system line on a rail-heavy model.
- **Confidence:** medium (claimed)
- **Source:** `vcU85OrwuV0` @ UNKNOWN — “it will silently route to Opus”
- **Epistemic:** SOURCE

### Council that disagrees is the sponsor — and a doctrine echo
- **Claim:** Single chatbot is a yes-man. A council with assigned attack roles + real research returns receipts. He built it in an afternoon on HyperAgent.
- **Reasoning:** Same roast as `pbrln2TVeh4`, sold as a sponsor.
- **Mechanism:** Slack drop → personas (skeptical investor, competitor, numbers) → brutal feedback.
- **Evidence:** Sponsor block. Free credits CTA.
- **Conditions:** Named roles, not a nameless farm. Exceptions: HyperAgent is on-tape; we do not install it.
- **Action:** Named desks already argue. Do not spawn a Slack council product.
- **Confidence:** high as a pattern; operate-never as HyperAgent.
- **Source:** `vcU85OrwuV0` @ UNKNOWN — “a team that disagrees with me on purpose”
- **Epistemic:** SOURCE

## C. Mental Models

- **Short + why, not a constitution.** Intelligence + a good pile beats a rule dump. **SOURCE**
- **Stop is a feature.** Assessment ≠ send. **SOURCE**
- **Act when enough.** Plan mode can be a stall. **SOURCE**
- **Prove or say unverified.** Done is a pointer. **SOURCE**
- **Hidden downgrade.** Rails can swap the worker. **SOURCE**
- **5–15% expensive.** Default cheap. **SOURCE**
- **Negatives work again** (his update). Sibling tape disagrees. **SOURCE** / keep **SYSTEM SYNTHESIS** dissent
- **Sponsor council is roast-as-ad.** **INFERENCE**

## D. Procedures

1. Pick the cheapest model that can do the job. Expensive brain only when the job is in the 5–15%.
2. Write why / who / win in the standing card.
3. Write the never-list **with** stop: no send/fix/delete until go.
4. Allow act-when-enough. Do not require a full plan theater on a known job.
5. Standing prove-it: point at the result or say unverified.
6. Do not stand “explain your private reasoning” on a rail-heavy model.
7. Checkable stop: evidence or an honest unverified. A yes-man “looks great” is a fail.
8. If behavior suddenly drops, ask whether the worker was silently swapped.

**Qualify / frame:** prompting recap + sponsor + promo clock. Not a Fable buy.
**Objections:** “Always use the strongest” — he says 5–15%. “Show your reasoning” — can demote you.
**Avoid:** Fable/HyperAgent install; $10/$50 as FACT; jailbreak tests.
**When to change:** if the pile is missing, short prompts will guess — write the pile first (`context-docs`).

## E. Examples

**Situation:** “Write an email about the delay.”  
**Action:** Expand to who, what they need, bigger task; OS pulls the right files.  
**Reasoning:** Why connects the task to the pile.  
**Outcome:** More specific email (claimed).  
**Lesson:** Why is not bloat. Implicit rule: short + why, not a 12-rule dump.

**Situation:** Intern-shaped agent.  
**Action:** “Deliverable is your assessment. Report and stop. Don’t fix/send/edit/delete until I say go.”  
**Reasoning:** Models volunteer action.  
**Outcome:** Assessment without a send.  
**Lesson:** Stop-rules are architecture. Implicit rule: we already removed send; keep it in the card.

**Situation:** Standing “explain your reasoning” on Fable.  
**Action:** May refuse and silently hand to Opus.  
**Reasoning:** Safety / Mythos-child rails.  
**Outcome:** You are not on the model you think.  
**Lesson:** Hidden swap. Implicit rule: do not jailbreak-test to see it.

## F. Decision Rules

- If the job is routine → cheap model + low/medium effort.
- If you cannot write why → you do not have a brief.
- If the worker might send/fix → standing stop until go.
- If it says done → pointer or “unverified.”
- If you want chain-of-thought on a rail-heavy model → do not stand it in the system prompt.
- If a sponsor offers a council → use named desks, not the vendor.
- Optimize: rare expensive brain + prove-it. Refuse: Fable default, HyperAgent, silent-swap as a feature we operate.

## G. Contrarian

- Against “always plan mode”: he dropped it.
- Against “more context is always better”: say less if the pile is good.
- Against “never negative-prompt”: he came back to negatives (4.8 tape went the other way).
- Against “show your reasoning so we can trust it”: on Fable that request is a tripwire.
- Field assumes strongest model always on. He budgets 5–15%.

## H. Assumptions

**His:** Fable is the strongest he has used; the official doc is gold; promo ends July 7; HyperAgent council is a real roast; silent Opus route is real; 5–15% is the right diet.

**Ours:** Captions complete enough (2,569 words). $10/$50 / promo / chart = **UNVERIFIED.** Domain-specific: Anthropic model. Cursor + Grok. Do/don’t tension with `q5lg3npxjAc` stays labeled. Jailbreak/bio rails: we do not probe.

**Falsifiers:** Fable-low is not cheaper/better than Opus-high. Silent route does not happen. Negatives regress quality.

**Disagreement (keep labeled):** We will not operate Fable 5 or HyperAgent. The **5–15%**, **stop-until-go**, **prove-it**, and **hidden-swap awareness** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What is Fable 5’s public name in the API vs the UI?
- How often does the silent Opus route fire on normal work (not jailbreak)?
- Which verification-loop sibling video is the end card? Do not invent the id.
- How does he reconcile this tape’s negatives with the 4.8 “do, don’t don’t” tape?

## J. Connections

- **SYSTEM SYNTHESIS** → `q5lg3npxjAc` (effort lever; do vs don’t). Keep dissent.
- **SYSTEM SYNTHESIS** → `pbrln2TVeh4` (roast + prove-it).
- **SYSTEM SYNTHESIS** → `jZgcWCzxh1I` (ultra / expensive width).
- **SYSTEM SYNTHESIS** → `lkR6mvqQQlk` (Mythos parent / rails).
- **SYSTEM SYNTHESIS** → doctrine #5–7, #11; `ask-principal`; `golden-test-loop`; `agent-job-card`.
- Do not test the bio/hack tripwire.

## K. Future-Use

- 5–15% expensive-brain budget as a Money Desk observe note (unassigned).
- Silent-swap check as a Watchdog question (unassigned).
- “Report and stop” as a standing HITL line (already true; file if Evens wants it on more cards).

## Steal / Operate-never

### Machine: Cheap default → why + stop-until-go → act-when-enough → prove or say unverified
- **Epistemic:** SOURCE (six habits) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (task) → pick cheap brain unless it is the 5–15% → write why/who/win → standing never-send/never-fix → allow act-when-enough → require a pointer or “unverified” → if the worker’s IQ suddenly drops, ask who actually ran.
- **Questions / signals:** “Is this a Fable-rare job or grunt?” “Did I write why?” “Could this send?” “Where is the proof?”
- **Qualify / frame / objections:** Prompting tape + sponsor. Objection: always strongest — 5–15%. Objection: show reasoning — may silent-swap.
- **Procedure:** D steps 1–8. Checkable stops: (1) model/effort chosen on purpose, (2) stop-rule in the card, (3) evidence or unverified.
- **Example that proves it:** Intern prompt: assess and stop; no send until go. Lesson: negatives are architecture when they remove send.
- **Why it works:** Expensive models wander; yes-men ship; “done” without a pointer is 70%. Conditions: a pile, HITL send. Exceptions: Fable-specific tripwire we will not operate; do/don’t dissent with 4.8 tape.
- **Conditions / exceptions:** Cursor + Grok only. No Fable / HyperAgent / Skool. Clients parked.
- **Operate-never payload:** Fable as default; $10/$50 as FACT; jailbreak tests; Slack council vendor.
- **Hive run (existing skills only):** `agent-job-card` · `ask-principal` · `golden-test-loop` · `context-docs` · `interview-to-desk` (named dissenters, not HyperAgent).
- **Source:** `vcU85OrwuV0` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Fable 5 / Claude / HyperAgent / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- Quote $10/$50 per million · 50% promo · July 7 as FACT
- Jailbreak / bio / “reveal reasoning” probes
- Nameless Slack council farm
- New `icp_id` / unpark Normand / rotate hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not buy Fable because a promo clock is ticking.

- **Done** on a prompt OS: why on the card + stop-until-go + prove-or-unverified + expensive brain only when named. A sponsor council is not done.
- **Delegate without being asked:** HITL keeps send off; Watchdog asks “where is the pointer?”; I do not add a Fable desk.
- **Skeptical review:** Six habits are a bundle. Silent-swap is a vendor rail, not a toy. I will not approve HyperAgent.
- **One system this take:** standing prove-it + stop-until-go. Not “prompt Fable 5.”
- Live hunt stays parked.
