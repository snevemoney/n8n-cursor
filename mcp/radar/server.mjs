#!/usr/bin/env node
/**
 * LightningFlow AI - Radar Audit MCP Server
 * 
 * Provides tools for quick depreciation checks and dead letter triage
 * from within Cursor IDE.
 */

import process from "node:process";

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY");
  process.exit(1);
}

async function querySupabase(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase query failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

// MCP tool implementations
const tools = new Map([
  ["radar_audit_now", async ({ env = "local" }) => {
    try {
      const [
        staleWorkflows,
        credentialIssues,
        deadLetters,
        jobsBloat,
        staleInvoices,
        memoryBloat
      ] = await Promise.all([
        querySupabase('SELECT count(*) as count FROM v_stale_workflows'),
        querySupabase('SELECT count(*) as count FROM v_credential_issues'),
        querySupabase('SELECT coalesce(sum(dl_count), 0) as count FROM v_deadletters_backlog'),
        querySupabase('SELECT old_jobs, old_results FROM v_jobs_bloat'),
        querySupabase('SELECT count(*) as count FROM v_invoices_stale'),
        querySupabase('SELECT entries_90d_plus as count FROM v_memory_bloat')
      ]);

      const staleWfCount = staleWorkflows[0]?.count || 0;
      const credIssuesCount = credentialIssues[0]?.count || 0;
      const dlCount = deadLetters[0]?.count || 0;
      const oldJobsCount = jobsBloat[0]?.old_jobs || 0;
      const staleInvoicesCount = staleInvoices[0]?.count || 0;
      const memoryBloatCount = memoryBloat[0]?.count || 0;

      // Calculate score
      let score = 0;
      if (staleWfCount > 10) score += 25;
      else if (staleWfCount > 5) score += 15;
      else if (staleWfCount > 0) score += 5;

      if (credIssuesCount > 5) score += 25;
      else if (credIssuesCount > 2) score += 15;
      else if (credIssuesCount > 0) score += 10;

      if (dlCount > 100) score += 25;
      else if (dlCount > 50) score += 15;
      else if (dlCount > 10) score += 10;

      if (oldJobsCount > 1000) score += 15;
      else if (oldJobsCount > 500) score += 10;
      else if (oldJobsCount > 100) score += 5;

      if (memoryBloatCount > 1000) score += 10;
      else if (memoryBloatCount > 500) score += 5;

      const severity = score > 50 ? 'critical' : score > 25 ? 'warning' : 'ok';

      return {
        env,
        score,
        severity,
        metrics: {
          stale_workflows: staleWfCount,
          credential_issues: credIssuesCount,
          dead_letters: dlCount,
          old_jobs: oldJobsCount,
          stale_invoices: staleInvoicesCount,
          memory_bloat: memoryBloatCount
        },
        summary: `${severity.toUpperCase()}: Score ${score}/100 - ${staleWfCount} stale workflows, ${credIssuesCount} cred issues, ${dlCount} dead letters`
      };
    } catch (error) {
      throw new Error(`Radar audit failed: ${error.message}`);
    }
  }],

  ["radar_list_deadletters", async ({ limit = 20, env = null }) => {
    try {
      let sql = 'SELECT id, workflow, env, node, error, created_at, retriable FROM dead_letters';
      const params = [];
      
      if (env) {
        sql += ' WHERE env = $1';
        params.push(env);
      }
      
      sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
      params.push(limit);

      const deadLetters = await querySupabase(sql, params);
      
      return {
        count: deadLetters.length,
        dead_letters: deadLetters.map(dl => ({
          id: dl.id,
          workflow: dl.workflow,
          env: dl.env,
          node: dl.node,
          error: dl.error?.substring(0, 100) + (dl.error?.length > 100 ? '...' : ''),
          created_at: dl.created_at,
          retriable: dl.retriable,
          age_hours: Math.round((Date.now() - new Date(dl.created_at).getTime()) / (1000 * 60 * 60))
        }))
      };
    } catch (error) {
      throw new Error(`Failed to list dead letters: ${error.message}`);
    }
  }],

  ["radar_credential_health", async () => {
    try {
      const credentialIssues = await querySupabase(`
        SELECT name, type, issue_type, age, uses_30d 
        FROM v_credential_issues 
        ORDER BY age DESC, uses_30d ASC
      `);

      return {
        total_issues: credentialIssues.length,
        by_type: credentialIssues.reduce((acc, cred) => {
          acc[cred.issue_type] = (acc[cred.issue_type] || 0) + 1;
          return acc;
        }, {}),
        critical: credentialIssues.filter(c => c.issue_type === 'duplicate_name' || c.age > 90),
        details: credentialIssues
      };
    } catch (error) {
      throw new Error(`Failed to check credential health: ${error.message}`);
    }
  }],

  ["radar_workflow_health", async () => {
    try {
      const staleWorkflows = await querySupabase(`
        SELECT name, active, last_run_at, age, status
        FROM v_stale_workflows 
        ORDER BY age DESC
      `);

      return {
        total_stale: staleWorkflows.length,
        active_stale: staleWorkflows.filter(w => w.status === 'active_stale').length,
        inactive_stale: staleWorkflows.filter(w => w.status === 'inactive_stale').length,
        oldest: staleWorkflows[0] ? {
          name: staleWorkflows[0].name,
          age_days: Math.round(staleWorkflows[0].age / (1000 * 60 * 60 * 24))
        } : null,
        workflows: staleWorkflows.map(w => ({
          name: w.name,
          active: w.active,
          age_days: Math.round(w.age / (1000 * 60 * 60 * 24)),
          status: w.status
        }))
      };
    } catch (error) {
      throw new Error(`Failed to check workflow health: ${error.message}`);
    }
  }]
]);

// MCP JSON-RPC over stdio
process.stdin.setEncoding("utf8");
let buffer = "";

process.stdin.on("data", async (chunk) => {
  buffer += chunk;
  let newlineIndex;
  
  while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, newlineIndex);
    buffer = buffer.slice(newlineIndex + 1);
    
    if (!line.trim()) continue;
    
    try {
      const request = JSON.parse(line);
      const tool = tools.get(request.method);
      
      if (!tool) {
        process.stdout.write(JSON.stringify({
          id: request.id,
          error: { message: `Unknown method: ${request.method}` }
        }) + "\n");
        continue;
      }
      
      const result = await tool(request.params || {});
      process.stdout.write(JSON.stringify({
        id: request.id,
        result
      }) + "\n");
      
    } catch (error) {
      process.stdout.write(JSON.stringify({
        id: request.id,
        error: { message: error.message }
      }) + "\n");
    }
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  process.exit(0);
});

process.on("SIGTERM", () => {
  process.exit(0);
});
