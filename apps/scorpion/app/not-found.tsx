'use client';

import Link from 'next/link';
import { Panel } from '@/components/scorpion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0d10] text-[#e4e8ee] flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <Panel>
          <div className="text-center space-y-4">
            <div className="sc-title">404 - Not Found</div>
            <div className="text-lg font-semibold">
              Page Not Found
            </div>
            <div className="text-sm text-white/40">
              The page you're looking for doesn't exist or has been moved.
            </div>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-sm text-sm hover:bg-emerald-500/30 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}

