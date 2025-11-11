'use client';

import { Card, Badge } from '@/components/scorpion';

interface UserToolCardProps {
  name: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  slashCommand: string;
  onClick: () => void;
}

export function UserToolCard({ name, label, description, icon, category, slashCommand, onClick }: UserToolCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left group focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2 active:scale-[0.98] transition-transform"
    >
      <Card hover padding="md" className="hover:border-emerald-400/30 hover:scale-[1.02] hover:shadow-lg transition-all duration-100">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                {label}
              </h3>
              <span className="text-xs text-white/30 font-mono">{slashCommand}</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">{description}</p>
            <div className="mt-2">
              <Badge variant="default" size="sm">
                {category}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
}

