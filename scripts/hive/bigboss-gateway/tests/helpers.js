import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hmacHex } from '../src/auth.js';
import { normalizeCommit, normalizePull } from '../src/github.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const TEST_SECRET = 'test-only-not-a-real-secret';

export function loadFixtureGithub() {
  const n8n = JSON.parse(readFileSync(join(root, 'fixtures/github-n8n-cursor-prs.json'), 'utf8'));
  const ce = JSON.parse(readFileSync(join(root, 'fixtures/github-client-engine-prs.json'), 'utf8'));
  const commits = JSON.parse(readFileSync(join(root, 'fixtures/github-commits.json'), 'utf8'));
  return {
    ok: true,
    pulls: [
      ...n8n.map((pr) => normalizePull(pr, { owner: 'snevemoney', name: 'n8n-cursor' })),
      ...ce.map((pr) => normalizePull(pr, { owner: 'snevemoney', name: 'client-engine' })),
    ],
    commits: commits.map((c) => normalizeCommit(c, { owner: 'snevemoney', name: 'n8n-cursor' })),
  };
}

export function signedHeaders(body, secret = TEST_SECRET) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    'content-type': 'application/json',
    'x-voice-signature': hmacHex(secret, raw),
  };
}

export async function withServer(t, { env, githubFetch } = {}) {
  const { createGateway } = await import('../src/server.js');
  const server = createGateway({
    env: { BIGBOSS_GATEWAY_SECRET: TEST_SECRET, ...env },
    githubFetch: githubFetch || (async () => loadFixtureGithub()),
    now: () => Date.parse('2026-08-28T20:00:00Z'),
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${port}`;
}

export async function post(base, path, body, headers) {
  const raw = JSON.stringify(body);
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: headers || signedHeaders(raw),
    body: raw,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}
