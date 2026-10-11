---
name: One person marketing desk
description: >-
  Use when running a brand-aware marketing loop on Cursor+Grok — website, ads,
  carousels, sizzle/UGC via Higgsfield/Canva, plus a creative tracker; never
  Claude desktop.
---
# One person marketing desk

**Owner desk:** Creative + GTM  
**Sources:** Nate Herk `yt:yCACmFTiCto` (Turn Claude Into a One Person Marketing Team)  
**Remap:** Claude Code project → Cursor cloud agent + Grok Bot skills. Higgsfield via **live MCP** (not ComfyUI desktop).

## When
Need a full marketing first-pass for a brand we already own: site + creatives + tracker, without a human design/edit team on every frame.

## Three Ps (FACT from tape chapters)
1. **Project** — brand-aware workspace (assets, voice, offers, forbidden claims).
2. **Pipeline** — generate website → ads/reels/carousels → UGC → QA.
3. **Proof** — creative tracker (what shipped, cost notes, human-touch gaps).

## Do
1. Seed brand assets (logo, colors, fonts, offer one-liners, never-say list) in the project before generating.
2. Website first-pass via Cursor cloud agent + Hostinger/Shadcn paths we already have — not Claude Code Hostinger VPS demos as required.
3. Ads / carousels / sizzle / UGC via **Higgsfield MCP** (+ Canva MCP when layout/static). Human QA every first-pass.
4. Log each asset in a creative tracker (Drive sheet or GitHub issue): asset · channel · status · human-touch needed · cost note (UNVERIFIED $ on tape).
5. Close the loop into [marketing-pattern-block](sand-workflow:marketing-pattern-block) language for prospect packets when relevant — not an ads-management SKU.

## Don't
- Claude desktop / Claude Code as the daily desk (**WORKAROUND:** Cursor + Grok)
- ComfyUI desktop (**WORKAROUND:** Higgsfield MCP)
- Quote Nate revenue / agency $ as FACT
- Ship UGC/ads without human QA
- Read hired-UGC view counts as demand. Paid human UGC creators (~$30/video, new dedicated accounts, no own audience) can draw views and still not convert: one tape run made 3 videos, got 1 customer and $0 (single anecdote, Joma ep. 3, YouTube RrPvLrW8iJY). Track installs/payments per video before scaling creators.
- Treat Hostinger VPS promo codes as required infra

## Tools
| Need | Path |
|---|---|
| Motion / UGC / sizzle | Higgsfield MCP — **PROVE** (CONNECTED) |
| Static / carousel layout | Canva MCP — **PROVE** (CONNECTED) |
| Site scaffold | Cursor cloud agent + Shadcn / Hostinger-* — **PROVE** |
| Tracker | Google Drive sheet or GitHub issue — **PROVE** |
| Claude Code / Claude desktop | **BLOCKED** — Cursor+Grok **WORKAROUND** |
| ComfyUI | **BLOCKED** — Higgsfield **WORKAROUND** |

## Prompts
**ASR source:** `yt:yCACmFTiCto` Whisper LIVE 2026-08-22 (`transcripts/yCACmFTiCto/full.txt`). Label FACT vs INFERENCE.

**Three Ps seed (FACT: pain · person · promise — Nate)**
```
Brand: [name]
FACT from operator (not invent):
- Person (who feels the pain):
- Pain (what mornings/workflow break):
- Promise (how product solves both):
Also dump: voice, never-say, offer angles, logo/product shot paths.
Create CLAUDE.md-equivalent project bible + context/*.md for Cursor+Grok.
Remap: Claude Code desktop → Cursor cloud agent + Grok. No Claude desktop dual-stack.
```

**Brand-aware marketing project (FACT pipeline from tape)**
```
Workspace already has: logos · product shots · brand-guidelines PDF · 3Ps context.
1) Seed / refresh brand bible from assets (do not invent colors — pull from guidelines).
2) Website first-pass: open on PAIN not product; Scroll-style interactive ok if repo provided.
3) Parallel generations via Higgsfield MCP (NOT Comfy):
   a) BOGO / offer ad stills (volume for testing)
   b) Marketing-studio sizzle (vertical + landscape)
   c) Instagram carousels (pain→promise→flavors)
   d) UGC: character sheets → storyboards → Seedance/video → QA reject bad frames
4) Creative tracker (xlsx/sheet): date · type · campaign · channel · primary angle · deliverables · model · credits/$ (label UNVERIFIED) · status
5) Human QA every asset. Turn winners into reusable skills.
No Claude desktop. No Comfy. Higgsfield MCP only for motion/UGC.
```

**Creative tracker row (FACT columns from tape analytics sheet)**
```
ID | Date | Generation type | Campaign | Channel | Primary angle | Angles covered | Deliverables | Gens built | Tool/model | Credits | $ (UNVERIFIED) | Status | Link
```

**UGC control loop (FACT: characters → boards → video → QA)**
```
Generate 3–4 consistent characters from brand person.
Storyboard selfie/close-up/drink beats as stills first.
Then video (Seedance family via Higgsfield). QA: reject off-brand logo/back-panel/wrong shelf.
Save boards + rejects with reason. Prefer organic scripts we approve over salesy AI-ad tone.
```

## LIVE enrich 2026-08-24
### Brock Grok desk (`yt:BFZ7lyKYcg8`) FACT
- Role bots (content / short-form / inbox / partnerships) + **group chat** between them beats one mega-thread.
- Morning **inbox triage routine** → top 3 focus items; invoice-related mail handed to invoice bot (draft only, HITL send).
- Content bot: scrape X (when plugin live) for AI/industry ideas — don’t doomscroll.
- Creative tracker can live in GitHub issue / Drive (**WORKAROUND** for ClickUp boards).
- **70% cheaper / $60 Pro** = **UNVERIFIED** marketing — never quote as operator pricing FACT.

### Nate ScrollCraft (`yt:QUI6Ug4cHnE`) FACT
- Website first-pass: interview → scroll-driven unique site (not template), then ads/UGC.
- Brand assets first; generate only gaps (Higgsfield). Keyframe verify before calling site done.


## Repass delta — video-training 20260909 Wave I
- yt:Acw0NtkyNtM: invoice-from-lead draft HITL.
- yt:BFZ7lyKYcg8: morning inbox top-3 routine + invoice agent draft from PDF style; ClickUp→GitHub/Drive; $/% UNVERIFIED.

## Wave Y 2026-09-09 (`yt:yCACmFTiCto`)
- Fresh en-orig VTT **PROVE** (fills prior Whisper CAPTION_GAP)
- Recreation: `repass-20260909/yCACmFTiCto/recreation/ONE_PERSON_MARKETING_DESK_GATE.md`
