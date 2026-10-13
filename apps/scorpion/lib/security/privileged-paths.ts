/**
 * Privileged Scorpion API paths that must authenticate.
 * Public health/login stay open. Dashboard GET lists are not in this set.
 */

export const PRIVILEGED_API_PREFIXES = [
  '/api/security/secrets',
  '/api/edge',
  '/api/settings',
  '/api/migrate',
  '/api/migration',
  '/api/gateway',
  '/api/openai',
  '/api/prompts',
  '/api/test-env',
  '/api/test-n8n',
  '/api/debug-workflows',
  '/api/dev',
  '/api/operations/control',
  '/api/services/register',
  '/api/services/mesh/reset',
  '/api/governance/enforce-retention',
  '/api/telemetry/trigger',
  '/api/telemetry/populate',
  '/api/build',
  '/api/ops',
] as const;

const PRIVILEGED_EXACT = new Set([
  '/api/agents',
]);

const PRIVILEGED_AGENT_ACTIONS = new Set(['run', 'pause']);

export function isPrivilegedApiPath(pathname: string, method: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  const verb = method.toUpperCase();

  if (PRIVILEGED_API_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return true;
  }

  if (path === '/api/selling' && verb !== 'GET') {
    return true;
  }

  if (PRIVILEGED_EXACT.has(path) && verb !== 'GET') {
    return true;
  }

  const agentAction = path.match(/^\/api\/agents\/[^/]+\/(run|pause)$/);
  if (agentAction && PRIVILEGED_AGENT_ACTIONS.has(agentAction[1])) {
    return true;
  }

  return false;
}

export const PUBLIC_API_PREFIXES = [
  '/api/health',
  '/api/security/auth/login',
] as const;
