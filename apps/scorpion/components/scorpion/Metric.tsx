import React, { memo } from 'react';

interface MetricProps {
  label: string;
  value: string | number;
  valueColor?: string;
  hint?: string;
  className?: string;
}

export const Metric = memo(function Metric({ label, value, valueColor, hint, className = '' }: MetricProps) {
  return (
    <div className={`sc-panel px-3 py-2 md:px-4 md:py-3 min-w-0 ${className}`}>
      <div className="sc-title mb-1 md:mb-1.5">{label}</div>
      <div className={`text-xl md:text-2xl font-semibold ${valueColor || 'text-white'}`}>{value}</div>
      {hint && <div className="text-[9px] md:text-[10px] text-white/30 mt-1">{hint}</div>}
    </div>
  );
});

