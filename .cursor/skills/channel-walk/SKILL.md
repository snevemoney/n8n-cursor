---
name: channel-walk
description: >-
  Channel catalog + walk queue: list public uploads, ingest ONE
  uningested tape (PACKET+full.txt), then STOP so the parent can
  spawn 17. Use when the operator says channel-walk, walk @nateherk,
  Nate Herk channel, or drops a channel handle. Sequence, not dump.
  Cursor plus Grok Bot. No Grok Bot HTTP.
---

# Channel walk (Cursor)

Load `scripts/hive/grok-skills/channel-walk.md` and follow it.

**In:** a channel handle (first: `@nateherk`). Evens may paste one or two URLs.  
**Stages:** Catalog → pick next uningested tape → ingest PACKET+full.txt → parent may spawn 17 (`--video-id`) → study with `deep-video-learning` (A–K then steal) → score coverage-loop if a model moved → STOP.  
**Hard step:** send / pay / book / publish stay Evens. Teaching videos ≠ auto-upload copies of Nate.

**Default batch:** 1 tape (or 2 if Evens pastes two URLs). Checkable stop = packet on disk + 17 takes filled **or** Evens says skip spawn. Next tape = a new iteration.

**Never:** spawn 17×N · treat Nate $ as FACT · unpark Normand / start a Path A client · dump the channel into takes · Grok Bot HTTP.

Grok `/` copy: `~/.grokbot/skills/channel-walk/SKILL.md`.
