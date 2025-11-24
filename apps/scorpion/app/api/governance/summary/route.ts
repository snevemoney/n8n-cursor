// Governance Summary API
// Returns summary statistics for the Operations Console

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

/**
 * GET /api/governance/summary - Get governance summary statistics
 */
export const GET = withErrorHandling(async () => {
  // Get total data assets
  const assetsResult = await query('SELECT COUNT(*) as count FROM data_assets');
  const totalAssets = parseInt(assetsResult.rows[0]?.count || '0', 10);

  // Get active policies
  const policiesResult = await query(
    "SELECT COUNT(*) as count FROM governance_policies WHERE enabled = TRUE"
  );
  const activePolicies = parseInt(policiesResult.rows[0]?.count || '0', 10);

  // Get access logs in last 24 hours
  const logsResult = await query(
    `SELECT COUNT(*) as count FROM access_logs 
     WHERE timestamp > NOW() - INTERVAL '24 hours'`
  );
  const accessLogs24h = parseInt(logsResult.rows[0]?.count || '0', 10);

  // Get retention rules
  const retentionResult = await query(
    "SELECT COUNT(*) as count FROM retention_rules WHERE enabled = TRUE"
  );
  const retentionRules = parseInt(retentionResult.rows[0]?.count || '0', 10);

  // Get recent denied access attempts (last 24h)
  const deniedResult = await query(
    `SELECT COUNT(*) as count FROM access_logs 
     WHERE result = 'denied' AND timestamp > NOW() - INTERVAL '24 hours'`
  );
  const denied24h = parseInt(deniedResult.rows[0]?.count || '0', 10);

  return createSuccessResponse({
    totalAssets,
    activePolicies,
    accessLogs24h,
    retentionRules,
    denied24h,
  });
});

