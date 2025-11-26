import React, { ReactNode, memo } from 'react';

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode; // Power of 10 Rule 3: Small addition
}

export const Panel = memo(function Panel({ title, children, className = '', actions }: PanelProps) {
  return (
    <div className={`sc-panel min-w-0 ${className}`} suppressHydrationWarning>
      {title && (
        <div className="px-3 py-2 md:px-4 md:py-2.5 sc-title border-b border-white/5 flex items-center justify-between" suppressHydrationWarning>
          <span>{title}</span>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className={title ? "p-3 pt-2 md:p-4 md:pt-3" : "p-3 md:p-4"} suppressHydrationWarning>{children}</div>
    </div>
  );
});

