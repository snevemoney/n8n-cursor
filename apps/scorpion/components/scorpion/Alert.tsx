'use client';

import React, { ReactNode, memo } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

export interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message?: string;
  children?: ReactNode;
  onClose?: () => void;
  action?: ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; icon: ReactNode }> = {
  success: {
    bg: 'bg-emerald-500/10 border-emerald-500/50',
    border: 'border-emerald-500/50',
    icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
  },
  warning: {
    bg: 'bg-yellow-500/10 border-yellow-500/50',
    border: 'border-yellow-500/50',
    icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
  },
  danger: {
    bg: 'bg-red-500/10 border-red-500/50',
    border: 'border-red-500/50',
    icon: <AlertCircle className="h-5 w-5 text-red-400" />,
  },
  info: {
    bg: 'bg-blue-500/10 border-blue-500/50',
    border: 'border-blue-500/50',
    icon: <Info className="h-5 w-5 text-blue-400" />,
  },
};

export const Alert = memo(function Alert({
  variant,
  title,
  message,
  children,
  onClose,
  action,
  className = '',
}: AlertProps) {
  const styles = variantStyles[variant];
  
  return (
    <div className={`${styles.bg} border ${styles.border} rounded-md p-3 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-semibold text-white mb-1">
              {title}
            </div>
          )}
          {message && (
            <div className="text-xs text-white/70">
              {message}
            </div>
          )}
          {children && (
            <div className="text-xs text-white/70">
              {children}
            </div>
          )}
          {action && (
            <div className="mt-2">
              {action}
            </div>
          )}
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 flex-shrink-0"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});

