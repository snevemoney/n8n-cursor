---
name: Ship work card
description: Use this when a website or proof is complete and must land on evenslouis.ca/work as a proper card (media, copy, seed, click-pass).
---

# Ship a finished site onto evenslouis.ca/work

Public catalog is proof-only. Cards show cinematic/outcome media. No live demo links, Source/GitHub, CE/dashboard, hive/n8n/ops, or localhost.

## When
A site, craft proof, or product demo is complete (click-pass on the real URL). Do this before calling the job done. Also run after Website build pipeline phase 9.

## Card types
- Craft / proof: preview.webm plus 1-hero.jpg. Seed via db:seed-portfolio-proofs after adding the slug to PORTFOLIO_PROOF_SLUGS plus CASE_COPY.
- Product / UI: keep gallery pngs. Prepend preview.webm with db:seed-work-preview-videos. Do not wipe stills.

Held back until operator un-HOLDs: afterlight, grove, meridian, energy-orb, inner-green.

## Assets
Drop under public/screenshots/{slug}/: 1-hero.jpg, preview.mp4 (Safari Baseline H.264 60fps yuv420p ~960x540 no B-frames), preview.webm at 60fps.
Craft = real browser capture. Product = Remotion at 60fps. Gallery stills stay png. Never invent 5-foo.jpg from a png name.

## DB
Project.screenshots: preview.webm, 1-hero.jpg, then gallery pngs. CASE_COPY for problem/result/description. Public proofs: demoUrl repoUrl repoPath null. Live only after media exists.
Seeds inside the app container: db:seed-portfolio-proofs for craft, db:seed-work-preview-videos for product prepend.

## Ship loop
1. Lock slug plus CASE_COPY.
2. Capture or render 60fps motion plus hero still.
3. Encode Safari MP4 plus WebM; docker cp into the running app.
4. Upsert Project via seed scripts. Do not delete other live cards.
5. HEAD every gallery URL — all 200.
6. Click https://evenslouis.ca/work and /work/{slug}. Videos must play. Looks-good-without-a-click is a fail.
7. iPhone Safari hard-refresh; confirm motion not a blank card.
8. PR code changes. No main merge without HITL.

## CardMedia rules
- Still under video, video fully visible. No HTML poster. Never opacity-0.
- MP4 source first, then WebM. Cache-bust video URLs.
- Next-sibling poster only for video paths. Gallery stills keep their own src.
- Still-only fallback only when there is no usable video source.

## Never
- Public demo, GitHub, /pro, or localhost on the card
- HTML poster or hidden videos
- 30fps or Main-profile MP4 as the Safari source
- Seeding HOLD slugs
- Deleting the Next work route folder
- Treating HTTP 200 as done without a play check

## Ownership model
Builds are operator-owned proofs on the public catalog.
Commercial path: clone the build for a client, apply their brand and modifications, hand off their copy.
Public /work stays proof-only (no Source button, no live client demo URL, no repo link).
Never put the client fork or private demo on the public card.
