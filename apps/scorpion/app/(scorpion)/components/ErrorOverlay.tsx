'use client';

import { useEffect, useState } from 'react';

interface ErrorOverlayProps {
  eventStream?: EventSource; // if you manage this externally, you can pass signals another way
}

interface Signal {
  id: string;
  message: string;
  type: string;
  severity: number;
  tag?: string;
}

export function ErrorOverlay() {
  const [signals, setSignals] = useState<Signal[]>([]);

  // You should wire this to your existing SSE client.
  // For now, provide a simple global dispatch hook via window.
  useEffect(() => {
    function onSignal(e: CustomEvent<Signal>) {
      setSignals((prev) => [e.detail, ...prev].slice(0, 5));
      setTimeout(() => {
        setSignals((current) => current.filter((s) => s.id !== e.detail.id));
      }, 8000);
    }

    // @ts-ignore
    window.__SCORPION_SIGNAL__ = (signal: Signal) => {
      const evt = new CustomEvent<Signal>('scorpion-signal', { detail: signal });
      window.dispatchEvent(evt);
    };

    window.addEventListener('scorpion-signal', onSignal as any);

    return () => {
      window.removeEventListener('scorpion-signal', onSignal as any);
    };
  }, []);

  if (!signals.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {signals.map((s) => (
        <div
          key={s.id}
          className="max-w-sm rounded-md border border-red-500/70 bg-black/80 text-xs text-neutral-100 p-3 shadow-lg"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold">
              {s.tag || 'Scorpion Alert'} (sev {s.severity})
            </span>
          </div>
          <p>{s.message}</p>
        </div>
      ))}
    </div>
  );
}

