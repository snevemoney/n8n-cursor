# Creative Studio workflow tests
Status: filled
Date: 2026-08-14
From take: takes/creative-studio.md
## Tests
### 1. cinematic-recipe playbook lock
- Tape change: 3 refs · video hero · previs before long render. Style bible is a wiki, not a vibe. Taste stays on a strong model. No fake-3D / game-studio SKU. Encoded in `PLAYBOOK.md` + `STYLE_BIBLE.md` + `motion-ref-pack.md` + `slice-build.md` (tapes 2, 6, 8, 12).
- Command: `ls docs/hive/outer-heaven/CONTENT/website-building/cinematic/{PLAYBOOK.md,STYLE_BIBLE.md,motion-ref-pack.md,assets/} scripts/hive/grok-skills/slice-build.md && rg -n "Inkwell|Streets of Punk|fromanother|video hero|WebGL|previs|cinematic-recipe" those files`
- Result: pass
- Evidence: All five paths exist. Bible + ref pack name the same three live sites (Inkwell, Streets of Punk, fromanother) with WHY filled. Playbook house rule: hero is muted video + scroll/cursor, no WebGL/Three.js default; stills → previs → grade. `slice-build.md` line 14 points cinematic lane at that playbook. Hero pack on disk: `hero-loop.webm` 272K, `hero-loop.mp4` 631K, posters + broll — under the ~4MB budget. Did not open the Vercel residual. Did not generate new plates.

### 2. motion-pipeline Higgsfield/AE proof pack
- Tape change: Proof clips we already have; recorded performance on the card, not a still of the farm. Folder-in / many-surfaces-out with a human 10x pass. HOWTO + walkthrough clip are the artifact (tapes 7, 8, 11).
- Command: `ls -lh docs/hive/outer-heaven/CONTENT/creative/higgsfield-ae-proof/{HOWTO.md,proof-ref-to-layers.mp4,stills/} && file stills/* && ffprobe -v error -show_entries format=duration proof-ref-to-layers.mp4 && ls ~/.grokbot/research-packets/cinematic-site/higgsfield-ae-proof/`
- Result: pass
- Evidence: HOWTO table matches disk 1:1 — `01-reference-merged.png` through `05-layer-grain.jpg` plus `proof-ref-to-layers.mp4` (ISO MP4, 588K, duration 6.6s; HOWTO says ~7s muted). Stills are 1536×1024 PNG plates except grain 1920×1080 JPEG. Grokbot copy present (`HOWTO.md`, mp4, `stills/`, `OPERATOR_HANDOFF.md`). `steal-usecases.md` still lists `motion-pipeline` as still → frames → clip → grade; Higgsfield/AE we have. Did not burn credits. Did not sign into the AE bridge.

### 3. info-gain-cite skill (HITL, no farm)
- Tape change: One honest page/clip from a run we did; HITL publish; check Grok cite. Rank-everywhere is a farm — we do not operate it (tape 17). Walkthrough beats screenshot.
- Command: `ls scripts/hive/grok-skills/info-gain-cite.md scripts/hive/grok-skills/click-live-site.md && rg -n "HITL|farm|indexer|hands-on|looks good" those files && rg -n "info-gain-cite" scripts/hive/grok-skills/steal-usecases.md`
- Result: pass
- Evidence: `info-gain-cite.md` loop is one hands-on page on a surface we own → HITL publish → note cite or miss. Never block names rank-everywhere farm, paid indexer, 24h #1 claims. `steal-usecases.md` row 121 matches. `click-live-site.md` still fails “looks good” without opening the URL / clicking CTA / checking hero load. Proposed skills from the take (`brand-template-as-skill`, `proof-walkthrough`, `taste-veto`, `lighting-panel`, `playbook-cards`, `packaging-parallel`) have no standalone files — correct; proposed stays listed until Evens says write. Did not publish. Did not ask Grok a cite question.

## Never (operate)
- No send / pay / deploy / book / publish. No Grok Bot.
- No NSFW / watermark-jailbreak / fake-PFP farm / OTP / device farm / mass-DM.
- No auto-dial, betting, prediction-market, or game-studio SKU this cycle.
- No client-facing creative from a cheap model. A workflow screenshot is not done.
- No farm creatives generated this run. No LESSONS merge. Takes stay SSOT.

## Blocked on Evens
- HOWTO optional DoD: live AE screenshot after he signs into Higgsfield bridge once. Credits stay off.
- `info-gain-cite` publish + Grok cite check — HITL only; this desk does not ship the page.
- Licensed asset spend and any client-facing creative stay HITL.
- Preview residual `https://cinematic-ai-partner.vercel.app/` is Forge/Watchdog `click-live-site`, not a Creative Studio publish.
