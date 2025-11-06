import React, { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, children, className = '' }: PanelProps) {
  return (
    <div className={`sc-panel ${className}`}>
      {title && <div className="px-3 py-2 sc-title border-b border-white/5">{title}</div>}
      <div className={title ? "p-3 pt-0" : "p-3"}>{children}</div>
    </div>
  );
}

