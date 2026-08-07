/**
 * Evens Louis product / path registry
 * Single source of truth for public vs operator vs parked vs machine surfaces.
 */

export type SurfaceAudience = 'public' | 'operator' | 'parked' | 'machine';

export interface ProductSurface {
  id: string;
  name: string;
  href: string;
  audience: SurfaceAudience;
  port?: number;
  blurb: string;
  healthz?: string;
}

/** Canonical surfaces on evenslouis.ca */
export const productSurfaces: ProductSurface[] = [
  {
    id: 'client-engine-public',
    name: 'Client Engine (public site)',
    href: 'https://evenslouis.ca/',
    audience: 'public',
    port: 3200,
    blurb: 'CE marketing + work pages on apex (restored 2026-08-07).',
    healthz: 'https://evenslouis.ca/api/health',
  },
  {
    id: 'work',
    name: 'Work',
    href: 'https://evenslouis.ca/work',
    audience: 'public',
    blurb: 'CE public work/case-study page (portfolio lane catalog parked on :4010).',
  },
  {
    id: 'client-engine',
    name: 'Client Engine',
    href: 'https://evenslouis.ca/dashboard',
    audience: 'operator',
    port: 3200,
    blurb: 'Private business OS (leads, builds, ingest, AI). /pro is basePath twin on :3204.',
    healthz: 'https://evenslouis.ca/api/health',
  },
  {
    id: 'client-engine-pro',
    name: 'Client Engine (/pro)',
    href: 'https://evenslouis.ca/pro',
    audience: 'operator',
    port: 3204,
    blurb: 'CE with NEXT_PUBLIC_BASE_PATH=/pro.',
    healthz: 'https://evenslouis.ca/pro/api/health',
  },
  {
    id: 'portfolio-parked',
    name: 'Portfolio (parked container)',
    href: 'http://127.0.0.1:4010/',
    audience: 'parked',
    port: 4010,
    blurb: 'Monorepo portfolio still built; not on apex catch-all after CE restore.',
    healthz: 'http://127.0.0.1:4010/healthz',
  },
  {
    id: 'n8n',
    name: 'n8n',
    href: 'https://evenslouis.ca/n8n/',
    audience: 'operator',
    port: 5678,
    blurb: 'Automation backbone. UI operator-gated; webhooks stay machine-reachable.',
    healthz: 'https://evenslouis.ca/n8n/healthz',
  },
  {
    id: 'scorpion',
    name: 'Scorpion',
    href: 'https://evenslouis.ca/scorpion',
    audience: 'operator',
    port: 3003,
    blurb: 'Private ops console (council, knowledge, workflow control).',
    healthz: 'https://evenslouis.ca/scorpion/healthz',
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    href: 'https://evenslouis.ca/claw',
    audience: 'operator',
    blurb: 'Telegram-first Outer Heaven status (gated). Human remote control stays in Telegram.',
  },
  {
    id: 'openclaw-hooks',
    name: 'OpenClaw hooks',
    href: 'https://evenslouis.ca/claw/hooks',
    audience: 'machine',
    blurb: 'Machine ingress for n8n/MCP/CE callbacks — no basic_auth (like n8n webhooks).',
  },
  {
    id: 'insights',
    name: 'InsightsLM',
    href: 'https://evenslouis.ca/insights',
    audience: 'operator',
    blurb: 'Reserved NotebookLM-style RAG path (gated). Stage after CE/n8n/OpenClaw stable.',
  },
  {
    id: 'lightningflow',
    name: 'LightningFlow',
    href: 'https://evenslouis.ca/lightningflow',
    audience: 'parked',
    port: 3202,
    blurb: 'Parked Lightning SaaS R&D. Keep alive; do not feature publicly.',
    healthz: 'https://evenslouis.ca/lightningflow/healthz',
  },
  {
    id: 'builder',
    name: 'Builder',
    href: 'https://evenslouis.ca/builder',
    audience: 'operator',
    port: 3001,
    blurb: 'Client Engine website builder (gate until healthy).',
  },
];

export function getPublicSurfaces(): ProductSurface[] {
  return productSurfaces.filter((s) => s.audience === 'public');
}

export function getOperatorSurfaces(): ProductSurface[] {
  return productSurfaces.filter((s) => s.audience === 'operator');
}

export function getParkedSurfaces(): ProductSurface[] {
  return productSurfaces.filter((s) => s.audience === 'parked');
}

export function getMachineSurfaces(): ProductSurface[] {
  return productSurfaces.filter((s) => s.audience === 'machine');
}

export function getSurfaceById(id: string): ProductSurface | undefined {
  return productSurfaces.find((s) => s.id === id);
}
