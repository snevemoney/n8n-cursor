---
name: JARVIS assistant core
description: Use when building or judging a "JARVIS" personal voice assistant: router, plugin registry, swappable cloud or local brain, and confirmation gates on risky plugins like computer control or purchases.
---
# JARVIS assistant core
Sources (2026-10-10 two-week full watch): `yt:K_cha25S4Qo` FatihMakes Mark 53/56, plus the Zubair Trabzada JARVIS series and DeepCantCode (see the packet SUMMARY).
## Steps
1. Speech → text upstream (Gemini Live / Whisper). The core works on text, so you can test it without a mic.
2. Router: regex or a decision model maps the utterance to a plugin. Fallback = the LLM brain.
3. Plugin registry: each plugin declares `risky`. Computer control, sending, buying, and deleting require explicit confirmation.
4. Brain is swappable: cloud (Gemini/Claude/GPT) for quality, local LLM for privacy (Mark 56).
5. Track cost per turn (see the JARVIS cost tape) and keep the notes vault local.
## Proof
`jarvis_core.py` → 6/6 PASS (stub brain). Live voice and cloud brain: no keys or mic on box.
