import React, { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, children, className = '' }: PanelProps) {
  return (
    <div className={`sc-panel ${className}`}>
      {title && <div className="px-4 py-2.5 sc-title border-b border-white/5">{title}</div>}
      <div className={title ? "p-4 pt-3" : "p-4"}>{children}</div>
    </div>
  );
}

