/**
 * Feedback Endpoint
 * POST /api/v1/feedback - Submit feedback on Scorpion's responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';
import { query } from '@/lib/db/client';
import { randomUUID } from 'crypto';
import { emitEvent } from '@/lib/events/event-bus';

const feedbackSchema = z.object({
  conversationId: z.string().optional(),
  messageId: z.string().optional(),
  rating: z.enum(['good', 'bad']),
  tags: z.array(z.string()).optional(),
  comment: z.string().optional(),
});

/**
 * POST /api/v1/feedback - Submit feedback
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, feedbackSchema);
  if (!validation.success) {
    return validation.error;
  }

  const { conversationId, messageId, rating, tags = [], comment } = validation.data;

  try {
    if (!process.env.DATABASE_URL) {
      // Fallback: just emit event
      await emitEvent({
        id: randomUUID(),
        type: 'feedback.received',
        severity: 'info',
        timestamp: new Date().toISOString(),
        source: 'feedback-endpoint',
        environment: 'dev',
        data: {
          conversationId,
          messageId,
          rating,
          tags,
          comment,
        },
      });

      return createSuccessResponse({
        message: 'Feedback received (not persisted - DATABASE_URL not set)',
      });
    }

    const insertQuery = `
      INSERT INTO chat_feedback (
        id, conversation_id, message_id, rating, tags, comment
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id::text
    `;

    const result = await query<{ id: string }>(insertQuery, [
      randomUUID(),
      conversationId || null,
      messageId || null,
      rating,
      JSON.stringify(tags),
      comment || null,
    ]);

    // Emit event
    await emitEvent({
      id: randomUUID(),
      type: 'feedback.received',
      severity: 'info',
      timestamp: new Date().toISOString(),
      source: 'feedback-endpoint',
      environment: 'dev',
      data: {
        feedbackId: result.rows[0]?.id,
        conversationId,
        messageId,
        rating,
        tags,
        comment,
      },
    });

    return createSuccessResponse({
      id: result.rows[0]?.id,
      message: 'Feedback received',
    }, 201);
  } catch (error: any) {
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to submit feedback: ${error.message}`,
      { error: error.message },
      500
    );
  }
});

/**
 * GET /api/v1/feedback - Get feedback summary
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    if (!process.env.DATABASE_URL) {
      return createSuccessResponse({
        message: 'Database not configured',
        summary: {},
      });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (conversationId) {
      conditions.push(`conversation_id = $${paramIndex++}`);
      params.push(conversationId);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    params.push(limit);

    // Get feedback summary
    const summaryQuery = `
      SELECT 
        rating,
        COUNT(*) as count,
        array_agg(DISTINCT tag) as tags
      FROM chat_feedback,
      LATERAL jsonb_array_elements_text(tags) as tag
      ${whereClause}
      GROUP BY rating
    `;

    const summaryResult = await query(summaryQuery, params.slice(0, -1));

    // Get recent feedback
    const recentQuery = `
      SELECT id, conversation_id, message_id, rating, tags, comment, created_at
      FROM chat_feedback
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex}
    `;

    const recentResult = await query(recentQuery, params);

    return createSuccessResponse({
      summary: summaryResult.rows,
      recent: recentResult.rows.map(row => ({
        ...row,
        tags: row.tags ? JSON.parse(row.tags as any) : [],
      })),
      count: recentResult.rows.length,
    });
  } catch (error: any) {
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to get feedback: ${error.message}`,
      { error: error.message },
      500
    );
  }
});

