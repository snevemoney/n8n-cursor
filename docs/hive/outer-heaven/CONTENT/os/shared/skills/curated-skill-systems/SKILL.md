---
name: Curated skill systems
description: >-
  Use when pruning or organizing hive skills — keep a curated working set, one skill per job, anti-hoarding after research repasses.
---

# Curated skill systems

Sources: Simon Scrapes curated skills; Cole PIV; youtube-ai-implement P1.

## When
Forge or Librarian reviewing skill hygiene, or after a research repass.

## Do
1. Prefer a curated working set used weekly over hoarding unused skills.
2. One skill per job; automate only after it works by hand (golden-test-loop).
3. After research: research-signal-to-skills, then prune duplicates.

## Don't
- Skill marketplace hoarding
- Hundred-agent swarm as hygiene
- Five names for the same recipe

## Wave AA enrich 2026-09-09 — L1–L7 (`yt:-u_igSQHAIo`)
- Progressive disclosure + personalization + eval before self-improve claims. L7 workforce ≠ one mega-skill. Packet `repass-20260909/-u_igSQHAIo/`.

## Enrich 2026-10-11: four habits that make one general agent + skills beat many agents (yt:HIRDzMtuWFk, Nate Herk, on Anthropic's Agent Skills talk)
- **Save proven code in the skill.** When a run writes a script whose output you like, move it into the skill's scripts folder and point SKILL.md at it, so later runs execute it instead of regenerating it. Then rerun twice and check the saved file is actually called.
- **Descriptions decide whether a skill exists.** Only name + description load up front (progressive disclosure). Write one job per skill, in the words a person would type, with no two skills competing. Test each with three prompts: obvious (should fire), reworded (should still fire), unrelated (must not fire). PROVE: `recreations/20261011/run1230/skill_trigger_test.py` in signals-2mo-backlog-20261010, run over all 473 hive skills → PASS as a method. Real findings: `speed-to-lead-demo` loses its own obvious query to `document-processing-micro-demo` (whose description is just "P2 proof after speed-to-lead"), 0/3 reworded queries routed with a lexical router (a lower bound; an LLM router does better), and the top overlap pairs (e.g. sales-call-to-actions vs meetings-to-execution) are merge or clarify candidates.
- **Turn each correction into the smallest durable fix.** Ask why it went wrong: process (edit SKILL.md steps), missing context (add a reference file), weak rule (add an explicit Don't), or flaky code (save a script). Then rerun the same task.
- **Verify before returning.** Define acceptance criteria, make a draft, check it with outside evidence (rendered screenshots, opened primary sources, a test, or 2–3 critic personas such as beginner, skeptical buyer, target reader; keep only issues raised more than once), fix, recheck, and report what was checked and what couldn't be. "Model-proof" is not real; portability is, so test key skills in a second harness.
