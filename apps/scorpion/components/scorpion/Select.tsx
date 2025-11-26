'use client';

import React, { SelectHTMLAttributes, memo, forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  error?: boolean;
  monospace?: boolean;
}

export const Select = memo(forwardRef<HTMLSelectElement, SelectProps>(function Select({
  options,
  error = false,
  monospace = false,
  className = '',
  ...props
}, ref) {
  const baseStyles = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const errorStyles = error ? 'border-red-400/50 focus:border-red-400/70' : '';
  const monoStyles = monospace ? 'font-mono sc-mono' : '';
  
  return (
    <select
      ref={ref}
      className={`${baseStyles} ${errorStyles} ${monoStyles} ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className="bg-[#0f1318] text-white"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}));

