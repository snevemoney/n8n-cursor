---
name: multimodal-youtube-learning
description: >-
  Treat a YouTube video as a multimodal behavior trace, not a
  transcript. Fifteen-step protocol: said vs shown, click patterns,
  implicit tricks, speech≠behavior, failures, decision points, tool
  strategy, visual evidence, creator OS. Use with deep-video-learning
  or when the operator says multimodal / behavior trace / what they
  clicked. Caption-only packets must not invent clicks. Cursor plus Grok.
---

# Multimodal YouTube learning (Cursor)

Load `scripts/hive/grok-skills/multimodal-youtube-learning.md` and follow it.

**Core rule:** What did they actually do? In what order? What did they click? What did they repeatedly check? What failed? What expertise was never explained?

**Caption-only (hive default):** declared + sequence-from-speech. Visual/click = `unobserved` or `UNKNOWN`. Do not invent UI paths. Cursor capture (installed): `cursor-video-watch` → `packets/{id}/watch.json`. Grok Bot keeps Grok computer watch.

Runs inside `deep-video-learning` A–K. Writes atoms / behaviors / fragments / mismatches — not a project workflow. Then `capability-acquisition` (UNTESTED). No new vision vendor. Do not scrape the 146.
