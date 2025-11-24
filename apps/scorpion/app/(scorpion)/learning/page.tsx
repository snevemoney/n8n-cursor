'use client';

import { useEffect, useState } from 'react';
import { Brain, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';
import { Card } from '@/components/scorpion/Card';
import { LoadingState } from '@/components/scorpion/LoadingState';
import { ErrorState } from '@/components/scorpion/ErrorState';

interface LearningStats {
  totalPatterns: number;
  byQueryType: Record<string, number>;
  successRate: number;
  topTools: Array<{ tool: string; count: number }>;
}

export default function LearningPage() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/learning/statistics');
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to load statistics');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch learning statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading learning statistics..." />;
  if (error) return <ErrorState error={error} retry={fetchStats} />;
  if (!stats) return <ErrorState error="No statistics available" retry={fetchStats} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
          <Brain className="h-8 w-8 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Pattern Learning</h1>
          <p className="text-white/60">Continuous improvement through interaction analysis</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Brain className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalPatterns}</div>
              <div className="text-sm text-white/60">Learned Patterns</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {(stats.successRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-white/60">Success Rate</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {Object.keys(stats.byQueryType).length}
              </div>
              <div className="text-sm text-white/60">Query Types</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Query Types Distribution */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-white/80" />
          <h2 className="text-xl font-semibold text-white">Patterns by Query Type</h2>
        </div>

        <div className="space-y-3">
          {Object.entries(stats.byQueryType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => {
              const percentage = (count / stats.totalPatterns) * 100;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80 capitalize">{type}</span>
                    <span className="text-white/60">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Top Tools */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-white/80" />
          <h2 className="text-xl font-semibold text-white">Most Used Tools</h2>
        </div>

        <div className="space-y-2">
          {stats.topTools.map((tool, index) => (
            <div
              key={tool.tool}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                  #{index + 1}
                </div>
                <span className="text-white/90 font-mono text-sm">{tool.tool}</span>
              </div>
              <span className="text-white/60 text-sm">{tool.count} uses</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Info Box */}
      <Card className="border border-blue-500/20 bg-blue-500/5">
        <div className="flex gap-3">
          <Brain className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white/80 space-y-2">
            <p className="font-semibold text-white">How Pattern Learning Works:</p>
            <ul className="space-y-1 text-white/60">
              <li>• Scorpion learns from every successful interaction</li>
              <li>• Similar queries retrieve relevant patterns for better planning</li>
              <li>• Tool selection improves based on what worked in the past</li>
              <li>• No external training required - learns continuously from usage</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
