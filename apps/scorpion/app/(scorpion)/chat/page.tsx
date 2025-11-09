'use client';

import { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from '@/lib/chat/chatStore';
import { loadMessages } from '@/lib/chat/persistence';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageList } from '@/components/chat/MessageList';
import { Composer } from '@/components/chat/Composer';
import { PlanTimeline } from '@/components/chat/PlanTimeline';
import { CouncilPanel } from '@/components/chat/CouncilPanel';
import { KnowledgePanel } from '@/components/chat/KnowledgePanel';
import { ToolCallCard } from '@/components/chat/ToolCallCard';
import type { CouncilVote } from '@/lib/chat/types';
import { Settings, Sparkles, Zap, Brain, Users, ChevronRight, ChevronLeft } from 'lucide-react';

/**
 * Chat-AGI Page - Integrated with Scorpion layout
 */
export default function ChatPage() {
  const {
    currentConversation,
    conversations,
    messages,
    addConversation,
    addMessage,
    updateMessage,
    setCurrentConversation,
    setStreaming,
    setConversationStreaming,
    provider,
    model,
    setProvider,
    setModel,
    setInputValue,
  } = useChatStore();
  
  const [streamingContent, setStreamingContent] = useState<Record<string, string>>({}); // Track per conversation
  const [planSteps, setPlanSteps] = useState<Record<string, any[]>>({});
  const [councilVotes, setCouncilVotes] = useState<Record<string, CouncilVote[]>>({});
  const [councilThinking, setCouncilThinking] = useState<Record<string, Record<string, string>>>({}); // conversationId -> memberId -> thinking content
  const [councilCommunications, setCouncilCommunications] = useState<Record<string, any[]>>({});
  const [knowledgeHits, setKnowledgeHits] = useState<Record<string, any[]>>({});
  const [toolCalls, setToolCalls] = useState<Record<string, any[]>>({});
  const [activePanel, setActivePanel] = useState<'plan' | 'council' | 'tools' | 'knowledge'>('plan');
  const [showSettings, setShowSettings] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [researchParam, setResearchParam] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  
  // Set mounted state after hydration and load client-side state
  useEffect(() => {
    setMounted(true);
    // Get research param from URL after mount
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setResearchParam(params.get('research'));
      
      // Load provider and model from localStorage
      const savedProvider = localStorage.getItem('chat-provider');
      const savedModel = localStorage.getItem('chat-model');
      if (savedProvider) {
        setProvider(savedProvider as any);
      }
      if (savedModel) {
        setModel(savedModel);
      }
    }
  }, [setProvider, setModel]);
  
  // Fetch available models from Ollama
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/ollama/models');
        if (response.ok) {
          const data = await response.json();
          const modelNames = data.models?.map((m: any) => m.name) || [];
          setAvailableModels(modelNames);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    };
    fetchModels();
  }, []);
  
  // Pre-populate input from research session
  useEffect(() => {
    if (researchParam && currentConversation) {
      setInputValue(`Discuss the research findings from session ${researchParam}. What are the key insights and how can we use them?`);
    }
  }, [researchParam, currentConversation]); // setInputValue is stable from Zustand
  
  // Initialize and load persisted data
  useEffect(() => {
    // Load persisted conversations
    useChatStore.getState().loadPersistedData();
    
    // Create first conversation if none exist
    const state = useChatStore.getState();
    if (state.conversations.length === 0) {
      const newConv = {
        id: uuidv4(),
        title: 'New Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addConversation(newConv);
    } else if (!state.currentConversation) {
      // Select most recent conversation
      setCurrentConversation(state.conversations[0].id);
    }
  }, [addConversation, setCurrentConversation]);
  
  // Reload messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      // Force reload messages from storage when switching conversations
      const persistedMessages = loadMessages(currentConversation);
      if (persistedMessages.length > 0) {
        // Update store with persisted messages
        const state = useChatStore.getState();
        if (JSON.stringify(state.messages[currentConversation] || []) !== JSON.stringify(persistedMessages)) {
          useChatStore.setState({
            messages: {
              ...state.messages,
              [currentConversation]: persistedMessages,
            },
          });
        }
      }
    }
  }, [currentConversation]);
  
  const handleNewConversation = async () => {
    const newConv = {
      id: uuidv4(),
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addConversation(newConv);
    
    // Sync new conversation to shared storage
    try {
      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: newConv,
          messages: [],
        }),
      });
    } catch (error) {
      console.error('[Chat] Failed to sync new conversation:', error);
      // Don't block on sync errors
    }
  };
  
  const handleStop = () => {
    console.log('[Chat] Stop requested');
    
    // Abort the fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Cancel the reader
    if (readerRef.current) {
      readerRef.current.cancel().catch(err => {
        console.warn('[Chat] Error canceling reader:', err);
      });
      readerRef.current = null;
    }
    
    // Clean up streaming state
    if (currentConversation) {
      setConversationStreaming(currentConversation, false);
      setStreamingContent(prev => {
        const next = { ...prev };
        delete next[currentConversation];
        return next;
      });
    }
  };
  
  const handleSend = async (content: string) => {
    if (!currentConversation) return;
    
    // Stop any existing stream
    handleStop();
    
    // Capture conversationId at start, but also verify it's still current during streaming
    const conversationId = currentConversation;
    
    // Add user message
    const userMsg = {
      id: uuidv4(),
      role: 'user' as const,
      content,
      ts: Date.now(),
    };
    addMessage(conversationId, userMsg);
    
    // Sync conversation to shared storage for knowledge ingestion
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      const currentMessages = messages[conversationId] || [];
      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: conversation || {
            id: conversationId,
            title: 'New Chat',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          messages: [...currentMessages, userMsg],
        }),
      });
    } catch (error) {
      console.error('[Chat] Failed to sync conversation:', error);
      // Don't block on sync errors
    }
    
    // Reset state for this conversation
    setStreamingContent(prev => ({ ...prev, [conversationId]: '' }));
    setPlanSteps(prev => ({ ...prev, [conversationId]: [] }));
    setCouncilVotes(prev => ({ ...prev, [conversationId]: [] }));
    setCouncilThinking(prev => ({ ...prev, [conversationId]: {} }));
    setCouncilCommunications(prev => ({ ...prev, [conversationId]: [] }));
    setKnowledgeHits(prev => ({ ...prev, [conversationId]: [] }));
    setToolCalls(prev => ({ ...prev, [conversationId]: [] }));
    setConversationStreaming(conversationId, true);
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      // Connect to streaming API with abort signal
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          messages: [userMsg],
          provider,
          model,
        }),
        signal: abortController.signal,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Handle SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');
      
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';
      
      while (true) {
        // Check if aborted before reading
        if (abortController.signal.aborted) {
          console.log('[Chat] Stream aborted, stopping read loop');
          break;
        }
        
        const { done, value } = await reader.read();
        if (done) break;
        
        // Check again after read (in case abort happened during read)
        if (abortController.signal.aborted) {
          console.log('[Chat] Stream aborted after read, stopping');
          break;
        }
        
        // Check if conversation was switched during streaming
        // If so, we should still process events but they'll go to the original conversation
        // This prevents mixing, but we could also abort the stream
        const currentConv = useChatStore.getState().currentConversation;
        if (currentConv !== conversationId) {
          console.warn(`[Chat] Conversation switched during stream. Original: ${conversationId}, Current: ${currentConv}`);
          // Optionally: abort the stream or continue with original conversationId
          // For now, we'll continue with the original to prevent mixing
        }
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const event = JSON.parse(line.slice(6));
            
            // Use the original conversationId for all events to prevent mixing
            // This ensures all events from this stream go to the correct conversation
            const targetConversationId = conversationId;
            
            switch (event.type) {
              case 'delta':
                assistantContent += event.data.content;
                setStreamingContent(prev => ({ ...prev, [targetConversationId]: assistantContent }));
                break;
                
              case 'plan_step':
                setPlanSteps(prev => ({
                  ...prev,
                  [targetConversationId]: (() => {
                    const existing = prev[targetConversationId]?.find(s => s.id === event.data.id);
                    if (existing) {
                      return prev[targetConversationId].map(s => s.id === event.data.id ? { ...s, ...event.data } : s);
                    }
                    return [...(prev[targetConversationId] || []), event.data];
                  })(),
                }));
                break;
                
              case 'council_start':
                // Reset council state
                setCouncilVotes(prev => ({ ...prev, [targetConversationId]: [] }));
                setCouncilThinking(prev => ({ ...prev, [targetConversationId]: {} }));
                setCouncilCommunications(prev => ({ ...prev, [targetConversationId]: [] }));
                if (targetConversationId === currentConversation) {
                  setActivePanel('council');
                }
                break;
                
              case 'council_thinking':
                // Update thinking status
                if (event.data.status === 'completed' && event.data.fullResponse) {
                  setCouncilThinking(prev => ({
                    ...prev,
                    [targetConversationId]: {
                      ...(prev[targetConversationId] || {}),
                      [event.data.memberId]: event.data.fullResponse,
                    },
                  }));
                }
                break;
                
              case 'council_thinking_delta':
                // Stream thinking content in real-time
                setCouncilThinking(prev => ({
                  ...prev,
                  [targetConversationId]: {
                    ...(prev[targetConversationId] || {}),
                    [event.data.memberId]: event.data.accumulated,
                  },
                }));
                break;
                
              case 'council_communication':
                // Add communication to list
                setCouncilCommunications(prev => ({
                  ...prev,
                  [targetConversationId]: [...(prev[targetConversationId] || []), event.data],
                }));
                break;
                
              case 'council_vote':
                setCouncilVotes(prev => ({
                  ...prev,
                  [targetConversationId]: [...(prev[targetConversationId] || []), event.data],
                }));
                break;
                
              case 'council_complete':
                // Council deliberation finished
                break;
                
              case 'council_consensus':
                // Show consensus result
                break;
                
              case 'council_error':
                console.error('[Council] Error:', event.data.message);
                break;
                
              case 'tool':
                setToolCalls(prev => ({
                  ...prev,
                  [targetConversationId]: (() => {
                    const existing = prev[targetConversationId]?.find(t => t.callId === event.data.callId);
                    if (existing) {
                      return prev[targetConversationId].map(t => t.callId === event.data.callId ? { ...t, ...event.data } : t);
                    }
                    return [...(prev[targetConversationId] || []), event.data];
                  })(),
                }));
                
                // Extract knowledge hits from kb.search tool results
                if (event.data.tool === 'kb.search' && event.data.status === 'completed' && event.data.result?.hits) {
                  setKnowledgeHits(prev => ({
                    ...prev,
                    [targetConversationId]: event.data.result.hits || [],
                  }));
                  // Auto-switch to knowledge panel if it's the current conversation
                  if (targetConversationId === currentConversation) {
                    setActivePanel('knowledge');
                  }
                }
                break;
                
              case 'knowledge':
                // Handle dedicated knowledge event
                setKnowledgeHits(prev => ({
                  ...prev,
                  [targetConversationId]: event.data.hits || [],
                }));
                // Auto-switch to knowledge panel if it's the current conversation
                if (targetConversationId === currentConversation) {
                  setActivePanel('knowledge');
                }
                break;
                
              case 'status':
                if (targetConversationId === currentConversation) {
                  if (event.data.phase === 'planning') setActivePanel('plan');
                  else if (event.data.phase === 'council') setActivePanel('council');
                  else if (event.data.phase === 'executing') setActivePanel('tools');
                }
                break;
                
              case 'done':
                addMessage(targetConversationId, {
                  id: event.data.messageId,
                  role: 'assistant' as const,
                  content: assistantContent,
                  ts: Date.now(),
                });
                
                // Sync conversation after assistant response
                try {
                  const conversation = conversations.find(c => c.id === targetConversationId);
                  const currentMessages = messages[targetConversationId] || [];
                  await fetch('/api/conversations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      conversation: conversation || {
                        id: targetConversationId,
                        title: 'New Chat',
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                      },
                      messages: currentMessages,
                    }),
                  });
                } catch (error) {
                  console.error('[Chat] Failed to sync conversation:', error);
                  // Don't block on sync errors
                }
                
                setStreamingContent(prev => {
                  const next = { ...prev };
                  delete next[targetConversationId];
                  return next;
                });
                setConversationStreaming(targetConversationId, false);
                break;
                
              case 'error':
                console.error('[Chat] Error:', event.data.message);
                addMessage(targetConversationId, {
                  id: uuidv4(),
                  role: 'assistant' as const,
                  content: `❌ **Error:** ${event.data.message}\n\n${event.data.details ? `\`\`\`\n${event.data.details}\n\`\`\`` : ''}`,
                  ts: Date.now(),
                });
                setConversationStreaming(targetConversationId, false);
                setStreamingContent(prev => {
                  const next = { ...prev };
                  delete next[targetConversationId];
                  return next;
                });
                break;
                
            }
          } catch (error) {
            console.error('[Chat] Failed to parse event:', error);
          }
        }
      }
      
      // Clean up refs if stream completed normally
      if (!abortController.signal.aborted) {
        abortControllerRef.current = null;
        readerRef.current = null;
      }
    } catch (error: any) {
      // Don't show error if it was aborted
      if (error.name === 'AbortError' || abortController.signal.aborted) {
        console.log('[Chat] Stream aborted by user');
        // Add a message indicating it was stopped
        addMessage(conversationId, {
          id: uuidv4(),
          role: 'assistant' as const,
          content: '⏹️ **Generation stopped**',
          ts: Date.now(),
        });
      } else {
        console.error('[Chat] Stream error:', error);
        addMessage(conversationId, {
          id: uuidv4(),
          role: 'assistant' as const,
          content: `❌ **Connection Error:** ${error.message}\n\nPlease check:\n- Ollama is running\n- Model is available\n- Network connection`,
          ts: Date.now(),
        });
      }
      setConversationStreaming(conversationId, false);
      setStreamingContent(prev => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
      abortControllerRef.current = null;
      readerRef.current = null;
    } finally {
      // Only update streaming state if not already cleaned up
      if (!abortController.signal.aborted) {
        setConversationStreaming(conversationId, false);
        setStreamingContent(prev => {
          const next = { ...prev };
          delete next[conversationId];
          return next;
        });
      }
    }
  };
  
  // Get current conversation's state
  const currentMessages = currentConversation ? messages[currentConversation] || [] : [];
  const currentStreamingContent = currentConversation ? streamingContent[currentConversation] || '' : '';
  const currentPlanSteps = currentConversation ? planSteps[currentConversation] || [] : [];
  const currentCouncilVotes = currentConversation ? councilVotes[currentConversation] || [] : [];
  const currentCouncilThinking = currentConversation ? councilThinking[currentConversation] || {} : {};
  const currentCouncilCommunications = currentConversation ? councilCommunications[currentConversation] || [] : [];
  const currentToolCalls = currentConversation ? toolCalls[currentConversation] || [] : [];
  const currentKnowledgeHits = currentConversation ? knowledgeHits[currentConversation] || [] : [];
  
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#0a0d10] via-[#0c1014] to-[#0a0d10]">
      {/* Top Bar - Grok style */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0c1014]/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">SCORPION</h1>
            <p className="text-xs text-white/50 mt-0.5">Chat-AGI Interface</p>
          </div>
        </div>
        
        {/* Model Configuration - Compact */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/50">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              className="px-2 py-1 bg-[#0f1318] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400/50"
            >
              <option value="ollama">Ollama</option>
              <option value="openai">OpenAI</option>
              <option value="azure">Azure</option>
              <option value="local">Local</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/50">Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="qwen2.5-coder"
              className="w-40 px-2 py-1 bg-[#0f1318] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400/50"
            />
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4 text-white/60" />
          </button>
        </div>
      </div>
      
      {/* Main Content - Optimized proportions */}
      <div className="flex-1 flex overflow-hidden min-w-0">
        {/* Left: Conversation List - Compact */}
        <div className="w-48 border-r border-white/10 bg-[#0c1014]/30 backdrop-blur-xl flex-shrink-0">
          <ConversationList
            conversations={conversations}
            currentId={currentConversation}
            onSelect={setCurrentConversation}
            onNew={handleNewConversation}
            onDelete={(id) => useChatStore.getState().deleteConversation(id)}
          />
        </div>
        
        {/* Center: Chat - Takes most space */}
        <div className="flex-1 flex flex-col relative min-w-0">
          <MessageList messages={currentMessages} streamingContent={currentStreamingContent} />
          <Composer onSend={handleSend} onStop={handleStop} />
        </div>
        
        {/* Right Panel Toggle Button - Fixed position when hidden */}
        {!showRightPanel && (
          <button
            onClick={() => setShowRightPanel(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40 px-3 py-4 bg-[#0c1014]/95 backdrop-blur-xl border-l-2 border-t border-b border-emerald-400/30 rounded-l-lg hover:bg-emerald-400/10 hover:border-emerald-400/50 transition-all duration-300 shadow-lg"
            aria-label="Show right panel"
            title="Show panel"
          >
            <ChevronLeft className="h-5 w-5 text-emerald-400" />
          </button>
        )}
        
        {/* Right: Panels - Collapsible, compact when visible */}
        {showRightPanel && (
          <div className="w-64 border-l border-white/10 bg-[#0c1014]/30 backdrop-blur-xl flex flex-col flex-shrink-0 transition-all duration-300">
            {/* Panel Header with Toggle */}
            <div className="flex items-center border-b border-white/10">
              {/* Tabs */}
              <div className="flex-1 flex">
                {(['plan', 'council', 'tools', 'knowledge'] as const).map((panel) => (
                  <button
                    key={panel}
                    onClick={() => setActivePanel(panel)}
                    className={`flex-1 px-2 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                      activePanel === panel
                        ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5'
                        : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {panel === 'plan' && <Zap className="h-3 w-3 inline mr-1" />}
                    {panel === 'council' && <Users className="h-3 w-3 inline mr-1" />}
                    {panel === 'tools' && <Sparkles className="h-3 w-3 inline mr-1" />}
                    {panel === 'knowledge' && <Brain className="h-3 w-3 inline mr-1" />}
                    <span className="hidden sm:inline">{panel}</span>
                  </button>
                ))}
              </div>
              {/* Toggle Button - Prominent */}
              <button
                onClick={() => setShowRightPanel(false)}
                className="px-3 py-2.5 border-l border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
                aria-label="Hide right panel"
                title="Hide panel"
              >
                <ChevronRight className="h-4 w-4 text-white/70 hover:text-white" />
              </button>
            </div>
          
          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activePanel === 'plan' && (
              currentPlanSteps.length > 0 ? (
                <PlanTimeline steps={currentPlanSteps} />
              ) : (
                <div className="text-center text-white/40 text-sm py-8">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-white/20" />
                  <p>No plan steps yet</p>
                </div>
              )
            )}
            
            {activePanel === 'council' && (
              currentCouncilVotes.length > 0 || Object.keys(currentCouncilThinking).length > 0 || currentCouncilCommunications.length > 0 ? (
                <CouncilPanel 
                  votes={currentCouncilVotes} 
                  thinking={currentCouncilThinking}
                  communications={currentCouncilCommunications}
                />
              ) : (
                <div className="text-center text-white/40 text-sm py-8">
                  <Users className="h-8 w-8 mx-auto mb-2 text-white/20" />
                  <p>No council votes yet</p>
                </div>
              )
            )}
            
            {activePanel === 'tools' && (
              currentToolCalls.length > 0 ? (
                <div className="space-y-2">
                  {currentToolCalls.map((tool, i) => (
                    <ToolCallCard key={i} {...tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-white/40 text-sm py-8">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-white/20" />
                  <p>No tool calls yet</p>
                </div>
              )
            )}
            
            {activePanel === 'knowledge' && (
              currentKnowledgeHits.length > 0 ? (
                <KnowledgePanel hits={currentKnowledgeHits} />
              ) : (
                <div className="text-center text-white/40 text-sm py-8">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-white/20" />
                  <p>No knowledge hits yet</p>
                </div>
              )
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}