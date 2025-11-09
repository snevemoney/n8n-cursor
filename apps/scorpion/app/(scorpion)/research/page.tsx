'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Panel, Metric } from '@/components/scorpion';
import { Search, Loader2, CheckCircle, XCircle, Activity, MessageSquare } from 'lucide-react';

type ResearchCategory = 
  | 'general'
  | 'company-research'
  | 'market-analysis' 
  | 'competitor-analysis'
  | 'technical-research'
  | 'financial-research';

interface BrowserAction {
  type: string;
  timestamp: number;
  url: string;
  selector?: string;
  data?: any;
  screenshot?: string;
}

interface ResearchResult {
  query: string;
  category: string;
  sources: Array<{
    url: string;
    title: string;
    relevanceScore: number;
  }>;
  summary: string;
  keyFindings: string[];
  confidence: number;
  duration: number;
}

// Example queries by category
const EXAMPLE_QUERIES: Record<ResearchCategory, string[]> = {
  'general': [
    'Latest trends in AI and machine learning',
    'Best practices for remote team management',
    'Current state of cryptocurrency regulations'
  ],
  'company-research': [
    'OpenAI company overview and recent developments',
    'Tesla financial performance and market position',
    'Stripe payment processing capabilities and pricing'
  ],
  'market-analysis': [
    'SaaS market trends and growth projections',
    'E-commerce landscape in Southeast Asia',
    'Cloud infrastructure market share analysis'
  ],
  'competitor-analysis': [
    'Notion vs Obsidian feature comparison',
    'Shopify vs WooCommerce for small businesses',
    'Slack competitors and alternatives'
  ],
  'technical-research': [
    'Next.js 14 app router best practices',
    'PostgreSQL vs MongoDB performance comparison',
    'OAuth 2.0 implementation guide'
  ],
  'financial-research': [
    'S&P 500 performance analysis 2024',
    'Venture capital funding trends in AI startups',
    'Cryptocurrency market cap analysis'
  ]
};

