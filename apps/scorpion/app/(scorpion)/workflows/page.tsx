'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the client component with SSR disabled to prevent hydration errors
const WorkflowsClient = dynamic(
  () => import('./WorkflowsClient').then(mod => ({ default: mod.WorkflowsClient })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-white/40">Loading workflows...</div>
      </div>
    )
  }
);

export default function WorkflowsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null on server to prevent any server-side rendering
  if (typeof window === 'undefined') {
    return null;
  }

  // Don't render until mounted to prevent hydration errors
  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-white/40">Loading workflows...</div>
      </div>
    );
  }

  return <WorkflowsClient />;
}
