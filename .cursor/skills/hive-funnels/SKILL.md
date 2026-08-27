---
name: hive-funnels
description: >-
  Run hive funnels (same as workflows) on Cursor + Grok Bot. Use when the
  operator says funnel, workflow, website offer, paid slice, lead list, wiki
  ingest, session dump, slice build, coverage loop, loop the agents, or
  channel-walk / @nateherk, or deep video learning / study this
  tape, or capability acquisition / what became possible, or
  checkable-stop / until satisfied / loop cap, or
  verify-after-browser / after a click / assume the click
  worked, or cursor-video-watch / watch this video /
  frames+transcript, or state-json / last-run store, or
  separate-verifier / builder grades builder, or
  assume-it-will-touch / permissions are tools, or
  sanitize-in-check-out / pass ≠ send, or
  hosted-neq-scheduled / 24/7 host, or
  vault-not-prompt / keys in chat, or
  api-macro-vision / vision agent, or
  side-effect-not-essay / it learned, or
  filter-then-llm / dump the table, or
  observe-pane / yellow needs-input, or
  token-receipt / billed run, or
  actuate-tape-skill / factory-first wrap / actuate a tape sitting, or
  click the live surface / maestro-style flow / click-live-site, or
  roadblock-bank / after a mess / never-again row, or
  social-source-ingest / IG X Reddit Facebook TikTok packet, or
  catalog-demand-match / can we do this, or
  internal host-OS / connect Obsidian / Claude Code x Obsidian remap, or
  url-habit-router / pasted a URL / learn this / build this, or
  grill-me / extract my brain / interview me relentlessly /
  before deciding what to do with a product, or
  ingest is steps / they built a UI / steal their design process, or
  brownfield RPIV / evolve the AI layer / ai-layer-in-repo, or
  Obsidian did not receive / emit to vault / OS has no data, or
  Syncthing / vault sync / live identical vault, or
  cursor chats / local sessions / grok read my chats. Do not adopt other AI vendors.
---

# Hive funnels (Cursor)

Workflow = funnel. Stack = **Cursor + Grok Bot**.

Load the matching file in `scripts/hive/grok-skills/` and follow it. Grok `/` copies live in `~/.grokbot/skills/<slug>/SKILL.md` — **generated mirrors, never hand-edit** (`skills-sync.py`).

**Drift gate (tiered, grill 2026-08-16):** before running any skill, read `docs/hive/outer-heaven/CONTENT/os/AUDIT.json` → `drift`. If the skill you are about to run appears in `mirror_diff` / `mirror_missing` — **hard-stop**: run `python3 scripts/hive/os/skills-sync.py --write`, reload the skill, then continue. Unrelated drift or `rules_stale` = yellow: name it, keep working. The sync is graded by the audit process, never by the agent running the skill.

