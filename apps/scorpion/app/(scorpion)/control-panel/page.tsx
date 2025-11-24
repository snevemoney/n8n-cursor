/**
 * Scorpion Control Panel
 * Visual interface for adjusting behavior dials
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Tabs, TabsList, TabsTrigger, TabsContent, Textarea, useToast } from '@/components/scorpion';

interface BehaviorMode {
  mode: string;
  description: string;
  tone: string;
  maxDepth: string;
  safetyBias: string;
  costBias: string;
}

interface KnowledgeSource {
  source: string;
  weight: number;
}

interface Memory {
  id: string;
  scope: string;
  content: string;
  weight: number;
  tags?: string[];
}

export default function ControlPanelPage() {
  const { showToast } = useToast();
  
  // State
  const [currentMode, setCurrentMode] = useState<string>('owner');
  const [modes, setModes] = useState<BehaviorMode[]>([]);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newMemory, setNewMemory] = useState({ scope: 'global', content: '', weight: 3, tags: [] as string[] });
  const [feedbackSummary, setFeedbackSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Load current mode
      const modeRes = await fetch('/api/v1/control-panel/mode');
      if (modeRes.ok) {
        const modeData = await modeRes.json();
        setCurrentMode(modeData.data?.mode || 'owner');
      }

      // Load modes
      const modesRes = await fetch('/api/v1/control-panel/modes');
      if (modesRes.ok) {
        const modesData = await modesRes.json();
        setModes(modesData.data?.modes || []);
      }

      // Load knowledge sources
      const knowledgeRes = await fetch('/api/v1/control-panel/knowledge');
      if (knowledgeRes.ok) {
        const knowledgeData = await knowledgeRes.json();
        setKnowledgeSources(knowledgeData.data?.sources || []);
      }

      // Load memories
      const memoriesRes = await fetch('/api/v1/control-panel/memories');
      if (memoriesRes.ok) {
        const memoriesData = await memoriesRes.json();
        setMemories(memoriesData.data?.memories || []);
      }

      // Load feedback summary
      const feedbackRes = await fetch('/api/v1/feedback');
      if (feedbackRes.ok) {
        const feedbackData = await feedbackRes.json();
        setFeedbackSummary(feedbackData.data || feedbackData);
      }
    } catch (error) {
      console.error('Failed to load control panel data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateMode(mode: string) {
    try {
      const res = await fetch('/api/v1/control-panel/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });

      if (res.ok) {
        setCurrentMode(mode);
        showToast('success', `Mode changed to ${mode}`);
      } else {
        showToast('error', 'Failed to update mode');
      }
    } catch (error) {
      showToast('error', 'Failed to update mode');
    }
  }

  async function updateKnowledgeWeight(source: string, weight: number) {
    try {
      const res = await fetch('/api/v1/control-panel/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, weight }),
      });

      if (res.ok) {
        setKnowledgeSources(prev => 
          prev.map(s => s.source === source ? { ...s, weight } : s)
        );
        showToast('success', `Updated ${source} weight to ${weight}`);
      } else {
        showToast('error', 'Failed to update knowledge weight');
      }
    } catch (error) {
      showToast('error', 'Failed to update knowledge weight');
    }
  }

  async function createMemory() {
    try {
      const res = await fetch('/api/v1/control-panel/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMemory),
      });

      if (res.ok) {
        await loadData();
        setNewMemory({ scope: 'global', content: '', weight: 3, tags: [] });
        showToast('success', 'Memory created');
      } else {
        showToast('error', 'Failed to create memory');
      }
    } catch (error) {
      showToast('error', 'Failed to create memory');
    }
  }

  async function deleteMemory(id: string) {
    try {
      const res = await fetch(`/api/v1/control-panel/memories/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadData();
        showToast('success', 'Memory deleted');
      } else {
        showToast('error', 'Failed to delete memory');
      }
    } catch (error) {
      showToast('error', 'Failed to delete memory');
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-white/60">Loading control panel...</div>
      </div>
    );
  }

  const currentModeConfig = modes.find(m => m.mode === currentMode);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Scorpion Control Panel</h1>
        <p className="text-white/60 mt-2">
          Control Scorpion's behavior through 4 dials: Policy, Knowledge, Tools, and Memory
        </p>
      </div>

      <Tabs defaultValue="policy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="policy">Policy Dial</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Dial</TabsTrigger>
          <TabsTrigger value="memory">Memory Dial</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Policy Dial */}
        <TabsContent value="policy" className="space-y-4">
          <Card title="Behavior Mode">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Current Mode</label>
                <Select
                  value={currentMode}
                  onChange={(e) => updateMode(e.target.value)}
                  options={modes.map(mode => ({
                    value: mode.mode,
                    label: `${mode.mode} - ${mode.description}`,
                  }))}
                />
              </div>

              {currentModeConfig && (
                <div className="space-y-2 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-sm"><strong className="text-white/80">Tone:</strong> <span className="text-white/60">{currentModeConfig.tone}</span></div>
                  <div className="text-sm"><strong className="text-white/80">Max Depth:</strong> <span className="text-white/60">{currentModeConfig.maxDepth}</span></div>
                  <div className="text-sm"><strong className="text-white/80">Safety Bias:</strong> <span className="text-white/60">{currentModeConfig.safetyBias}</span></div>
                  <div className="text-sm"><strong className="text-white/80">Cost Bias:</strong> <span className="text-white/60">{currentModeConfig.costBias}</span></div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Knowledge Dial */}
        <TabsContent value="knowledge" className="space-y-4">
          <Card title="Knowledge Source Weights">
            <div className="space-y-4">
              {knowledgeSources.map(source => (
                <div key={source.source} className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{source.source}</div>
                    <div className="text-sm text-white/60">
                      Weight: {source.weight.toFixed(1)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={source.weight}
                      onChange={(e) => {
                        const weight = parseFloat(e.target.value);
                        if (!isNaN(weight)) {
                          updateKnowledgeWeight(source.source, weight);
                        }
                      }}
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Memory Dial */}
        <TabsContent value="memory" className="space-y-4">
          <Card title="Long-term Memory">
            <div className="space-y-4">
              {/* Create new memory */}
              <div className="p-4 border border-white/10 rounded-lg space-y-4">
                <h3 className="font-medium text-white">Add New Memory</h3>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Scope</label>
                  <Select
                    value={newMemory.scope}
                    onChange={(e) => setNewMemory({ ...newMemory, scope: e.target.value })}
                    options={[
                      { value: 'global', label: 'Global' },
                      { value: 'finance', label: 'Finance' },
                      { value: 'nursing', label: 'Nursing' },
                      { value: 'ai', label: 'AI' },
                      { value: 'bitcoin', label: 'Bitcoin' },
                      { value: 'architecture', label: 'Architecture' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Content</label>
                  <Textarea
                    value={newMemory.content}
                    onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                    placeholder="E.g., Evens prioritizes Bitcoin over traditional stocks."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Weight (1-5)</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={newMemory.weight}
                    onChange={(e) => setNewMemory({ ...newMemory, weight: parseInt(e.target.value) || 3 })}
                  />
                </div>
                <Button onClick={createMemory}>Create Memory</Button>
              </div>

              {/* Existing memories */}
              <div className="space-y-2">
                <h3 className="font-medium text-white">Existing Memories</h3>
                {memories.map(memory => (
                  <div key={memory.id} className="p-4 border border-white/10 rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white/80">{memory.scope}</span>
                          <span className="text-xs text-white/40">Weight: {memory.weight}</span>
                        </div>
                        <div className="text-white/80">{memory.content}</div>
                        {memory.tags && memory.tags.length > 0 && (
                          <div className="mt-2 flex gap-1">
                            {memory.tags.map(tag => (
                              <span key={tag} className="text-xs bg-white/10 px-2 py-1 rounded text-white/60">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteMemory(memory.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Feedback */}
        <TabsContent value="feedback" className="space-y-4">
          <Card title="Feedback Summary">
            {feedbackSummary ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-white mb-2">Ratings</h3>
                  <div className="space-y-2">
                    {feedbackSummary.summary?.map((item: any) => (
                      <div key={item.rating} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                        <span className="capitalize text-white/80">{item.rating}</span>
                        <span className="font-medium text-white">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {feedbackSummary.recent && feedbackSummary.recent.length > 0 && (
                  <div>
                    <h3 className="font-medium text-white mb-2">Recent Feedback</h3>
                    <div className="space-y-2">
                      {feedbackSummary.recent.slice(0, 5).map((item: any) => (
                        <div key={item.id} className="p-3 border border-white/10 rounded">
                          <div className="flex items-center justify-between">
                            <span className="capitalize text-white/80">{item.rating}</span>
                            <span className="text-xs text-white/40">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {item.tags && item.tags.length > 0 && (
                            <div className="mt-2 flex gap-1">
                              {item.tags.map((tag: string) => (
                                <span key={tag} className="text-xs bg-white/10 px-2 py-1 rounded text-white/60">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.comment && (
                            <div className="mt-2 text-sm text-white/60">{item.comment}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white/60">No feedback yet</div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
