/**
 * Database Migration API Endpoint
 * Runs database migrations for events and cost tracking tables
 * 
 * GET /api/migrate - Check migration status
 * POST /api/migrate - Run migrations
 */

import { NextRequest, NextResponse } from 'next/server';
import { runMigration } from '../../../scripts/migrate-cost-tracking';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if tables exist
    const { query } = await import('../../../lib/db/client');
    
    const tables = [
      'events',
      'cost_resources',
      'cost_budgets',
      'cost_budget_vs_actual'
    ];
    
    const status: Record<string, boolean> = {};
    
    for (const table of tables) {
      try {
        await query(`SELECT 1 FROM ${table} LIMIT 1`);
        status[table] = true;
      } catch (error: any) {
        if (error.code === '42P01') {
          status[table] = false;
        } else {
          throw error;
        }
      }
    }
    
    const allExist = Object.values(status).every(exists => exists);
    
    return NextResponse.json({
      migrationComplete: allExist,
      tables: status
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Failed to check migration status',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await runMigration();
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Migration failed',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

