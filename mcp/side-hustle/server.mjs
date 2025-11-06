#!/usr/bin/env node
/**
 * LightningFlow AI - Side-Hustle MCP Server
 * 
 * Provides tools for managing side-hustle workflows (e.g., voice agent → Google Sheets)
 * from within Cursor IDE.
 */

import process from "node:process";
import { createHmac } from "node:crypto";

const { 
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  SIDE_HUSTLE_ENABLED = "true"
} = process.env;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY");
  process.exit(1);
}

if (SIDE_HUSTLE_ENABLED !== "true") {
  console.error("❌ Side-hustle features are disabled");
  process.exit(1);
}

async function querySupabase(sql, params = []) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql, params })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase query failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

function verifyHmac(payload, signature, secret) {
  const expectedSignature = createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return expectedSignature === signature;
}

// MCP tool implementations
const tools = new Map([
  ["side_hustle_list_tenants", async ({ status = "active", limit = 20 }) => {
    try {
      const sql = `
        SELECT 
          id, name, slug, description, business_type, industry,
          contact_email, rate_limit_per_hour, rate_limit_per_day,
          created_at, status
        FROM tenants 
        WHERE status = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;
      
      const tenants = await querySupabase(sql, [status, limit]);
      
      return {
        count: tenants.length,
        tenants: tenants.map(t => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description,
          business_type: t.business_type,
          industry: t.industry,
          contact_email: t.contact_email,
          rate_limits: {
            per_hour: t.rate_limit_per_hour,
            per_day: t.rate_limit_per_day
          },
          created_at: t.created_at,
          status: t.status
        }))
      };
      
    } catch (error) {
      throw new Error(`Failed to list tenants: ${error.message}`);
    }
  }],

  ["side_hustle_create_tenant", async ({ 
    name, 
    slug, 
    description, 
    business_type, 
    industry, 
    contact_email, 
    contact_phone, 
    contact_name,
    rate_limit_per_hour = 1000,
    rate_limit_per_day = 10000
  }) => {
    try {
      // Validate required fields
      if (!name || !slug) {
        throw new Error('Name and slug are required');
      }
      
      // Check if slug already exists
      const existing = await querySupabase(
        'SELECT id FROM tenants WHERE slug = $1',
        [slug]
      );
      
      if (existing.length > 0) {
        throw new Error(`Tenant with slug '${slug}' already exists`);
      }
      
      // Create tenant using the function
      const result = await querySupabase(`
        SELECT create_tenant_with_defaults($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        name, slug, description, business_type, industry, 
        contact_email, contact_phone, contact_name
      ]);
      
      const tenantId = result[0].create_tenant_with_defaults;
      
      // Get the created tenant
      const tenant = await querySupabase(
        'SELECT * FROM tenants WHERE id = $1',
        [tenantId]
      );
      
      if (tenant.length === 0) {
        throw new Error('Failed to create tenant');
      }
      
      return {
        success: true,
        tenant_id: tenantId,
        message: `Tenant '${name}' created successfully with slug '${slug}'`,
        tenant: {
          id: tenant[0].id,
          name: tenant[0].name,
          slug: tenant[0].slug,
          description: tenant[0].description,
          business_type: tenant[0].business_type,
          industry: tenant[0].industry,
          contact_email: tenant[0].contact_email,
          rate_limits: {
            per_hour: tenant[0].rate_limit_per_hour,
            per_day: tenant[0].rate_limit_per_day
          },
          created_at: tenant[0].created_at
        }
      };
      
    } catch (error) {
      throw new Error(`Failed to create tenant: ${error.message}`);
    }
  }],

  ["side_hustle_get_mappings", async ({ tenant_id, tenant_slug }) => {
    try {
      let tenantId = tenant_id;
      
      // If slug provided, get tenant ID
      if (tenant_slug && !tenant_id) {
        const tenant = await querySupabase(
          'SELECT id FROM tenants WHERE slug = $1',
          [tenant_slug]
        );
        
        if (tenant.length === 0) {
          throw new Error(`Tenant with slug '${tenant_slug}' not found`);
        }
        
        tenantId = tenant[0].id;
      }
      
      if (!tenantId) {
        throw new Error('Either tenant_id or tenant_slug must be provided');
      }
      
      const mappings = await querySupabase(`
        SELECT 
          id, name, description, source_field, source_type, source_required,
          target_field, target_type, target_required, sort_order, created_at
        FROM mappings 
        WHERE tenant_id = $1
        ORDER BY sort_order, name
      `, [tenantId]);
      
      return {
        tenant_id: tenantId,
        count: mappings.length,
        mappings: mappings.map(m => ({
          id: m.id,
          name: m.name,
          description: m.description,
          source: {
            field: m.source_field,
            type: m.source_type,
            required: m.source_required
          },
          target: {
            field: m.target_field,
            type: m.target_type,
            required: m.target_required
          },
          sort_order: m.sort_order,
          created_at: m.created_at
        }))
      };
      
    } catch (error) {
      throw new Error(`Failed to get mappings: ${error.message}`);
    }
  }],

  ["side_hustle_create_job", async ({ 
    tenant_id, 
    tenant_slug, 
    job_type, 
    input_data, 
    webhook_signature = null,
    webhook_secret = null
  }) => {
    try {
      let tenantId = tenant_id;
      
      // If slug provided, get tenant ID
      if (tenant_slug && !tenant_id) {
        const tenant = await querySupabase(
          'SELECT id, webhook_secret FROM tenants WHERE slug = $1',
          [tenant_slug]
        );
        
        if (tenant.length === 0) {
          throw new Error(`Tenant with slug '${tenant_slug}' not found`);
        }
        
        tenantId = tenant[0].id;
        webhook_secret = webhook_secret || tenant[0].webhook_secret;
      }
      
      if (!tenantId) {
        throw new Error('Either tenant_id or tenant_slug must be provided');
      }
      
      if (!job_type) {
        throw new Error('Job type is required');
      }
      
      // Verify webhook signature if provided
      if (webhook_signature && webhook_secret) {
        if (!verifyHmac(input_data, webhook_signature, webhook_secret)) {
          throw new Error('Invalid webhook signature');
        }
      }
      
      // Check rate limits
      const tenant = await querySupabase(
        'SELECT rate_limit_per_hour, rate_limit_per_day FROM tenants WHERE id = $1',
        [tenantId]
      );
      
      if (tenant.length === 0) {
        throw new Error('Tenant not found');
      }
      
      const hourlyLimit = await querySupabase(`
        SELECT check_rate_limit($1, 'hourly', $2)
      `, [tenantId, tenant[0].rate_limit_per_hour]);
      
      if (!hourlyLimit[0].check_rate_limit) {
        return {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Hourly rate limit exceeded',
          retry_after: '1 hour'
        };
      }
      
      // Create job
      const job = await querySupabase(`
        INSERT INTO side_hustle_jobs (tenant_id, job_type, input_data, input_metadata)
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at
      `, [
        tenantId, 
        job_type, 
        JSON.stringify(input_data),
        JSON.stringify({
          webhook_signature: webhook_signature ? 'verified' : 'none',
          source: 'mcp',
          timestamp: new Date().toISOString()
        })
      ]);
      
      return {
        success: true,
        job_id: job[0].id,
        tenant_id: tenantId,
        job_type,
        status: 'pending',
        created_at: job[0].created_at,
        message: 'Job created successfully'
      };
      
    } catch (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }
  }],

  ["side_hustle_get_job_status", async ({ job_id }) => {
    try {
      if (!job_id) {
        throw new Error('Job ID is required');
      }
      
      const jobs = await querySupabase(`
        SELECT 
          j.*,
          t.name as tenant_name,
          t.slug as tenant_slug
        FROM side_hustle_jobs j
        JOIN tenants t ON j.tenant_id = t.id
        WHERE j.id = $1
      `, [job_id]);
      
      if (jobs.length === 0) {
        return { found: false, message: 'Job not found' };
      }
      
      const job = jobs[0];
      
      // Get results if any
      const results = await querySupabase(`
        SELECT * FROM side_hustle_results WHERE job_id = $1
      `, [job_id]);
      
      return {
        found: true,
        job: {
          id: job.id,
          tenant: {
            id: job.tenant_id,
            name: job.tenant_name,
            slug: job.tenant_slug
          },
          job_type: job.job_type,
          status: job.status,
          input_data: job.input_data,
          output_data: job.output_data,
          error_message: job.error_message,
          processing_time_ms: job.processing_time_ms,
          retry_count: job.retry_count,
          max_retries: job.max_retries,
          created_at: job.created_at,
          started_at: job.started_at,
          completed_at: job.completed_at
        },
        results: results.map(r => ({
          id: r.id,
          result_type: r.result_type,
          success: r.success,
          error_message: r.error_message,
          external_id: r.external_id,
          external_url: r.external_url,
          created_at: r.created_at
        }))
      };
      
    } catch (error) {
      throw new Error(`Failed to get job status: ${error.message}`);
    }
  }],

  ["side_hustle_get_rate_limit_status", async ({ tenant_id, tenant_slug }) => {
    try {
      let tenantId = tenant_id;
      
      // If slug provided, get tenant ID
      if (tenant_slug && !tenant_id) {
        const tenant = await querySupabase(
          'SELECT id FROM tenants WHERE slug = $1',
          [tenant_slug]
        );
        
        if (tenant.length === 0) {
          throw new Error(`Tenant with slug '${tenant_slug}' not found`);
        }
        
        tenantId = tenant[0].id;
      }
      
      if (!tenantId) {
        throw new Error('Either tenant_id or tenant_slug must be provided');
      }
      
      const status = await querySupabase(`
        SELECT * FROM v_rate_limit_status WHERE tenant_id = $1
      `, [tenantId]);
      
      if (status.length === 0) {
        return { found: false, message: 'Rate limit status not found' };
      }
      
      const rateStatus = status[0];
      
      return {
        found: true,
        tenant: {
          id: rateStatus.tenant_id,
          name: rateStatus.tenant_name
        },
        limits: {
          hourly: rateStatus.rate_limit_per_hour,
          daily: rateStatus.rate_limit_per_day
        },
        current_usage: {
          hourly: rateStatus.current_hourly_requests,
          daily: rateStatus.current_daily_requests
        },
        usage_percentages: {
          hourly: rateStatus.hourly_usage_percent,
          daily: rateStatus.daily_usage_percent
        },
        limits_exceeded: {
          hourly: rateStatus.hourly_limit_exceeded,
          daily: rateStatus.daily_limit_exceeded
        }
      };
      
    } catch (error) {
      throw new Error(`Failed to get rate limit status: ${error.message}`);
    }
  }],

  ["side_hustle_health", async () => {
    try {
      const checks = {};
      
      // Check database
      try {
        const dbStatus = await querySupabase('SELECT 1 as test');
        checks.database = { status: 'ok' };
      } catch (error) {
        checks.database = { status: 'error', error: error.message };
      }
      
      // Check tenants table
      try {
        const tenantCount = await querySupabase('SELECT COUNT(*) as count FROM tenants');
        checks.tenants = { 
          status: 'ok', 
          count: tenantCount[0].count 
        };
      } catch (error) {
        checks.tenants = { status: 'error', error: error.message };
      }
      
      // Check mappings table
      try {
        const mappingCount = await querySupabase('SELECT COUNT(*) as count FROM mappings');
        checks.mappings = { 
          status: 'ok', 
          count: mappingCount[0].count 
        };
      } catch (error) {
        checks.mappings = { status: 'error', error: error.message };
      }
      
      // Check jobs table
      try {
        const jobCount = await querySupabase('SELECT COUNT(*) as count FROM side_hustle_jobs');
        checks.jobs = { 
          status: 'ok', 
          count: jobCount[0].count 
        };
      } catch (error) {
        checks.jobs = { status: 'error', error: error.message };
      }
      
      const overallStatus = Object.values(checks).every(check => check.status === 'ok') ? 'healthy' : 'degraded';
      
      return {
        status: overallStatus,
        checks,
        message: overallStatus === 'healthy' ? 'All side-hustle systems operational' : 'Some systems degraded',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
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
