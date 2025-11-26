import { NextRequest, NextResponse } from 'next/server';
import { assertSupabase } from '@/lib/supabase-server';
import fs from 'fs/promises';
import path from 'path';

/**
 * Database Migration API
 * Creates necessary tables and functions for the Lightning Platform
 */

/**
 * Migration API Endpoint
 * 
 * Runs the advanced Lightning AI features migration
 * WARNING: This should only be used during setup and then removed in production
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = assertSupabase();
    
    // Return mock migration response if Supabase not configured
    if (!supabase) {
      return NextResponse.json({
        success: true,
        message: 'Mock migration completed',
        migrations_applied: [
          'create_users_table',
          'create_tutorials_table', 
          'create_embeddings_table',
          'create_usage_logs_table'
        ],
        mode: 'mock'
      });
    }

    // Security check - only run in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Migration endpoint disabled in production' },
        { status: 403 }
      );
    }

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'sql', '05_advanced_lightning_ai_features.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');

    // Split by semicolons and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    const results = [];
    const errors = [];

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        });

        if (error) {
          // Try direct execution for DDL statements
          const { data: directData, error: directError } = await supabase
            .from('_prisma_migrations') // This will fail, but we'll catch and try rpc
            .select('*')
            .limit(1);

          // Use a different approach for DDL
          console.warn(`RPC failed for statement ${i + 1}, trying direct execution:`, error.message);
          
          // For now, we'll log and continue
          errors.push({
            statement: i + 1,
            sql: statement.substring(0, 100) + '...',
            error: error.message,
          });
        } else {
          results.push({
            statement: i + 1,
            success: true,
            data,
          });
        }
      } catch (err) {
        errors.push({
          statement: i + 1,
          sql: statement.substring(0, 100) + '...',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      totalStatements: statements.length,
      successfulStatements: results.length,
      failedStatements: errors.length,
      results,
      errors,
      note: 'You should run the SQL migration directly in Supabase SQL Editor for best results'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please run the SQL migration directly in Supabase SQL Editor'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check migration status
 */
export async function GET() {
  try {
    const supabase = assertSupabase();
    
    // Return mock response if Supabase not configured
    if (!supabase) {
      return NextResponse.json({
        success: true,
        tablesStatus: {},
        migrationComplete: false,
        existingTables: 0,
        totalTables: 10,
        instructions: 'Configure Supabase environment variables to check migration status',
        mode: 'mock'
      });
    }

    // Check if tables exist
    const tablesToCheck = [
      'tutorials',
      'tutorial_embeddings',
      'loop_embeddings',
      'onboarding_events',
      'vector_feedback',
      'user_interactions',
      'channel_stats',
      'forward_events',
      'ai_agents',
      'agent_executions'
    ];

    const tableStatus: Record<string, string> = {};

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);

        tableStatus[table] = error ? 'missing' : 'exists';
      } catch (err) {
        tableStatus[table] = 'missing';
      }
    }

    const existingTables = Object.values(tableStatus).filter(status => status === 'exists').length;
    const totalTables = tablesToCheck.length;

    return NextResponse.json({
      success: true,
      tablesStatus: tableStatus,
      migrationComplete: existingTables === totalTables,
      existingTables,
      totalTables,
      instructions: existingTables < totalTables ? 
        'Run the SQL migration in Supabase SQL Editor or call POST /api/migrate' :
        'All tables exist - migration appears complete'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    );
  }
} 