| Operator says | Skill | You do in Cursor |
|---------------|-------|------------------|
| New project / dump | `session-bootstrap` | First message = full dump, then short loops |
| New topic / SOP-prompt / three folders | `sop-is-prompt-three-folders` | New chat per topic; SOP = prompt; load context + SOP-prompt + corpus. Parents: `session-bootstrap` + `context-docs` / `wiki-ingest` / `agent-as-hire`. Not ACQ. Send HITL. |
| Build site/page/game | `slice-build` | Bible → plan → one system; cinematic → `cinematic-recipe`; verify → `click-live-site` |
| Brownfield RPIV / evolve this repo’s AI layer | `ai-layer-in-repo` | Prime → plan handoff → fresh execute (new chat **or** same+PLAN.md) → validate. Watchdog GRADE required. Not any coding. Not ingest. Not website emit. Slice still `slice-build`. |
| Cinematic / premium motion page | `cinematic-recipe` | 3 refs (Awwwards count) + video hero + CTA-before-scroll roast; fail-the-build; click live. $ UNVERIFIED |
| Website emit from a living/ref page | `website-emit-from-ref` | ASK which method (clone / reconstruct-from-trace / file-a-reference) → emit into `website-assets/` as a **buyable option**. Same spine = system-upgrade. Tools → `tool-captures/` (3 wrappers when selling). Skills → `skill-candidates/` (3 ICPs). After PROVEN, auto-mint the distinct slug — class=system-upgrade no longer skips. DETECT class=skill still mints same sit. `cinematic-recipe` always-on for a website bite. Not any-repo / any-skill → landing. |
| Hear “X killed Y” / two builders same job | `competitive-teardown` | Name audiences → list categories → score only walked rows. Remap Cursor+Grok. Not a landing. Not Agent Kit. |
| Motion clip grade | `motion-grade-pipeline` | Still → video → upscale → color → timing. Prefer one continuous ≤30s 720p plate. Not Arcads. Publish HITL |
| Script-timed motion / beat graphics | `script-beat-motion` | Timed script → beats → sourced numbers → one graphic. Not a page wrap. Publish HITL |
| Award-ref Seedance scroll-scrub site | `seedance-site` | Awwwards refs → one continuous ≤30s 720p plate → split frames → page scrubs → CTA-before-scroll roast. Cursor+Grok. Claude/Jarvis operate-never. Deploy HITL |
| We are a level-3 software factory (process) | `dark-factory` | Evens plans + validates. Forge builds. Watchdog grades. Loop: code → surface → chat. Sitting: PRD → interview → three files → ticket → bite → hidden hold-outs → Watchdog GRADE → HITL deploy. Card: `MATRIX-PROCESS-2026-08-15`. Product foundation: `CONTENT/knowledge/product-factory/` (login/pay/share once). SIP “dark headless factory” = primitives; desks = process. Both. Not a SKU. Next SKU reuses `primitives.json`. Merge ≠ ship. Auto-merge operate-never |
| Session → named skill / proven list mint | `skill-from-session` | Winning Cursor/Grok session **or PROVEN capability** → named SKILL.md (SSOT + Cursor pointer + skills-sync). Auto-mint after PROVEN. Explain-don’t-recommend. Not session-bootstrap copies. |
| Interview before code / 1% delta | `interview-before-code-one-percent` | Interview (what/who/one feature/analog) before write; already-selling analog + 1% delta; Saturday unit. Not Claude. Publish HITL. |
| Voice four pieces / three doors | `voice-four-pieces-three-doors` | persona+voice+KB+tools → test UI / widget / phone. Book HITL. No vendor install. |
| Grill me / extract my brain / interview me relentlessly | `grill-me` | One question at a time + recommended answer · explore disk first · checkpoint every answer to `CONTENT/brainstorms/` · flags → owner (Evens sends) · close = labeled merges; proven machines auto-mint |
| Before deciding what to do with a product | `grill-me` | Always grill-me on product sittings (2026-08-16 · business-operations-and-beautiful-webapps). Capture first. Labeled merges on close. No new SKILL.md here. |
| Wiki lint / lint the vault / health check the wiki | `wiki-lint` | Semantic pass: contradictions · dead links · stale facts · gap candidates → `CONTENT/os/LINT.md` callouts. Propose, never apply mid-lint. Byte drift stays `skills-sync` |
| Actuate a tape sitting / factory-first wrap | `actuate-tape-skill` | Factory pack + hidden hold-outs first → named bite → Watchdog GRADE after → artifacts on disk → scoreboard lists paths. Plate generate later. HITL deploy. |
| Checkout in one sitting / $1 card-test | `checkout-in-one-sitting` | Distro on the clock → thin offer → site+Stripe → self-test pay path → 48h card-test → opportunity-cost kill. Path C only. Pay HITL. No new ICP |
| Specialist group-chat handoff | `specialist-handoff` | Name two specialists → dump + reference → classify WAKE → handoff sentence → file draft → Gmail SMTP when Evens says send. Send-removed. No new ClickUp |
| Claude Design motion machine | `claude-design-motion` | Workflow: timed script → beats → sourced numbers → one graphic (`script-beat-motion`). Publish HITL |
| FDE career / delivery gym | `fde-career` | Workflow: demo≠mess → measured install or 45-min case gym (`forward-deployed-gap`). Not a hunt |
| Plan-mode + objective | `plan-mode-objective` | Workflow: plan + explain-don’t-recommend + skill-from-session + objective done-when + Watchdog grade |
| Offline plate vs world | `offline-plate-vs-world` | Workflow: classify page/clip vs interactive world. RESEARCH/ASK. Do not stand up Genie |
| Demo works / their world does not | `forward-deployed-gap` | Measured messy install or Career case-study gym. Not a hunt. Tape $ UNVERIFIED |
| Higgsfield / AE vectors | `higgsfield-ae-vectors` | Reference → editable vectors. Proof clip, not a plugin SKU |
| Private demo + connectors | `mcp-on-private-demo` | Connectors on private preview only. Public share = off |
| Desk job before work | `desk-wiki-before-work` | Read owns-X / never-Y before spawn. Not 8k-node Obsidian |
| Script from HIS voice | `voice-script-from-operator` | Path C script from Evens’s cadence. No generic-AI tells. Publish HITL |
| Click the live surface / maestro-style flow / after site ship | `click-live-site` | Any owned UI (prod / staging / preview / localhost-if-ship). Load flow YAML. Host browser (Cursor → `cursor-ide-browser`; Grok Bot → Grok browser). Per-step `verify-after-browser`. Status on disk. Watchdog GRADE. Not Maestro CLI |
| Checkout / paid surface | `paid-slice-funnel` | Thin V1; Stripe/domain HITL; smoke preview **and** domain |
| Lead list (volume) | `list-anneal-funnel` | 50 → 60–70% → then 3–5 to Path A |
| Named leaky site | `lead-web-find` | URL + leak + contact → MUST score |
| Outbound | `outbound-playbook-funnel` | After margin green; then discovery/demo |
| Wiki / memory | `wiki-ingest` | Write Outer Heaven pages + log |
| New lane / desk | `interview-to-desk` | Triangle, then one task |
| Unsure / voice / book | `ask-principal` | Ask Evens; never close. Alias: `confirm-then-actuate` |
| Strip Send / no ack-reply | `send-removed` | First Gmail = read+draft. Cookbook must not say restricted send |
| Gather then Evens yes | `confirm-then-actuate` | Load `ask-principal`. Silence is not yes. Evens sends/books |
| Pay/send/deploy confirm | `input-required-gate` | Card any instance can resume. Confirm ≠ execute |
| What do we sell (sentence) | `outcome-offer-funnel` | ICP sentence; client still needs constraint + four-blank |
| Website funnel | `website-offer-funnel` | **Router first** — Path A client / B lists / C our surface |
| Website selling training | (not a skill — read) | `CONTENT/knowledge/training/WEBSITE-SELLING.md` — Path A money + delivery spines; `cinematic-recipe` is the hard done-check |
| One-person use cases | `one-person-usecases` | review-to-book · clip-factory · Person B brief · speed-positioning · demand-validate |
| Any steal / business type | `steal-usecases` + `.cursor/skills/steal-sheet` | After a video: `deep-video-learning` A–K first, then steal. One master `STEAL_SHEET.md` — pick `icp_id` then router. Doctrine: `DEEP_SUMMARIES.md` |
| Hunt / run today | `icp-runbook` + `.cursor/skills/icp-runbook` | Open `CONTENT/icp-runbooks/{icp_id}.md` → **Today** block → `website-offer-funnel` |
| Spawn desks here | `hive-spawn-desks` | Default five: Forge, Watchdog, HITL Operator, Researcher, Communications Manager. All 17 only if Evens says all desks or `coverage-loop --video-id`. Study = `deep-video-learning`. Never Grok Bot / `sendPrompt` |
| Loop the agents / coverage / until they can do them all | `coverage-loop` | One model or one tape: teach → spawn (parent) → steal → atoms → capability last-mile (WIRE distinct or labeled merge + named workflow + reproduce card) → score → wire one → dry-run → next. Remap-as-done forbidden. 24/7 ≠ auto-money. Channel / new YouTube URL starts at `channel-walk`. Load `checkable-stop` first |
| Loop / until satisfied / no written stop | `checkable-stop` | Write DONE-CHECK + CAP + COST before the loop. Until-satisfied is a weak stop. Wired job = `coverage-loop` |
| After a browser/UI click | `verify-after-browser` | IF Cursor → `cursor-ide-browser`. IF Grok Bot → Grok Bot web browser (do not call Cursor MCP). Same card: ACT → EXPECTED → OBSERVED → COMPARE → NEXT. Wired job = `click-live-site`. Caption-only: no invented clicks |
| Watch this video / cursor-video-watch / frames+transcript | `cursor-video-watch` | IF Cursor → `cursor-ide-browser` on a living YouTube tab (parent chat) → `packets/{id}/watch.json`. IF Grok Bot → Grok computer watch (do not call Cursor MCP). THEN `analyze-video-watch-output`. Same card either way. |
| After a mess / never-again | `roadblock-bank` | One JSON row in `CONTENT/knowledge/product-factory/roadblocks.json`. Not a blog. Filter then write. |
| After a ProofCheck bite / Path C offer | `website-offer-funnel` Path C | Update owned offer surface (`PROMOTION.md` / SHARE-CARD). Do not publish. |
| Last-run / wake more than once | `state-json` | Filter one key from `.hive/state.json` (`last_run` · `jobs` · `profile` · `ids` · `product_factory`). Do not dump the store. Wired job = coverage-loop `log-run` |
| Builder grades builder / ship green | `separate-verifier` | Watchdog fills GRADE + required Missing Piece Hunter pass. Forge must not self-score. Wired job = `golden-test-loop` / `click-live-site` |
| Spawn / new tools / “don’t touch” | `assume-it-will-touch` | Allow-list + territory + no bypass. Prompt “don’t” is not a lock. Wired job = `hive-spawn-desks` |
| Text into a model or out to a human | `sanitize-in-check-out` | Redact in → check out → fail halt. Pass ≠ send. Wired job = `inbox-to-task-routing` |
| 24/7 / overnight / new host | `hosted-neq-scheduled` | Classify WAKE before always-on. Default no new host. Wired job = Big Boss + Day Planner + `/loop` |
| Keys / 2FA / host env | `vault-not-prompt` | Env or vault only. Never paste. 2FA stays human. Wired job = HITL secrets + Forge |
| Vision / computer-use / headed browser | `api-macro-vision` | API → macro → vision last. Write LADDER first. Headed = host path (Cursor → `cursor-ide-browser`; Grok Bot → Grok browser). Wired job = Forge `slice-build` |
| “It learned” / OAuth connected | `side-effect-not-essay` | External artifact + prompt diff. Essay is not a ship. Wired job = Watchdog smoke |
| Inbox / table / state into the model | `filter-then-llm` | Deterministic filter, then LLM. No filter → no model. Wired job = inbox + `hive-state.py get` |
| Named jobs / idle / needs-input | `observe-pane` | working / yellow / done. Yellow = `ask-principal`. Wired job = spawn `set-job` |
| Billed run / COST field | `token-receipt` | Tokens + duration + correctness. Tape $ UNVERIFIED. Wired job = coverage-loop + Money Desk |
| Channel walk / @nateherk / next Nate tape | `channel-walk` | Catalog → one uningested tape → PACKET+full.txt → STOP. Parent may spawn 17. Study = A–K then steal. Not 17×N. Hunt stays Normand |
| Non-YouTube public social URL | `social-source-ingest` | One IG/X/Reddit/FB/TikTok URL → packet-shaped note + visible.txt. Then steal / catalog-demand-match. YouTube stays `channel-walk`. Not six clones |
| Can we do X / demand-signal / match SKU | `catalog-demand-match` | USE / BUILD / RESEARCH / REFUSE / ASK. Path C waitlist = `paid-slice__us`. Clients parked = no hunt |
| Path C clip / one owned channel | `clip-factory` + `one-channel-deep` | Publishing + Creative. Preview only. Evens publishes |
| Study this tape / deep video learning / learn this video | `deep-video-learning` | Reconstruct A–K from `full.txt`, then steal, then L. Researcher emits atoms + `capability-acquisition` last-mile (distinct SKILL.md or labeled merge; one named workflow; THINK/BEHAVE/TRICKS/USE). Caption-only: no invented clicks. Not a summary. Not understand-only. |
| Knowledge system / atoms / graph / do not blend | `knowledge-architecture` | Five layers + compiler + 3 audits + multimodal + capability. Never retrieve→blend. After a tape: atoms + LEARNED candidates, not a mega-workflow. |
| Video as behavior trace / multimodal / what they clicked | `multimodal-youtube-learning` | 15-step. Speech vs shown. Caption-only = no invented clicks. |
| What became possible / capability / primitive / desk parts | `capability-acquisition` | Six extractions. Route **parts** to existing desks. Infra notes → system-upgrade. **Last-mile:** LEARNED → TESTING → Watchdog GRADE → PROVEN → **auto-mint** distinct slug (SSOT + Cursor pointer + skills-sync). Class=system-upgrade no longer skips mint. Merge/skip only when the slug already exists. Remap-as-done forbidden. Compile one named workflow + desk reproduce + THINK/BEHAVE/TRICKS/USE. Do not clone the YouTuber. |
| Compile a project workflow from knowledge | `workflow-compiler` | Named project **or** one tape machine. Classify → decompose (no retrieve) → coverage map → retrieve narrowly → condition → smallest workflow → `knowledge-audit`. One tape → one (or two) machines. Not a parked ICP card. Not 147→1. |
| Audit a compiled workflow | `knowledge-audit` | Coverage / context-misuse / contradiction. Fail = do not ship. |
| Host OS / connect Obsidian / Claude Code x Obsidian remap | `internal-host-os` | Cursor + Grok hosts. Write `HIVE_OBSIDIAN_VAULT` raw → wiki + index.md → `build-graph-index.mjs`. Grok reads disk, not Scorpion HTTP. Do not install Claude Code. Tape `njHuj8OxIVI`. Internal ≠ public. |
| Cursor chats / local sessions / grok read my chats | `cursor-chat-sessions` | Live JSONL under `~/.cursor/projects/*/agent-transcripts/`. CLI `list` then `read --id`. Do not dump all. Do not commit transcripts. Processed `CURSOR_CHATS` markdown is secondary. |
| Obsidian did not receive / OS has no data / emit to vault | `vault-receive` | End of sitting: `emit-vault-receive.py` → `CONTENT/os/` (inbox + daily + reports). Capture cache ≠ Obsidian. Then `compile-agentic-os.py`. No 8k graph walk. |
| Pasted a URL / learn this / build this / walk this channel | `url-habit-router` | Classify first (receptionist). Triage states INBOX→ADOPTED. Then the existing skill. Write `last_url_habit` + `state`. YouTube → `channel-walk`. X/IG/TT/FB → `social-source-ingest`. Live URL → `click-live-site`. Factory/SIP → five-score. Path A parked. |
| Ingest is steps / they built a UI / steal their design process | `ingest-is-steps` | Build tape: numbered D is the runbook. Steal cites D. Implement walks D. Demonstration LEARNED requires capability card + ACTION TRACE (UNKNOWN allowed). `DESIGN: yes` → refs + N mockups + pick + double-down before HTML. Cursor + Grok. Caption-only: spoken steps only. |
| Syncthing / vault sync / live identical vault | `syncthing-vault-sync` | Walk D: install → Show ID → add remote → full-path folder → `.stignore` → pair existing `n8ncloud`. Cursor finds `127.0.0.1:8384`. No Hostinger buy. IDs off git. No-delete except LF-under-disk-pressure. |
| Log-all then approve-some / meeting then deck | `ask-principal` + `warm-draft-hitl` | `-Q_P7HFydZk` merge. Not a new skill. Gamma/Fireflies operate-never. |
| Org before skills / second-brain lie | `internal-host-os` + `wiki-lint` | `Ek1NBfnnTH0` · `i4Q8wHZNPBU` merges. Vault is a map, not Jarvis. |
| Sell outcome not agent template | `outcome-offer-funnel` | `wk8KV280fbg` merge. Do not quote template $ as FACT. |

## Hard step
Send, pay, deploy, book, publish = operator. Never auto.
n8n notify sink = Grok Watchdog webhook env GROK_WATCHDOG_WEBHOOK_URL.

## Never
Claude Cowork, Claude Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus.  
Operate-never: OTP farms, auto-dial, unverified YouTube income as ours. Steal the machine from those tapes; do not skip them. Evens is the visionary — Cursor does not pre-vote the never-list.
