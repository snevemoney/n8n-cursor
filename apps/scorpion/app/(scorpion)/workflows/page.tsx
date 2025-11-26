'use client';

import dynamic from 'next/dynamic';

// Dynamically import the client component with SSR disabled to prevent hydration errors
// Optimized loading state for faster perceived performance
const WorkflowsClient = dynamic(
  () => import('./WorkflowsClient').then(mod => ({ default: mod.WorkflowsClient })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-white/40 animate-pulse">Loading workflows...</div>
      </div>
    )
  }
);

export default function WorkflowsPage() {
  // Direct render - dynamic import handles SSR prevention
  return <WorkflowsClient />;
}
