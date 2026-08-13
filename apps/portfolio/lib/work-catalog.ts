/**
 * Public work catalog — mirrors packages/shared-config repo-registry lanes.
 * Kept local so the portfolio app does not require workspace package linking at build time.
 */

export type WorkLane =
  | 'hive_core'
  | 'product_candidate'
  | 'side_wip'
  | 'hive_capability'
  | 'parked'
  | 'legacy';

export interface WorkProject {
  id: string;
  name: string;
  role: string;
  lane: WorkLane;
  statusLabel: string;
  github: string;
  wip: boolean;
  notTheProductOf: string;
}

export const workCatalog: WorkProject[] = [
  {
    id: 'n8n-cursor',
    name: 'n8n-cursor (hive monorepo)',
    role: 'Path map, portfolio, Scorpion, n8n tooling — the ops host.',
    lane: 'hive_core',
    statusLabel: 'Hive',
    github: 'https://github.com/snevemoney/n8n-cursor',
    wip: false,
    notTheProductOf: 'Client Engine or Outer Heaven',
  },
  {
    id: 'client-engine',
    name: 'Client Engine',
    role: 'Private business OS: leads → builds → proofs (operator-only).',
    lane: 'hive_core',
    statusLabel: 'Hive',
    github: 'https://github.com/snevemoney/client-engine',
    wip: true,
    notTheProductOf: 'ProofCheck QC or Scorpion',
  },
  {
    id: 'philanthropic-ai-agent',
    name: 'Outer Heaven (OpenClaw hands)',
    role: 'Telegram multi-agent tool backend — not a public SaaS UI.',
    lane: 'hive_core',
    statusLabel: 'Hive',
    github: 'https://github.com/snevemoney/philanthropic-ai-agent',
    wip: false,
    notTheProductOf: 'Scorpion browser cockpit',
  },
  {
    id: 'outer-heaven-backups',
    name: 'Outer Heaven Backups',
    role: 'Encrypted hourly backups for the agent OS.',
    lane: 'hive_core',
    statusLabel: 'Hive',
    github: 'https://github.com/snevemoney/outer-heaven-backups',
    wip: false,
    notTheProductOf: 'the agent runtime itself',
  },
  {
    id: 'shield-buddies',
    name: 'SENTINEL',
    role: 'Offline Quebec emergency PWA: supplies, check-ins, OSINT, vault.',
    lane: 'product_candidate',
    statusLabel: 'Product candidate',
    github: 'https://github.com/snevemoney/shield-buddies',
    wip: true,
    notTheProductOf: 'Clearfield investigation workbench',
  },
  {
    id: 'clipengine',
    name: 'ClipEngine',
    role: 'Rights-aware stream clip detect → review → publish.',
    lane: 'product_candidate',
    statusLabel: 'Product candidate',
    github: 'https://github.com/snevemoney/clipengine',
    wip: true,
    notTheProductOf: 'Bookflix',
  },
  {
    id: 'trendspotter-ai',
    name: 'Trendspotter',
    role: 'TikTok → ticker → Kalshi overlap scanner.',
    lane: 'product_candidate',
    statusLabel: 'Product candidate',
    github: 'https://github.com/snevemoney/trendspotter-ai',
    wip: true,
    notTheProductOf: 'OpenClaw Scout/Radar',
  },
  {
    id: 'proof-qc-assist',
    name: 'ProofCheck QC',
    role: 'Bilingual nursing claim verification against sources.',
    lane: 'product_candidate',
    statusLabel: 'Product candidate',
    github: 'https://github.com/snevemoney/proof-qc-assist',
    wip: true,
    notTheProductOf: 'Client Engine proofs',
  },
  {
    id: 'autoflow-finance',
    name: 'AutoFlow Finance',
    role: 'Auto-loan deal desk with income OCR and funding queues.',
    lane: 'side_wip',
    statusLabel: 'Side WIP',
    github: 'https://github.com/snevemoney/autoflow-finance',
    wip: true,
    notTheProductOf: 'Client Engine',
  },
  {
    id: 'book-reimagined',
    name: 'Bookflix',
    role: 'Book → AI scenes → Netflix-style watch UX.',
    lane: 'side_wip',
    statusLabel: 'Side WIP',
    github: 'https://github.com/snevemoney/book-reimagined',
    wip: true,
    notTheProductOf: 'ClipEngine',
  },
  {
    id: 'quick-list-hub-42',
    name: 'QuickMarket',
    role: 'Local classifieds with listings and demo paid publish.',
    lane: 'side_wip',
    statusLabel: 'Side WIP',
    github: 'https://github.com/snevemoney/quick-list-hub-42',
    wip: true,
    notTheProductOf: 'LightningFlow',
  },
  {
    id: 'clearfield-evidence-flow',
    name: 'Clearfield',
    role: 'OSINT evidence/claims workbench — hive capability for SENTINEL intel.',
    lane: 'hive_capability',
    statusLabel: 'Capability',
    github: 'https://github.com/snevemoney/clearfield-evidence-flow',
    wip: true,
    notTheProductOf: 'SENTINEL',
  },
  {
    id: 'insights-lm-private',
    name: 'InsightsLM',
    role: 'Self-hosted NotebookLM-style RAG (reserved operator path later).',
    lane: 'hive_capability',
    statusLabel: 'Capability',
    github: 'https://github.com/snevemoney/insights-lm-private',
    wip: true,
    notTheProductOf: 'a second public RAG product vs Scorpion',
  },
  {
    id: 'lightningflow',
    name: 'LightningFlow',
    role: 'Parked Lightning Network SaaS R&D (not featured).',
    lane: 'parked',
    statusLabel: 'Parked',
    github: 'https://github.com/snevemoney/n8n-cursor',
    wip: true,
    notTheProductOf: 'legacy lightning-ui / GH stub',
  },
  {
    id: 'lightning-ui',
    name: 'lightning-ui',
    role: 'Legacy Lightning UI dump — frozen; use monorepo LightningFlow.',
    lane: 'legacy',
    statusLabel: 'Legacy',
    github: 'https://github.com/snevemoney/lightning-ui',
    wip: false,
    notTheProductOf: 'canonical LightningFlow',
  },
];

export const laneOrder: WorkLane[] = [
  'hive_core',
  'product_candidate',
  'side_wip',
  'hive_capability',
  'parked',
  'legacy',
];

export const laneTitles: Record<WorkLane, string> = {
  hive_core: 'Hive / money core',
  product_candidate: 'Product candidates',
  side_wip: 'Side projects (WIP)',
  hive_capability: 'Hive capabilities',
  parked: 'Parked',
  legacy: 'Legacy',
};
