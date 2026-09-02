import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { EVIDENCE_CAP, KINDS } from '../src/constants.js';
import { fetchGithubLive } from '../src/github.js';
import { isLeftoverDraft, kindForPull, shapeOrganizationalSearch } from '../src/shaper.js';
import { loadFixtureGithub } from './helpers.js';

const NOW = Date.parse('2026-08-28T20:00:00Z');

describe('GitHub shaper (fixture, no network)', () => {
  const github = loadFixtureGithub();

  it('loads fixture pulls without inventing rows', () => {
    assert.equal(github.ok, true);
    assert.ok(github.pulls.some((pr) => pr.number === 82));
    assert.ok(github.pulls.some((pr) => pr.number === 26));
    assert.ok(github.pulls.some((pr) => isLeftoverDraft(pr.title)));
  });

  it('open PR titled fix is attempted, not completed, and conflicts', () => {
    const fix = github.pulls.find((pr) => pr.number === 82);
    assert.equal(kindForPull(fix), 'attempted');
    const shaped = shapeOrganizationalSearch({
      query: 'look at my signals',
      scope: 'github',
      callerClass: 'CEO',
      github,
      now: NOW,
    });
    const row = shaped.evidence.find((e) => e.ref.includes('/pull/82'));
    assert.ok(row);
    assert.equal(row.kind, 'attempted');
    assert.ok(KINDS.has(row.kind));
    assert.ok(shaped.possible_conflicts.some((c) => c.includes('#82') && c.includes('attempted')));
  });

  it('prefers material PRs over leftover cron drafts', () => {
    const shaped = shapeOrganizationalSearch({
      query: 'look at my signals',
      scope: 'github',
      callerClass: 'CEO',
      github,
      now: NOW,
    });
    const first = shaped.evidence[0];
    assert.ok(first);
    assert.equal(/hitl inbox|goal\/gap|no-waiting|factory os.*reminder/i.test(first.fact), false);
    assert.match(first.fact, /#85|#26|#82|#23/);
    assert.ok(shaped.answer_summary.includes('Deprioritized'));
  });

  it('caps evidence at 20 and never invents PRs when GitHub fails', () => {
    const shaped = shapeOrganizationalSearch({
      query: 'look at my signals',
      scope: 'all',
      github,
      now: NOW,
    });
    assert.ok(shaped.evidence.length <= EVIDENCE_CAP);
    assert.deepEqual(
      shaped.unavailable.sort(),
      ['grok', 'memory', 'obsidian'],
    );

    const failed = shapeOrganizationalSearch({
      query: 'look at my signals',
      scope: 'all',
      github: { ok: false, pulls: [], commits: [] },
      now: NOW,
    });
    assert.deepEqual(failed.evidence, []);
    assert.ok(failed.unavailable.includes('github'));
    assert.match(failed.answer_summary, /will not invent/i);
    assert.equal(failed.evidence.some((e) => /#\d+/.test(e.fact)), false);
  });

  it('scope=memory does not use GitHub and lists unwired sources', () => {
    const shaped = shapeOrganizationalSearch({
      query: 'what did we decide',
      scope: 'memory',
      github,
      now: NOW,
    });
    assert.deepEqual(shaped.evidence, []);
    assert.ok(shaped.unavailable.includes('memory'));
    assert.ok(shaped.unavailable.includes('grok'));
    assert.ok(shaped.unavailable.includes('obsidian'));
    assert.equal(shaped.unavailable.includes('github'), false);
  });

  it('fetchGithubLive puts github in unavailable path when fetch throws (no invented PRs)', async () => {
    const result = await fetchGithubLive({
      fetchImpl: async () => {
        throw new Error('network down');
      },
    });
    assert.equal(result.ok, false);
    assert.deepEqual(result.pulls, []);
    assert.deepEqual(result.commits, []);
  });

  it('requests open PRs newest-updated first', async () => {
    const urls = [];
    await fetchGithubLive({
      fetchImpl: async (url) => {
        urls.push(String(url));
        return { ok: true, json: async () => [] };
      },
    });
    const pullUrls = urls.filter((u) => u.includes('/pulls?'));
    assert.ok(pullUrls.length >= 1);
    for (const url of pullUrls) {
      assert.match(url, /sort=updated/);
      assert.match(url, /direction=desc/);
    }
  });
});
