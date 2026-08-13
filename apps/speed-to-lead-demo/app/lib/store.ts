import { promises as fs } from 'fs';
import path from 'path';
import { Lead } from './types';

// Vercel serverless: only /tmp is writable; local dev uses .data/
const DATA_DIR =
  process.env.VERCEL === '1'
    ? path.join('/tmp', 'speed-to-lead-demo')
    : path.join(process.cwd(), '.data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // already exists
  }
}

export async function getLeads(): Promise<Lead[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(LEADS_FILE, 'utf-8');
    return JSON.parse(raw) as Lead[];
  } catch {
    return [];
  }
}

export async function saveLead(lead: Lead): Promise<void> {
  const leads = await getLeads();
  leads.push(lead);
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
}

export async function updateLead(
  id: string,
  updates: Partial<Lead>
): Promise<Lead | null> {
  const leads = await getLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  leads[idx] = { ...leads[idx], ...updates };
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
  return leads[idx];
}
