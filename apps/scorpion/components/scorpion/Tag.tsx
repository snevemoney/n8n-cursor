'use client';

import React, { ReactNode, memo } from 'react';
import { X } from 'lucide-react';
import { Badge, BadgeVariant, BadgeSize } from './Badge';

export interface TagProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  onRemove?: () => void;
  className?: string;
}

export const Tag = memo(function Tag({
  variant = 'default',
  size = 'md',
  children,
  onRemove,
  className = '',
}: TagProps) {
  return (
    <Badge variant={variant} size={size} className={`inline-flex items-center gap-1.5 ${className}`}>
      <span>{children}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:bg-white/10 rounded transition-colors p-0.5 -mr-1"
          aria-label="Remove tag"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
});

