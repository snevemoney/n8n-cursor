'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from '@/lib/chat/chatStore';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageList } from '@/components/chat/MessageList';
import { Composer } from '@/components/chat/Composer';
import { PlanTimeline } from '@/components/chat/PlanTimeline';
import { CouncilPanel } from '@/components/chat/CouncilPanel';
import { KnowledgePanel } from '@/components/chat/KnowledgePanel';
import { ToolCallCard } from '@/components/chat/ToolCallCard';
import type { CouncilVote } from '@/lib/chat/types';
import { Settings } from 'lucide-react';

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
    provider,
    model,
    setProvider,
    setModel,
  } = useChatStore();
  
  const [streamingContent, setStreamingContent] = useState('');
  const [planSteps, setPlanSteps] = useState<any[]>([]);
  const [councilVotes, setCouncilVotes] = useState<CouncilVote[]>([]);
  const [knowledgeHits, setKnowledgeHits] = useState<any[]>([]);
  const [toolCalls, setToolCalls] = useState<any[]>([]);
  const [activePanel, setActivePanel] = useState<'plan' | 'council' | 'tools' | 'knowledge'>('plan');
  const [showSettings, setShowSettings] = useState(false);
  
  // Initialize and load persisted data
  useEffect(() => {
    // Load persisted conversations
    useChatStore.getState().loadPersistedData();
    
    // Create first conversation if none exist
    const state = useChatStore.getState();
    if (state.conversations.length === 0) {
      handleNewConversation();
    } else if (!state.currentConversation) {
      // Select most recent conversation
      setCurrentConversation(state.conversations[0].id);
    }
  }, []);
  
  const handleNewConversation = () => {
    const newConv = {
      id: uuidv4(),
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addConversation(newConv);
  };
  
  const handleSend = async (content: string) => {
    if (!currentConversation) return;
    
    // Add user message
    const userMsg = {
      id: uuidv4(),
      role: 'user' as const,
      content,
      ts: Date.now(),
    };
    addMessage(currentConversation, userMsg);
    
    // Reset state
    setStreamingContent('');
    setPlanSteps([]);
    setCouncilVotes([]);
    setKnowledgeHits([]);
    setToolCalls([]);
    setStreaming(true);
    
    try {
      // Connect to streaming API
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversation,
          messages: [userMsg],
          provider,
          model,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Handle SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');
      
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const event = JSON.parse(line.slice(6));
            
            switch (event.type) {
              case 'delta':
                assistantContent += event.data.content;
                setStreamingContent(assistantContent);
                break;
                
              case 'plan_step':
                setPlanSteps(prev => {
                  const existing = prev.find(s => s.id === event.data.id);
                  if (existing) {
                    return prev.map(s => s.id === event.data.id ? { ...s, ...event.data } : s);
                  }
                  return [...prev, event.data];
                });
                break;
                
              case 'council_vote':
                setCouncilVotes(prev => [...prev, event.data]);
                break;
                
              case 'tool':
                setToolCalls(prev => {
                  const existing = prev.find(t => t.callId === event.data.callId);
                  if (existing) {
                    return prev.map(t => t.callId === event.data.callId ? { ...t, ...event.data } : t);
                  }
                  return [...prev, event.data];
                });
                break;
                
              case 'status':
                // Update active panel based on phase
                if (event.data.phase === 'planning') setActivePanel('plan');
                else if (event.data.phase === 'council') setActivePanel('council');
                else if (event.data.phase === 'executing') setActivePanel('tools');
                break;
                
              case 'done':
                // Add final assistant message
                addMessage(currentConversation, {
                  id: event.data.messageId,
                  role: 'assistant' as const,
                  content: assistantContent,
                  ts: Date.now(),
                });
                setStreamingContent('');
                break;
                
              case 'error':
                console.error('[Chat] Error:', event.data.message);
                break;
            }
          } catch (error) {
            console.error('[Chat] Failed to parse event:', error);
          }
        }
      }
    } catch (error: any) {
      console.error('[Chat] Stream error:', error);
      addMessage(currentConversation, {
        id: uuidv4(),
        role: 'assistant' as const,
        content: `Error: ${error.message}`,
        ts: Date.now(),
      });
    } finally {
      setStreaming(false);
    }
  };
  
  const currentMessages = currentConversation ? messages[currentConversation] || [] : [];
  
  return (
    <div className="h-full flex flex-col">
      {/* Top Bar with Model Settings */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div>
          <h1 className="text-xl font-semibold text-white">Chat AGI</h1>
          <p className="text-sm text-white/40 mt-0.5">
            AI-powered conversational interface with council deliberation
          </p>
        </div>
        
        {/* Model Configuration */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/60">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              className="px-3 py-1.5 bg-[#0f1318] border border-white/10 rounded text-sm text-white focus:outline-none focus:border-emerald-400/50"
            >
              <option value="ollama">Ollama</option>
              <option value="openai">OpenAI</option>
              <option value="azure">Azure</option>
              <option value="local">Local</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/60">Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="qwen2.5-coder"
              className="w-48 px-3 py-1.5 bg-[#0f1318] border border-white/10 rounded text-sm text-white focus:outline-none focus:border-emerald-400/50"
            />
          </div>
          
          <div className="h-6 w-px bg-white/10" />
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${
              true ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                true ? 'bg-emerald-400' : 'bg-red-400'
              }`} />
              Connected
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Conversation List */}
        <ConversationList
          conversations={conversations}
          currentId={currentConversation}
          onSelect={setCurrentConversation}
          onNew={handleNewConversation}
          onDelete={(id) => useChatStore.getState().deleteConversation(id)}
        />
        
        {/* Center: Chat Messages */}
        <div className="flex-1 flex flex-col bg-[#0a0e13]">
          <MessageList messages={currentMessages} streamingContent={streamingContent} />
          <Composer onSend={handleSend} />
        </div>
        
        {/* Right: Side Panels */}
        <div className="w-80 border-l border-white/5 bg-[#0a0e13] flex flex-col">
          {/* Panel Tabs */}
          <div className="flex border-b border-white/5">
            {(['plan', 'council', 'tools', 'knowledge'] as const).map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-wide transition-colors ${
                  activePanel === panel
                    ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                {panel}
              </button>
            ))}
          </div>
          
          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activePanel === 'plan' && (
              planSteps.length > 0 ? (
                <PlanTimeline steps={planSteps} />
              ) : (
                <div className="text-center text-white/40 text-sm py-8">
                  No plan steps yet
                </div>
              )
            )}
            
            {activePanel === 'council' && (
              councilVotes.length > 0 ? (
                <CouncilPanel votes={councilVotes} />
              ) : (
                <div className="text-center text-white/40 text-sm py-8">
                  No council votes yet
                </div>
              )
            )}
            
            {activePanel === 'tools' && (
              toolCalls.length > 0 ? (
                <div className="space-y-2">
                  {toolCalls.map((tool, i) => (
                    <ToolCallCard key={i} {...tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-white/40 text-sm py-8">
                  No tool calls yet
                </div>
              )
            )}
            
            {activePanel === 'knowledge' && (
              knowledgeHits.length > 0 ? (
                <KnowledgePanel hits={knowledgeHits} />
              ) : (
                <div className="text-center text-white/40 text-sm py-8">
                  No knowledge hits yet
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

