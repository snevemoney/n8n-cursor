'use client';

import { Panel, Card, Badge, Input } from '@/components/scorpion';
import {
    Wrench,
    Terminal,
    Cpu,
    Search,
    BookOpen,
    Workflow,
    Activity,
    Bot,
    Database,
    FileCode,
    Brain,
    Settings,
    ExternalLink,
    Zap
} from 'lucide-react';
import { useState, useMemo } from 'react';

export interface SerializableToolSpec {
    name: string;
    description: string;
    metadata?: {
        category?: string;
        status?: 'stable' | 'beta' | 'experimental';
        docsUrl?: string;
        usedBy?: Array<'planner' | 'council' | 'build' | 'ops' | 'knowledge' | 'executor'>;
        tags?: string[];
    };
}

// Helper to categorize tools
const getToolCategory = (name: string): { label: string; color: string; icon: any } => {
    const prefix = name.split('.')[0];
    switch (prefix) {
        case 'research':
            return { label: 'Research', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: Search };
        case 'kb':
        case 'knowledge':
        case 'ontology':
            return { label: 'Knowledge', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: BookOpen };
        case 'workflows':
            return { label: 'Automation', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: Workflow };
        case 'logs':
        case 'notifications':
        case 'system':
        case 'backup':
        case 'stats':
        case 'operations':
        case 'settings':
            return { label: 'System', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', icon: Activity };
        case 'agent':
        case 'agents':
            return { label: 'Agents', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: Bot };
        case 'project':
            return { label: 'Planning', color: 'text-pink-400 bg-pink-400/10 border-pink-400/20', icon: Database };
        case 'code':
        case 'files':
            return { label: 'Development', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', icon: FileCode };
        case 'llm':
        case 'llamacpp':
            return { label: 'AI Models', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', icon: Brain };
        default:
            return { label: 'Utility', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20', icon: Wrench };
    }
};

// Helper to get tool status
const getToolStatus = (name: string): 'stable' | 'beta' | 'experimental' => {
    if (name.includes('experiment') || name.includes('train') || name.includes('compare')) return 'experimental';
    if (name.includes('agent') || name.includes('llm')) return 'beta';
    return 'stable';
};

const StatusBadge = ({ status }: { status: 'stable' | 'beta' | 'experimental' }) => {
    const styles = {
        stable: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        beta: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        experimental: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    };

    return (
        <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-mono ${styles[status]}`}>
            {status}
        </span>
    );
};

interface ToolsListProps {
    initialTools: SerializableToolSpec[];
}

export default function ToolsList({ initialTools }: ToolsListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');


    const filteredTools = useMemo(() => {
        return initialTools.filter(tool => {
            // Search filter
            const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.description.toLowerCase().includes(searchQuery.toLowerCase());

            // Category filter
            const category = tool.metadata?.category || getToolCategory(tool.name).label;
            const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

            // Status filter
            const status = tool.metadata?.status || getToolStatus(tool.name);
            const matchesStatus = selectedStatus === 'all' || status === selectedStatus;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [initialTools, searchQuery, selectedCategory, selectedStatus]);

    // Group by category
    const groupedTools = useMemo(() => {
        const groups: Record<string, typeof initialTools> = {};
        filteredTools.forEach(tool => {
            const cat = tool.metadata?.category
                ? tool.metadata.category
                : getToolCategory(tool.name).label;
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(tool);
        });
        return groups;
    }, [filteredTools]);

    // Get unique categories and counts
    const categories = useMemo(() => {
        const cats = new Set(initialTools.map(t => t.metadata?.category || getToolCategory(t.name).label));
        return Array.from(cats).sort();
    }, [initialTools]);

    const statusCounts = useMemo(() => {
        const counts = { all: initialTools.length, stable: 0, beta: 0, experimental: 0 };
        initialTools.forEach(t => {
            const status = t.metadata?.status || getToolStatus(t.name);
            counts[status]++;
        });
        return counts;
    }, [initialTools]);

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Wrench className="w-6 h-6 text-emerald-400" />
                        Tools Catalog
                    </h1>
                    <p className="text-white/60">
                        Registry of {initialTools.length} AI-callable tools available to Scorpion agents.
                    </p>
                </div>

                <div className="w-full md:w-64">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <label htmlFor="category-filter" className="text-sm text-white/60">Category:</label>
                    <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    >
                        <option value="all">All ({initialTools.length})</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat} ({initialTools.filter(t => (t.metadata?.category || getToolCategory(t.name).label) === cat).length})</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label htmlFor="status-filter" className="text-sm text-white/60">Status:</label>
                    <select
                        id="status-filter"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    >
                        <option value="all">All ({statusCounts.all})</option>
                        <option value="stable">Stable ({statusCounts.stable})</option>
                        <option value="beta">Beta ({statusCounts.beta})</option>
                        <option value="experimental">Experimental ({statusCounts.experimental})</option>
                    </select>
                </div>
            </div>

            {/* Tool Grid */}
            <div className="space-y-8">
                {Object.entries(groupedTools).map(([category, categoryTools]) => {
                    const CategoryIcon = getToolCategory(categoryTools[0].name).icon;

                    return (
                        <div key={category} className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                                <CategoryIcon className="w-5 h-5 text-white/40" />
                                <h2 className="text-lg font-semibold text-white/80">{category}</h2>
                                <span className="text-xs text-white/30 font-mono">({categoryTools.length})</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categoryTools.map((tool) => (
                                    <Card key={tool.name} className="group p-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-lg ${getToolCategory(tool.name).color}`}>
                                                    <Terminal className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-white text-sm font-mono">{tool.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <StatusBadge status={tool.metadata?.status || getToolStatus(tool.name)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-white/60 mb-4 flex-1 line-clamp-3">
                                            {tool.description}
                                        </p>

                                        {/* Usage Context */}
                                        {tool.metadata?.usedBy && tool.metadata.usedBy.length > 0 && (
                                            <div className="mb-3">
                                                <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-1.5">Used By</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {tool.metadata.usedBy.map(usage => (
                                                        <span
                                                            key={usage}
                                                            className="text-[10px] px-2 py-1 rounded bg-white/10 text-white/70 border border-white/10 font-medium"
                                                        >
                                                            {usage}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-white/5 mt-auto space-y-3">
                                            <div>
                                                <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-1.5">Schema</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {/* We can't easily inspect Zod schema here without more logic,
                              so we'll just show a placeholder or nothing for now */}
                                                    <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 font-mono">
                                                        Zod Schema
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-[10px] text-white/30">v1.0.0</span>
                                                {tool.metadata?.docsUrl ? (
                                                    <a
                                                        href={tool.metadata.docsUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                                                    >
                                                        View Docs <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ) : (
                                                    <button className="text-xs text-white/20 flex items-center gap-1 opacity-50 cursor-not-allowed">
                                                        No Docs
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {filteredTools.length === 0 && (
                    <div className="text-center py-12 text-white/40">
                        <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p>No tools found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
