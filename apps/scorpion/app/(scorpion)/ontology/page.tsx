'use client';

import { useState, useEffect } from 'react';
import { Panel, DataTable, LoadingState, ErrorState, EmptyState, PageLoadingBar } from '@/components/scorpion';
import { Search, Database, Link2, Filter } from 'lucide-react';

interface OntologyEntity {
  id: string;
  type: string;
  data: any;
  relationships?: any[];
  metadata?: any;
}

export default function OntologyPage() {
  const [entities, setEntities] = useState<OntologyEntity[]>([]);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityType, setEntityType] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<OntologyEntity | null>(null);

  const entityTypes = [
    'Project',
    'Workflow',
    'Agent',
    'Decision',
    'Metric',
    'Knowledge',
    'SideHustle'
  ];

  useEffect(() => {
    // Defer initial load aggressively so page renders instantly
    // Only defer on initial mount, not when entityType changes
    if (entities.length === 0) {
      const loadData = () => {
        loadEntities();
      };
      
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
      } else {
        setTimeout(loadData, 0); // Immediate fallback
      }
    } else {
      // When entityType changes, load immediately (user interaction)
      loadEntities();
    }
  }, [entityType]);

  const loadEntities = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (entityType) {
        params.set('type', entityType);
      }
      if (searchQuery) {
        params.set('q', searchQuery);
      }
      params.set('limit', '100');

      const response = await fetch(`/api/ontology?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const results = data.success ? data.data.results : data.results || [];
        setEntities(results);
      } else {
        throw new Error(`Failed to load entities: ${response.statusText}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load entities');
      console.error('Failed to load entities:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadEntities();
  };

  const getEntityIcon = (type: string) => {
    const icons: Record<string, any> = {
      Project: Database,
      Workflow: Link2,
      Agent: Database,
      Decision: Database,
      Metric: Database,
      Knowledge: Database,
      SideHustle: Database,
    };
    return icons[type] || Database;
  };

  return (
    <>
      <PageLoadingBar loading={loading && entities.length === 0} />
    <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
      <Panel title="Ontology Browser">
        <p className="text-sm text-white/60 mb-4">
          Explore entities and relationships in Scorpion's knowledge graph. The ontology stores structured knowledge about projects, workflows, agents, and more.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search entities..."
                  className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-400/50"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-sm hover:bg-emerald-500/30 transition-all"
              >
                Search
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-white/60" />
              <label className="text-sm text-white/60">Filter by Type</label>
            </div>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-400/50"
            >
              <option value="">All Types</option>
              {entityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && entities.length === 0 ? (
          <LoadingState text="Loading entities..." />
        ) : error && entities.length === 0 ? (
          <ErrorState
            error={error}
            onRetry={loadEntities}
            title="Failed to load entities"
            fullPage={false}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-white/60 mb-2">
                Found {entities.length} entities
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {entities.length === 0 ? (
                  <EmptyState
                    icon={Database}
                    title="No entities found"
                    message={searchQuery || entityType ? "Try adjusting your search or filter criteria" : "No entities in the ontology yet"}
                    fullPage={false}
                  />
                ) : (
                  entities.map((entity) => {
                  const Icon = getEntityIcon(entity.type);
                  return (
                    <div
                      key={entity.id}
                      onClick={() => setSelectedEntity(entity)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-100 ease-out ${
                        selectedEntity?.id === entity.id
                          ? 'border-emerald-400/50 bg-emerald-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:scale-[1.02] hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-mono text-emerald-300">{entity.type}</span>
                        <span className="text-xs text-white/40 ml-auto">{entity.id}</span>
                      </div>
                      <div className="text-sm mt-2">
                        {typeof entity.data === 'object' ? (
                          <div className="space-y-1">
                            {Object.entries(entity.data).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="text-white/60">{key}:</span>{' '}
                                <span className="text-white/80">
                                  {typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : String(value).substring(0, 50)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-white/80">{String(entity.data).substring(0, 100)}</div>
                        )}
                      </div>
                      {entity.relationships && entity.relationships.length > 0 && (
                        <div className="mt-2 text-xs text-white/40">
                          {entity.relationships.length} relationship(s)
                        </div>
                      )}
                    </div>
                  );
                  })
                )}
              </div>
            </div>

            <div>
              {selectedEntity ? (
                <Panel title="Entity Details">
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-white/60 mb-1">ID</div>
                      <div className="text-sm font-mono text-white/80">{selectedEntity.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60 mb-1">Type</div>
                      <div className="text-sm text-emerald-300">{selectedEntity.type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60 mb-1">Data</div>
                      <pre className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs overflow-auto max-h-96">
                        {JSON.stringify(selectedEntity.data, null, 2)}
                      </pre>
                    </div>
                    {selectedEntity.relationships && selectedEntity.relationships.length > 0 && (
                      <div>
                        <div className="text-xs text-white/60 mb-1">Relationships</div>
                        <div className="space-y-2">
                          {selectedEntity.relationships.map((rel: any, idx: number) => (
                            <div key={idx} className="p-2 bg-white/5 border border-white/10 rounded text-xs">
                              {JSON.stringify(rel, null, 2)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedEntity.metadata && (
                      <div>
                        <div className="text-xs text-white/60 mb-1">Metadata</div>
                        <pre className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs overflow-auto">
                          {JSON.stringify(selectedEntity.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </Panel>
              ) : (
                <Panel title="Select an Entity">
                  <div className="text-center py-8 text-white/40 text-sm">
                    Click on an entity to view details
                  </div>
                </Panel>
              )}
            </div>
          </div>
        )}
      </Panel>
    </div>
    </>
  );
}

