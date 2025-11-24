// Access Logs API

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

/**
 * GET /api/governance/access-logs - List access logs (paginated)
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const assetId = searchParams.get('assetId');
  const action = searchParams.get('action');
  const result = searchParams.get('result');
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  let queryStr = 'SELECT * FROM access_logs WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (userId) {
    queryStr += ` AND actor_user_id = $${paramIndex++}`;
    params.push(userId);
  }

  if (assetId) {
    queryStr += ` AND asset_id = $${paramIndex++}`;
    params.push(assetId);
  }

  if (action) {
    queryStr += ` AND action = $${paramIndex++}`;
    params.push(action);
  }

  if (result) {
    queryStr += ` AND result = $${paramIndex++}`;
    params.push(result);
  }

  queryStr += ` ORDER BY timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const resultData = await query(queryStr, params);

  // Get total count
  const countQuery = queryStr.replace(/ORDER BY.*$/, '').replace(/LIMIT.*$/, '');
  const countResult = await query(
    countQuery.replace('SELECT *', 'SELECT COUNT(*) as total'),
    params.slice(0, -2) // Remove limit and offset
  );
  const total = parseInt(countResult.rows[0]?.total || '0', 10);

  return createSuccessResponse({
    logs: resultData.rows,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
});

