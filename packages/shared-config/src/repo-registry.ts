/**
 * Full GitHub repo inventory for Evens Louis hive / product taxonomy.
 * Lanes prevent overlap: hive vs product candidate vs side WIP vs capability vs legacy.
 */

export type RepoLane =
  | 'hive_core'
  | 'product_candidate'
  | 'side_wip'
  | 'hive_capability'
  | 'parked'
  | 'legacy';

export type RepoMaturity =
  | 'active'
  | 'near_ship'
  | 'wip'
  | 'phase_0'
  | 'parked'
  | 'legacy'
  | 'ops';

export type PathVerdict =
  | 'KEEP'
  | 'ADD_OPERATOR_PATH'
  | 'NO_PATH'
  | 'PARK'
  | 'LATER';

export interface RepoEntry {
  id: string;
  github: string;
  name: string;
  /** One-line product purpose */
  role: string;
  lane: RepoLane;
  maturity: RepoMaturity;
  pathVerdict: PathVerdict;
  /** Apex path if any; null = none */
  apexPath: string | null;
  /** What this must not be confused with */
  confusionWith: string[];
  /** Suggested GitHub About description (≤160 chars) */
  githubDescription: string;
  topics: string[];
  /** Canonical home for humans */
  canonicalHome: string;
  /** WIP / not-the-product disclaimer for README */
  notTheProductOf: string;
}

