# Tool registry — installs of Oct 10–11, 2026 (box, Mac, VPS)

51 entries. By status: verified 31, needs-key 13, partial 6, skipped 1.

Machine-readable: `TOOLS_REGISTRY.json`. Sync (report-only): `sync_tools.sh box` then run `out/mac_checks.sh` read-only on the Mac and `out/vps_checks_for_forge.sh` via Forge on the VPS, then `sync_tools.sh report`. Results: `SYNC_RESULTS.md`.

Status legend: **verified** = smoke-tested on >=1 machine, works without extra keys; **partial** = installed but part missing (disk/browser/apply); **needs-key** = installed; real use needs a key; **skipped** = deliberately not installed

| Tool | Status | Desk | License | Box | Mac | VPS | Keys (names only) |
|---|---|---|---|---|---|---|---|
| [VoiceStudio](https://github.com/debpalash/VoiceStudio) | skipped | creative_studio | AGPL-3.0 | `/workspace/tools/VoiceStudio` | — | — | — |
| [ppt-master](https://github.com/hugohe3/ppt-master) | verified | creative_studio | MIT | `/workspace/tools/ppt-master` | `~/tools/ppt-master` | `/opt/tools/hugohe3_ppt-master` | — |
| [gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view) | needs-key | creative_studio | MIT (code; data/assets not MIT) | `/workspace/tools/gods-eye-view` | `~/tools/gods-eye-view` | — | GOOGLE_MAPS_API_KEY (opt), CESIUM_ION_TOKEN (opt), OPENAI_API_KEY (opt), AISSTREAM_API_KEY (opt), FIRMS_MAP_KEY (opt), TOMTOM_API_KEY (opt), OPENSKY creds (opt) |
| [rea](https://github.com/morluto/rea) | verified | forge | MIT | `/workspace/tools/rea` | `~/tools/rea` | `/opt/tools/morluto_rea` | — |
| [diagram-design](https://github.com/cathrynlavery/diagram-design) | verified | creative_studio | MIT | `/workspace/tools/diagram-design` | `~/tools/diagram-design` | `/opt/tools/cathrynlavery_diagram-design` | — |
| [paperclip](https://github.com/paperclipai/paperclip) | partial | big_boss | MIT | `/workspace/tools/paperclip` | `~/tools/paperclip` | `/opt/tools/paperclipai_paperclip` | — |
| [mattpocock-skills](https://github.com/mattpocock/skills) | verified | forge | MIT | `/workspace/tools/skills` | `~/tools/mattpocock-skills` | `/opt/tools/mattpocock_skills` | — |
| [ECC](https://github.com/affaan-m/ECC) | partial | forge | MIT | `/workspace/tools/ECC` | `~/tools/ECC` | `/opt/tools/affaan-m_ECC` | — |
| [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | verified | forge | none (no license) | `/workspace/tools/andrej-karpathy-skills` | `~/tools/andrej-karpathy-skills` | `/opt/tools/multica-ai_andrej-karpathy-skills` | — |
| [claude-mem](https://github.com/thedotmack/claude-mem) | needs-key | librarian | Apache-2.0 | `/workspace/tools/claude-mem` | `~/tools/claude-mem` | `/opt/tools/thedotmack_claude-mem` | Claude login or OPENROUTER_API_KEY |
| [agency-agents](https://github.com/msitarzewski/agency-agents) | verified | big_boss | MIT | `/workspace/tools/undefinedki/msitarzewski__agency-agents` | `~/tools/agency-agents` | `/opt/tools/msitarzewski_agency-agents` | — |
| [wshobson-agents](https://github.com/wshobson/agents) | verified | forge | MIT | `/workspace/tools/undefinedki/wshobson__agents` | `~/tools/wshobson-agents` | `/opt/tools/wshobson_agents` | — |
| [knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | verified | big_boss | Apache-2.0 | `/workspace/tools/undefinedki/anthropics__knowledge-work-plugins` | `~/tools/knowledge-work-plugins` | `/opt/tools/anthropics_knowledge-work-plugins` | — |
| [claude-quickstarts](https://github.com/anthropics/claude-quickstarts) | needs-key | forge | MIT | `/workspace/tools/undefinedki/anthropics__claude-quickstarts` | `~/tools/claude-quickstarts` | `/opt/tools/anthropics_claude-quickstarts` | ANTHROPIC_API_KEY |
| [addyosmani-agent-skills](https://github.com/addyosmani/agent-skills) | verified | forge | MIT | `/workspace/tools/undefinedki/addyosmani__agent-skills` | `~/tools/agent-skills` | `/opt/tools/addyosmani_agent-skills` | — |
| [hyperframes](https://github.com/heygen-com/hyperframes) | verified | creative_studio | Apache-2.0 | `/workspace/tools/nateherk/heygen-com__hyperframes` | `~/tools/hyperframes` | `/opt/tools/b2/heygen-com_hyperframes` | — |
| [googleworkspace-cli (gws)](https://github.com/googleworkspace/cli) | needs-key | big_boss | Apache-2.0 | `/workspace/tools/nateherk/googleworkspace__cli` | `~/tools/gws-cli` | `/opt/tools/b2/googleworkspace_cli` | GCP OAuth client (gws auth setup) |
| [apify-mcp-server](https://github.com/apify/apify-mcp-server) | needs-key | researcher | MIT | `/workspace/tools/nateherk/apify__apify-mcp-server` | `~/tools/apify-mcp-server` | `/opt/tools/b2/apify_apify-mcp-server` | APIFY_TOKEN |
| [scroll-craft](https://github.com/nateherkai/scroll-craft) | verified | creative_studio | MIT | `/workspace/tools/nateherk/nateherkai__scroll-craft` | `~/tools/scroll-craft` | `/opt/tools/b2/nateherkai_scroll-craft` | — |
| [humanizer](https://github.com/blader/humanizer) | verified | lead_gtm_comms | MIT | `/workspace/tools/nateherk/blader__humanizer` | `~/tools/humanizer` | `/opt/tools/b2/blader_humanizer` | — |
| [expo-skills](https://github.com/expo/skills) | verified | forge | MIT | `/workspace/tools/nateherk/expo__skills` | `~/tools/expo-skills` | `/opt/tools/b2/expo_skills` | — |
| [supabase-agent-skills](https://github.com/supabase/agent-skills) | verified | forge | MIT | `/workspace/tools/nateherk/supabase__agent-skills` | `~/tools/supabase-agent-skills` | `/opt/tools/b2/supabase_agent-skills` | — |
| [stripe-best-practices](https://github.com/stripe/ai) | verified | money_desk | MIT | `/workspace/tools/nateherk/stripe__ai` | `~/tools/stripe-ai` | `/opt/tools/b2/stripe_ai` | — |
| [playwright-cli](https://github.com/microsoft/playwright-cli) | verified | forge | Apache-2.0 | `/workspace/tools/nateherk/microsoft__playwright-cli` | `~/tools/playwright-cli` | `/opt/tools/b2/microsoft_playwright-cli` | — |
| [claude-security](https://github.com/anthropics/claude-plugins-official) | verified | watchdog | Apache-2.0 | `/workspace/tools/nateherk/anthropics__claude-plugins-official` | `~/tools/claude-plugins-official` | `/opt/tools/b2/anthropics_claude-plugins-official` | — |
| [open-seo](https://github.com/every-app/open-seo) | needs-key | lead_gtm_comms | MIT | `/workspace/tools/nateherk/every-app__open-seo` | — | `/opt/tools/b2/every-app_open-seo` | DATAFORSEO_API_KEY |
| [token-dashboard](https://github.com/nateherkai/token-dashboard) | verified | watchdog | MIT | `/workspace/tools/nateherk/nateherkai__token-dashboard` | `~/tools/token-dashboard` | `/opt/tools/b2/nateherkai_token-dashboard` | — |
| [superpowers](https://github.com/obra/superpowers) | verified | forge | MIT | `/workspace/tools/superpowers` | `~/tools/superpowers` | `/opt/tools/b3/obra_superpowers` | — |
| [codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | partial | librarian | MIT | — | `~/tools/codebase-memory-mcp` | `(not installed)` | — |
| [last30days-skill](https://github.com/mvanhorn/last30days-skill) | needs-key | researcher | MIT | `/workspace/tools/last30days-skill` | — | `/opt/tools/b3/mvanhorn_last30days-skill` | X/Reddit/YouTube source keys (optional, see CONFIGURATION.md) |
| [Agent-Reach](https://github.com/Panniantong/Agent-Reach) | needs-key | researcher | MIT | `/workspace/tools/Agent-Reach` | — | `/opt/tools/b3/Panniantong_Agent-Reach` | per-platform keys/cookies |
| [jev-ultrafast](https://github.com/browser-use/jev-ultrafast) | needs-key | forge | MIT | `/workspace/tools/jev-ultrafast` | — | `/opt/tools/b3/browser-use_jev-ultrafast` | TYPESAFE_API_KEY, TEXT_MODEL_API_KEY |
| [gstack](https://github.com/garrytan/gstack) | partial | watchdog | MIT | `/workspace/tools/gstack` | `~/.claude/skills/gstack` | — | — |
| [anthropic-skills](https://github.com/anthropics/skills) | verified | creative_studio | Apache-2.0 (docx/pdf/pptx/xlsx source-available) | `/workspace/tools/anthropic-skills` | `~/tools/anthropic-skills` | `/opt/tools/b3/anthropics_skills` | — |
| [promptfoo](https://github.com/promptfoo/promptfoo) | needs-key | watchdog | MIT | `/workspace/tools/promptfoo-cli` | — | `(not installed)` | OPENROUTER_API_KEY (model) |
| [impeccable](https://github.com/pbakaus/impeccable) | verified | creative_studio | Apache-2.0 | `/workspace/tools/impeccable` | `~/tools/impeccable` | — | — |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | verified | creative_studio | MIT | `/workspace/tools/taste-skill` | `~/tools/taste-skill` | — | — |
| [mem0](https://github.com/mem0ai/mem0) | needs-key | librarian | Apache-2.0 | — | — | `/opt/tools/b3/mem0ai_mem0` | OPENAI_API_KEY (LLM+embeddings; configurable) |
| [crawl4ai](https://github.com/unclecode/crawl4ai) | partial | researcher | Apache-2.0 | `/workspace/tools/crawl4ai` | — | `/opt/tools/b3/unclecode_crawl4ai` | — |
| [markitdown](https://github.com/microsoft/markitdown) | verified | librarian | MIT | `/workspace/tools/markitdown` | `~/tools/markitdown` | `/opt/tools/b3/microsoft_markitdown` | — |
| [Scrapling](https://github.com/D4Vinci/Scrapling) | partial | researcher | BSD-3-Clause | `/workspace/tools/Scrapling` | — | `/opt/tools/b3/D4Vinci_Scrapling` | — |
| [fastmcp](https://github.com/PrefectHQ/fastmcp) | verified | forge | Apache-2.0 | — | `~/tools/fastmcp` | `/opt/tools/b3/PrefectHQ_fastmcp` | — |
| [context7-mcp](https://github.com/upstash/context7) | verified | forge | MIT | — | `~/tools/context7-mcp` | — | CONTEXT7_API_KEY (optional) |
| [iFixAi](https://github.com/ifixai-ai/iFixAi) | needs-key | watchdog | Apache-2.0 | `/workspace/tools/iFixAi` | — | `/opt/tools/b3/ifixai-ai_iFixAi` | model provider key |
| [warren](https://github.com/jayminwest/warren) | needs-key | big_boss | MIT | — | — | `/opt/tools/b3/jayminwest_warren` | agent CLIs' own keys |
| [gsap-skills](https://github.com/greensock/gsap-skills) | verified | creative_studio | MIT | `/workspace/tools/gsap-skills` | `~/tools/gsap-skills` | — | — |
| [claude-seo](https://github.com/AgriciDaniel/claude-seo) | verified | lead_gtm_comms | MIT | `/workspace/tools/claude-seo` | `~/tools/claude-seo` | — | DataForSEO/Ahrefs/SE Ranking/Google/Firecrawl (optional extensions) |
| JevRouter | verified | big_boss | MIT | `/workspace/tools/JevRouter` | `~/tools/JevRouter` | — | LITELLM_KEY_* via jev-shim (or OPENROUTER_API_KEY) |
| jev-shim | verified | big_boss | internal | `/workspace/tools/jev-shim` | `~/tools/jev-shim` | — | LITELLM_KEY_* |
| jev-evals (promptfoo slim) | verified | watchdog | internal | `/workspace/tools/jev-evals` | `~/tools/jev-evals` | — | LITELLM_KEY_* |
| jev-route | verified | big_boss | internal | `/home/box/.local/bin/jev-route` | — | — | LITELLM_KEY_GROK_DESKS (+ per-platform LITELLM_KEY_*) |

## Purpose and verify commands

- **VoiceStudio**: Local voice cloning, dubbing, transcription (Electron+Python). Notes: Deferred for RAM; VPS SKIPPED as instructed.
  - box: `test -f /workspace/tools/VoiceStudio/package.json` (reported: DEFERRED_RAM clone only)
- **ppt-master**: PDF/Word/MD to editable PPTX (skill + scripts).
  - box: `test -x /workspace/tools/ppt-master/.venv/bin/python && test -f /workspace/tools/ppt-master/skills/ppt-master/scripts/svg_to_pptx.py` (reported: INSTALLED_VERIFIED)
  - mac: `test -d ~/tools/ppt-master/skills/ppt-master` (reported: present (_install-results))
  - vps: `test -f /opt/tools/hugohe3_ppt-master/skills/ppt-master/scripts/svg_to_pptx.py` (reported: INSTALLED_OBSERVED)
- **gods-eye-view**: 3D globe viewer with live flights/ships/cams. Notes: Live layers need optional keys; VPS SKIPPED.
  - box: `test -d /workspace/tools/gods-eye-view/dist` (reported: INSTALLED_VERIFIED build+preview)
  - mac: `test -d ~/tools/gods-eye-view` (reported: build exit 0)
- **rea**: Reverse-engineering CLI + MCP server. Notes: Also MCP namespace user-rea in this agent.
  - box: `node /workspace/tools/rea/scripts/rea.mjs --version` (reported: 6.4.0)
  - mac: `node ~/tools/rea/scripts/rea.mjs --version` (reported: 6.4.0 | SYNC 2026-10-11: FAIL — compiled runtime missing (needs `npm ci && npm run build:cached` in ~/tools/rea))
  - vps: `node /opt/tools/morluto_rea/scripts/rea.mjs --version` (reported: 6.4.0)
- **diagram-design**: Diagram skill (44 types HTML/SVG). Notes: PNG export needs Playwright browser.
  - box: `test -f /workspace/tools/diagram-design/scripts/verify-doctor.py` (reported: doctor PASS)
  - mac: `test -d ~/tools/diagram-design` (reported: doctor: needs Playwright renderer)
  - vps: `python3 /opt/tools/cathrynlavery_diagram-design/scripts/verify-doctor.py` (reported: PASS)
- **paperclip**: Run a company of autonomous agents.
  - box: `test -f /workspace/tools/paperclip/package.json` (reported: BLOCKED_DISK source only)
  - mac: `test -d ~/tools/paperclip/node_modules` (reported: deps exit 0)
  - vps: `bash -c 'ls /opt/tools/paperclipai_paperclip/node_modules >/dev/null'` (reported: API /api/health 200; UI not served)
- **mattpocock-skills**: 38 small engineering skills.
  - box: `test $(find /workspace/tools/skills/skills -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: cloned)
  - mac: `test $(find ~/tools/mattpocock-skills -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: present)
  - vps: `test $(find /opt/tools/mattpocock_skills -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: 38/38 valid)
- **ECC**: Skills/memory/security pack for Claude Code, Codex, Cursor.
  - box: `node /workspace/tools/ECC/scripts/ecc.js --help >/dev/null` (reported: --help OK; not applied)
  - mac: `node ~/tools/ECC/scripts/ecc.js --help >/dev/null` (reported: dry-run + apply log present (_ecc-apply.txt))
  - vps: `node /opt/tools/affaan-m_ECC/scripts/ecc.js --help >/dev/null` (reported: CLI OK; apply not done (would overwrite settings.json))
- **andrej-karpathy-skills**: CLAUDE.md with 4 Karpathy coding rules.
  - box: `test -f /workspace/tools/andrej-karpathy-skills/CLAUDE.md` (reported: present)
  - mac: `test -f ~/tools/andrej-karpathy-skills/CLAUDE.md` (reported: present)
  - vps: `test -f /opt/tools/multica-ai_andrej-karpathy-skills/CLAUDE.md` (reported: present)
- **claude-mem**: Session memory/summaries for agents. Notes: Hooks not installed; reads Claude keychain token by design; PostHog telemetry consent-gated.
  - box: `node /workspace/tools/claude-mem/dist/npx-cli/index.js version` (reported: 13.35.0)
  - mac: `test -d ~/tools/claude-mem` (reported: 13.35.0; sign-in link pending)
  - vps: `node /opt/tools/thedotmack_claude-mem/dist/npx-cli/index.js version` (reported: 13.35.0)
- **agency-agents**: ~170 role agents for 15+ tools.
  - box: `test -d /workspace/tools/undefinedki/msitarzewski__agency-agents` (reported: lint 0 errors)
  - mac: `test -d ~/tools/agency-agents` (reported: present)
  - vps: `test -d /opt/tools/msitarzewski_agency-agents` (reported: lint PASSED)
- **wshobson-agents**: 92 Claude Code plugins.
  - box: `test $(find /workspace/tools/undefinedki/wshobson__agents -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: plugin.json valid)
  - mac: `test -d ~/tools/wshobson-agents` (reported: present)
  - vps: `test -d /opt/tools/wshobson_agents` (reported: 92/92 valid)
- **knowledge-work-plugins**: Anthropic job plugins (sales, legal, finance).
  - box: `test $(find /workspace/tools/undefinedki/anthropics__knowledge-work-plugins -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: 22 plugins valid)
  - mac: `test -d ~/tools/knowledge-work-plugins` (reported: present)
  - vps: `test -d /opt/tools/anthropics_knowledge-work-plugins` (reported: 22/22, 252/252)
- **claude-quickstarts**: Official runnable agent examples.
  - box: `test -d /workspace/tools/undefinedki/anthropics__claude-quickstarts/.venv` (reported: venv; Agent imports)
  - mac: `test -d ~/tools/claude-quickstarts` (reported: anthropic 1.13.0)
  - vps: `test -d /opt/tools/anthropics_claude-quickstarts` (reported: clone only)
- **addyosmani-agent-skills**: 25 dev-cycle skills.
  - box: `test $(find /workspace/tools/undefinedki/addyosmani__agent-skills -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: 25 valid)
  - mac: `test -d ~/tools/agent-skills` (reported: present)
  - vps: `test -d /opt/tools/addyosmani_agent-skills` (reported: 25/25)
- **hyperframes**: HTML+GSAP to MP4 rendering CLI + skills.
  - box: `test $(find /workspace/tools/nateherk/heygen-com__hyperframes -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: SKILLS_ONLY; CLI not installed)
  - mac: `test -d ~/tools/hyperframes` (reported: 0.8.147; 21 skills)
  - vps: `test -d /opt/tools/b2` (reported: 0.8.147; 21/21)
- **googleworkspace-cli (gws)**: Gmail/Drive/Calendar/Sheets CLI + 95 skills.
  - box: `test $(find /workspace/tools/nateherk/googleworkspace__cli -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: SKILLS_ONLY)
  - mac: `test -d ~/tools/gws-cli` (reported: gws present; 95 skills)
  - vps: `test -d /opt/tools/b2` (reported: gws 0.22.5; no auth)
- **apify-mcp-server**: MCP server for Apify actors (scraping).
  - box: `test -d /workspace/tools/nateherk/apify__apify-mcp-server` (reported: CLONE_ONLY)
  - mac: `test -d ~/tools/apify-mcp-server` (reported: present)
  - vps: `node /opt/tools/b2/apify_apify-mcp-server/dist/stdio.js --help` (reported: build OK; not registered)
- **scroll-craft**: Skill for scroll-driven premium websites.
  - box: `test $(find /workspace/tools/nateherk/nateherkai__scroll-craft -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: valid)
  - mac: `test -d ~/tools/scroll-craft` (reported: 1 skill)
  - vps: `test -d /opt/tools/b2` (reported: valid)
- **humanizer**: Removes AI-writing tells.
  - box: `test $(find /workspace/tools/nateherk/blader__humanizer -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: valid)
  - mac: `test -d ~/tools/humanizer` (reported: 1 skill)
  - vps: `test -d /opt/tools/b2` (reported: valid)
- **expo-skills**: 25 Expo/React Native skills.
  - box: `test $(find /workspace/tools/nateherk/expo__skills -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: 25 valid)
  - mac: `test -d ~/tools/expo-skills` (reported: 26 skills)
  - vps: `test -d /opt/tools/b2` (reported: 25/25)
- **supabase-agent-skills**: Supabase/Postgres best-practice skills.
  - box: `test $(find /workspace/tools/nateherk/supabase__agent-skills -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: 2 valid)
  - mac: `test -d ~/tools/supabase-agent-skills` (reported: 2 skills)
  - vps: `test -d /opt/tools/b2` (reported: 2/2)
- **stripe-best-practices**: Stripe integration skill (sparse).
  - box: `test $(find /workspace/tools/nateherk/stripe__ai -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: valid)
  - mac: `test -d ~/tools/stripe-ai` (reported: 1 skill)
  - vps: `test -d /opt/tools/b2` (reported: valid)
- **playwright-cli**: Token-light browser automation CLI.
  - box: `test $(find /workspace/tools/nateherk/microsoft__playwright-cli -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: SKILL_ONLY)
  - mac: `test -d ~/tools/playwright-cli` (reported: 0.1.22)
  - vps: `test -d /opt/tools/_ms-playwright` (reported: 0.1.22 + headless chromium real run)
- **claude-security**: In-session vuln scan plugin (hooks when enabled). Notes: Hooks not enabled anywhere.
  - box: `test $(find /workspace/tools/nateherk/anthropics__claude-plugins-official -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: plugin valid)
  - mac: `test -d ~/tools/claude-plugins-official` (reported: present)
  - vps: `test -d /opt/tools/b2` (reported: files only)
- **open-seo**: Self-hosted SEO tool on DataForSEO.
  - box: `test -d /workspace/tools/nateherk/every-app__open-seo` (reported: CLONE_ONLY)
  - vps: `test -d /opt/tools/b2` (reported: clone only; Docker skipped (disk))
- **token-dashboard**: Claude Code token/cost dashboard. Notes: Probable video item (not confirmed).
  - box: `python3 /workspace/tools/nateherk/nateherkai__token-dashboard/cli.py --help >/dev/null` (reported: scan+stats ran)
  - mac: `python3 ~/tools/token-dashboard/cli.py --help >/dev/null` (reported: help captured)
  - vps: `test -d /opt/tools/b2` (reported: scan ran)
- **superpowers**: Engineering workflow skills.
  - box: `test $(find /workspace/tools/superpowers -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: cloned 15 SKILL.md)
  - mac: `test -d ~/.claude/skills/brainstorming || test -d ~/tools/superpowers` (reported: 14 skills x3 dirs)
  - vps: `test -d /opt/tools/b3/obra_superpowers` (reported: 15/15)
- **codebase-memory-mcp**: Code knowledge-graph MCP server.
  - mac: `~/tools/codebase-memory-mcp/build/c/codebase-memory-mcp --version` (reported: built from source; not in MCP config)
  - vps: `true` (reported: SKIPPED disk floor)
- **last30days-skill**: 30-day multi-source research skill. Notes: Optional macOS keychain cookie extractor — do not enable without Evens OK.
  - box: `test -d /workspace/tools/last30days-skill/.venv` (reported: --help OK)
  - vps: `test -d /opt/tools/b3/mvanhorn_last30days-skill` (reported: --help OK)
- **Agent-Reach**: Multi-platform reach/scrape CLI.
  - box: `/workspace/tools/Agent-Reach/.venv/bin/agent-reach --version` (reported: v1.5.0)
  - vps: `/opt/tools/b3/Panniantong_Agent-Reach/.venv/bin/agent-reach --version` (reported: v1.5.0)
- **jev-ultrafast**: Jev-driven fast browser agent. Notes: Never run `jev --help/--version` as a check: it starts a server.
  - box: `/workspace/tools/jev-ultrafast/.venv/bin/python -c 'import importlib.util,sys;sys.exit(0 if importlib.util.find_spec("jev_ultrafast") or importlib.util.find_spec("jev") else 1)'` (reported: imports; `jev --help` hangs)
  - vps: `test -d /opt/tools/b3/browser-use_jev-ultrafast/.venv` (reported: entry point; starts server on --version)
- **gstack**: Review/QA/ship skills (subset). Notes: Browser/cookie/keychain parts NOT installed.
  - box: `test -d /workspace/tools/gstack` (reported: cloned, no setup)
  - mac: `test -f ~/.claude/skills/gstack/VERSION` (reported: v1.91.90.0; 4 skills x3; bun/browse missing)
- **anthropic-skills**: Official Anthropic skills.
  - box: `test $(find /workspace/tools/anthropic-skills -name SKILL.md 2>/dev/null | wc -l) -gt 0` (reported: cloned)
  - mac: `test -d ~/tools/anthropic-skills` (reported: 18 skills x3)
  - vps: `test -d /opt/tools/b3/anthropics_skills` (reported: 20/20)
- **promptfoo**: LLM eval harness. Notes: Set PROMPTFOO_DISABLE_TELEMETRY=1.
  - box: `cd /workspace/tools/promptfoo-cli && PROMPTFOO_DISABLE_TELEMETRY=1 timeout 60 npx --no-install promptfoo --version` (reported: 0.124.1)
  - vps: `true` (reported: SKIPPED disk floor)
- **impeccable**: Design-quality skills.
  - box: `test -d /workspace/tools/impeccable` (reported: cloned)
  - mac: `test -d ~/tools/impeccable` (reported: per-tool variants)
- **taste-skill**: Design taste skills.
  - box: `test -d /workspace/tools/taste-skill` (reported: cloned)
  - mac: `test -d ~/tools/taste-skill` (reported: 13 skills x3)
- **mem0**: Agent memory library.
  - vps: `test -d /opt/tools/b3/mem0ai_mem0/.venv` (reported: library imports, 2.2.1)
- **crawl4ai**: LLM-friendly crawler.
  - box: `test -x /workspace/tools/crawl4ai/.venv/bin/crwl` (reported: 0.9.4; browsers not installed)
  - vps: `test -d /opt/tools/b3/unclecode_crawl4ai` (reported: clone only; SKIPPED disk)
- **markitdown**: Files to Markdown.
  - box: `bash -c 'ls /workspace/tools/markitdown/.venv/bin/markitdown'` (reported: 0.1.8)
  - mac: `bash -c 'ls ~/tools/markitdown/.venv/bin/markitdown'` (reported: 0.1.8)
  - vps: `test -d /opt/tools/b3/microsoft_markitdown/.venv` (reported: 0.1.8 real run)
- **Scrapling**: Adaptive scraping library.
  - box: `test -d /workspace/tools/Scrapling/.venv` (reported: core 0.4.15; fetchers not installed)
  - vps: `test -d /opt/tools/b3/D4Vinci_Scrapling/.venv` (reported: core parser ok)
- **fastmcp**: Python MCP server framework.
  - mac: `bash -c 'ls ~/tools/fastmcp/.venv/bin/fastmcp'` (reported: fastmcp version OK)
  - vps: `test -d /opt/tools/b3/PrefectHQ_fastmcp/.venv` (reported: 4.1.0 PyPI)
- **context7-mcp**: Docs-lookup MCP server. Notes: Adding to MCP configs needs Evens approval.
  - mac: `test -d ~/tools/context7-mcp/node_modules` (reported: --help OK; not in MCP configs)
- **iFixAi**: AI diagnostics CLI.
  - box: `test -d /workspace/tools/iFixAi/.venv` (reported: 4.1.0)
  - vps: `test -d /opt/tools/b3/ifixai-ai_iFixAi/.venv` (reported: 4.1.0)
- **warren**: Multi-agent CLI orchestrator.
  - vps: `test -x /opt/tools/b3/_cli/bun` (reported: 0.19.3 CLI)
- **gsap-skills**: GSAP animation skills.
  - box: `test -d /workspace/tools/gsap-skills` (reported: cloned)
  - mac: `test -d ~/tools/gsap-skills` (reported: 8 skills x3)
- **claude-seo**: SEO audit/content/schema skill pack.
  - box: `test -d /workspace/tools/claude-seo` (reported: cloned)
  - mac: `test -d ~/tools/claude-seo` (reported: 25 skills x3)
- **JevRouter**: Policy-gated Jev capability router.
  - box: `test -f /workspace/tools/JevRouter/dist/index.js || test -d /workspace/tools/JevRouter/dist` (reported: 0.1.0 built)
  - mac: `test -d ~/tools/JevRouter` (reported: bundle copied)
- **jev-shim**: Loopback shim: native Jev API to LiteLLM jev.
  - box: `test -f /workspace/tools/jev-shim/shim.py` (reported: in use)
  - mac: `test -d ~/tools/jev-shim` (reported: present)
- **jev-evals (promptfoo slim)**: Jev eval suite on promptfoo.
  - box: `test -f /workspace/tools/jev-evals/promptfooconfig.yaml` (reported: 18/18)
  - mac: `test -d ~/tools/jev-evals` (reported: present)
- **jev-route**: Cheap Jev preflight router CLI (v3.2 signal-pack fix).
  - box: `test -x /home/box/.local/bin/jev-route && test -f /home/box/.local/share/jev/packs.json` (reported: v3.2 live 2026-10-11)
