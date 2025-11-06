import React, { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, ReactNode>[];
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <table className="w-full text-xs">
      <thead className="text-white/30 border-b border-white/5">
        <tr>
          {columns.map(col => (
            <th key={col.key} className="py-2 text-left sc-title">{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="border-b border-white/5/20 hover:bg-white/5 transition-colors">
            {columns.map(col => (
              <td key={col.key} className="py-2">{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

