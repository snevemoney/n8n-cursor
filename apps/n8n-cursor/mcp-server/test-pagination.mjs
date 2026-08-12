#!/usr/bin/env node

/**
 * Unit test for n8n workflow list pagination logic.
 *
 * Validates that the paginated fetch helpers correctly follow
 * nextCursor until exhausted and return the full workflow set.
 *
 * Run: node apps/n8n-cursor/mcp-server/test-pagination.mjs
 */

import assert from 'node:assert/strict';
import { test, describe, mock } from 'node:test';

function makePage(ids, nextCursor = null) {
  return {
    data: ids.map(id => ({
      id: String(id),
      name: `workflow-${id}`,
      active: id % 2 === 0,
      updatedAt: '2025-01-01T00:00:00Z',
      nodes: [{ type: 'n8n-nodes-base.manualTrigger' }],
    })),
    nextCursor,
  };
}

/**
 * Replicates the pagination loop from mcp-server/index.js
 * (n8n_list_workflows handler) in isolation so we can test
 * it without starting the full MCP server.
 */
async function paginatedFetch(fetchFn) {
  const allRows = [];
  let cursor = null;
  const maxPages = 50;
  let page = 0;

  do {
    const url = new URL('http://localhost:5678/rest/workflows');
    url.searchParams.set('limit', '250');
    if (cursor) url.searchParams.set('cursor', cursor);

    const r = await fetchFn(url.toString());
    if (!r.ok) throw new Error(`n8n API error ${r.status}`);
    const data = await r.json();
    const workflows = data.data || [];
    for (const w of workflows) {
      allRows.push({
        id: w.id,
        name: w.name,
        active: !!w.active,
        updatedAt: w.updatedAt,
        nodes: w.nodes?.length || 0,
      });
    }
    cursor = data.nextCursor || null;
    page++;
  } while (cursor && page < maxPages);

  return allRows;
}

describe('n8n workflow list pagination', () => {
  test('single page (no nextCursor) returns all workflows', async () => {
    const fetchFn = mock.fn(async () => ({
      ok: true,
      json: async () => makePage([1, 2, 3]),
    }));

    const result = await paginatedFetch(fetchFn);
    assert.equal(result.length, 3);
    assert.equal(fetchFn.mock.calls.length, 1);
  });

  test('multi-page pagination follows nextCursor until null', async () => {
    const pages = [
      makePage([1, 2, 3], 'cursor-page2'),
      makePage([4, 5, 6], 'cursor-page3'),
      makePage([7, 8], null),
    ];
    let callIndex = 0;

    const fetchFn = mock.fn(async (url) => {
      const pageData = pages[callIndex++];
      return { ok: true, json: async () => pageData };
    });

    const result = await paginatedFetch(fetchFn);
    assert.equal(result.length, 8);
    assert.equal(fetchFn.mock.calls.length, 3);
    assert.deepEqual(result.map(r => r.id), ['1','2','3','4','5','6','7','8']);
  });

  test('cursor parameter is passed correctly on subsequent pages', async () => {
    const pages = [
      makePage([1], 'abc123'),
      makePage([2], null),
    ];
    let callIndex = 0;

    const fetchFn = mock.fn(async (url) => {
      const pageData = pages[callIndex++];
      return { ok: true, json: async () => pageData };
    });

    await paginatedFetch(fetchFn);

    const firstUrl = fetchFn.mock.calls[0].arguments[0];
    assert.ok(!firstUrl.includes('cursor='), 'first call should not have cursor');

    const secondUrl = fetchFn.mock.calls[1].arguments[0];
    assert.ok(secondUrl.includes('cursor=abc123'), 'second call should include cursor');
  });

  test('empty first page returns empty array', async () => {
    const fetchFn = mock.fn(async () => ({
      ok: true,
      json: async () => ({ data: [], nextCursor: null }),
    }));

    const result = await paginatedFetch(fetchFn);
    assert.equal(result.length, 0);
    assert.equal(fetchFn.mock.calls.length, 1);
  });

  test('respects maxPages safety limit', async () => {
    let callCount = 0;
    const fetchFn = mock.fn(async () => {
      callCount++;
      return {
        ok: true,
        json: async () => makePage([callCount], `cursor-${callCount + 1}`),
      };
    });

    const result = await paginatedFetch(fetchFn);
    assert.equal(result.length, 50);
    assert.equal(fetchFn.mock.calls.length, 50);
  });

  test('177-workflow estate fits in single page at limit=250', async () => {
    const ids = Array.from({ length: 177 }, (_, i) => i + 1);
    const fetchFn = mock.fn(async () => ({
      ok: true,
      json: async () => makePage(ids),
    }));

    const result = await paginatedFetch(fetchFn);
    assert.equal(result.length, 177);
    assert.equal(fetchFn.mock.calls.length, 1, 'should complete in one request');
    const activeCount = result.filter(r => r.active).length;
    assert.ok(activeCount > 0, 'should include active workflows');
  });

  test('API error throws on first page', async () => {
    const fetchFn = mock.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    }));

    await assert.rejects(() => paginatedFetch(fetchFn), /n8n API error 500/);
  });
});
