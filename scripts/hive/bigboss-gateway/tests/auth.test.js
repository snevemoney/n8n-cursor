import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { authorize, hmacHex, readGatewaySecret } from '../src/auth.js';
import { post, TEST_SECRET, withServer } from './helpers.js';

describe('auth fail-closed', () => {
  it('unset secret is always 401, even with a signature', async (t) => {
    assert.equal(readGatewaySecret({}), '');
    const denied = authorize({
      secret: '',
      rawBody: '{"query":"x"}',
      headers: { 'x-voice-signature': hmacHex('anything', '{"query":"x"}') },
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'secret_unset');

    const base = await withServer(t, { env: { BIGBOSS_GATEWAY_SECRET: '' } });
    const { status } = await post(base, '/v1/organizational_search', { query: 'look at my signals' });
    assert.equal(status, 401);
  });

  it('bad HMAC is 401', async (t) => {
    const denied = authorize({
      secret: TEST_SECRET,
      rawBody: '{"query":"x"}',
      headers: { 'x-voice-signature': '00'.repeat(32) },
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'bad_signature');

    const base = await withServer(t);
    const { status } = await post(
      base,
      '/v1/organizational_search',
      { query: 'look at my signals' },
      { 'content-type': 'application/json', 'x-voice-signature': 'deadbeef' },
    );
    assert.equal(status, 401);
  });

  it('valid HMAC of the raw body is accepted', () => {
    const raw = '{"query":"look at my signals"}';
    const ok = authorize({
      secret: TEST_SECRET,
      rawBody: raw,
      headers: { 'x-voice-signature': hmacHex(TEST_SECRET, raw) },
    });
    assert.equal(ok.ok, true);
    assert.equal(ok.via, 'hmac');
  });

  it('Authorization Bearer with the same secret is accepted', async (t) => {
    const ok = authorize({
      secret: TEST_SECRET,
      rawBody: '{}',
      headers: { authorization: `Bearer ${TEST_SECRET}` },
    });
    assert.equal(ok.ok, true);
    assert.equal(ok.via, 'bearer');

    const base = await withServer(t);
    const { status, json } = await post(
      base,
      '/v1/organizational_search',
      { query: 'look at my signals', scope: 'github' },
      { 'content-type': 'application/json', authorization: `Bearer ${TEST_SECRET}` },
    );
    assert.equal(status, 200);
    assert.ok(json.answer_summary);
  });

  it('Authorization header equal to the secret (no Bearer prefix) is accepted for EL env_var_label', () => {
    const ok = authorize({
      secret: TEST_SECRET,
      rawBody: '{}',
      headers: { authorization: TEST_SECRET },
    });
    assert.equal(ok.ok, true);
    assert.equal(ok.via, 'bearer');
  });
});
