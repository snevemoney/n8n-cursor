---
name: Request routing chains
description: >-
  Use at the start of any request to pick the chain of skills, tools and connectors in order (signal intake, build, review, creative, client delivery, research/teardown, ops, comms), with one default and one fallback where tools overlap.
---
# Request routing chains (2026-10-11)

Step 0 for every chain: `jev-route "<task>" <platform>` (cheap, advisory). `hard_step=human` or exit 2 means a human gate sits on the irreversible step; everything before it may proceed. Every tool call should leave a line in `~/.local/state/owned-tools/use.jsonl` (see `owned-tools`).

## 1. Signal intake (a video, post, link or bookmark)
1. `oh-fetch <url>` (owned MCP fetch) → fallback WebFetch / browser.
2. Video or audio: `oh-transcribe <url>` → fallback `summarize-audio-video`; X posts: X connector `get_posts_by_id` (read only).
3. Context: `oh-search` (SearXNG) → fallback WebSearch.
4. Triage: `oh-jev "<summary>" implement study noise` (bulk, cheap) → frontier model only for `implement`.
5. Skill: `research-signal-to-skills`, `youtube-watch-to-implement-digest`, `x-profile-to-skill`, `what-changed-delta`, `ai-news-importance-rank`.
6. Persist: packet under `/workspace/research/packets/<topic>-<date>/` → `brain-export`.
Conflict: oh-fetch vs Crawl4AI → default oh-fetch (single page); Crawl4AI only for multi-page crawls (OFF on VPS; ask Forge).

## 2. Build (code, site, automation)
1. `jev-route` → 2. `grill-me-into-prompt` (clarify) → 3. `osmani-spec-before-code` / `osmani-spec-before-code` → 4. build skill (`website-build-pipeline`, `stack-pick`, `osmani-incremental-slice`, `golden-test-loop`) → 5. Forge implements → 6. critic: `ai-quality-control-critic` / Watchdog (`n8n-legacy-ops`), `osmani-code-review-axes`, `verify-then-done`, `vibe-click-live` → 7. secret scan (detect-secrets) → 8. PR (GitHub or Origin connector). Merge/deploy = human.
Conflict: superpowers-* vs osmani-* overlap (TDD, plans, review). Default superpowers-* for the process; osmani-* as the review checklist.
Conflict: GitHub vs Origin → default GitHub (`cursor-github`) for snevemoney repos; Origin for sneve1 mirrors.

## 3. Review / debug
`osmani-debug-recovery` → `osmani-code-review-axes` → `osmani-code-review-axes` / `osmani-code-review-axes` → `osmani-simplify`. Regressions in the router: `/workspace/tools/jev-evals/run.sh` (promptfoo).

## 4. Creative (UI, video, ads)
1. Reference: Mobbin (`search_screens` / `search_flows` / `search_sections`) → 2. components: 21st (`search` → `get_component`; AI generation is OFF) → fallback Shadcn registry → 3. design-literacy skills (`design-tokens`, `landing-page-design`, `design-tokens`, `taste`/`impeccable` repos) → 4. media: Higgsfield (generation costs credits; free plan, 0 credits on 2026-10-11 → BLOCKED until Evens tops up) → 5. `one-story-into-20-angles`, `demo-clip-library`. Publishing (TikTok/X) = human.
Conflict: 21st vs Shadcn → default 21st (paid tier, unlimited retrieval); Shadcn when the project has components.json.

## 5. Client delivery
`audit-first-architect-2` → `audit-first-architect-2` / `hardening-20-point-audit` → `value-based-pricing` / `value-based-pricing` → `document-processing-microdemo` → `client-delivery-checklist-grok-first` → `retainer-aios-sticky`. Emails/proposals = draft only, human sends.

## 6. Research / competitor / teardown
`deep-research-company` / `personal-market-researcher` → `competitor-monitor` → `app-teardown-rea` (REA MCP; Ghidra fallback) → `lost-deal-analysis` / `ai-news-importance-rank`. Search default `oh-search`, fallback WebSearch, then Composio search tools.

## 7. Ops (box + VPS)
Liveness: `/workspace/backups/scheduler/ensure.sh` (routine) → Healthchecks pings (lib.sh `hc`) → alerts `oh-notify` (ntfy, human-must-act only). Backups: restic (box-backup 02:10, offsite-copy 04:40). VPS/site: Uptime Kuma + Beszel (Forge). Box hygiene: `box-ram-hygiene`, `background-infrastructure`, disk check `df -h /` (stop heavy work under 8 GB). Hostinger connectors: read-only checks only; any change is a Forge task.
Conflict: Uptime Kuma vs Healthchecks → Kuma for URLs (push), Healthchecks for jobs (pull/dead-man).

## 8. Comms / calendar / inbox
Gmail / Slack / Calendar / X DM connectors: read freely; drafts go through the parent's draft flow; sending needs Evens' explicit OK. `meeting-prep-focus-defender` for calendar, `sponsor-tracker-no-send`, `office-artifact-pack`.

## 9. Desk kits (n8n-kit-*)
Desk roles map to `n8n-legacy-ops`, `-comms`, `-consultant`, `-creative`, `-lead-hunter`, `-librarian`, `-money-desk`, `-product-gtm`, `-watchdog`, `-wealth`; load the desk's kit before the chain above.

## Appendix: more skills per chain (wired 2026-10-11 from the orphan triage)
- Desk kits (9): n8n-legacy-ops, n8n-legacy-ops, n8n-legacy-ops, n8n-legacy-ops, n8n-legacy-ops, n8n-legacy-ops, n8n-legacy-ops, n8n-legacy-ops, n8n-legacy-ops, n8n-legacy-ops.
- Build (2): osmani-api-boundaries, osmani-constraint-bar, osmani-adr-docs, osmani-obs-literacy, piv-eng-loop, session-bootstrap, mcp-connector-live-proof, connect-existing-software, golden-test-loop, intro-programming-ii-java-cpp-oop.
- Atlassian/JSM engagements (2/5): jsm-ae-scope → jsm-ae-architect → jsm-ae-develop → jsm-ae-test → jsm-ae-debug → jsm-ae-sync → jsm-ae-audit → jsm-ae-document.
- Client delivery / sales (5): aios-five-layers, aios-five-layers, bizdoc-company-case-method, gtm-named-employees-talktrack, door-cta-live-check, multi-business-lane-tag, amplitude-funnel-readout.
- Research / leads (6): public-contact-corroborate, quarantine-lead-farms, books-pdfs-to-courses, tape-walk-corpus-extract, youtube-outlier-scorecard, mktg-value-stp-mix-plan-checklists, prediction-event-expectations, demkinn-56-router.
- Creative (4): wealth-intelligence-episode-spine, reference-driven-video-production, own-motion-kit.
- Commerce lane: amazon-day1-individual → amazon-day1-individual / amazon-day1-individual → amazon-day1-individual.
- HOLD / parked (load only when Evens reopens the lane): dropship-later-hold, quarantine-lead-farms, quarantine-lead-farms.
- Jev triage said "deprecate" (NOT deprecated; Evens decides): buy-expensive-things, gsc-dying-pages, quarantine-lead-farms, related-youtuber-steal-map, sponsor-tracker-no-send.
