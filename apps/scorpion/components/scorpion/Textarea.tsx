'use client';

import React, { TextareaHTMLAttributes, memo, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  monospace?: boolean;
}

export const Textarea = memo(forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({
  error = false,
  monospace = false,
  className = '',
  ...props
}, ref) {
  const baseStyles = 'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed resize-none';
  const errorStyles = error ? 'border-red-400/50 focus:border-red-400/70' : '';
  const monoStyles = monospace ? 'font-mono sc-mono' : '';
  
  return (
    <textarea
      ref={ref}
      className={`${baseStyles} ${errorStyles} ${monoStyles} ${className}`}
      {...props}
    />
  );
}));

