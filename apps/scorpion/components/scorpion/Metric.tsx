import React from 'react';

interface MetricProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function Metric({ label, value, hint, className = '' }: MetricProps) {
  return (
    <div className={`sc-panel px-3 py-2 ${className}`}>
      <div className="sc-title mb-1">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {hint && <div className="text-[10px] text-white/30 mt-1">{hint}</div>}
    </div>
  );
}

