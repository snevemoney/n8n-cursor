/**
 * Patch sketch — copy into philanthropic-ai-agent tool registry.
 * ce_list_actions: last N Client Engine actions via Scorpion hive bridge.
 */
export const ceListActionsTool = {
  name: 'ce_list_actions',
  description: 'List recent Client Engine actions/events (read-only).',
  parameters: {
    type: 'object',
    properties: {
      limit: { type: 'number', description: 'Max actions (default 10)' },
    },
  },
  async execute(args: { limit?: number }, ctx: { hiveBase: string; token: string }) {
    const limit = Math.min(50, Math.max(1, args.limit ?? 10));
    const res = await fetch(
      `${ctx.hiveBase}/api/hive/ce/actions?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${ctx.token}`,
          Accept: 'application/json',
        },
      },
    );
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error || `http_${res.status}`);
    return body;
  },
};
