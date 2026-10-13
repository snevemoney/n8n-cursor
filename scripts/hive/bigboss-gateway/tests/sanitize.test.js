import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assertNoSecrets, containsSecrets, redactSecrets } from '../src/sanitize.js';
import { shapeOrganizationalSearch } from '../src/shaper.js';
import { loadFixtureGithub, post, TEST_SECRET, withServer } from './helpers.js';

describe('response never contains tokens/secrets', () => {
  it('redacts token-shaped strings and env assignments', () => {
    const dirty = {
      fact: 'see ghp_abcdefghijklmnopqrstuvwxyz0123456789 and Bearer abcdefghijklmnop',
      note: 'BIGBOSS_GATEWAY_SECRET=super-secret-value GITHUB_TOKEN=also-secret',
    };
    assert.equal(containsSecrets(dirty), true);
    const clean = redactSecrets(dirty);
    assert.equal(containsSecrets(clean), false);
    assert.equal(JSON.stringify(clean).includes('ghp_'), false);
    assert.equal(JSON.stringify(clean).includes('super-secret-value'), false);
    assertNoSecrets(clean, ['super-secret-value']);
  });

  it('shaped search + HTTP responses never echo the gateway secret or a planted token', async (t) => {
    const github = loadFixtureGithub();
    github.pulls[0] = {
      ...github.pulls[0],
      title: `${github.pulls[0].title} ghp_${'a'.repeat(36)}`,
    };
    const shaped = shapeOrganizationalSearch({
      query: 'look at my signals',
      scope: 'github',
      github,
    });
    const blob = JSON.stringify(shaped);
    assert.equal(blob.includes('ghp_'), false);
    assert.equal(blob.includes(TEST_SECRET), false);
    assert.equal(containsSecrets(shaped), false);

    const base = await withServer(t, { env: { GITHUB_TOKEN: 'ghp_' + 'b'.repeat(36) } });
    const search = await post(base, '/v1/organizational_search', {
      query: 'look at my signals',
      caller_class: 'CEO',
    });
    const brief = await post(base, '/v1/ceo_briefing', {});
    const text = JSON.stringify(search.json) + JSON.stringify(brief.json);
    assert.equal(search.status, 200);
    assert.equal(brief.status, 200);
    assert.equal(text.includes(TEST_SECRET), false);
    assert.equal(text.includes('ghp_'), false);
    assert.equal(text.includes('GITHUB_TOKEN'), false);
    assert.equal(containsSecrets(search.json), false);
    assert.equal(containsSecrets(brief.json), false);
  });
});
