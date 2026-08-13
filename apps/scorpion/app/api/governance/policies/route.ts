// Governance Policies API

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

const policySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  scope: z.enum(['global', 'project', 'tenant']),
  config: z.record(z.unknown()),
  enabled: z.boolean().optional(),
});

/**
 * GET /api/governance/policies - List all policies
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get('scope');
  const enabled = searchParams.get('enabled');

  let queryStr = 'SELECT * FROM governance_policies WHERE 1=1';
  const params: any[] = [];

  if (scope) {
    queryStr += ' AND scope = $' + (params.length + 1);
    params.push(scope);
  }

  if (enabled !== null) {
    queryStr += ' AND enabled = $' + (params.length + 1);
    params.push(enabled === 'true');
  }

  queryStr += ' ORDER BY created_at DESC';

  const result = await query(queryStr, params);

  return createSuccessResponse({
    policies: result.rows,
    count: result.rowCount,
  });
});

/**
 * POST /api/governance/policies - Create a new policy
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const validation = policySchema.safeParse(body);

  if (!validation.success) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Invalid policy data',
      validation.error.errors,
      400
    );
  }

  const { name, description, scope, config, enabled } = validation.data;

  const result = await query(
    `INSERT INTO governance_policies (id, name, description, scope, config_json, enabled)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [randomUUID(), name, description || null, scope, JSON.stringify(config), enabled !== false]
  );

  return createSuccessResponse(result.rows[0], 201);
});

/**
 * PUT /api/governance/policies/[id] - Update a policy
 */
export const PUT = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const policyId = searchParams.get('id');

  if (!policyId) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Policy ID required',
      [],
      400
    );
  }

  const body = await req.json();
  const validation = policySchema.partial().safeParse(body);

  if (!validation.success) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Invalid policy data',
      validation.error.errors,
      400
    );
  }

  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (validation.data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    params.push(validation.data.name);
  }
  if (validation.data.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    params.push(validation.data.description);
  }
  if (validation.data.scope !== undefined) {
    updates.push(`scope = $${paramIndex++}`);
    params.push(validation.data.scope);
  }
  if (validation.data.config !== undefined) {
    updates.push(`config_json = $${paramIndex++}`);
    params.push(JSON.stringify(validation.data.config));
  }
  if (validation.data.enabled !== undefined) {
    updates.push(`enabled = $${paramIndex++}`);
    params.push(validation.data.enabled);
  }

  if (updates.length === 0) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'No fields to update',
      [],
      400
    );
  }

  updates.push(`updated_at = NOW()`);
  params.push(policyId);

  const result = await query(
    `UPDATE governance_policies
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    return createErrorResponse(
      ApiErrorCode.NOT_FOUND,
      'Policy not found',
      [],
      404
    );
  }

  return createSuccessResponse(result.rows[0]);
});

