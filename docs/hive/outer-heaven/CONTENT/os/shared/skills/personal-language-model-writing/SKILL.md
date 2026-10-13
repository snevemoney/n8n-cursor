---
name: Personal language model writing
description: >-
  Use when a content desk drafts in the operator's (or a client's) voice and must
  beat "AI slop" — build a personal-language-model ledger, score every piece on
  tier/hook/shelf-life/voice-dials before writing, and let the robot only audit
  and recombine approved language, never invent.
---
# Personal language model (PLM) writing

**Owner:** Creative Studio · Content / Publishing consume · pairs with [personal-x-writer](sand-workflow:personal-x-writer), [viral-content-scout](sand-workflow:viral-content-scout).
**Platform:** Grok Bot (ledger + auditor) + Cursor cloud agent for the LLM rewrite. **Install:** none — **PROVE** (`plm_kit.py` 9/9 + transfer 4/4, L2 `yt:YuOSyRj3sXg` Nicolas Cole 2026-10-11).

## Source (FACT, yt:YuOSyRj3sXg "$30M Writer: Never write AI slop again")
Nicolas Cole: "AI slop" = commodity content (not attributable to anyone). Beat it with a **personal language model** — your life + claimed opinions as the "unmade data set." The human does the thinking/writing/choosing sides/first-telling; the robot only **repeats and remixes approved language**. "You can't automate what you can't articulate."

## The method (FACT, card timestamps)
- **Three tiers** (t0225/t0355): commodity < personality ("I did/think this" + life detail) < original (years of crystallized thinking).
- **Approved language, 4 steps** (t0905): collect → approve (you already said it) → recombine (sentences across sources) → repeat. "5 + 7 benefits of journaling → a third list."
- **Pick your side** (t1400): for each commodity idea, record the side you CLAIM and the side you REJECT — else the LLM guesses and you call the guess slop.
- **Ownership = association** (t1712): volume, then personality details. Reuse your best sentences (Cole's WoW line, used hundreds of times).
- **Unmade data set** (t2162): life facts, formative experiences, mistakes-as-story, lessons, chosen opinions.
- **Brand vs founder** (t2456): the brand channel repeats your chosen commodity ideas; personality stays on the human.
- **Three hooks** (t2950): commodity → personality → timely (same sentence, different value + shelf life).
- **Timely vs timeless** (t3000): pick the horizon before writing.
- **Voice = 3 dials** (t3230): word choice · sentence length · sentence structure. The **1% fix**: two "according to NYT/HBR" lines flipped a piece to "sounds just like me."
- **Company brain is the moat** (t3672): one deep thinker writes long-form; robots repeat it into every channel.

## The recipe (PROVE) — `plm_kit.py`
Keep a **ledger** (schema in `sample_ledger_cole.json`): life_facts, formative_experiences, mistakes, lessons, claimed_ideas, rejected_ideas, approved_language, original_claims, voice{max_avg_sentence_words, structure, banned_words}.
Before writing, **score** every piece on 4 axes: tier · hook · shelf-life · voice-dials.
Robot jobs only:
- `audit(draft, ledger)` → tier/hook/shelf-life + flags: **AI_PICKED_WRONG_SIDE** (uses a rejected idea), **UNOWNED_COMMODITY** (no claimed side, no personality point), **VOICE_DIALS_OFF** (length/structure/word-choice). Verdict OK | SLOP_RISK.
- `recombine(lists, take)` → a new list from **approved lines only** (dedup).
- `channel_check(text, ledger, channel)` → keeps personality off the brand channel.
Tests: `test_plm_kit.py` 9/9 (hooks, shelf life, you-should vs I-did, wrong-side, 1% fix, approved reuse, banned word, recombine); `test_transfer_company_brain.py` 4/4 (brand vs founder routing).

## LLM rewrite (WORKAROUND / BLOCKED on box)
The generative half (rewrite prose to the target dials) runs via a **Cursor cloud agent** (OpenRouter key lives in Cursor). The kit emits the exact dial targets + approved lines the model must honor; it never invents facts. HITL before any public post (see [personal-x-writer](sand-workflow:personal-x-writer)).

## Never
- Let the model write net-new thinking or invent life facts/numbers.
- Auto-post. Draft → HITL.
- Treat "we already have a writer skill" as done — run the audit on the actual draft.

## Tools
| Need | Path |
|---|---|
| Ledger + auditor + recombine | box `plm_kit.py` — **PROVE** |
| LLM rewrite to voice dials | Cursor cloud agent (OpenRouter in Cursor) — **BLOCKED on box / WORKAROUND** |
| Public post | **BLOCKED** needsAuth — draft only, HITL |
