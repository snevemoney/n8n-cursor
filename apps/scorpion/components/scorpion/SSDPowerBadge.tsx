'use client';

import { Zap, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SSDPowerBadgeProps {
  className?: string;
  showText?: boolean;
}

/**
 * SSDPowerBadge - Visual indicator that SSD mode is active
 * Shows a pulsing badge when SSD is detected - makes you feel powerful! ⚡
 */
export function SSDPowerBadge({ className = '', showText = false }: SSDPowerBadgeProps) {
  const [isSSD, setIsSSD] = useState(false);

  useEffect(() => {
    const checkSSD = async () => {
      try {
        const response = await fetch('/api/storage/status', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Only update state if SSD status actually changed
            setIsSSD((prevIsSSD) => {
              const newIsSSD = data.isSSD || false;
              return newIsSSD !== prevIsSSD ? newIsSSD : prevIsSSD;
            });
          }
        }
      } catch (error) {
        // Silent fail - keep existing state
      }
    };

    checkSSD();
    // Refresh every 60 seconds (less frequent to reduce unnecessary checks)
    const interval = setInterval(checkSSD, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isSSD) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-2 border-yellow-400/50 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 transition-all hover:scale-105 ${className}`}>
      <div className="relative">
        <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
        <Sparkles className="w-2.5 h-2.5 text-yellow-300 absolute -top-1 -right-1 animate-ping" />
      </div>
      {showText && (
        <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
          SUPER POWER
        </span>
      )}
    </div>
  );
}

