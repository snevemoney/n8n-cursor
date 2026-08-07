# Phase 0 — WIP inventory freeze

Frozen at program start. Maturity changes require a registry PR + `/work` sync.

| Surface | Repo | Lane | Maturity | Apex | Phase 0 action |
|---------|------|------|----------|------|----------------|
| n8n-cursor | `n8n-cursor` | hive_core | active | `/` | Keep; taxonomy host |
| Client Engine | `client-engine` | hive_core | wip | `/pro` | Hive APIs (Phase 2+) |
| Outer Heaven | `philanthropic-ai-agent` | hive_core | active | `/claw/hooks` | Tools (Phase 1+) |
| OH backups | `outer-heaven-backups` | hive_core | ops | none | Cover `.openclaw/` (Phase 4) |
| Scorpion | monorepo app | hive | active/stub | `/scorpion` | Real image when disk allows |
| n8n | service | hive bus | active | `/n8n` | Catalog (Phase 5) |
| OpenClaw | gateway | hive | active | `/claw` | Loopback (done); resilience Ph4 |
| Portfolio | monorepo app | public | active | `/`, `/work` | Catalog sync |
| SENTINEL | `shield-buddies` | product_candidate | near_ship | none | QA Ph9 / launch Ph10 |
| ProofCheck | `proof-qc-assist` | product_candidate | near_ship | none | Launch Ph11 |
| ClipEngine | `clipengine` | product_candidate | phase_0 | none | Demo Ph13 |
| Trendspotter | `trendspotter-ai` | product_candidate | wip | none | Paper Ph14 |
| Clearfield | `clearfield-evidence-flow` | hive_capability | wip | none | Feed Ph12 |
| InsightsLM | `insights-lm-private` | hive_capability | near_ship | `/insights` later | Stage Ph15 after Ph8 |
| AutoFlow | `autoflow-finance` | side_wip | wip | none | Decision Ph16 |
| Bookflix | `book-reimagined` | side_wip | wip | none | Decision Ph16 |
| QuickMarket | `quick-list-hub-42` | side_wip | wip | none | Decision Ph16 |
| LightningFlow | monorepo app | parked | parked | `/lightningflow` | Health only |
| lightning-ui | GH | legacy | legacy | none | Frozen |
| lightningflow stub | GH | legacy | legacy | none | Superseded |

Hygiene (Phase 0 verify): all sibling repos have README headers; `n8n-cursor` header ships on migration branch (PR #29).
