/** Patch sketch — scorpion_health */
export const scorpionHealthTool = {
  name: 'scorpion_health',
  description: 'Scorpion hive/ops health summary (read-only).',
  parameters: { type: 'object', properties: {} },
  async execute(_args: Record<string, never>, ctx: { hiveBase: string; token: string }) {
    const res = await fetch(`${ctx.hiveBase}/api/hive/health`, {
      headers: {
        Authorization: `Bearer ${ctx.token}`,
        Accept: 'application/json',
      },
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error || `http_${res.status}`);
    return body;
  },
};
