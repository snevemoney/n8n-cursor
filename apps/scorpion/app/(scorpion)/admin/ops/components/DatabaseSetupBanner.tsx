'use client';

/**
 * Database Setup Banner
 * Shows when database tables are missing
 */

import { Alert } from '@/components/scorpion';
import { Database } from 'lucide-react';

export function DatabaseSetupBanner() {
  return (
    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
      <div className="flex items-start gap-3">
        <Database className="h-5 w-5 text-yellow-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-300 mb-1">
            Database Tables Not Created
          </h3>
          <p className="text-xs text-white/70 mb-3">
            The governance and migration tables need to be created in your database.
          </p>
          <div className="bg-black/30 rounded p-3 font-mono text-xs text-white/90">
            <div className="mb-1">Run the migration script:</div>
            <code className="block">
              pnpm tsx scripts/migrate-cost-tracking.ts
            </code>
            <div className="mt-2 text-white/60 text-[10px]">
              Make sure DATABASE_URL is set in your environment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





