/** Patch sketch — scorpion_register_outcome */
export const scorpionRegisterOutcomeTool = {
  name: 'scorpion_register_outcome',
  description: 'Register a mission outcome into CE and/or Scorpion hive ledgers.',
  parameters: {
    type: 'object',
    properties: {
      missionId: { type: 'string' },
      summary: { type: 'string' },
      target: { type: 'string', description: 'ce | scorpion | both' },
      sourceTopicId: { type: 'number' },
      agentId: { type: 'string' },
    },
    required: ['missionId', 'summary', 'target'],
  },
  async execute(
    args: {
      missionId: string;
      summary: string;
      target: 'ce' | 'scorpion' | 'both';
      sourceTopicId?: number;
      agentId?: string;
    },
    ctx: { hiveBase: string; token: string },
  ) {
    const res = await fetch(`${ctx.hiveBase}/api/hive/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(args),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error || `http_${res.status}`);
    return body;
  },
};
