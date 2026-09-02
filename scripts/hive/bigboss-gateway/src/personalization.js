import { emptyPublicVars, isCeoCaller, ORG_PACK } from './org-pack.js';
import { redactSecrets } from './sanitize.js';
import { shapeCeoBriefing } from './shaper.js';

function stringifyList(items) {
  if (!items?.length) return '';
  return items.join('; ');
}

function ceoVarsFromBriefing(briefing) {
  return {
    caller_role: briefing.caller_role || ORG_PACK.ceo.role,
    caller_name: briefing.caller_name || ORG_PACK.ceo.name,
    session_privacy: briefing.session_privacy || ORG_PACK.session_privacy_ceo,
    current_focus: briefing.current_focus || ORG_PACK.building_mode_line,
    recent_projects: stringifyList(briefing.recent_projects),
    urgent_items: stringifyList(briefing.urgent_items),
    urgent_line_1: briefing.urgent_lines?.[0] || '',
    urgent_line_2: briefing.urgent_lines?.[1] || '',
    last_bigboss_session: briefing.last_bigboss_session || ORG_PACK.last_bigboss_session,
    building_mode: briefing.building_mode || ORG_PACK.building_mode,
    voice_line: ORG_PACK.voice_line,
  };
}

/**
 * ElevenLabs conversation-initiation webhook.
 * CEO ANI → CEO vars. Anyone else → PUBLIC empty pack (no private project names, no money).
 */
export function shapePersonalization({ callerId, github, now } = {}) {
  const ceo = isCeoCaller(callerId);
  const dynamic_variables = ceo
    ? ceoVarsFromBriefing(shapeCeoBriefing({ github, now }))
    : emptyPublicVars();

  return redactSecrets({
    type: 'conversation_initiation_client_data',
    dynamic_variables,
  });
}

export { isCeoCaller };
