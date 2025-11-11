'use client';

import React, { ButtonHTMLAttributes, ReactNode, memo } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-600/50',
  secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50',
  danger: 'bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30 disabled:opacity-50',
  ghost: 'bg-transparent text-white/70 hover:bg-white/5 hover:text-white disabled:opacity-50',
  success: 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50',
  warning: 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 hover:bg-yellow-500/30 disabled:opacity-50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = memo(function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-400/50';
  
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  
  return (
    <button
      className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
});

