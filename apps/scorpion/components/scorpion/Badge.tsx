'use client';

import React, { ReactNode, memo } from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-white/5 border border-white/10 text-white/60',
  success: 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300',
  warning: 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-300',
  danger: 'bg-red-500/20 border border-red-400/50 text-red-300',
  info: 'bg-blue-500/20 border border-blue-400/50 text-blue-300',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1.5 text-xs',
};

export const Badge = memo(function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-sm font-medium';
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  
  return (
    <span className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}>
      {children}
    </span>
  );
});

