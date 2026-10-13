/**
 * Small static org pack. Public-safe facts only. No secrets, no money, no vault paths.
 * Phone numbers here are the published voice line / known CEO ANI — not credentials.
 */
export const ORG_PACK = {
  ceo: {
    name: 'Evens Louis',
    role: 'CEO',
    caller_id_e164: '+14384019991',
    caller_id_suffix: '4019991',
  },
  voice_line: '+1 825 450 1273',
  agent_id: 'agent_0001m12xxdbge58ttc2701w67nyk',
  building_mode: 'factory_os',
  building_mode_line: 'Factory OS this week — no buyer surface.',
  session_privacy_ceo: 'private-operator',
  session_privacy_public: 'public-restricted',
  last_bigboss_session: 'unavailable — session log not wired in slice 1',
};

export const PERSONALIZATION_KEYS = [
  'caller_role',
  'caller_name',
  'session_privacy',
  'current_focus',
  'recent_projects',
  'urgent_items',
  'urgent_line_1',
  'urgent_line_2',
  'last_bigboss_session',
  'building_mode',
  'voice_line',
];

export function emptyPublicVars() {
  const vars = {};
  for (const key of PERSONALIZATION_KEYS) {
    vars[key] = key === 'caller_role' ? 'PUBLIC' : key === 'session_privacy' ? ORG_PACK.session_privacy_public : '';
  }
  return vars;
}

export function isCeoCaller(callerId) {
  const raw = String(callerId || '').trim();
  if (!raw) return false;
  if (raw === ORG_PACK.ceo.caller_id_e164) return true;
  const digits = raw.replace(/\D/g, '');
  if (digits === '14384019991' || digits === '4384019991') return true;
  return digits.endsWith(ORG_PACK.ceo.caller_id_suffix);
}