export default function ResearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionParam = searchParams?.get('session');
  
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ResearchCategory>('general');
  const [depth, setDepth] = useState<'shallow' | 'medium' | 'deep'>('medium');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'researching' | 'completed' | 'failed'>('idle');
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [browserActions, setBrowserActions] = useState<BrowserAction[]>([]);
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const actionsEndRef = useRef<HTMLDivElement>(null);

  // Load session from URL parameter
  useEffect(() => {
    if (sessionParam && sessionParam !== sessionId) {
      setSessionId(sessionParam);
      setStatus('researching');
    }
  }, [sessionParam]);
  
  // Auto-scroll to bottom of actions log
  useEffect(() => {
    actionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [browserActions]);

  // Poll for session status
  useEffect(() => {
    if (!sessionId || status === 'completed' || status === 'failed') return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/research/start?sessionId=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'completed') {
            setStatus('completed');
            setResult(data.result);
          } else if (data.status === 'failed') {
            setStatus('failed');
          }
        }
      } catch (error) {
        console.error('Failed to poll status:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, status]);

  const useExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
    setShowExamples(false);
  };

  const startResearch = async () => {
    if (!query.trim()) return;
    
    setStatus('loading');
    setBrowserActions([]);
    setCurrentScreenshot(null);
    setResult(null);
    setShowExamples(false);

    try {
      const response = await fetch('/api/research/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, category, depth, maxSites: 10 })
      });

      if (!response.ok) {
        throw new Error('Failed to start research');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setStatus('researching');

      // TODO: Implement WebSocket connection for real-time browser events
      // For now, research runs but doesn't show browser visualization
      // WebSocket endpoint: ws://localhost:3000/api/research/stream
      setStatus('completed');
      setResult({
        query,
        summary: 'Research completed. Real-time browser visualization coming soon via WebSocket.',
        sources: [],
        findings: []
      });

    } catch (error) {
      console.error('Failed to start research:', error);
      setStatus('failed');
    }
  };


  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Web Research & Company Intelligence</h1>
          <p className="text-sm text-white/40">Automated research with live browser visualization</p>
        </div>
      </div>

      {/* Research Query Input */}
      <Panel title="Research Query">
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-white/60">Query</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter research query or company name..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
              disabled={status === 'researching'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-white/60">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResearchCategory)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-white focus:outline-none focus:border-white/20"
                disabled={status === 'researching'}
              >
                <option value="general">General Research</option>
                <option value="company-research">Company Research</option>
                <option value="market-analysis">Market Analysis</option>
                <option value="competitor-analysis">Competitor Analysis</option>
                <option value="technical-research">Technical Research</option>
                <option value="financial-research">Financial Research</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2 text-white/60">Depth</label>
              <select
                value={depth}
                onChange={(e) => setDepth(e.target.value as any)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-white focus:outline-none focus:border-white/20"
                disabled={status === 'researching'}
              >
                <option value="shallow">Shallow (3 sources)</option>
                <option value="medium">Medium (5 sources)</option>
                <option value="deep">Deep (8+ sources)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startResearch}
              disabled={!query.trim() || status === 'researching'}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'researching' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Start Research
                </>
              )}
            </button>
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-sm transition-colors"
            >
              {showExamples ? 'Hide' : 'Show'} Examples
            </button>
          </div>
        </div>
      </Panel>

      {/* Example Queries */}
      {showExamples && (
        <Panel title={`Example Queries - ${category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`}>
          <div className="space-y-2">
            <div className="text-xs text-white/40 mb-3">Click any example to use it as your query:</div>
            <div className="grid gap-2">
              {EXAMPLE_QUERIES[category].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => useExampleQuery(example)}
                  className="text-left px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm transition-colors text-sm text-white/80 hover:text-white"
                >
                  <span className="text-white/40 mr-2">{idx + 1}.</span>
                  {example}
                </button>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {/* Status & Browser Activity */}
      {status !== 'idle' && (
        <div className="grid grid-cols-2 gap-4">
          {/* Browser Activity Log */}
          <Panel title="🌐 Browser Activity">
            <div className="h-96 overflow-y-auto bg-black/20 border border-white/10 rounded-sm p-3 font-mono text-xs space-y-1">
              {browserActions.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/40">
                  Waiting for browser activity...
                </div>
              ) : (
                <>
                  {browserActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-white/40 flex-shrink-0">
                        [{new Date(action.timestamp).toLocaleTimeString()}]
                      </span>
                      <span className="text-blue-400">{action.type}</span>
                      <span className="text-white/60 truncate">{action.url}</span>
                      {action.data && (
                        <span className="text-emerald-400">
                          {JSON.stringify(action.data)}
                        </span>
                      )}
                    </div>
                  ))}
                  <div ref={actionsEndRef} />
                </>
              )}
            </div>
          </Panel>

          {/* AI Agent Status */}
          <Panel title="🤖 AI Agent Status">
            <div className="space-y-2">
              {status === 'loading' && (
                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-sm">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-sm">Initializing research session...</span>
                </div>
              )}
              
              {status === 'researching' && (
                <>
                  <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-sm">
                    <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-sm">WebResearchAgent: Searching sources...</span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-sm">
                    <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-sm">Extracting content from pages...</span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-sm">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-sm">Analyzing findings with LLM...</span>
                  </div>
                </>
              )}

              {status === 'completed' && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">Research completed successfully!</span>
                </div>
              )}

              {status === 'failed' && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-sm">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm">Research failed. Please try again.</span>
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}

      {/* Research Results */}
      {result && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Metric 
              label="Sources" 
              value={(result.sources?.length || 0).toString()} 
            />
            <Metric 
              label="Findings" 
              value={(result.keyFindings?.length || 0).toString()} 
            />
            <Metric 
              label="Confidence" 
              value={`${((result.confidence || 0) * 100).toFixed(0)}%`}
              className={(result.confidence || 0) > 0.7 ? 'text-emerald-400' : 'text-yellow-400'} 
            />
            <Metric 
              label="Duration" 
              value={`${((result.duration || 0) / 1000).toFixed(1)}s`} 
            />
          </div>

          {/* Discuss with AI Button */}
          <div className="flex justify-end">
            <button
              onClick={() => router.push(`/chat?research=${sessionId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded text-emerald-400 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Discuss Results with AI
            </button>
          </div>

          <Panel title="📊 Summary">
            <p className="text-white/80 leading-relaxed">{result.summary || 'No summary available'}</p>
          </Panel>

          <Panel title="🔍 Key Findings">
            <ul className="space-y-2">
              {(result.keyFindings || []).map((finding, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 font-semibold flex-shrink-0">{i + 1}.</span>
                  <span className="text-white/80">{finding}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title={`📚 Sources (${result.sources?.length || 0})`}>
            <div className="space-y-2">
              {(result.sources || []).map((source, i) => (
                <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-sm">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-medium"
                  >
                    {source.title}
                  </a>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-white/40 truncate">{source.url}</span>
                    <span className="text-xs text-emerald-400">
                      Relevance: {(source.relevanceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

