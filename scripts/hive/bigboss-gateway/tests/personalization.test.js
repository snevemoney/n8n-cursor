import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { emptyPublicVars, isCeoCaller } from '../src/org-pack.js';
import { shapePersonalization } from '../src/personalization.js';
import { shapeCeoBriefing } from '../src/shaper.js';
import { loadFixtureGithub, post, TEST_SECRET, withServer } from './helpers.js';

describe('CEO vs PUBLIC personalization', () => {
  const github = loadFixtureGithub();
  const now = Date.parse('2026-08-28T20:00:00Z');

  it('recognizes CEO ANI and suffix', () => {
    assert.equal(isCeoCaller('+14384019991'), true);
    assert.equal(isCeoCaller('14384019991'), true);
    assert.equal(isCeoCaller('+1 (438) 401-9991'), true);
    assert.equal(isCeoCaller('+15551234567'), false);
    assert.equal(isCeoCaller(''), false);
  });

  it('CEO pack has orientation vars; PUBLIC pack is empty of projects and money', () => {
    const ceo = shapePersonalization({ callerId: '+14384019991', github, now });
    assert.equal(ceo.type, 'conversation_initiation_client_data');
    assert.equal(ceo.dynamic_variables.caller_role, 'CEO');
    assert.equal(ceo.dynamic_variables.caller_name, 'Evens Louis');
    assert.equal(ceo.dynamic_variables.session_privacy, 'private-operator');
    assert.equal(ceo.dynamic_variables.building_mode, 'factory_os');
    assert.ok(ceo.dynamic_variables.current_focus);
    assert.equal(/\$|usd|stripe/i.test(JSON.stringify(ceo.dynamic_variables)), false);

    const pub = shapePersonalization({ callerId: '+15551234567', github, now });
    assert.equal(pub.dynamic_variables.caller_role, 'PUBLIC');
    assert.deepEqual(pub.dynamic_variables, emptyPublicVars());
    assert.equal(pub.dynamic_variables.current_focus, '');
    assert.equal(pub.dynamic_variables.recent_projects, '');
    assert.equal(pub.dynamic_variables.urgent_items, '');
    assert.equal(/n8n-cursor|client-engine|Evens|Factory OS/i.test(JSON.stringify(pub.dynamic_variables)), false);
    assert.equal(/\$|money|usd/i.test(JSON.stringify(pub)), false);
  });

  it('ceo_briefing is tiny orientation JSON with at most two urgent_lines', () => {
    const brief = shapeCeoBriefing({ github, now });
    assert.equal(brief.caller_role, 'CEO');
    assert.equal(brief.caller_name, 'Evens Louis');
    assert.equal(brief.session_privacy, 'private-operator');
    assert.equal(brief.building_mode, 'factory_os');
    assert.ok(brief.current_focus);
    assert.ok(Array.isArray(brief.recent_projects));
    assert.ok(Array.isArray(brief.urgent_items));
    assert.ok(Array.isArray(brief.urgent_lines));
    assert.ok(brief.urgent_lines.length <= 2);
    assert.match(brief.last_bigboss_session, /unavailable/);
    assert.equal(brief.urgent_lines.some((line) => /HITL inbox|goal\/gap|NO-WAITING/i.test(line)), false);
  });

  it('HTTP personalization routes CEO vs PUBLIC', async (t) => {
    const base = await withServer(t);
    const ceo = await post(base, '/v1/personalization', { caller_id: '+14384019991' });
    assert.equal(ceo.status, 200);
    assert.equal(ceo.json.dynamic_variables.caller_role, 'CEO');

    const pub = await post(base, '/v1/personalization', { caller_id: '+16045551212' });
    assert.equal(pub.status, 200);
    assert.equal(pub.json.dynamic_variables.caller_role, 'PUBLIC');
    assert.equal(pub.json.dynamic_variables.recent_projects, '');
    assert.equal(JSON.stringify(pub.json).includes(TEST_SECRET), false);
  });
});