export const repoRegistry: RepoEntry[] = [
  {
    id: 'n8n-cursor',
    github: 'https://github.com/snevemoney/n8n-cursor',
    name: 'n8n-cursor',
    role: 'Monorepo host: portfolio, Scorpion, LightningFlow park, Caddy path map, n8n tooling.',
    lane: 'hive_core',
    maturity: 'active',
    pathVerdict: 'KEEP',
    apexPath: '/',
    confusionWith: ['client-engine', 'philanthropic-ai-agent'],
    githubDescription:
      'Hive monorepo: evenslouis.ca path map, portfolio, Scorpion ops, n8n tooling. Not Client Engine or Outer Heaven.',
    topics: ['monorepo', 'n8n', 'nextjs', 'scorpion', 'caddy', 'hive'],
    canonicalHome: 'https://evenslouis.ca/',
    notTheProductOf: 'Client Engine, Outer Heaven, or any Lovable side project',
  },
  {
    id: 'client-engine',
    github: 'https://github.com/snevemoney/client-engine',
    name: 'Client Engine',
    role: 'Private business OS: leads → builds → proofs → AI with operator approval.',
    lane: 'hive_core',
    maturity: 'wip',
    pathVerdict: 'KEEP',
    apexPath: '/pro',
    confusionWith: ['proof-qc-assist', 'scorpion', 'autoflow-finance'],
    githubDescription:
      'Private Client Engine business OS (leads/builds/proofs). Operator-only at /pro — not ProofCheck or Scorpion.',
    topics: ['business-os', 'crm', 'nextjs', 'prisma', 'operator-only'],
    canonicalHome: 'https://evenslouis.ca/pro',
    notTheProductOf: 'ProofCheck QC, Scorpion, or AutoFlow Finance',
  },
  {
    id: 'philanthropic-ai-agent',
    github: 'https://github.com/snevemoney/philanthropic-ai-agent',
    name: 'Outer Heaven / Philanthropy',
    role: 'Tool backend (hands) for OpenClaw Telegram agents — not a public SaaS UI.',
    lane: 'hive_core',
    maturity: 'active',
    pathVerdict: 'ADD_OPERATOR_PATH',
    apexPath: '/claw/hooks',
    confusionWith: ['scorpion', 'n8n-cursor', 'client-engine'],
    githubDescription:
      'Outer Heaven hands: OpenClaw Telegram agent tool API. Not Scorpion UI, not Client Engine, not a public SaaS.',
    topics: ['openclaw', 'telegram', 'multi-agent', 'outer-heaven', 'hive'],
    canonicalHome: 'Telegram Outer Heaven (OpenClaw)',
    notTheProductOf: 'Scorpion browser cockpit or Client Engine',
  },
  {
    id: 'outer-heaven-backups',
    github: 'https://github.com/snevemoney/outer-heaven-backups',
    name: 'Outer Heaven Backups',
    role: 'Encrypted hourly Outer Heaven / OpenClaw backups (AES-256, 7 versions).',
    lane: 'hive_core',
    maturity: 'ops',
    pathVerdict: 'NO_PATH',
    apexPath: null,
    confusionWith: ['philanthropic-ai-agent'],
    githubDescription:
      'Outer Heaven encrypted hourly backups (AES-256, 7 versions). Ops infra — not the agent runtime.',
    topics: ['backups', 'ops', 'outer-heaven', 'encrypted'],
    canonicalHome: 'VPS cron only',
    notTheProductOf: 'the Philanthropy tool API or OpenClaw gateway itself',
  },
  {
    id: 'shield-buddies',
    github: 'https://github.com/snevemoney/shield-buddies',
    name: 'SENTINEL',
    role: 'Offline Quebec emergency PWA: supplies, check-ins, OSINT feeds, vault, drone detection.',
    lane: 'product_candidate',
    maturity: 'near_ship',
    pathVerdict: 'NO_PATH',
    apexPath: null,
    confusionWith: ['clearfield-evidence-flow'],
    githubDescription:
      'SENTINEL — offline Quebec emergency PWA (supplies, check-ins, OSINT, vault). Not Clearfield investigation workbench.',
    topics: ['pwa', 'emergency-preparedness', 'offline-first', 'quebec', 'osint'],
    canonicalHome: 'GitHub (own domain later)',
    notTheProductOf: 'Clearfield Evidence Flow or the personal hive',
  },
  {
    id: 'clipengine',
    github: 'https://github.com/snevemoney/clipengine',
    name: 'ClipEngine',
    role: 'Rights-aware stream clipping: detect moments, review, publish to cleared platforms.',
    lane: 'product_candidate',
    maturity: 'phase_0',
    pathVerdict: 'NO_PATH',
    apexPath: null,
    confusionWith: ['book-reimagined', 'philanthropic-ai-agent'],
    githubDescription:
      'ClipEngine — rights-aware stream clip detect→review→publish. Phase 0 WIP. Not Bookflix; not Outer Heaven Creator.',
    topics: ['stream-clipping', 'nestjs', 'bullmq', 'content-ops', 'wip'],
    canonicalHome: 'GitHub (WIP)',
    notTheProductOf: 'Bookflix or OpenClaw Creator topic',
  },
  {
    id: 'trendspotter-ai',
    github: 'https://github.com/snevemoney/trendspotter-ai',
    name: 'Trendspotter',
    role: 'TikTok trend scanner mapping brands/tickers and Kalshi prediction-market overlap.',
    lane: 'product_candidate',
    maturity: 'wip',
    pathVerdict: 'NO_PATH',
    apexPath: null,
    confusionWith: ['philanthropic-ai-agent', 'client-engine'],
    githubDescription:
      'TikTok→ticker→Kalshi trend scanner (WIP). Not OpenClaw Scout/Radar and not Client Engine lead intel.',
    topics: ['tiktok', 'trend-detection', 'kalshi', 'supabase', 'wip'],
    canonicalHome: 'GitHub (WIP)',
    notTheProductOf: 'OpenClaw Scout/Radar or Client Engine',
  },
  {
    id: 'proof-qc-assist',
    github: 'https://github.com/snevemoney/proof-qc-assist',
    name: 'ProofCheck QC',
    role: 'Bilingual nursing-student claim verification against academic sources.',
    lane: 'product_candidate',
    maturity: 'near_ship',
    pathVerdict: 'NO_PATH',
    apexPath: null,
    confusionWith: ['client-engine', 'insights-lm-private', 'clearfield-evidence-flow'],
    githubDescription:
      'ProofCheck QC — nursing claim verification (EN/FR). Not Client Engine proofs, InsightsLM, or Clearfield.',
    topics: ['nursing-education', 'claim-verification', 'academic', 'bilingual', 'wip'],
    canonicalHome: 'GitHub (WIP)',
    notTheProductOf: 'Client Engine proofs, InsightsLM, or Clearfield',
  },
  {
    id: 'autoflow-finance',
    github: 'https://github.com/snevemoney/autoflow-finance',
    name: 'AutoFlow Finance',
    role: 'Auto-loan deal desk: income OCR, credit/funding queues, dealer pipeline.',
    lane: 'side_wip',
    maturity: 'wip',
    pathVerdict: 'NO_PATH',
    apexPath: null,
    confusionWith: ['client-engine', 'lightningflow'],
    githubDescription:
      'Auto-loan finance desk (income OCR, credit/funding queues) — side WIP. Not Client Engine or LightningFlow.',
    topics: ['auto-finance', 'fintech', 'ocr', 'supabase', 'side-project'],
    canonicalHome: 'GitHub (side WIP)',
    notTheProductOf: 'Client Engine or LightningFlow',
  },
  {
    id: 'book-reimagined',
    github: 'https://github.com/snevemoney/book-reimagined',
    name: 'Bookflix',
    role: 'Upload a book → AI chapters/scenes → Netflix-style watch experience.',
    lane: 'side_wip',
    maturity: 'wip',
    pathVerdict: 'NO_PATH',
    apexPath: null,
    confusionWith: ['clipengine'],
    githubDescription:
      'Bookflix — book→AI scenes→watch UX (side WIP). Not ClipEngine stream clipping.',
    topics: ['book-to-video', 'ai-scenes', 'supabase', 'side-project', 'wip'],
    canonicalHome: 'GitHub (side WIP)',
    notTheProductOf: 'ClipEngine',
  },
  {
    id: 'quick-list-hub-42',
    github: 'https://github.com/snevemoney/quick-list-hub-42',
    name: 'QuickMarket',
    role: 'Local classifieds marketplace with listings, messaging, demo paid publish.',
    lane: 'side_wip',
    maturity: 'wip',
    pathVerdict: 'NO_PATH',
    apexPath: null,
    confusionWith: ['lightningflow', 'client-engine'],
    githubDescription:
      'QuickMarket — local classifieds (side WIP, demo payments). Not LightningFlow or Client Engine.',
    topics: ['marketplace', 'classifieds', 'supabase', 'side-project'],
    canonicalHome: 'GitHub (side WIP)',
    notTheProductOf: 'LightningFlow or Client Engine',
  },
  {
    id: 'clearfield-evidence-flow',
    github: 'https://github.com/snevemoney/clearfield-evidence-flow',
    name: 'Clearfield',
    role: 'OSINT investigation casefile: claims, contradictions, link graphs.',
    lane: 'hive_capability',
    maturity: 'wip',
    pathVerdict: 'NO_PATH',
    apexPath: null,
    confusionWith: ['shield-buddies', 'insights-lm-private', 'client-engine'],
    githubDescription:
      'Clearfield — OSINT evidence/claims workbench (capability). Feeds SENTINEL intel; not a second emergency PWA.',
    topics: ['osint', 'evidence', 'knowledge-graph', 'fact-checking', 'capability'],
    canonicalHome: 'GitHub (hive capability)',
    notTheProductOf: 'SENTINEL / shield-buddies',
  },
  {
    id: 'insights-lm-private',
    github: 'https://github.com/snevemoney/insights-lm-private',
    name: 'InsightsLM',
    role: 'Self-hosted NotebookLM-style RAG (Supabase + n8n). One grounded-research surface with Scorpion RAG.',
    lane: 'hive_capability',
    maturity: 'near_ship',
    pathVerdict: 'LATER',
    apexPath: '/insights',
    confusionWith: ['scorpion', 'proof-qc-assist'],
    githubDescription:
      'InsightsLM — self-hosted NotebookLM-style RAG. Reserved /insights later; not a parallel public product vs Scorpion RAG.',
    topics: ['notebooklm', 'rag', 'n8n', 'supabase', 'hive-capability'],
    canonicalHome: 'Reserved https://evenslouis.ca/insights (gated, later)',
    notTheProductOf: 'Scorpion as a whole or ProofCheck QC',
  },
  {
    id: 'lightningflow-monorepo',
    github: 'https://github.com/snevemoney/n8n-cursor',
    name: 'LightningFlow (canonical)',
    role: 'Parked Lightning Network SaaS inside n8n-cursor monorepo apps/lightningflow.',
    lane: 'parked',
    maturity: 'parked',
    pathVerdict: 'PARK',
    apexPath: '/lightningflow',
    confusionWith: ['lightning-ui', 'lightningflow-gh'],
    githubDescription:
      'Canonical LightningFlow lives in n8n-cursor apps/lightningflow — parked at /lightningflow, not featured.',
    topics: ['lightning-network', 'bitcoin', 'parked', 'saas'],
    canonicalHome: 'https://evenslouis.ca/lightningflow (parked, operator-gated)',
    notTheProductOf: 'the GH lightning-ui dump or GH lightningflow stub',
  },
  {
    id: 'lightning-ui',
    github: 'https://github.com/snevemoney/lightning-ui',
    name: 'lightning-ui (legacy)',
    role: 'Legacy fat dump of Lightning business OS UI — freeze; prefer monorepo LightningFlow.',
    lane: 'legacy',
    maturity: 'legacy',
    pathVerdict: 'NO_PATH',
    apexPath: null,
    confusionWith: ['lightningflow-monorepo', 'lightningflow-gh'],
    githubDescription:
      'LEGACY Lightning business OS dump. Prefer apps/lightningflow in n8n-cursor. Do not develop in parallel.',
    topics: ['legacy', 'lightning-network', 'archive'],
    canonicalHome: 'Archived — use n8n-cursor apps/lightningflow',
    notTheProductOf: 'the canonical LightningFlow path app',
  },
  {
    id: 'lightningflow-gh',
    github: 'https://github.com/snevemoney/lightningflow',
    name: 'lightningflow (GH stub)',
    role: 'Tiny unfinished LightningFlow monorepo stub — superseded by n8n-cursor apps/lightningflow.',
    lane: 'legacy',
    maturity: 'legacy',
    pathVerdict: 'NO_PATH',
    apexPath: null,
    confusionWith: ['lightningflow-monorepo', 'lightning-ui'],
    githubDescription:
      'SUPERSEDED stub. Canonical LightningFlow is apps/lightningflow in snevemoney/n8n-cursor (parked).',
    topics: ['legacy', 'superseded', 'lightning-network'],
    canonicalHome: 'Superseded by n8n-cursor',
    notTheProductOf: 'the live parked LightningFlow on evenslouis.ca',
  },
];

export function getReposByLane(lane: RepoLane): RepoEntry[] {
  return repoRegistry.filter((r) => r.lane === lane);
}

export function getRepoById(id: string): RepoEntry | undefined {
  return repoRegistry.find((r) => r.id === id);
}

export function getPublicWorkCatalog(): RepoEntry[] {
  return repoRegistry.filter(
    (r) =>
      r.lane === 'product_candidate' ||
      r.lane === 'side_wip' ||
      r.lane === 'hive_capability' ||
      r.lane === 'hive_core' ||
      r.lane === 'parked' ||
      r.lane === 'legacy',
  );
}
