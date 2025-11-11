'use client';

import { Panel } from '@/components/scorpion/Panel';
import { LoadingState } from '@/components/scorpion';

export default function OpsLoading() {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-[#0a0d10] via-[#0c1014] to-[#0a0d10]">
      <div className="p-3 md:p-6 space-y-4 md:space-y-6 min-w-0">
        <Panel>
          <LoadingState variant="skeleton" skeletonLines={5} text="Loading operations..." />
        </Panel>
      </div>
    </div>
  );
}

