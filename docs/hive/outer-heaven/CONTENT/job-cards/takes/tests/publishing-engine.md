# Publishing Engine workflow tests
Status: filled
Date: 2026-08-14
From take: takes/publishing-engine.md
## Tests
### 1. Beta+ can-act / publish suppression
- Tape change: Take + doctrine: package walkthrough-ready; never publish autonomously; routine suppressed until beta+. `should-run.py` treats Publishing Engine as GTM-suppressed through development and extra-suppressed through testing.
- Command:
  ```
  python3 scripts/hive/os/should-run.py --self-test
  python3 scripts/hive/product-state.py --validate
  python3 scripts/hive/product-state.py --can-act "Publishing Engine" clipengine
  python3 scripts/hive/os/should-run.py --agent "Publishing Engine" --state '{"lifecycle":"testing"}'
  python3 scripts/hive/os/should-run.py --agent "Publishing Engine" --state '{"lifecycle":"development"}'
  python3 scripts/hive/os/should-run.py --agent "Publishing Engine" --state '{"lifecycle":"idea"}'
  python3 scripts/hive/os/should-run.py --agent "Publishing Engine" --state '{"lifecycle":"beta"}'
  python3 scripts/hive/os/should-run.py --agent "Publishing Engine" --state '{"lifecycle":"launch_ready"}'
  python3 scripts/hive/agent-scenarios.py --validate
  ```
- Result: pass
- Evidence: `should-run` self-test OK. `product-state` validate OK (6 projects). clipengine lifecycle is `beta` → can-act **RUN** / "checks passed". idea + development → **WAIT_FOR_STATE** ("GTM/Publishing suppressed"). testing → **WAIT_FOR_STATE** ("Publishing suppressed while lifecycle=testing"). beta + launch_ready → **RUN**. `agent-scenarios` validate OK; Publishing Engine `always_hitl: True`, suppressed_lifecycles include testing. Routine copy still says "Never publish without HITL L3". Did not publish, schedule, or go live. Note: `should-run --self-test` has no Publishing Engine case (Watchdog/GTM/Forge/Lead Hunter only); live gate still matches the take.

### 2. catalog-demand-match vs take machines + never-list
- Tape change: Take default machines are `one-channel-deep` and `clip-factory`. Never operate farms / OTP / mass-DM / betting. No “how I make $85K” / YouTube-RPM proof page. `info-gain-cite` is a named steal, not a farm.
- Command:
  ```
  python3 scripts/hive/catalog-demand-match.py --need "clip shorts from a podcast for a YouTube creator"
  python3 scripts/hive/catalog-demand-match.py --need "one channel deep warm network posts on our owned surface"
  python3 scripts/hive/catalog-demand-match.py --need "one-channel-deep"
  python3 scripts/hive/catalog-demand-match.py --need "IG farm OFM account farm mass DM"
  python3 scripts/hive/catalog-demand-match.py --need "how I make 85K proof page from YouTube RPM"
  python3 scripts/hive/catalog-demand-match.py --need "auto-dial restaurant booking bot"
  python3 scripts/hive/catalog-demand-match.py --need "betting prediction market analyzer like Polymind"
  python3 scripts/hive/catalog-demand-match.py --need "info-gain-cite honest page from a run we did"
  ```
- Result: fail
- Evidence: clip-factory need → **BUILD** `clip-factory__creator-longform__greater-montreal` (catalog row exists; PE is a primary agent). Handshake `required_skills` is `slice-build`, not clip-factory / one-channel-deep. one-channel-deep natural language → **RESEARCH** (0 matches) even though `BUSINESS_CATALOG.json` has `one-channel-deep__*` rows — `KEYWORD_MACHINES` has no one-channel-deep entry. Hyphenated `one-channel-deep` → **ASK**. Farm / auto-dial / betting → **REFUSE** (kill list). “how I make 85K … YouTube RPM” → **RESEARCH**, not REFUSE — income-proof page is not a kill term. `info-gain-cite` → **RESEARCH** (skill file exists; not in catalog / KEYWORD_MACHINES).

### 3. Skill wiring vs take (files, owners, brief)
- Tape change: Take roll-up skills: `one-channel-deep`, `clip-factory`, `info-gain-cite`, `agent-as-hire`, `session-bootstrap`, `wiki-ingest`, plus proposed `video-drop-pack` / `waitlist-proof-page` / `report-from-transcript` / `brand-as-skill`. Job card default machine is one-channel-deep · clip-factory. Brief must inject owns/never. Takes stay SSOT — do not merge LESSONS-FROM-TAPE. Do not `--publish` the brief.
- Command:
  ```
  ls scripts/hive/grok-skills/{info-gain-cite,session-bootstrap,agent-as-hire,wiki-ingest,outcome-offer-funnel}.md
  ls scripts/hive/grok-skills/{one-channel-deep,clip-factory,video-drop-pack,waitlist-proof-page,report-from-transcript,brand-as-skill}.md
  ls docs/hive/outer-heaven/CONTENT/n8n-learning/one-pagers/publishing-engine.md
  python3 scripts/hive/os/outer-heaven-brief.py --self-test
  python3 scripts/hive/os/outer-heaven-brief.py --agent "Publishing Engine" --format markdown
  ```
- Result: fail
- Evidence: Existing skill files present: info-gain-cite, session-bootstrap, agent-as-hire, wiki-ingest, outcome-offer-funnel (one-channel-deep maps here in steal-usecases). Dedicated `one-channel-deep.md` and `clip-factory.md` **missing** — machines only. Four proposed skills correctly **absent** (do not auto-write SKILL.md). n8n one-pager **missing**. Brief self-test OK; job card injects “HITL preview / clip-factory / one channel deep” and never “Publish autonomously / farms / quote RPM”. Did not pass `--publish`. `one-channel-deep__us__*` and `one-channel-deep__creator-longform__*` primary_agents are Big Boss / Consultant / Forge — **not** Publishing Engine. `os_agents_config.py` still sells “multi-platform publish pipeline”; `agent-scenarios.py` still has “Schedule approved posts across platforms” — both fight one-channel-deep. Brief does not load the take (correct; takes stay SSOT).
## Never (operate)
- Publish, schedule live, paid boost, or go live.
- Account farms, OTP, fake identity, mass-DM, betting, auto-dial.
- A “how I make $85K” / YouTube-RPM proof page.
- Grok Bot. Merge LESSONS-FROM-TAPE.md. Rewrite the take.
## Blocked on Evens
- Add `one-channel-deep` (and maybe `info-gain-cite`) to `catalog-demand-match.py` KEYWORD_MACHINES so catalog rows resolve.
- Kill-list income-proof / RPM pages so “how I make $85K” is REFUSE, not RESEARCH.
- Re-owner `one-channel-deep__*` catalog rows to Publishing Engine (today: Big Boss / Consultant / Forge).
- Whether to write the four proposed SKILL.md files — take named them; prior mission said do not auto-write.
- clipengine is already `beta`, so can-act is RUN for packaging. Evens still hits publish.
