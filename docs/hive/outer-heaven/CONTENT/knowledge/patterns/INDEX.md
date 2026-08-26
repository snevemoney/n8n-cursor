# Patterns (layer 4)

Versioned **derived** objects. They point BACK to atom ids. They do not delete atoms. They are not “truth.”

**Schema:** [schema.json](schema.json)

Fields: `pattern_id`, `version`, `steps`, `support_ids`, `dissent_ids`, `valid_when`, `less_relevant_when`, `confidence`.

Merge only when conditions, goals, and context are compatible. Semantic similarity alone is not a merge. Dissent stays visible.

**111 patterns this turn** (seeded compatible machines + support-graph clusters).

| pattern_id | title | support | dissent | creators |
|------------|-------|--------:|--------:|---------:|
| `P-inbound-from-demonstrated-build` | Inbound from a demonstrated build, not a category pitch | 3 | 4 | 3 |
| `P-category-pitch-fails` | VIEW A — category pitch fails (unspecified job) | 1 | 0 | 1 |
| `P-dont-lead-with-word-AI` | VIEW B — don't lead with the word AI (operator-heard) | 1 | 1 | 1 |
| `P-four-blanks-before-build` | Name bucket + KPI + today + 60-day target before building | 3 | 0 | 1 |
| `P-book-clock-not-model` | Book tools fail on timezone/notice, not 'AI'. Book stays HITL. | 2 | 1 | 1 |
| `P-sanitize-then-check-pass-neq-send` | Sanitize before the model; check before leave; pass ≠ send | 3 | 0 | 1 |
| `P-wiki-raw-index-log` | Raw → wiki pages → index → log. Do not dump the corpus. | 3 | 0 | 1 |
| `P-wat-sop-md-one-job-tools` | Workflow = SOP markdown; tool = one action. No on-tape vendor install. | 3 | 2 | 1 |
| `P-plan-then-assets-then-bypass` | Plan and drop real assets before bypass. Keys stay human. | 3 | 2 | 1 |
| `P-tape-dollars-unverified` | Tape / tweet dollars are UNVERIFIED. Do not quote as ours. | 2 | 0 | 2 |
| `P-clip-reference-lock-hitl-publish` | Clip / gen factory: reference-lock + log. Human ships. | 2 | 1 | 1 |
| `P-log-first-approve-deck-second` | Log every meeting; deck is optional and gated | 3 | 0 | 1 |
| `P-own-os-before-outbound` | Own the desk OS before DMs. Niche after a shipped case. | 2 | 0 | 1 |
| `P-public-widget-is-a-credit-hose` | Public unpaid widget is a credit hose. No auto-book. | 1 | 0 | 1 |
| `P-auto-001` | agent-eval / ops — prompt-as-power-up | 2 | 0 | 1 |
| `P-auto-002` | agent-eval / ops — tool-covers-a-model-weakness | 2 | 0 | 1 |
| `P-auto-003` | agent-harness / deploy — chooser-is-a-2-axis-slider-not-a-winner | 7 | 3 | 1 |
| `P-auto-004` | agent-loops / ops — loop-trigger-action-checkable-stop | 3 | 0 | 1 |
| `P-auto-005` | agent-ops / build — different-products-not-a-kill | 2 | 0 | 1 |
| `P-auto-006` | agent-ops / build — front-is-gather-production-url-is-the-send | 5 | 2 | 1 |
| `P-auto-007` | agent-ops / build — search-then-always-allow-then-send | 4 | 0 | 1 |
| `P-auto-008` | agent-ops / build — interview-then-clone-the-winner-dont-one-app-hope | 2 | 3 | 1 |
| `P-auto-009` | agent-ops / build — climb-only-when-forced | 3 | 0 | 1 |
| `P-auto-010` | agent-ops / build — manager-sandwich-map-simplest-machine-prove-scar | 4 | 1 | 1 |
| `P-auto-011` | agent-ops / build — relative-ai-person-one-tool-roi-then-taste-owns-the-name | 2 | 3 | 1 |
| `P-auto-012` | agent-ops / build — buzzword-retract-workflow-not-agent | 4 | 0 | 1 |
| `P-auto-013` | agent-ops / build — teams-are-for-peer-talk-bounce-not-for-a-bucket-brigade | 9 | 2 | 1 |
| `P-auto-014` | agent-ops / build — form-to-roadmap-email-to-book-cta | 2 | 0 | 1 |
| `P-auto-015` | agent-ops / build — activity-log-skin-seeing-the-work | 2 | 0 | 1 |
| `P-auto-016` | agent-ops / build — copy-paste-claude-before-claude-code | 2 | 1 | 1 |
| `P-auto-017` | agent-ops / build — width-vs-depth-is-the-real-split | 9 | 3 | 1 |
| `P-auto-018` | agent-ops / build — goal-needs-objective-done-overnight-is-optional-theater | 2 | 2 | 1 |
| `P-auto-019` | agent-ops / build — tools-exist-so-90-doesnt-compound-to-59 | 2 | 3 | 1 |
| `P-auto-020` | agent-ops / build — plan-questions-assets-then-bypass | 2 | 2 | 1 |
| `P-auto-021` | agent-ops / build — delegate-parallel-researchers-then-a-diagram | 4 | 0 | 1 |
| `P-auto-022` | agent-ops / build — three-layers-a-handoff-note | 3 | 0 | 1 |
| `P-auto-023` | agent-ops / guardrail — instance-mcp-search-execute-anything-marked-available | 3 | 2 | 1 |
| `P-auto-024` | agent-ops / guardrail — hosted-agent-always-on-agent | 2 | 2 | 1 |
| `P-auto-025` | agent-ops / ops — one-board | 2 | 0 | 1 |
| `P-auto-026` | agent-os / ops — four-failures-x-expertise-vs-situational | 3 | 0 | 1 |
| `P-auto-027` | agi-judgment / strategy — his-agi-open-ended-go-figure-it-out | 5 | 0 | 1 |
| `P-auto-028` | ai-history / strategy — a-field-without-a-name-does-not-exist | 3 | 0 | 1 |
| `P-auto-029` | career / acquisition — passion-picks-the-path-domain-in-constraint-is-the-rare-hire | 2 | 0 | 1 |
| `P-auto-030` | career / positioning — constraint-kpi-before-the-build-or-you-are-a-pharmacist | 2 | 2 | 1 |
| `P-auto-031` | claude-code / ops — plan-sandwich-code-prove-done-then-evolve | 3 | 0 | 1 |
| `P-auto-032` | content-ops / build — two-tavily-modes-pin-don-t-activate-the-sunday-gun | 2 | 2 | 1 |
| `P-auto-033` | content-ops / build — still-plus-ugc-prompt-product-in-hand-video | 3 | 0 | 1 |
| `P-auto-034` | content-ops / build — claude-is-the-interface-higgsfield-is-the-factory | 7 | 3 | 1 |
| `P-auto-035` | content-ops / build — manager-delegates-sub-workflows-own-binary | 2 | 2 | 1 |
| `P-auto-036` | content-ops / publishing — paste-sources-then-chat-may-beat-an-automation | 2 | 0 | 1 |
| `P-auto-037` | data-tables / ops — in-instance-table-sheets-verbs-without-the-wire | 4 | 0 | 1 |
| `P-auto-038` | evaluation / build — eval-hypothesis-objective-proof | 2 | 0 | 1 |
| `P-auto-039` | grok-bot / ops — one-job-per-bot-description-is-the-router | 3 | 0 | 1 |
| `P-auto-040` | guardrails / ops — two-guardrail-kinds-ai-check-vs-non-ai-sanitize | 2 | 0 | 1 |
| `P-auto-041` | idea-stress-test / strategy — file-behind-divider-beats-goal-character-limit | 4 | 0 | 1 |
| `P-auto-042` | inbox-agent / delivery — wireframe-four-paths-classifier-is-a-router-not-a-writer | 3 | 0 | 1 |
| `P-auto-043` | industry-read / orientation — they-want-a-referee-not-a-brake-they-will-pull | 3 | 1 | 1 |
| `P-auto-044` | knowledge-ops / build — factory-skill-then-five-harness-plugins | 2 | 0 | 1 |
| `P-auto-045` | knowledge-ops / build — pick-method-by-question-type | 2 | 0 | 1 |
| `P-auto-046` | knowledge-ops / build — wrapper-context-is-the-product-model-is-a-layer | 2 | 0 | 1 |
| `P-auto-047` | knowledge-ops / ops — lowest-level-that-kills-the-pain-router-before-pile | 3 | 0 | 1 |
| `P-auto-048` | lead-gen / acquisition — clay-is-the-waterfall-claude-is-the-ui-avoider | 6 | 2 | 1 |
| `P-auto-049` | media-agents / delivery — name-and-share-then-edit | 3 | 0 | 1 |
| `P-auto-050` | media-gen / build — find-file-then-edit-image | 2 | 0 | 1 |
| `P-auto-051` | model-eval / ops — job-in-front-not-a-crown-feel-is-labeled-gut | 3 | 0 | 1 |
| `P-auto-052` | model-eval / ops — manager-vs-worker-not-a-bench-crown | 3 | 0 | 1 |
| `P-auto-053` | model-eval / ops — fugu-is-a-conductor-api-not-a-better-llm | 4 | 0 | 1 |
| `P-auto-054` | model-ops / operate — six-fable-habits-why-don-t-act-prove-no-reasoning-less | 10 | 1 | 1 |
| `P-auto-055` | model-ops / operate — april-line-still-governs-no-ga-mythos-preview | 10 | 0 | 1 |
| `P-auto-056` | model-ops / operate — your-use-case-the-benchmark-chart | 2 | 0 | 1 |
| `P-auto-057` | model-ops / operate — prompts-models-live-in-a-table-not-the-canvas | 2 | 0 | 1 |
| `P-auto-058` | model-ops / operate — rank-is-personal-skills-then-status-line-are-the-day | 2 | 1 | 1 |
| `P-auto-059` | model-ops / operate — family-roles-then-a-multi-agent-handoff | 3 | 0 | 1 |
| `P-auto-060` | offer-delivery / delivery — research-write-dont-send | 2 | 0 | 1 |
| `P-auto-061` | offer-ladder / acquisition — rung-zero-is-hours-jumping-2-3-is-the-freeze | 3 | 0 | 1 |
| `P-auto-062` | offer-positioning / acquisition — inbound-casual-almost-free-throw-a-number | 2 | 0 | 1 |
| `P-auto-063` | offer-positioning / acquisition — metric-first-one-problem-loop | 2 | 0 | 1 |
| `P-auto-064` | offer-positioning / acquisition — category-pitch-fails | 3 | 0 | 1 |
| `P-auto-065` | offer-positioning / acquisition — random-price-anchored-on-last-sale | 4 | 0 | 1 |
| `P-auto-066` | offer-positioning / acquisition — tool-pitch-loses-outcome-pitch-wins | 4 | 0 | 1 |
| `P-auto-067` | offer-positioning / acquisition — diagnose-solve-value-price | 16 | 6 | 1 |
| `P-auto-068` | offer-positioning / acquisition — effort-is-the-1-lever-wrong-effort-looks-like-a-bad-model | 2 | 0 | 1 |
| `P-auto-069` | offer-positioning / acquisition — don-t-hire-a-role-explode-it-into-irreducible-actions | 2 | 1 | 1 |
| `P-auto-070` | offer-positioning / acquisition — inbound-from-a-public-similar-build | 2 | 0 | 1 |
| `P-auto-071` | offer-positioning / acquisition — investment-not-expense-frame | 2 | 0 | 1 |
| `P-auto-072` | offer-pricing / acquisition — outreach-agent-fills-db-does-not-send | 9 | 0 | 1 |
| `P-auto-073` | openai-tools / setup — responses-toggle-unlocks-built-in-tools | 2 | 0 | 1 |
| `P-auto-074` | pricing / acquisition — ceiling-from-their-mouth-10-20pct-is-a-start-not-a-law | 3 | 0 | 1 |
| `P-auto-075` | proposals / delivery — split-log-vs-generate-poll-until-gist-exists | 3 | 0 | 1 |
| `P-auto-076` | rag / ops — assistant-hides-the-pipeline-http-fromai-is-the-glue | 3 | 0 | 1 |
| `P-auto-077` | rag / ops — folder-drop-ingest | 2 | 0 | 1 |
| `P-auto-078` | retrieval / build — four-http-is-the-whole-no-pipeline | 7 | 1 | 1 |
| `P-auto-079` | retrieval / build — brain-native-tools-vs-agent-attached-tools | 4 | 0 | 1 |
| `P-auto-080` | retrieval / build — pick-retrieval-by-the-human-gesture | 7 | 1 | 1 |
| `P-auto-081` | retrieval / build — file-kb-first-vector-later-native-calendar-ne-mcp-tape | 2 | 1 | 1 |
| `P-auto-082` | saas-gtm / acquisition — clock-includes-distribution-sell-before-the-repo | 3 | 0 | 1 |
| `P-auto-083` | safety / operate — two-nodes-ai-check-vs-no-ai-sanitize | 8 | 0 | 1 |
| `P-auto-084` | safety / operate — folder-os-portable-secrets-handoff-before-dumb-zone | 2 | 2 | 1 |
| `P-auto-085` | tooling / architecture — route-the-model-per-step-not-per-day | 2 | 2 | 1 |
| `P-auto-086` | video-gen / publishing — chunk-voice-60s-phrase-locked-edit-adversarial-qa | 2 | 0 | 1 |
| `P-auto-087` | video-gen / publishing — same-creative-chain-as-soul-cheaper-looking-session-subscription-burn | 2 | 0 | 1 |
| `P-auto-088` | voice-agents / build — linear-guardrails-beat-an-autonomous-therapist | 3 | 1 | 1 |
| `P-auto-089` | voice-agents / build — four-pieces-three-doors-code-configures-the-vendor | 2 | 3 | 1 |
| `P-auto-090` | voice-agents / build — voice-brain-once-backends-are-dumb-verbs | 6 | 2 | 1 |
| `P-auto-091` | voice-agents / build — clock-and-model-are-the-first-two-bugs | 2 | 2 | 1 |
| `P-auto-092` | voice-agents / build — normalize-then-gate-never-post-a-dirty-number | 2 | 3 | 1 |
| `P-auto-093` | voice-agents / delivery — speech-to-speech-vision-is-the-product-tools-still-go-silent | 3 | 0 | 1 |
| `P-auto-094` | voice-agents / setup — calendar-tools-before-the-pretty-prompt | 2 | 0 | 1 |
| `P-auto-095` | workflow-build / build-verify — approve-the-plan-then-audit-the-leftover-six | 2 | 0 | 1 |
| `P-auto-096` | workflow-build / build — the-builder-guesses-outputs-you-pin-reality | 2 | 0 | 1 |
| `P-auto-097` | youtube-ops / publishing — moneyball-title-on-base-keyword-home-run-hook | 3 | 0 | 1 |
