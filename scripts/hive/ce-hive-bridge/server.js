/**
 * Lightweight Client Engine hive machine API (Phases 2/6/7).
 * Talks to CE Postgres; does not require rebuilding the Next CE image.
 *
 * Hub source: scripts/hive/ce-hive-bridge/server.js
 * Deploy: bash scripts/hive/upgrade-hive-leverage.py (VPS)
 */
import http from 'http';
import { randomUUID } from 'crypto';
import pg from 'pg';

const port = Number(process.env.PORT || 3205);
const token = (process.env.CE_HIVE_TOKEN || '').trim();
const databaseUrl = process.env.DATABASE_URL;
const hiveWebhookSecret = (process.env.HIVE_WEBHOOK_SECRET || '').trim();
const n8nWebhookBase = (process.env.N8N_WEBHOOK_BASE || 'https://evenslouis.ca/webhook').replace(
  /\/+$/,
  '',
);

if (!databaseUrl) {
  console.error('DATABASE_URL required');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: databaseUrl, max: 4 });

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function unauthorized(res) {
  return json(res, 401, { ok: false, error: 'unauthorized' });
}

function assertAuth(req, res) {
  if (!token) return true;
  const h = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  if (!m || m[1].trim() !== token) {
    unauthorized(res);
    return false;
  }
  return true;
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

async function listActions(limit) {
  const { rows } = await pool.query(
    `SELECT id, "actionKey", "actionLabel", "sourceType", note, "actorLabel", "createdAt", "metaJson"
     FROM "AuditAction"
     ORDER BY "createdAt" DESC
     LIMIT $1`,
    [limit],
  );
  return rows.map((r) => {
    const meta = r.metaJson && typeof r.metaJson === 'object' ? r.metaJson : {};
    const resolved = meta.resolved === true;
    return {
      id: r.id,
      type: r.actionKey,
      summary: r.actionLabel || r.note || r.actionKey,
      createdAt: r.createdAt?.toISOString?.() || r.createdAt,
      source: r.sourceType || r.actorLabel || undefined,
      hitl: meta.hitl === true,
      resolved,
      resolution: meta.resolution || undefined,
    };
  });
}

async function listLeads(q, limit) {
  const params = [];
  let where = '';
  if (q) {
    params.push(`%${q}%`);
    where = `WHERE (title ILIKE $1 OR "contactName" ILIKE $1 OR "contactEmail" ILIKE $1 OR description ILIKE $1)`;
  }
  params.push(limit);
  const limIdx = params.length;
  const { rows } = await pool.query(
    `SELECT id, title, status, "contactName", "contactEmail", "createdAt"
     FROM "Lead"
     ${where}
     ORDER BY "createdAt" DESC
     LIMIT $${limIdx}`,
    params,
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.contactName || r.title,
    status: r.status,
    email: r.contactEmail || undefined,
  }));
}

async function createNote(body) {
  const leadId = body.leadId || body.dealId;
  const text = String(body.body || '').trim();
  const source = ['openclaw', 'n8n', 'operator'].includes(body.source)
    ? body.source
    : 'openclaw';
  if (!leadId || !text) {
    return { status: 400, body: { ok: false, error: 'leadId_and_body_required' } };
  }
  const id = randomUUID();
  await pool.query(
    `INSERT INTO "AuditAction"
       (id, "createdAt", "actionKey", "actionLabel", "sourceType", "sourceId", note, "metaJson")
     VALUES ($1, NOW(), 'hive.note', 'Hive note', $2, $3, $4, $5::jsonb)`,
    [id, source, leadId, text, JSON.stringify({ source, kind: 'note' })],
  );
  return { status: 201, body: { ok: true, id, source } };
}

async function queueAction(body) {
  const type = String(body.type || '').trim();
  const reason = String(body.reason || '').trim();
  const payload = body.payload ?? {};
  if (!type || !reason) {
    return { status: 400, body: { ok: false, error: 'type_and_reason_required' } };
  }
  const id = randomUUID();
  await pool.query(
    `INSERT INTO "AuditAction"
       (id, "createdAt", "actionKey", "actionLabel", "sourceType", "sourceId", note, "metaJson")
     VALUES ($1, NOW(), 'hive.queue', $2, 'hive', $1, $3, $4::jsonb)`,
    [
      id,
      `HITL queue: ${type}`,
      reason,
      JSON.stringify({ type, payload, reason, hitl: true }),
    ],
  );
  return {
    status: 201,
    body: { ok: true, id, queued: true, hitl: true, type, reason },
  };
}

