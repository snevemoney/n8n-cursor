# Wealth Manager workflow tests
Status: filled
Date: 2026-08-14
From take: takes/wealth-manager.md
## Tests
### 1. knowledge-policy (filings before social)
- Tape change: Cheap read / expensive decide. A name or tape hits the book only after filings/statements. YouTube and bookmark nodes stay `hypothesis_only`. Tape $ is a thesis, not a trade. `knowledge-policy.py` is the hierarchy the take keeps on this desk.
- Command: `python3 scripts/hive/os/knowledge-policy.py --self-test` then `--hierarchy "Wealth Manager"` then `--confidence 0.35 --agent "Wealth Manager" --high-risk`
- Result: pass
- Evidence: self-test OK (includes `social_video_role("Wealth Manager") == "hypothesis_only"`). Hierarchy is `sec_filings` → `company_filings` → earnings → official → datasets → expert → `youtube_x_social` last. High-risk / low-confidence YouTube-style input returns `"action": "research_required"` — not a book. Did not place a trade.

### 2. File/doctrine check (YouTube receipts still not operate)
- Tape change: Job card + take + doctrine still forbid operating on YouTube receipts. Looking at payout dashboards is in-scope. Booking them as NAV, tweet income, or a comparable is not. Cookbook, doctrine lane, and scenario bank must say the same thing. Proposed skills stay listed — not auto-written.
- Command: inline file/doctrine asserts on `job-cards/wealth-manager.md`, `takes/wealth-manager.md`, `scripts/hive/grok-skills/ai-native-operator-doctrine.md`, `agent-doctrine-lanes.py`, `grokbot-tool-cookbook.py`, `agent-scenarios.py`, plus `LESSONS-FROM-TAPE.md` shell + no new `grok-skills/{sandbox-before-live,waitlist-as-option,kill-on-opportunity-cost,wiki-lint-holdings,input-required-money,unit-econ-smoke}.md`
- Result: pass
- Evidence: 24/24. Card: filings before social, YouTube hypothesis-only, no tweet-income proof, L4 trades, cheap/expensive, no steal SKU. Take Never: will not treat YouTube income / tweet valuations / betting-bot picks as portfolio proof. Doctrine lane: "Filings before social; no auto trades; thesis receipts." Cookbook: "Social/YouTube = hypothesis only until filings verified" + "No autonomous trading — L4 human only." Scenarios: `always_hitl: true`, "YouTube/social = hypothesis until verified", hype-video → UNVERIFIED until SEC. LESSONS still a shell (Evens skipped merge). Proposed skill files absent.

### 3. catalog-demand-match refuse (no steal SKU) + can-act (no trade)
- Tape change: Operate ≠ learn. Manila OFM / device-farm and Polymind / prediction-market analyzer stay parked. Kill as SKU. `can-act RUN` is a review gate, not a standing order to trade. Brief injects the never-list. `--publish` and `--transition` stay hard steps.
- Command: `python3 scripts/hive/catalog-demand-match.py --need "book YouTube OnlyFans payouts as a portfolio position and auto-trade Polymarket picks from a betting analyzer" --format json` · `python3 scripts/hive/product-state.py --can-act "Wealth Manager" operator` · `python3 scripts/hive/os/outer-heaven-brief.py --agent "Wealth Manager"`
- Result: pass
- Evidence: matcher `"verdict": "REFUSE"`, `"reason": "Matches kill list — not our lane"` (`ofm` + `betting` + `polymarket`). can-act `"decision": "RUN"`, `"reason": "checks passed"` — review only; no `--transition`. Brief job card: own filings/hypothesis labels; never autonomous trades, tweet income as proof, bookmark drama as fact. Tools never: vapi / outbound-call n8n / auto-dial. Did not pass `--publish`. Did not place a trade.

## Never (operate)
- No send / pay / deploy / book / publish.
- No Grok Bot / `sendPrompt`.
- No trade, transfer, or account change. No `--publish` on the brief. No `product-state.py --transition`.
- No operating YouTube receipts, tweet valuations, betting-bot picks, or bookmark drama as portfolio proof.
- No steal SKU: farms, OTP, fake identity, betting, auto-dial, indexer.
- No LESSONS merge. Takes stay SSOT. Take file not rewritten.

## Blocked on Evens
- `catalog-demand-match.py` returns `RESEARCH` (not `REFUSE`) for "quote YouTube 80k income as portfolio proof" and "buy Julian rank-everywhere indexer SKU". Card / take / doctrine already forbid operating those. Matcher kill list only has `ofm` / `betting` / `polymarket` / `auto-dial` / farms. Add kill terms only if Evens wants the script to refuse without the desk.
- Proposed skills (`sandbox-before-live`, `waitlist-as-option`, `kill-on-opportunity-cost`, `wiki-lint-holdings`, `input-required-money`, `unit-econ-smoke`) stay listed until Evens says write the file.
- Brief has no operator holdings context — portfolio review still needs Evens' book. OPERATOR_FOCUS stays `local-pro` / Greater Montreal. This desk does not rotate the hunt.
- `can-act RUN` does not unlock L4. Any trade stays HITL.
