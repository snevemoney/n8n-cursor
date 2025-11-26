import React from 'react';

interface LogRowProps {
  time: string;
  text: string;
  level?: 'info' | 'warn' | 'error';
}

export function LogRow({ time, text, level }: LogRowProps) {
  const color = level === 'error' ? 'text-red-300' : level === 'warn' ? 'text-yellow-300' : '';
  return (
    <div className="px-3 py-2 flex gap-3 border-b border-white/5 last:border-0">
      <div className="text-[10px] text-white/30 w-32 sc-mono">{time}</div>
      <div className={`text-xs ${color}`}>{text}</div>
    </div>
  );
}

