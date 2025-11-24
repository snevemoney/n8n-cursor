'use client';

import React, { ReactNode, useState, isValidElement, memo, useCallback } from 'react';

interface Column {
  key: string;
  label: string;
  width?: string;
  wrap?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, ReactNode>[];
}

export const DataTable = memo(function DataTable({ columns, data }: DataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = useCallback((idx: number) => {
    setExpandedRows(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(idx)) {
        newExpanded.delete(idx);
      } else {
        newExpanded.add(idx);
      }
      return newExpanded;
    });
  }, []);

  const getCellContent = (content: ReactNode, colKey: string, rowIdx: number): string => {
    if (typeof content === 'string') return content;
    if (isValidElement(content)) {
      const props = content.props as { children?: ReactNode };
      if (typeof props.children === 'string') {
        return props.children;
      }
      if (props.children && typeof props.children === 'object') {
        return String(props.children);
      }
    }
    return String(content);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-white/30 border-b border-white/5 sticky top-0 bg-black/50 backdrop-blur-sm">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="py-2 px-2 text-left sc-title whitespace-nowrap"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const isExpanded = expandedRows.has(idx);
            return (
              <React.Fragment key={idx}>
                <tr
                  className="border-b border-white/5/20 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
                  onClick={() => toggleRow(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleRow(idx);
                    }
                  }}
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} row ${idx + 1}`}
                >
                  {columns.map(col => {
                    const content = row[col.key];
                    const textContent = getCellContent(content, col.key, idx);
                    const shouldWrap = col.wrap || isExpanded;
                    const isLong = textContent.length > 50;

                    return (
                      <td
                        key={col.key}
                        className={`py-2 px-2 ${shouldWrap ? 'break-words' : 'truncate'} ${col.key === 'id' ? 'sc-mono font-mono' : ''}`}
                        style={{
                          maxWidth: shouldWrap ? 'none' : col.width || '200px',
                          minWidth: col.width || 'auto'
                        }}
                        title={!shouldWrap && isLong ? textContent : undefined}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
                {isExpanded && (
                  <tr className="bg-white/2 border-b border-white/5">
                    <td colSpan={columns.length} className="py-3 px-4">
                      <div className="space-y-2">
                        {columns.map(col => {
                          const content = row[col.key];
                          const textContent = getCellContent(content, col.key, idx);
                          return (
                            <div key={col.key} className="flex gap-2">
                              <span className="text-white/40 font-semibold min-w-[80px]">{col.label}:</span>
                              <span className="text-white/80 break-words flex-1">
                                {typeof content === 'string' ? (
                                  <span className={col.key === 'id' ? 'sc-mono font-mono' : ''}>{content}</span>
                                ) : (
                                  content
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Tooltip for long content - removed fixed positioning for now, using native title attribute instead */}

      {data.length === 0 && (
        <div className="text-center py-8 text-white/40 text-sm">
          No data available
        </div>
      )}
    </div>
  );
});

