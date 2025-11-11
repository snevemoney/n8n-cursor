import React, { ReactNode, memo } from 'react';

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Panel = memo(function Panel({ title, children, className = '' }: PanelProps) {
  return (
    <div className={`sc-panel min-w-0 ${className}`}>
      {title && <div className="px-3 py-2 md:px-4 md:py-2.5 sc-title border-b border-white/5">{title}</div>}
      <div className={title ? "p-3 pt-2 md:p-4 md:pt-3" : "p-3 md:p-4"}>{children}</div>
    </div>
  );
});

