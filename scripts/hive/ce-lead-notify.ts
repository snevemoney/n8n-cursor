/** Notify hive bridge when a Lead row is created (Tier 3 approve/send stays on /pro). */
const BRIDGE = process.env.CE_HIVE_BRIDGE_URL ?? 'http://127.0.0.1:3205';
const TOKEN = process.env.CE_HIVE_TOKEN?.trim();

export type LeadNotifyPayload = {
  id: string;
  contactName?: string | null;
  title?: string;
  contactEmail?: string | null;
  status?: string;
};

export function notifyHiveLeadCreated(lead: LeadNotifyPayload): void {
  if (!TOKEN) return;
  void fetch(`${BRIDGE}/api/hive/leads/event`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      leadId: lead.id,
      name: lead.contactName ?? lead.title,
      email: lead.contactEmail ?? undefined,
      status: lead.status ?? 'new',
    }),
  }).catch(() => undefined);
}
