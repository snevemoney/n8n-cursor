import React from 'react';

interface MetricProps {
  label: string;
  value: string | number;
  valueColor?: string;
  hint?: string;
  className?: string;
}

export function Metric({ label, value, valueColor, hint, className = '' }: MetricProps) {
  return (
    <div className={`sc-panel px-4 py-3 ${className}`}>
      <div className="sc-title mb-1.5">{label}</div>
      <div className={`text-2xl font-semibold ${valueColor || 'text-white'}`}>{value}</div>
      {hint && <div className="text-[10px] text-white/30 mt-1">{hint}</div>}
    </div>
  );
}

