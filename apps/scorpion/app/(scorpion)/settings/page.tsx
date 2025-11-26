'use client';

import { useState, useEffect } from 'react';
import { Panel, Button, Input, Select, Badge, Alert, useToast, PageLoadingBar } from '@/components/scorpion';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [ragIndexing, setRagIndexing] = useState(true);
  const [autoTrigger, setAutoTrigger] = useState(false);
  const [councilAutoContext, setCouncilAutoContext] = useState(true);
  const [modelSource, setModelSource] = useState('ollama');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [openaiKey, setOpenaiKey] = useState('');
  const [entityRetention, setEntityRetention] = useState('90 days');
  const [ragModel, setRagModel] = useState('nomic-embed-text');
  const [useOpenAIEmbeddings, setUseOpenAIEmbeddings] = useState(false);
  const [useOpenAIFunctionCalling, setUseOpenAIFunctionCalling] = useState(true);
  const [maxAgents, setMaxAgents] = useState(4);
  const [requestTimeout, setRequestTimeout] = useState(30000);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [storageStatus, setStorageStatus] = useState<any>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  // Load settings on mount
  useEffect(() => {
    // Defer data fetches aggressively so page renders instantly
    const loadData = () => {
      loadSettings();
      loadStorageStatus();
      loadSystemInfo();
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
    } else {
      setTimeout(loadData, 0); // Immediate fallback
    }
  }, []);

  const loadStorageStatus = async () => {
    try {
      const response = await fetch('/api/storage/status');
      if (response && response.ok) {
        const data = await response.json();
        setStorageStatus(data);
      }
    } catch (error) {
      console.error('Failed to load storage status:', error);
    }
  };

  const loadSystemInfo = async () => {
    try {
      const response = await fetch('/api/system/info');
      if (response && response.ok) {
        const data = await response.json();
        setSystemInfo(data);
      }
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  };

  const loadSettings = async () => {
    try {
      // Only show loading spinner on initial load
      setLoading(true);
      const response = await fetch('/api/settings');
      if (response && response.ok) {
        const data = await response.json();
        // Update state with loaded settings
        if (data.ragIndexing !== undefined) setRagIndexing(data.ragIndexing);
        if (data.autoTrigger !== undefined) setAutoTrigger(data.autoTrigger);
        if (data.councilAutoContext !== undefined) setCouncilAutoContext(data.councilAutoContext);
        if (data.modelSource) setModelSource(data.modelSource);
        if (data.ollamaUrl) setOllamaUrl(data.ollamaUrl);
        if (data.openaiKey) setOpenaiKey(data.openaiKey);
        if (data.entityRetention) setEntityRetention(data.entityRetention);
        if (data.ragModel) setRagModel(data.ragModel);
        if (data.useOpenAIEmbeddings !== undefined) setUseOpenAIEmbeddings(data.useOpenAIEmbeddings);
        if (data.useOpenAIFunctionCalling !== undefined) setUseOpenAIFunctionCalling(data.useOpenAIFunctionCalling);
        if (data.maxAgents !== undefined) setMaxAgents(data.maxAgents);
        if (data.requestTimeout !== undefined) setRequestTimeout(data.requestTimeout);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = {
        ragIndexing,
        autoTrigger,
        councilAutoContext,
        modelSource,
        ollamaUrl,
        openaiKey,
        entityRetention,
        ragModel,
        useOpenAIEmbeddings,
        useOpenAIFunctionCalling,
        maxAgents,
        requestTimeout
      };
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response && response.ok) {
        showToast('success', 'Settings saved successfully!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      showToast('error', 'Failed to save settings. Please try again.');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <PageLoadingBar loading={loading} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          loading={saving}
          icon={<Save className="w-4 h-4" />}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* System Info Panel */}
      {systemInfo && (
        <Panel title="System Information & Model Recommendations">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-sm">
              <span className="sc-title">System RAM</span>
              <span className="text-sm text-white/70">{systemInfo.system?.ramGB?.toFixed(1)}GB</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-sm">
              <span className="sc-title">Lightweight Mode</span>
              <span className={`text-sm ${systemInfo.system?.lightweightMode ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {systemInfo.system?.lightweightMode ? 'Enabled (8GB or less)' : 'Disabled'}
              </span>
            </div>
            {systemInfo.model && (
              <div className="mt-4 space-y-2">
                <div className="sc-title text-sm mb-2">Recommended Model</div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-sm">
                  <div className="font-mono text-sm text-emerald-400 mb-1">
                    {systemInfo.model.recommended}
                  </div>
                  <div className="text-xs text-white/60">
                    {systemInfo.model.recommendations?.find((r: any) => r.recommended)?.description}
                  </div>
                </div>
                <div className="sc-title text-sm mt-4 mb-2">All Recommendations</div>
                <div className="space-y-2">
                  {systemInfo.model.recommendations?.map((rec: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-sm text-xs ${
                        rec.recommended
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'bg-white/5 border border-white/5'
                      }`}
                    >
                      <div className="font-mono text-white/90">{rec.model}</div>
                      <div className="text-white/60 mt-1">
                        Size: {rec.size} • RAM Required: {rec.ramRequired}
                      </div>
                      <div className="text-white/50 mt-1 text-xs">{rec.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}

      <div className="grid grid-cols-2 gap-4">
      <Panel title="Model Configuration">
        <div className="space-y-3">
          <div>
            <label className="sc-title block mb-1">Model Source</label>
            <Select
              options={[
                { value: 'ollama', label: 'Ollama' },
                { value: 'openai', label: 'OpenAI' },
              ]}
              value={modelSource}
              onChange={(e) => setModelSource(e.target.value)}
            />
          </div>
          <div>
            <label className="sc-title block mb-1">Ollama URL</label>
            <Input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              monospace
            />
          </div>
          {modelSource === 'openai' && (
            <div>
              <label className="sc-title block mb-1">OpenAI API Key</label>
              <Input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                monospace
              />
            </div>
          )}
        </div>
      </Panel>

      <Panel title="System Settings">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Enable RAG Indexing</div>
              <div className="text-xs text-white/40">Automatically index entities in RAG store</div>
            </div>
            <input 
              type="checkbox" 
              checked={ragIndexing}
              onChange={(e) => setRagIndexing(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Auto-trigger Workflows</div>
              <div className="text-xs text-white/40">Automatically trigger workflows on decisions</div>
            </div>
            <input 
              type="checkbox" 
              checked={autoTrigger}
              onChange={(e) => setAutoTrigger(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Council Auto-Context</div>
              <div className="text-xs text-white/40">Inject ontology context in council meetings</div>
            </div>
            <input 
              type="checkbox" 
              checked={councilAutoContext}
              onChange={(e) => setCouncilAutoContext(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
          </div>
        </div>
      </Panel>

      <Panel title="Ontology Settings">
        <div className="space-y-3">
          <div>
            <label className="sc-title block mb-1">Entity Retention</label>
            <Select
              options={[
                { value: '30 days', label: '30 days' },
                { value: '90 days', label: '90 days' },
                { value: '1 year', label: '1 year' },
                { value: 'Forever', label: 'Forever' },
              ]}
              value={entityRetention}
              onChange={(e) => setEntityRetention(e.target.value)}
            />
          </div>
          <div>
            <label className="sc-title block mb-1">RAG Embedding Model</label>
            <Select
              options={[
                { value: 'nomic-embed-text', label: 'nomic-embed-text' },
                { value: 'all-minilm', label: 'all-minilm' },
                ...(openaiKey ? [
                  { value: 'text-embedding-3-small', label: 'text-embedding-3-small' },
                  { value: 'text-embedding-3-large', label: 'text-embedding-3-large' },
                ] : []),
              ]}
              value={ragModel}
              onChange={(e) => setRagModel(e.target.value)}
            />
          </div>
        </div>
      </Panel>

      {openaiKey && (
        <Panel title="OpenAI Settings">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Use OpenAI Embeddings</div>
                <div className="text-xs text-white/40">Use OpenAI embeddings for better RAG quality (requires API key)</div>
              </div>
              <input 
                type="checkbox" 
                checked={useOpenAIEmbeddings}
                onChange={(e) => setUseOpenAIEmbeddings(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Enable Function Calling</div>
                <div className="text-xs text-white/40">Use OpenAI function calling for tool execution</div>
              </div>
              <input 
                type="checkbox" 
                checked={useOpenAIFunctionCalling}
                onChange={(e) => setUseOpenAIFunctionCalling(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
            </div>
            <Alert
              variant="success"
              title="OpenAI Features Available"
            >
              <div className="text-xs space-y-1 mt-1">
                <div>• Audio Transcription (Whisper)</div>
                <div>• Image Generation (DALL-E)</div>
                <div>• Advanced Embeddings</div>
                <div>• Function Calling</div>
              </div>
            </Alert>
          </div>
        </Panel>
      )}

      <Panel title="Performance">
        <div className="space-y-3">
          <div>
            <div className="sc-title mb-1">Max Concurrent Agents</div>
            <Input
              type="number"
              value={maxAgents.toString()}
              onChange={(e) => setMaxAgents(parseInt(e.target.value) || 4)}
              min={1}
              max={16}
              monospace
            />
          </div>
          <div>
            <div className="sc-title mb-1">Request Timeout (ms)</div>
            <Input
              type="number"
              value={requestTimeout.toString()}
              onChange={(e) => setRequestTimeout(parseInt(e.target.value) || 30000)}
              min={1000}
              max={120000}
              step={1000}
              monospace
            />
          </div>
        </div>
      </Panel>

      {storageStatus && (
        <Panel title="Storage Status">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Storage Type</div>
                <div className="text-xs text-white/40">Current storage device</div>
              </div>
              <Badge
                variant={storageStatus?.isSSD ? 'success' : 'default'}
                size="md"
              >
                {storageStatus?.storageType?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-1">Data Path</div>
              <div className="text-xs sc-mono text-white/60 break-all">{storageStatus?.dataPath || 'Loading...'}</div>
              {storageStatus?.isSSD && (
                <div className="text-[10px] text-emerald-400 mt-1">✅ Data stored on SSD</div>
              )}
            </div>

            {storageStatus?.performance && (
              <div>
                <div className="text-sm font-medium mb-2">Performance Benchmarks</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Read Speed:</span>
                    <span className="sc-mono font-semibold text-emerald-300">{storageStatus.performance.readSpeed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Write Speed:</span>
                    <span className="sc-mono font-semibold text-emerald-300">{storageStatus.performance.writeSpeed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Latency:</span>
                    <span className="sc-mono font-semibold text-emerald-300">{storageStatus.performance.latency}</span>
                  </div>
                </div>
              </div>
            )}

            {storageStatus?.performanceConfig && (
              <div>
                <div className="text-sm font-medium mb-2">Performance Configuration</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60">Workflow Batch Size:</span>
                    <span className="sc-mono text-white">
                      {storageStatus.performanceConfig.workflowSyncBatchSize}
                      {storageStatus?.isSSD && <span className="text-emerald-400 ml-1">(4x HDD)</span>}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Concurrency:</span>
                    <span className="sc-mono text-white">
                      {storageStatus.performanceConfig.workflowSyncConcurrency}
                      {storageStatus?.isSSD && <span className="text-emerald-400 ml-1">(3.3x HDD)</span>}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Media Concurrency:</span>
                    <span className="sc-mono text-white">
                      {storageStatus.performanceConfig.mediaProcessingConcurrency}
                      {storageStatus?.isSSD && <span className="text-emerald-400 ml-1">(3x HDD)</span>}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Max File Size:</span>
                    <span className="sc-mono text-white">
                      {storageStatus.performanceConfig.mediaProcessingMaxFileSizeMB}MB
                      {storageStatus?.isSSD && <span className="text-emerald-400 ml-1">(5x HDD)</span>}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {storageStatus?.optimizationsActive && storageStatus.optimizationsActive.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Active Optimizations</div>
                <div className="flex flex-wrap gap-2">
                  {storageStatus.optimizationsActive.map((opt: string) => (
                    <Badge key={opt} variant="success" size="sm">
                      {opt}
                    </Badge>
                  ))}
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-2">
                  ✨ These optimizations are only active in SSD mode
                </div>
              </div>
            )}

            {storageStatus?.detectedSSDPath && (
              <div>
                <div className="text-sm font-medium mb-1">Detected SSD</div>
                <div className="text-xs sc-mono text-white/60">{storageStatus.detectedSSDPath}</div>
              </div>
            )}

            {storageStatus?.isSSD && (
              <div className="pt-2 border-t border-white/10">
                <div className="text-xs text-emerald-400 font-medium mb-1">🚀 SSD Mode Benefits</div>
                <div className="text-[10px] text-white/60 space-y-0.5">
                  <div>• 4x larger batch sizes for faster syncs</div>
                  <div>• 3x more parallel operations</div>
                  <div>• 5x larger file processing capacity</div>
                  <div>• Extended cache TTL for better performance</div>
                  <div>• Faster file watching and prefetching</div>
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}

      {storageStatus?.integrations && storageStatus.integrations.ssdDetected && (
        <Panel title="SSD Integrations">
          <div className="space-y-3">
            <div className="text-xs text-white/60 mb-2">
              Maximize your SSD by migrating these services for better performance
            </div>
            
            {storageStatus.integrations.integrations?.map((integration: any) => (
              <div key={integration.name} className="border border-white/10 rounded-sm p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium">{integration.name}</div>
                    <div className="text-xs text-white/50">{integration.description}</div>
                  </div>
                  <Badge
                    variant={
                      integration.isOnSSD
                        ? 'success'
                        : integration.canMigrate
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  >
                    {integration.isOnSSD ? 'On SSD' : integration.canMigrate ? 'Can Migrate' : 'N/A'}
                  </Badge>
                </div>
                
                <div className="text-[10px] sc-mono text-white/60 mb-1 break-all">
                  Current: {integration.currentPath}
                </div>
                
                {integration.ssdPath && (
                  <div className="text-[10px] sc-mono text-emerald-400/80 mb-2 break-all">
                    SSD: {integration.ssdPath}
                  </div>
                )}
                
                {integration.sizeGB && (
                  <div className="text-[10px] text-white/50 mb-2">
                    Size: {integration.sizeGB} GB
                  </div>
                )}
                
                {integration.recommendation && (
                  <div className={`text-[10px] ${
                    integration.isOnSSD ? 'text-emerald-400/80' : 'text-yellow-400/80'
                  }`}>
                    {integration.recommendation}
                  </div>
                )}
              </div>
            ))}
            
            {storageStatus?.integrations?.totalSpaceSavedGB && parseFloat(storageStatus.integrations.totalSpaceSavedGB) > 0 && (
              <div className="pt-2 border-t border-white/10">
                <div className="text-xs text-emerald-400 font-medium">
                  💾 Total Space on SSD: {storageStatus.integrations.totalSpaceSavedGB} GB
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}
      </div>
    </div>
  );
}

