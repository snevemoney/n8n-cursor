'use client';

import React, { ReactNode, memo } from 'react';

export interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = memo(function Card({
  title,
  children,
  className = '',
  hover = false,
  padding = 'md',
}: CardProps) {
  const baseStyles = 'sc-panel';
  const hoverStyles = hover ? 'hover:bg-white/5 transition-colors cursor-pointer' : '';
  const paddingStyle = title ? (padding === 'md' ? 'p-4 pt-3' : paddingStyles[padding]) : paddingStyles[padding];
  
  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`} suppressHydrationWarning>
      {title && (
        <div className="px-4 py-2.5 sc-title border-b border-white/5">
          {title}
        </div>
      )}
      <div className={paddingStyle || 'p-4'}>
        {children}
      </div>
    </div>
  );
});

