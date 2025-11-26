/**
 * API Usage Analytics
 * Query API usage statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

/**
 * GET /api/gateway/usage - Get API usage statistics
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    if (!process.env['DATABASE_URL']) {
      return createSuccessResponse({
        message: 'Database not configured. Usage tracking unavailable.',
        usage: [],
      });
    }

    const { searchParams } = new URL(request.url);
    const apiKeyId = searchParams.get('apiKeyId');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (apiKeyId) {
      conditions.push(`api_key_id = $${paramIndex++}`);
      params.push(apiKeyId);
    }

    if (startTime) {
      conditions.push(`request_time >= $${paramIndex++}`);
      params.push(startTime);
    }

    if (endTime) {
      conditions.push(`request_time <= $${paramIndex++}`);
      params.push(endTime);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    params.push(limit);

    const usageQuery = `
      SELECT 
        id, api_key_id, endpoint, method, status_code,
        request_time, duration_ms, user_agent, ip_address
      FROM api_usage
      ${whereClause}
      ORDER BY request_time DESC
      LIMIT $${paramIndex}
    `;

    const result = await query(usageQuery, params);

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(DISTINCT api_key_id) as unique_keys,
        COUNT(DISTINCT endpoint) as unique_endpoints,
        AVG(duration_ms) as avg_duration_ms,
        SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count
      FROM api_usage
      ${whereClause}
    `;

    const summaryResult = await query(summaryQuery, params.slice(0, -1)); // Remove limit param

    return createSuccessResponse({
      usage: result.rows,
      summary: summaryResult.rows[0] || {},
      count: result.rows.length,
    });
  } catch (error: any) {
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to get usage statistics: ${error.message}`,
      { error: error.message },
      500
    );
  }
});

