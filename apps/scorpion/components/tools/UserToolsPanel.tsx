'use client';

import { useState, useMemo } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { UserToolCard } from './UserToolCard';
import { listUserTools } from '@/lib/chat/tools/user-tools/client';

interface UserToolsPanelProps {
  onToolSelect: (toolName: string, slashCommand: string) => void;
}

export function UserToolsPanel({ onToolSelect }: UserToolsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const tools = useMemo(() => listUserTools(), []);
  
  const categories = useMemo(() => {
    const cats = new Set(tools.map(t => t.category));
    return Array.from(cats).sort();
  }, [tools]);
  
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = !searchQuery || 
        tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.slashCommand.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || tool.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [tools, searchQuery, selectedCategory]);
  
  const handleToolClick = (tool: typeof tools[0]) => {
    onToolSelect(tool.name, tool.slashCommand);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Search and filters */}
      <div className="p-4 border-b border-white/10 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50"
          />
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedCategory === null
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 text-xs rounded capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tools list */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredTools.length === 0 ? (
          <div className="text-center text-white/40 text-sm py-8">
            <p>No tools found</p>
            {searchQuery && (
              <p className="text-xs mt-2">Try a different search term</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTools.map(tool => (
              <UserToolCard
                key={tool.name}
                name={tool.name}
                label={tool.label}
                description={tool.description}
                icon={tool.icon}
                category={tool.category}
                slashCommand={tool.slashCommand}
                onClick={() => handleToolClick(tool)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-white/10 text-xs text-white/40 text-center">
        {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} available
      </div>
    </div>
  );
}

