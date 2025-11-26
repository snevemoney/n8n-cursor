'use client';

/**
 * Operations Console - Governance & Migrations
 * Power of 10 Rule 3: Simple tabbed layout
 */

import { useState, Suspense } from 'react';
import { GovernancePanel } from './components/GovernancePanel';
import { MigrationPanel } from './components/MigrationPanel';
import { LoadingState } from '@/components/scorpion';

export default function AdminOpsPage() {
  const [tab, setTab] = useState<'governance' | 'migration'>('governance');

  return (
    <main className="p-6 space-y-4 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Operations Console</h1>
          <p className="text-sm text-white/60 mt-1">
            Manage data governance policies and track modernization migrations
          </p>
        </div>
        <div className="inline-flex rounded-md border border-white/10 overflow-hidden">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'governance'
                ? 'bg-white/10 text-white'
                : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setTab('governance')}
          >
            Governance
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors border-l border-white/10 ${
              tab === 'migration'
                ? 'bg-white/10 text-white'
                : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setTab('migration')}
          >
            Migrations
          </button>
        </div>
      </header>

      <Suspense fallback={<LoadingState text="Loading..." skeletonLines={3} />}>
        {tab === 'governance' ? <GovernancePanel /> : <MigrationPanel />}
      </Suspense>
    </main>
  );
}