async function resolveAction(actionId, body) {
  const decision = body.decision === 'reject' ? 'reject' : 'approve';
  const note = String(body.note || '').trim();
  const { rows } = await pool.query(
    `SELECT id, "actionKey", "metaJson" FROM "AuditAction" WHERE id = $1 LIMIT 1`,
    [actionId],
  );
  if (!rows.length) {
    return { status: 404, body: { ok: false, error: 'action_not_found' } };
  }
  const row = rows[0];
  const meta =
    row.metaJson && typeof row.metaJson === 'object' ? { ...row.metaJson } : {};
  if (meta.resolved === true) {
    return {
      status: 409,
      body: { ok: false, error: 'already_resolved', resolution: meta.resolution },
    };
  }
  const resolution = {
    decision,
    note: note || undefined,
    resolvedAt: new Date().toISOString(),
    resolvedVia: 'telegram',
  };
  meta.resolved = true;
  meta.resolution = resolution;
  await pool.query(`UPDATE "AuditAction" SET "metaJson" = $2::jsonb WHERE id = $1`, [
    actionId,
    JSON.stringify(meta),
  ]);
  const resolutionId = randomUUID();
  await pool.query(
    `INSERT INTO "AuditAction"
       (id, "createdAt", "actionKey", "actionLabel", "sourceType", "sourceId", note, "metaJson")
     VALUES ($1, NOW(), $2, $3, 'operator', $4, $5, $6::jsonb)`,
    [
      resolutionId,
      decision === 'approve' ? 'hive.approve' : 'hive.reject',
      `Operator ${decision}: ${row.actionKey}`,
      actionId,
      note || `Resolved via hive bridge (${decision})`,
      JSON.stringify({ kind: 'resolution', actionId, resolution }),
    ],
  );
  return {
    status: 200,
    body: {
      ok: true,
      actionId,
      decision,
      resolutionId,
      hitl: true,
      note: 'Ledger updated — money-touching sends still require CE /pro UI',
    },
  };
}

async function emitLeadEvent(body) {
  const leadId = body.leadId || body.id || body.lead_id;
  const name = body.name || body.contactName || body.title;
  const email = body.email || body.contactEmail || '';
  const status = body.status || 'new';
  const source = body.source || 'client-engine';
  const correlationId =
    body.correlationId || `ce-lead-${Date.now()}-${String(leadId || randomUUID()).slice(0, 8)}`;

  if (!leadId && !name && !email) {
    return {
      status: 400,
      body: { ok: false, error: 'leadId_or_name_or_email_required' },
    };
  }

  if (!hiveWebhookSecret) {
    return {
      status: 503,
      body: { ok: false, error: 'HIVE_WEBHOOK_SECRET_not_configured' },
    };
  }

  const payload = {
    route: 'ce-lead-notify',
    correlationId,
    sourceRepo: 'client-engine',
    payload: {
      leadId: leadId || 'unknown',
      name: name || 'Unknown',
      email,
      status,
      source,
      correlationId,
    },
  };

  const res = await fetch(`${n8nWebhookBase}/hive-ecosystem-route`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Hive-Secret': hiveWebhookSecret,
    },
    body: JSON.stringify(payload),
  });

  let routed = {};
  try {
    routed = await res.json();
  } catch {
    routed = { ok: res.ok };
  }

  if (!res.ok) {
    return {
      status: 502,
      body: {
        ok: false,
        error: 'ecosystem_route_failed',
        correlationId,
        status: res.status,
        detail: routed,
      },
    };
  }

  return {
    status: 202,
    body: {
      ok: true,
      correlationId,
      routed: true,
      route: 'ce-lead-notify',
      ecosystem: routed,
      note: 'Notify-only — approve/send on /pro (Tier 3)',
    },
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (req.method === 'GET' && (path === '/healthz' || path === '/api/hive/health')) {
      return json(res, 200, { ok: true, service: 'ce-hive-bridge' });
    }

    if (!assertAuth(req, res)) return;

    if (req.method === 'GET' && path === '/api/hive/actions') {
      const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 10));
      const actions = await listActions(limit);
      return json(res, 200, { actions });
    }

    if (req.method === 'GET' && path === '/api/hive/leads') {
      const q = url.searchParams.get('q')?.trim() || '';
      const hits = await listLeads(q, 20);
      return json(res, 200, { hits });
    }

    if (req.method === 'POST' && path === '/api/hive/leads/event') {
      const body = await readBody(req);
      if (body === null) return json(res, 400, { ok: false, error: 'invalid_json' });
      const out = await emitLeadEvent(body);
      return json(res, out.status, out.body);
    }

    if (req.method === 'POST' && path === '/api/hive/notes') {
      const body = await readBody(req);
      if (body === null) return json(res, 400, { ok: false, error: 'invalid_json' });
      const out = await createNote(body);
      return json(res, out.status, out.body);
    }

    if (req.method === 'POST' && path === '/api/hive/actions/queue') {
      const body = await readBody(req);
      if (body === null) return json(res, 400, { ok: false, error: 'invalid_json' });
      const out = await queueAction(body);
      return json(res, out.status, out.body);
    }

    const resolveMatch = /^\/api\/hive\/actions\/([^/]+)\/resolve$/.exec(path);
    if (req.method === 'POST' && resolveMatch) {
      const body = await readBody(req);
      if (body === null) return json(res, 400, { ok: false, error: 'invalid_json' });
      const out = await resolveAction(resolveMatch[1], body);
      return json(res, out.status, out.body);
    }

    return json(res, 404, { ok: false, error: 'not_found', path });
  } catch (e) {
    console.error(e);
    return json(res, 500, {
      ok: false,
      error: e instanceof Error ? e.message : 'server_error',
    });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`ce-hive-bridge on :${port} auth=${token ? 'on' : 'off'}`);
});
