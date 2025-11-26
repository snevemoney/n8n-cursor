'use client';

import React, { InputHTMLAttributes, ReactNode, memo, forwardRef } from 'react';
import { Search } from 'lucide-react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  icon?: ReactNode;
  monospace?: boolean;
}

export const Input = memo(forwardRef<HTMLInputElement, InputProps>(function Input({
  error = false,
  icon,
  monospace = false,
  className = '',
  ...props
}, ref) {
  const baseStyles = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const errorStyles = error ? 'border-red-400/50 focus:border-red-400/70' : '';
  const monoStyles = monospace ? 'font-mono sc-mono' : '';
  
  if (icon) {
    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 pointer-events-none">
          {icon}
        </div>
        <input
          ref={ref}
          className={`${baseStyles} ${errorStyles} ${monoStyles} pl-9 ${className}`}
          {...props}
        />
      </div>
    );
  }
  
  return (
    <input
      ref={ref}
      className={`${baseStyles} ${errorStyles} ${monoStyles} ${className}`}
      {...props}
    />
  );
}));

