'use client';

import { ASCIILogo } from '@/components/scorpion';
import { Panel } from '@/components/scorpion';
import Link from 'next/link';

export default function ScorpionHomePage() {
  return (
    <div className="h-full flex items-center justify-center sc-grid-bg">
      <div className="max-w-2xl w-full space-y-8 p-8">
        {/* ASCII Logo */}
        <div className="flex justify-center">
          <div className="sc-mono text-[8px] leading-tight text-emerald-400/80 whitespace-pre">
            {`
    ...******..*****..*****..*****..*****..*****..*****..*****..*****.
    ..*****....*****....*****....*****....*****....*****....*****....*****.
    *****....*****....*****....*****....*****....*****....*****....*****.
    *****....*****....*****....*****....*****....*****....*****....*****.
    ...******..*****..*****..*****..*****..*****..*****..*****..*****.
            `.trim()}
          </div>
        </div>

        {/* System Status */}
        <Panel>
          <div className="text-center space-y-4">
            <div className="sc-title">System Status</div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="text-lg font-semibold">SCORPION // SYSTEM ONLINE</div>
            </div>
            <div className="text-sm text-white/40 sc-mono">Initializing operations console...</div>
          </div>
        </Panel>

        {/* Quick Access */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/ops" className="sc-panel p-4 hover:bg-white/5 transition-colors block">
            <div className="sc-title mb-2">Operations</div>
            <div className="text-sm text-white/70">Monitor agents & workflows</div>
          </Link>
          <Link href="/council" className="sc-panel p-4 hover:bg-white/5 transition-colors block">
            <div className="sc-title mb-2">Council</div>
            <div className="text-sm text-white/70">Multi-agent deliberation</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

