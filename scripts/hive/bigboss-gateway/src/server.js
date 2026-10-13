import http from 'node:http';
import { authorize, readGatewaySecret } from './auth.js';
import {
  CALLER_CLASSES,
  DEFAULT_HOST,
  DEFAULT_PORT,
  DEPTHS,
  MAX_BODY_BYTES,
  SCOPES,
  SERVICE_NAME,
  SLICE,
  TIME_RANGES,
} from './constants.js';
import { fetchGithubLive } from './github.js';
import { isCeoCaller } from './org-pack.js';
import { shapePersonalization } from './personalization.js';
import { assertNoSecrets } from './sanitize.js';
import { shapeCeoBriefing, shapeOrganizationalSearch } from './shaper.js';

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

async function readRawBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const err = new Error('body_too_large');
      err.status = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function parseJsonBody(raw) {
  if (!raw.length) return {};
  try {
    const parsed = JSON.parse(raw.toString('utf8'));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function pickEnum(value, allowed, fallback) {
  return allowed.has(value) ? value : fallback;
}

function cleanResponse(body, extraForbidden) {
  return assertNoSecrets(body, extraForbidden);
}

export function createGateway({
  githubFetch = fetchGithubLive,
  env = process.env,
  now = () => Date.now(),
} = {}) {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);

      if (req.method === 'GET' && url.pathname === '/healthz') {
        return json(res, 200, { ok: true, service: SERVICE_NAME, slice: SLICE });
      }

      if (req.method !== 'POST') {
        return json(res, 405, { error: 'method_not_allowed' });
      }

      const rawBody = await readRawBody(req);
      const secret = readGatewaySecret(env);
      const auth = authorize({ secret, rawBody, headers: req.headers });
      if (!auth.ok) {
        return json(res, 401, { error: 'unauthorized' });
      }

      const body = parseJsonBody(rawBody);
      if (body == null) {
        return json(res, 400, { error: 'invalid_json' });
      }

      const extraForbidden = [secret, env.GITHUB_TOKEN].filter(Boolean);
      const token = env.GITHUB_TOKEN;

      if (url.pathname === '/v1/organizational_search') {
        const query = String(body.query || '').trim();
        if (!query) return json(res, 400, { error: 'query_required' });
        const scope = pickEnum(body.scope, SCOPES, 'all');
        const time_range = pickEnum(body.time_range, TIME_RANGES, '7d');
        const depth = pickEnum(body.depth, DEPTHS, 'standard');
        const caller_class = pickEnum(body.caller_class, CALLER_CLASSES, 'PUBLIC');

        let github = { ok: false, pulls: [], commits: [] };
        if (scope === 'github' || scope === 'all') {
          github = await githubFetch({ token, timeRange: time_range, now: now() });
        }
        const payload = shapeOrganizationalSearch({
          query,
          scope,
          depth,
          callerClass: caller_class,
          github,
          now: now(),
        });
        return json(res, 200, cleanResponse(payload, extraForbidden));
      }

      if (url.pathname === '/v1/ceo_briefing') {
        const github = await githubFetch({ token, timeRange: '30d', now: now() });
        const payload = shapeCeoBriefing({ github, now: now() });
        return json(res, 200, cleanResponse(payload, extraForbidden));
      }

      if (url.pathname === '/v1/personalization') {
        const callerId = body.caller_id || body.callerId || '';
        let github = { ok: false, pulls: [], commits: [] };
        if (isCeoCaller(callerId)) {
          github = await githubFetch({ token, timeRange: '30d', now: now() });
        }
        const payload = shapePersonalization({ callerId, github, now: now() });
        return json(res, 200, cleanResponse(payload, extraForbidden));
      }

      return json(res, 404, { error: 'not_found' });
    } catch (err) {
      const status = err.status || 500;
      return json(res, status, { error: status === 413 ? 'body_too_large' : 'internal_error' });
    }
  });
}

export function listenGateway(options = {}) {
  const env = options.env || process.env;
  const host = env.BIGBOSS_GATEWAY_HOST || DEFAULT_HOST;
  const port = Number(env.BIGBOSS_GATEWAY_PORT || DEFAULT_PORT);
  const server = createGateway(options);
  return new Promise((resolve) => {
    server.listen(port, host, () => resolve({ server, host, port }));
  });
}
