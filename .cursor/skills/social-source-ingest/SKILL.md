---
name: social-source-ingest
description: >-
  Ingest one public social surface (IG / X / Reddit / Facebook / TikTok)
  into a packet-shaped note. YouTube already has channel-walk. Use when
  a non-YouTube URL is named. Not six network clones. Cursor plus Grok Bot.
---

# Social-source ingest (Cursor)

Load `scripts/hive/grok-skills/social-source-ingest.md` and follow it.

**In:** one public IG / X / Reddit / Facebook / TikTok URL.  
**Out:** `packets/social/{surface}-{slug}/PACKET.md` + `visible.txt` (public text only).  
**Then:** `steal-usecases` / `catalog-demand-match`. YouTube stays `channel-walk`.

**Never:** invent clicks · DM · unpark Normand · one skill per network · send / pay / publish.

Grok `/` copy: `~/.grokbot/skills/social-source-ingest/SKILL.md`.
