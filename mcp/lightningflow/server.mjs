#!/usr/bin/env node
/**
 * LightningFlow AI - Lightning Operations MCP Server
 * 
 * Provides tools for Lightning operations (invoices, payouts, liquidity)
 * from within Cursor IDE.
 */

import process from "node:process";
import { createHash } from "node:crypto";

const { 
  LNFLOW_ENV = "local",
  LN_BACKEND = "lnbits",
  LNBITS_BASE_URL,
  LNBITS_API_KEY,
  LND_REST_URL,
  LND_MACAROON,
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  SLACK_WEBHOOK_URL
} = process.env;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY");
  process.exit(1);
}

// Lightning backend validation
if (LN_BACKEND === "lnbits" && (!LNBITS_BASE_URL || !LNBITS_API_KEY)) {
  console.error("❌ Missing LNbits env vars: LNBITS_BASE_URL, LNBITS_API_KEY");
  process.exit(1);
}

if (LN_BACKEND === "lnd" && (!LND_REST_URL || !LND_MACAROON)) {
  console.error("❌ Missing LND env vars: LND_REST_URL, LND_MACAROON");
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

async function callLightningAPI(endpoint, options = {}) {
  let url, headers, body;
  
  switch (LN_BACKEND) {
    case "lnbits":
      url = `${LNBITS_BASE_URL}${endpoint}`;
      headers = { 
        'X-Api-Key': LNBITS_API_KEY,
        'Content-Type': 'application/json',
        ...options.headers
      };
      break;
      
    case "lnd":
      url = `${LND_REST_URL}${endpoint}`;
      headers = { 
        'Grpc-Metadata-macaroon': LND_MACAROON,
        'Content-Type': 'application/json',
        ...options.headers
      };
      break;
      
    default:
      throw new Error(`Unsupported LN_BACKEND: ${LN_BACKEND}`);
  }
  
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${LN_BACKEND} API call failed: ${response.status} ${errorText}`);
  }
  
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.text();
}

function generateIdempotencyKey(payerRef, amountSats, memo = '') {
  const dateBucket = new Date().toISOString().slice(0, 10);
  const key = `${payerRef}:${amountSats}:${memo}:${dateBucket}`;
  return createHash('sha256').update(key).digest('hex');
}

// MCP tool implementations
const tools = new Map([
  ["ln_create_invoice", async ({ amount_sats, memo, payer_ref, expiry_secs = 3600 }) => {
    try {
      const ext_id = generateIdempotencyKey(payer_ref, amount_sats, memo);
      
      // Check if invoice already exists
      const existing = await querySupabase(
        'SELECT id, bolt11, payment_hash, status FROM invoices WHERE ext_id = $1',
        [ext_id]
      );
      
      if (existing.length > 0 && existing[0].status === 'pending') {
        return { 
          ...existing[0], 
          ext_id,
          action: 'existing',
          message: 'Invoice already exists and is pending'
        };
      }
      
      // Create invoice via Lightning backend
      let lightningResponse;
      switch (LN_BACKEND) {
        case "lnbits":
          lightningResponse = await callLightningAPI('/api/v1/payments', {
            method: 'POST',
            body: {
              out: false,
              amount: amount_sats,
              memo: memo || `Invoice for ${payer_ref}`,
              expiry: expiry_secs,
              unhashed_description: ext_id
            }
          });
          break;
          
        case "lnd":
          lightningResponse = await callLightningAPI('/v1/invoices', {
            method: 'POST',
            body: {
              value: amount_sats,
              memo: memo || `Invoice for ${payer_ref}`,
              expiry: expiry_secs
            }
          });
          break;
      }
      
      // Extract common fields
      const bolt11 = lightningResponse.payment_request || lightningResponse.bolt11;
      const payment_hash = lightningResponse.payment_hash || lightningResponse.r_hash;
      const expires_at = new Date(Date.now() + (expiry_secs * 1000)).toISOString();
      
      // Store in database
      const insertResult = await querySupabase(`
        INSERT INTO invoices (ext_id, msat, memo, status, flow, env, payer, hash, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [ext_id, amount_sats * 1000, memo, 'pending', 'mcp-create', LNFLOW_ENV, payer_ref, payment_hash, new Date().toISOString()]);
      
      return {
        ext_id,
        bolt11,
        payment_hash,
        expires_at,
        amount_sats,
        memo,
        payer_ref,
        invoice_id: insertResult[0].id,
        action: 'created',
        message: 'Invoice created successfully'
      };
      
    } catch (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }],

  ["ln_get_invoice_status", async ({ payment_hash, ext_id }) => {
    try {
      let query, params;
      
      if (payment_hash) {
        query = 'SELECT * FROM invoices WHERE hash = $1';
        params = [payment_hash];
      } else if (ext_id) {
        query = 'SELECT * FROM invoices WHERE ext_id = $1';
        params = [ext_id];
      } else {
        throw new Error('Either payment_hash or ext_id must be provided');
      }
      
      const invoices = await querySupabase(query, params);
      
      if (invoices.length === 0) {
        return { found: false, message: 'Invoice not found' };
      }
      
      const invoice = invoices[0];
      
      // Get Lightning backend status if available
      let lightningStatus = null;
      try {
        if (LN_BACKEND === "lnbits") {
          lightningStatus = await callLightningAPI(`/api/v1/payments/${invoice.hash}`);
        } else if (LN_BACKEND === "lnd") {
          lightningStatus = await callLightningAPI(`/v1/invoices/${invoice.hash}`);
        }
      } catch (error) {
        console.warn(`Could not fetch Lightning status: ${error.message}`);
      }
      
      return {
        found: true,
        invoice: {
          id: invoice.id,
          ext_id: invoice.ext_id,
          status: invoice.status,
          amount_sats: Math.floor(invoice.msat / 1000),
          memo: invoice.memo,
          bolt11: invoice.bolt11,
          payment_hash: invoice.hash,
          created_at: invoice.created_at,
          paid_at: invoice.paid_at,
          preimage: invoice.preimage
        },
        lightning_status: lightningStatus,
        env: invoice.env
      };
      
    } catch (error) {
      throw new Error(`Failed to get invoice status: ${error.message}`);
    }
  }],

  ["ln_pay_invoice", async ({ bolt11, max_fee_sats = 500 }) => {
    try {
      // Validate bolt11 format
      if (!bolt11.startsWith('lnbc')) {
        throw new Error('Invalid bolt11 invoice format');
      }
      
      // Check if we've already paid this invoice
      const existing = await querySupabase(
        'SELECT id, status FROM settlements WHERE kind = $1 AND tx_ref = $2',
        ['payment', bolt11]
      );
      
      if (existing.length > 0) {
        return {
          action: 'already_paid',
          settlement_id: existing[0].id,
          message: 'Invoice already paid'
        };
      }
      
      // Pay via Lightning backend
      let paymentResult;
      switch (LN_BACKEND) {
        case "lnbits":
          paymentResult = await callLightningAPI('/api/v1/payments', {
            method: 'POST',
            body: {
              out: true,
              bolt11: bolt11,
              max_fee: max_fee_sats
            }
          });
          break;
          
        case "lnd":
          paymentResult = await callLightningAPI('/v1/channels/transactions', {
            method: 'POST',
            body: {
              payment_request: bolt11,
              fee_limit: { fixed: max_fee_sats }
            }
          });
          break;
      }
      
      // Store settlement record
      const settlementResult = await querySupabase(`
        INSERT INTO settlements (kind, sats, fee_sats, tx_ref, created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, ['payment', paymentResult.amount || 0, paymentResult.fee || 0, bolt11, new Date().toISOString()]);
      
      return {
        action: 'paid',
        settlement_id: settlementResult[0].id,
        payment_hash: paymentResult.payment_hash,
        fee_sats: paymentResult.fee || 0,
        message: 'Payment successful'
      };
      
    } catch (error) {
      throw new Error(`Failed to pay invoice: ${error.message}`);
    }
  }],

  ["ln_liquidity_check", async () => {
    try {
      // Get channel information from Lightning backend
      let channels = [];
      
      if (LN_BACKEND === "lnbits") {
        // LNbits doesn't provide channel info, return basic status
        const balance = await callLightningAPI('/api/v1/wallet');
        channels = [{
          id: 'lnbits-wallet',
          local_balance: balance.balance || 0,
          remote_balance: 0,
          capacity: balance.balance || 0,
          inbound: balance.balance || 0,
          outbound: 0
        }];
      } else if (LN_BACKEND === "lnd") {
        const channelsResponse = await callLightningAPI('/v1/channels');
        channels = channelsResponse.channels.map(ch => ({
          id: ch.chan_id,
          local_balance: ch.local_balance,
          remote_balance: ch.remote_balance,
          capacity: ch.capacity,
          inbound: ch.remote_balance,
          outbound: ch.local_balance
        }));
      }
      
      // Calculate totals
      const totalInbound = channels.reduce((sum, ch) => sum + ch.inbound, 0);
      const totalOutbound = channels.reduce((sum, ch) => sum + ch.outbound, 0);
      const totalCapacity = channels.reduce((sum, ch) => sum + ch.capacity, 0);
      
      return {
        channels: channels.length,
        total_inbound_sats: totalInbound,
        total_outbound_sats: totalOutbound,
        total_capacity_sats: totalCapacity,
        utilization_percent: totalCapacity > 0 ? Math.round((totalOutbound / totalCapacity) * 100) : 0,
        channel_details: channels
      };
      
    } catch (error) {
      throw new Error(`Failed to check liquidity: ${error.message}`);
    }
  }],

  ["ln_health", async () => {
    try {
      const checks = {};
      
      // Check Lightning backend
      try {
        if (LN_BACKEND === "lnbits") {
          const status = await callLightningAPI('/api/v1/info');
          checks.lightning = { status: 'ok', version: status.version };
        } else if (LN_BACKEND === "lnd") {
          const status = await callLightningAPI('/v1/info');
          checks.lightning = { status: 'ok', version: status.version };
        }
      } catch (error) {
        checks.lightning = { status: 'error', error: error.message };
      }
      
      // Check database
      try {
        const dbStatus = await querySupabase('SELECT 1 as test');
        checks.database = { status: 'ok' };
      } catch (error) {
        checks.database = { status: 'error', error: error.message };
      }
      
      // Check environment
      checks.environment = {
        env: LNFLOW_ENV,
        backend: LN_BACKEND,
        timestamp: new Date().toISOString()
      };
      
      const overallStatus = Object.values(checks).every(check => check.status === 'ok') ? 'healthy' : 'degraded';
      
      return {
        status: overallStatus,
        checks,
        message: overallStatus === 'healthy' ? 'All systems operational' : 'Some systems degraded'
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
