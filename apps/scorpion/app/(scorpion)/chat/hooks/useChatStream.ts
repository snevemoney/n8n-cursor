import { useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from '@/lib/chat/chatStore';

interface UseChatStreamProps {
  currentConversation: string | null;
  conversations: any[];
  messages: Record<string, any[]>;
  provider: 'ollama' | 'openai';
  model: string;
  setStreamingContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setPlanSteps: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  setPlans: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setCouncilVotes: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  setCouncilThinking: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>;
  setCouncilCommunications: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  setCouncilConsensus: React.Dispatch<React.SetStateAction<Record<string, { summary: string; score: number; approved: boolean } | null>>>;
  setKnowledgeHits: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  setKnowledgeSearchQuery: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setToolCalls: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  setActivePanel: React.Dispatch<React.SetStateAction<'plan' | 'council' | 'tools' | 'knowledge' | 'user-tools'>>;
  setProgress: React.Dispatch<React.SetStateAction<Record<string, { phase: string; progress: number; message: string; step?: string }>>>;
  setToolProgress: React.Dispatch<React.SetStateAction<Record<string, Record<string, { tool: string; progress: string; status: string }>>>>;
  setShowRightPanel: React.Dispatch<React.SetStateAction<boolean>>;
  activePanel: 'plan' | 'council' | 'tools' | 'knowledge' | 'user-tools';
  setNextBestAction?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setCouncilResult?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setCreativePipeline?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setDataWorkflow?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export function useChatStream({
  currentConversation,
  conversations,
  messages,
  provider,
  model,
  setStreamingContent,
  setPlanSteps,
  setPlans,
  setCouncilVotes,
  setCouncilThinking,
  setCouncilCommunications,
  setCouncilConsensus,
  setKnowledgeHits,
  setKnowledgeSearchQuery,
  setToolCalls,
  setActivePanel,
  setProgress,
  setToolProgress,
  setShowRightPanel,
  activePanel,
  setNextBestAction,
  setCouncilResult,
  setCreativePipeline,
  setDataWorkflow,
  appendAudit,
}: UseChatStreamProps & { appendAudit?: (cid: string, e: any) => void }) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const mountedRef = useRef(true);
  const { addMessage, setConversationStreaming } = useChatStore();
  
  // Cleanup on unmount or conversation change
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Power of 10 Rule 7: Only abort if conversation actually changed, not on every render
      // This prevents premature stream abortion during normal operation
      const currentConv = useChatStore.getState().currentConversation;
      if (currentConv !== currentConversation) {
        // Conversation changed - abort old stream
        if (abortControllerRef.current) {
          console.log('[Chat] Conversation changed, aborting previous stream');
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        if (readerRef.current) {
          try {
            readerRef.current.cancel().catch(() => {});
          } catch (err) {
            // Ignore
          }
          readerRef.current = null;
        }
      }
      // Note: We don't abort on unmount if conversation hasn't changed
      // This allows streams to complete even if component unmounts temporarily
    };
  }, [currentConversation]);

  // Helper to safely update state only if component is mounted
  const safeStateUpdate = <T,>(updater: React.Dispatch<React.SetStateAction<T>>, updateFn: (prev: T) => T) => {
    if (mountedRef.current) {
      try {
        updater(updateFn);
      } catch (error) {
        // Component may have unmounted during update, ignore
        console.warn('[Chat] State update failed (component may have unmounted):', error);
      }
    }
  };

  const handleStop = () => {
    console.log('[Chat] Stop requested');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (readerRef.current) {
      try {
        readerRef.current.cancel().catch(() => {
          // Reader may already be closed, ignore
      });
      } catch (err) {
        // Reader may already be closed, ignore
      }
      readerRef.current = null;
    }
    
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
    console.log('[useChatStream] handleSend called', {
      content,
      contentLength: content.length,
      currentConversation,
      timestamp: Date.now()
    });
    
    if (!currentConversation) {
      const state = useChatStore.getState();
      if (state.conversations.length === 0) {
        const newConv = {
          id: uuidv4(),
          title: 'New Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        useChatStore.getState().addConversation(newConv);
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        // Power of 10 Rule 7: Guard undefined - ensure conversation exists
        const firstConversation = state.conversations[0];
        if (firstConversation) {
          useChatStore.getState().setCurrentConversation(firstConversation.id);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
    
    const finalConversationId = useChatStore.getState().currentConversation;
    if (!finalConversationId) {
      console.error('[Chat] Failed to initialize conversation');
      return;
    }
    
    // Stop any existing stream before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (readerRef.current) {
      try {
        readerRef.current.cancel().catch(() => {});
      } catch (err) {
        // Reader may already be closed
      }
      readerRef.current = null;
    }
    
    const conversationId = finalConversationId;
    
    const userMsg = {
      id: uuidv4(),
      role: 'user' as const,
      content,
      ts: Date.now(),
    };
    addMessage(conversationId, userMsg);
    
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation && conversation.title === 'New Chat') {
      const cleaned = content.replace(/^\/\w+\s+/, '').trim();
      const firstSentence = cleaned.split(/[.!?]\s/)[0];
      // Power of 10 Rule 7: Guard undefined - ensure firstSentence exists
      if (firstSentence) {
        const title = firstSentence.length <= 50 ? firstSentence : cleaned.slice(0, 47) + '...';
        if (title && title !== 'New Chat') {
          useChatStore.getState().updateConversation(conversationId, { title });
        }
      }
    }
    
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
    }
    
    setStreamingContent(prev => ({ ...prev, [conversationId]: '' }));
    setPlanSteps(prev => ({ ...prev, [conversationId]: [] }));
    setCouncilVotes(prev => ({ ...prev, [conversationId]: [] }));
    setCouncilThinking(prev => ({ ...prev, [conversationId]: {} }));
    setCouncilCommunications(prev => ({ ...prev, [conversationId]: [] }));
    setCouncilConsensus(prev => ({ ...prev, [conversationId]: null }));
    setKnowledgeHits(prev => ({ ...prev, [conversationId]: [] }));
    setToolCalls(prev => ({ ...prev, [conversationId]: [] }));
    setConversationStreaming(conversationId, true);
    
    let retryCount = 0;
    const maxRetries = 3;
    const userMessageContent = content; // Capture content for use in closure
    
    const attemptStream = async (): Promise<void> => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      try {
        const conversationMessages = messages[conversationId] || [];
        
        let response: Response;
        try {
          // JARVIS MODE: Always treat as owner (single-user system)
          // Evens Louis is the only user and has full access to everything
          const clientMode = 'owner';
          
          console.log('[useChatStream] Attempting to fetch /api/chat/stream', {
            conversationId,
            messageCount: conversationMessages.length + 1,
            provider,
            model,
            clientMode
          });
          
          response = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId,
              messages: [...conversationMessages, userMsg],
              provider,
              model,
              clientMode, // Always 'owner' - single-user Jarvis mode
            }),
            signal: abortController.signal,
          });
          
          console.log('[useChatStream] Fetch response received', {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText
          });
        } catch (fetchError: any) {
          const fetchErrorMsg = fetchError.message || fetchError.toString() || '';
          const isConnectionError = 
            fetchErrorMsg.includes('ERR_CONNECTION_REFUSED') ||
            fetchErrorMsg.includes('Failed to fetch') ||
            fetchErrorMsg.includes('ECONNREFUSED') ||
            fetchErrorMsg.includes('NetworkError') ||
            fetchError.code === 'ECONNREFUSED' ||
            fetchError.cause?.code === 'ECONNREFUSED';
          
          if (isConnectionError) {
            throw new Error(`Cannot connect to chat server. Make sure the Next.js dev server is running: \`cd apps/scorpion && pnpm dev\``);
          }
          throw fetchError;
        }
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment.');
          } else if (response.status === 503) {
            throw new Error('Service temporarily unavailable. Please try again.');
          } else {
            const errorText = await response.text().catch(() => '');
            // Strip HTML tags and clean error message
            let cleanError = errorText
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/&[^;]+;/g, '') // Remove HTML entities
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim()
              .substring(0, 200);
            
            // If error is just HTML structure, provide a cleaner message
            if (cleanError.length < 20 || cleanError.toLowerCase().includes('doctype') || cleanError.toLowerCase().includes('html')) {
              cleanError = `Server error (${response.status}). Please try again or check server logs.`;
            }
            
            throw new Error(`API error (${response.status}): ${cleanError}`);
          }
        }
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');
        
        readerRef.current = reader;
        const decoder = new TextDecoder();
        let buffer = '';
        let assistantContent = '';
        let savedPlan: any = null; // Store the plan structure for saving in message
        
        while (true) {
          if (abortController.signal.aborted) {
            console.log('[Chat] Stream aborted, stopping read loop');
            break;
          }
          
          const { done, value } = await reader.read();
          if (done) break;
          
          if (abortController.signal.aborted) {
            console.log('[Chat] Stream aborted after read, stopping');
            break;
          }
          
          const currentConv = useChatStore.getState().currentConversation;
          if (currentConv !== conversationId) {
            console.warn(`[Chat] Conversation switched during stream. Original: ${conversationId}, Current: ${currentConv}`);
          }
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (!line.startsWith('data: ')) {
              if (line.trim() && !line.startsWith(':')) {
                console.log('[Chat Stream] Non-data line:', line.substring(0, 100));
              }
              continue;
            }
            
            // Check if component is still mounted before processing events
            if (!mountedRef.current || abortController.signal.aborted) {
              console.log('[Chat] Component unmounted or aborted, stopping event processing');
              break;
            }
            
            try {
              const eventData = line.slice(6);
              const event = JSON.parse(eventData);
              const targetConversationId = conversationId;
              
              // Log all event types for debugging
              if (event.type) {
                console.log('[Chat Stream] Event received:', event.type, event.data ? Object.keys(event.data) : 'no data');
              }
              
              // Log all council-related events for debugging
              if (event.type && event.type.startsWith('council')) {
                console.log('[Chat Stream] Council event received:', event.type, event.data);
              }
              
              // Double-check mounted before state updates
              if (!mountedRef.current) break;
              
              switch (event.type) {
                case 'delta':
                  assistantContent += event.data.content;
                  console.log('[Chat Stream] Delta received, assistantContent length:', assistantContent.length);
                  if (mountedRef.current) {
                    safeStateUpdate(setStreamingContent, prev => ({ ...prev, [targetConversationId]: assistantContent }));
                  }
                  break;
                
                case 'intent':
                  // Store intent for debug display
                  console.log('[Chat] Intent classified:', event.data.intent);
                  
                  // Expose to window.__SCORPION_DEBUG__ for browser automation
                  if (typeof window !== 'undefined') {
                    if (!(window as any).__SCORPION_DEBUG__) {
                      (window as any).__SCORPION_DEBUG__ = {};
                    }
                    (window as any).__SCORPION_DEBUG__.lastMessage = {
                      intent: event.data.intent,
                      message: event.data.message || userMessageContent,
                      timestamp: Date.now(),
                    };
                  }
                  break;
                
                case 'plan':
                  // Store the full plan structure for saving in message
                  savedPlan = event.data.plan || (event.data.planJson ? JSON.parse(event.data.planJson) : null);
                  
                  // Store plan in state for UI display (includes reasoning)
                  if (savedPlan && mountedRef.current) {
                    safeStateUpdate(setPlans, prev => ({
                      ...prev,
                      [targetConversationId]: savedPlan,
                    }));
                  }
                  
                  // Update window.__SCORPION_DEBUG__ with plan info
                  if (typeof window !== 'undefined' && (window as any).__SCORPION_DEBUG__) {
                    (window as any).__SCORPION_DEBUG__.lastMessage = {
                      ...((window as any).__SCORPION_DEBUG__.lastMessage || {}),
                      plan: savedPlan,
                    };
                  }
                  break;
                
                case 'plan_step':
                  if (mountedRef.current) {
                    safeStateUpdate(setPlanSteps, prev => ({
                      ...prev,
                      [targetConversationId]: (() => {
                        // Power of 10 Rule 7: Guard undefined - ensure prev[targetConversationId] exists
                        const currentSteps = prev[targetConversationId] || [];
                        const existing = currentSteps.find((s: any) => s.id === event.data.id);
                        if (existing) {
                          return currentSteps.map((s: any) => s.id === event.data.id ? { ...s, ...event.data } : s);
                        }
                        return [...currentSteps, event.data];
                      })(),
                    }));
                  }
                  if (targetConversationId === currentConversation) {
                    // Force panel visibility
                    setTimeout(() => {
                      setShowRightPanel(true);
                    setActivePanel('plan');
                    }, 0);
                  }
                  break;
                
                case 'council_start':
                  console.log('[Chat Stream] Council start event received:', event.data);
                  if (mountedRef.current) {
                    safeStateUpdate(setCouncilVotes, prev => ({ ...prev, [targetConversationId]: [] }));
                    safeStateUpdate(setCouncilThinking, prev => ({ ...prev, [targetConversationId]: {} }));
                    safeStateUpdate(setCouncilCommunications, prev => ({ ...prev, [targetConversationId]: [] }));
                    safeStateUpdate(setCouncilConsensus, prev => ({ ...prev, [targetConversationId]: null }));
                  }
                  if (targetConversationId === currentConversation) {
                    // Force panel visibility
                    setTimeout(() => {
                      setShowRightPanel(true);
                    setActivePanel('council');
                    }, 0);
                  }
                  break;
                
                case 'council_thinking':
                  if (event.data.status === 'completed' && event.data.fullResponse && mountedRef.current) {
                    safeStateUpdate(setCouncilThinking, prev => ({
                      ...prev,
                      [targetConversationId]: {
                        ...(prev[targetConversationId] || {}),
                        [event.data.memberId]: event.data.fullResponse,
                      },
                    }));
                  }
                  break;
                
                case 'council_thinking_delta':
                  if (mountedRef.current) {
                    safeStateUpdate(setCouncilThinking, prev => ({
                      ...prev,
                      [targetConversationId]: {
                        ...(prev[targetConversationId] || {}),
                        [event.data.memberId]: event.data.accumulated,
                      },
                    }));
                  }
                  break;
                
                case 'council_communication':
                  console.log('[Chat Stream] Council communication event received:', event.data);
                  if (mountedRef.current) {
                    safeStateUpdate(setCouncilCommunications, prev => ({
                      ...prev,
                      [targetConversationId]: [...(prev[targetConversationId] || []), event.data],
                    }));
                  }
                  break;
                
                case 'council_caucus_start':
                  console.log('[Chat Stream] Council caucus starting:', event.data);
                  // Caucus is starting - members are connecting telepathically
                  break;
                  
                case 'council_caucus_round':
                  console.log('[Chat Stream] Council caucus round:', event.data);
                  // New round of discussion
                  break;
                  
                case 'council_caucus_message':
                  console.log('[Chat Stream] Council caucus message:', event.data);
                  // Member shared a thought in caucus - add to communications
                  if (mountedRef.current) {
                    safeStateUpdate(setCouncilCommunications, prev => ({
                      ...prev,
                      [targetConversationId]: [...(prev[targetConversationId] || []), {
                        ...event.data,
                        type: 'caucus',
                        memberId: event.data.fromId,
                        timestamp: event.data.timestamp || Date.now(),
                      }],
                    }));
                  }
                  break;
                  
                case 'council_caucus_complete':
                  console.log('[Chat Stream] Council caucus complete:', event.data);
                  // Caucus discussion finished, voting phase begins
                  break;
                
                case 'council_vote':
                  console.log('[Chat Stream] Council vote event received:', event.data);
                  if (mountedRef.current) {
                    safeStateUpdate(setCouncilVotes, prev => ({
                      ...prev,
                      [targetConversationId]: [...(prev[targetConversationId] || []), event.data],
                    }));
                  }
                  break;
                
                case 'council_consensus':
                  if (mountedRef.current) {
                    safeStateUpdate(setCouncilConsensus, prev => ({
                      ...prev,
                      [targetConversationId]: event.data,
                    }));
                  }
                  if (targetConversationId === currentConversation) {
                    // Force panel visibility
                    setTimeout(() => {
                      setShowRightPanel(true);
                    setActivePanel('council');
                    }, 0);
                  }
                  break;
                
                case 'next-best-action':
                  if (mountedRef.current && setNextBestAction) {
                    safeStateUpdate(setNextBestAction, prev => ({
                      ...prev,
                      [targetConversationId]: event.payload || event.data,
                    }));
                    console.log('[Chat Stream] Next-Best-Action received:', event.payload || event.data);
                  }
                  break;

                case 'similar-missions':
                  console.log('[Chat Stream] Similar missions received:', event.payload || event.data);
                  break;

                case 'improvement-signal':
                  if (mountedRef.current && typeof window !== 'undefined') {
                    const signal = event.payload || event.data;
                    // @ts-ignore
                    if (window.__SCORPION_SIGNAL__) {
                      // @ts-ignore
                      window.__SCORPION_SIGNAL__(signal);
                    }
                  }
                  break;

                case 'council_result':
                  if (mountedRef.current && setCouncilResult) {
                    const result = event.payload || event.data;
                    safeStateUpdate(setCouncilResult, prev => ({
                      ...prev,
                      [targetConversationId]: result,
                    }));
                    console.log('[Chat Stream] Council result received:', result);
                    if (targetConversationId === currentConversation) {
                      // Switch to council panel when result is received
                      setTimeout(() => {
                        setShowRightPanel(true);
                        setActivePanel('council');
                      }, 0);
                    }
                  }
                  break;

                case 'creative-pipeline':
                  if (mountedRef.current && setCreativePipeline) {
                    const pipeline = event.payload || event.data;
                    safeStateUpdate(setCreativePipeline, prev => ({
                      ...prev,
                      [targetConversationId]: pipeline,
                    }));
                    console.log('[Chat Stream] Creative pipeline received:', pipeline);
                  }
                  break;

                case 'data-workflow':
                  if (mountedRef.current && setDataWorkflow) {
                    const workflow = event.payload || event.data;
                    safeStateUpdate(setDataWorkflow, prev => ({
                      ...prev,
                      [targetConversationId]: workflow,
                    }));
                    console.log('[Chat Stream] Data workflow received:', workflow);
                  }
                  break;
                
                case 'council_error':
                  console.error('[Council] Error:', event.data.message);
                  break;
                
                case 'tool':
                  if (!mountedRef.current) break;
                  safeStateUpdate(setToolCalls, prev => {
                    const updated = {
                    ...prev,
                    [targetConversationId]: (() => {
                      // Ensure callId exists for proper tracking
                      if (!event.data.callId) {
                        console.warn('[Chat] Tool event missing callId:', event.data);
                        // Generate a fallback callId if missing
                        event.data.callId = event.data.callId || `tool-${Date.now()}-${Math.random()}`;
                      }
                      
                      const existing = prev[targetConversationId]?.find((t: any) => t.callId === event.data.callId);
                      if (existing) {
                        // Preserve startTime when updating
                        const updatedTool = { ...existing, ...event.data };
                        if (event.data.status === 'running' && !updatedTool.startTime) {
                          updatedTool.startTime = existing.startTime || Date.now();
                        }
                        // Power of 10 Rule 7: Guard undefined - ensure prev[targetConversationId] exists
                        const currentTools = prev[targetConversationId] || [];
                        return currentTools.map((t: any) => t.callId === event.data.callId ? updatedTool : t);
                      }
                      // Set startTime when tool starts running
                      const newTool = { ...event.data };
                      if (event.data.status === 'running') {
                        newTool.startTime = Date.now();
                      }
                      return [...(prev[targetConversationId] || []), newTool];
                    })(),
                    };
                    
                    // Update window.__SCORPION_DEBUG__ with tools info
                    if (typeof window !== 'undefined' && (window as any).__SCORPION_DEBUG__) {
                      (window as any).__SCORPION_DEBUG__.lastMessage = {
                        ...((window as any).__SCORPION_DEBUG__.lastMessage || {}),
                        toolsUsed: updated[targetConversationId] || [],
                      };
                    }
                    
                    return updated;
                  });
                  
                  // Always show panel and switch to tools when tool events occur
                  // Use setTimeout to ensure state updates happen after render
                  if (targetConversationId === currentConversation) {
                    // Force panel visibility
                    setTimeout(() => {
                    setShowRightPanel(true);
                    setActivePanel('tools');
                    }, 0);
                    
                    // Also update knowledge hits if it's kb.search, but don't switch panel
                    if (event.data.tool === 'kb.search' && event.data.status === 'completed') {
                      setKnowledgeHits(prev => ({
                        ...prev,
                        [targetConversationId]: event.data.result?.hits || [],
                      }));
                      
                      if (event.data.args?.query) {
                        setKnowledgeSearchQuery(prev => ({
                          ...prev,
                          [targetConversationId]: event.data.args.query,
                        }));
                      }
                    }
                  }
                  break;
                
                case 'knowledge':
                  if (!mountedRef.current) break;
                  const knowledgeHits = event.data.hits || [];
                  safeStateUpdate(setKnowledgeHits, prev => ({
                    ...prev,
                    [targetConversationId]: knowledgeHits,
                  }));
                  
                  if (event.data.query && mountedRef.current) {
                    safeStateUpdate(setKnowledgeSearchQuery, prev => ({
                      ...prev,
                      [targetConversationId]: event.data.query,
                    }));
                  }
                  
                  // Update window.__SCORPION_DEBUG__ with knowledge info
                  if (typeof window !== 'undefined' && (window as any).__SCORPION_DEBUG__) {
                    (window as any).__SCORPION_DEBUG__.lastMessage = {
                      ...((window as any).__SCORPION_DEBUG__.lastMessage || {}),
                      knowledge: {
                        attempted: true,
                        hasResults: knowledgeHits.length > 0,
                        results: knowledgeHits,
                      },
                    };
                  }
                  
                  if (targetConversationId === currentConversation && knowledgeHits.length > 0) {
                    // Force panel visibility when knowledge hits are available
                    setTimeout(() => {
                      setShowRightPanel(true);
                    setActivePanel('knowledge');
                    }, 0);
                  }
                  break;
                
                case 'thought':
                  // Route to Council tab (mini ticker)
                  if (targetConversationId === currentConversation) {
                    setTimeout(() => {
                      setShowRightPanel(true);
                      setActivePanel('council');
                    }, 0);
                  }
                  // Could store thoughts in state if needed for a ticker
                  break;
                
                case 'search_query':
                  // Route to Tools tab
                  if (targetConversationId === currentConversation) {
                    setTimeout(() => {
                      setShowRightPanel(true);
                      setActivePanel('tools');
                    }, 0);
                  }
                  // Update search query state
                  if (event.data.query) {
                    setKnowledgeSearchQuery(prev => ({
                      ...prev,
                      [targetConversationId]: event.data.query,
                    }));
                  }
                  break;
                
                case 'audit':
                  // Handle audit events for plan debugging
                  if (typeof appendAudit === 'function') {
                    appendAudit(event.data.conversationId || targetConversationId, event.data);
                  }
                  // When execution starts, make sure the right panel is open on 'plan' or 'tools'
                  if (event.data.op === 'plan_generated' || event.data.op === 'step_started') {
                    setShowRightPanel(true);
                    setActivePanel('plan');
                  }
                  break;
                
                case 'citation':
                  if (!mountedRef.current) break;
                  // Route to Knowledge tab and pin top-3
                  if (targetConversationId === currentConversation) {
                    setTimeout(() => {
                      if (mountedRef.current) {
                        setShowRightPanel(true);
                        setActivePanel('knowledge');
                      }
                    }, 0);
                  }
                  // Add citation to knowledge hits
                  safeStateUpdate(setKnowledgeHits, prev => {
                    const currentHits = prev[targetConversationId] || [];
                    const citation = event.data;
                    const exists = currentHits.some((h: any) => h.url === citation.url);
                    if (exists) return prev;
                    return {
                      ...prev,
                      [targetConversationId]: [...currentHits, {
                        id: citation.url || `citation-${Date.now()}-${Math.random()}`,
                        title: citation.title || 'Untitled',
                        url: citation.url || '',
                        score: citation.score || 0,
                        relevance: citation.score || 0,
                        excerpt: citation.reason || '',
                        snippet: citation.reason || '',
                        spans: citation.reason ? [{ text: citation.reason }] : [],
                        category: 'web',
                        provider: 'citation',
                        rank: citation.rank,
                      }],
                    };
                  });
                  break;
                
                case 'tool_result':
                  // Handle tool_result events (new contract system)
                  if (event.data?.result) {
                    const toolResult = event.data.result;
                    setToolCalls(prev => {
                      const existing = prev[targetConversationId] || [];
                      const updated = existing.map((t: any) => 
                        t.callId === event.data.callId 
                          ? { ...t, status: toolResult.ok ? 'completed' : 'failed', result: toolResult }
                          : t
                      );
                      return { ...prev, [targetConversationId]: updated };
                    });
                    setShowRightPanel(true);
                    setActivePanel('tools');
                  }
                  break;

                case 'knowledge_hit':
                  if (!mountedRef.current) break;
                  // Handle individual knowledge_hit events (from research.run)
                  const hit = event.data.hit || event.data;
                  
                  // Dev hook: count events
                  if (typeof window !== 'undefined' && (window as any).__evt) {
                    (window as any).__evt.hits = ((window as any).__evt.hits || 0) + 1;
                  }
                  
                  safeStateUpdate(setKnowledgeHits, prev => {
                    const currentHits = prev[targetConversationId] || [];
                    // CHECK 10: Fix URL deduping/collision - wrap URL parsing in try/catch
                    let hitHostname = '';
                    try {
                      if (hit.url && hit.url.startsWith('http')) {
                        hitHostname = new URL(hit.url).hostname;
                      }
                    } catch (e) {
                      // URL parsing failed, use string heuristics
                      const urlMatch = hit.url?.match(/https?:\/\/([^\/]+)/);
                      hitHostname = urlMatch ? urlMatch[1] : '';
                    }
                    
                    const exists = currentHits.some((h: any) => {
                      let hHostname = '';
                      try {
                        if (h.url && h.url.startsWith('http')) {
                          hHostname = new URL(h.url).hostname;
                        }
                      } catch (e) {
                        const urlMatch = h.url?.match(/https?:\/\/([^\/]+)/);
                        hHostname = urlMatch ? urlMatch[1] : '';
                      }
                      return (hitHostname && hHostname && hitHostname === hHostname && hit.title === h.title) ||
                             (hit.url && h.url && hit.url === h.url);
                    });
                    if (exists) {
                      return prev; // Don't add duplicates
                    }
                    return {
                      ...prev,
                      [targetConversationId]: [...currentHits, {
                        id: hit.url || `hit-${Date.now()}-${Math.random()}`,
                        title: hit.title || 'Untitled',
                        url: hit.url || '',
                        score: hit.score || 0,
                        relevance: hit.score || 0, // KnowledgePanel expects 'relevance'
                        excerpt: hit.excerpt || hit.snippet || '',
                        snippet: hit.snippet || hit.excerpt || '',
                        spans: hit.excerpt || hit.snippet ? [{ text: hit.excerpt || hit.snippet || '' }] : [], // KnowledgePanel expects 'spans'
                        category: hit.category || 'web',
                        provider: hit.provider || 'unknown',
                        publishedAt: hit.publishedAt || null,
                      }],
                    };
                  });
                  
                  // Update search query if provided
                  if (hit.query) {
                    setKnowledgeSearchQuery(prev => ({
                      ...prev,
                      [targetConversationId]: hit.query,
                    }));
                  }
                  
                  // Auto-switch to Knowledge panel when first hit arrives or during searching phase
                  if (targetConversationId === currentConversation) {
                    setTimeout(() => {
                      setShowRightPanel(true);
                      // Auto-switch to Knowledge panel when knowledge_hit events arrive
                      setActivePanel('knowledge');
                    }, 0);
                  }
                  break;
                
                case 'status':
                  if (targetConversationId === currentConversation) {
                    // Force panel visibility based on phase
                    setTimeout(() => {
                    setShowRightPanel(true);
                    if (event.data.phase === 'planning') {
                      setActivePanel('plan');
                    } else if (event.data.phase === 'council') {
                      setActivePanel('council');
                    } else if (event.data.phase === 'executing' || event.data.phase === 'searching' || event.data.phase === 'self_correcting') {
                      setActivePanel('tools');
                    }
                    }, 0);
                  }
                  break;
                
                case 'progress':
                  setProgress(prev => ({
                    ...prev,
                    [targetConversationId]: {
                      phase: event.data.phase,
                      progress: event.data.progress || 0,
                      message: event.data.message,
                      step: event.data.step,
                    },
                  }));
                  
                  if (targetConversationId === currentConversation) {
                    // Force panel visibility based on phase
                    setTimeout(() => {
                    setShowRightPanel(true);
                    if (event.data.phase === 'planning') {
                      setActivePanel('plan');
                    } else if (event.data.phase === 'council') {
                      setActivePanel('council');
                    } else if (event.data.phase === 'executing' || event.data.phase === 'searching') {
                      setActivePanel('tools');
                    }
                    }, 0);
                  }
                  break;
                
                case 'tool_progress':
                  setToolProgress(prev => ({
                    ...prev,
                    [targetConversationId]: {
                      ...(prev[targetConversationId] || {}),
                      [event.data.callId]: {
                        tool: event.data.tool,
                        progress: event.data.progress,
                        status: event.data.status,
                      },
                    },
                  }));
                  
                  if (targetConversationId === currentConversation && event.data.status === 'starting') {
                    // Force panel visibility when tool starts
                    setTimeout(() => {
                      setShowRightPanel(true);
                    setActivePanel('tools');
                    }, 0);
                  }
                  break;
                
                case 'final':
                  // Handle final message from new executor system
                  if (event.data?.content && mountedRef.current) {
                    assistantContent = event.data.content;
                    safeStateUpdate(setStreamingContent, prev => ({ ...prev, [targetConversationId]: assistantContent }));
                  }
                  break;

                case 'done':
                  if (!mountedRef.current) break;
                  // Include plan structure in message content for conversation history analysis
                  let messageContent = assistantContent;
                  if (savedPlan) {
                    // Append plan structure as a hidden JSON comment for extraction
                    messageContent += `\n\n<!-- PLAN_STRUCTURE:${JSON.stringify(savedPlan)} -->`;
                  }
                  
                  if (mountedRef.current) {
                    try {
                      addMessage(targetConversationId, {
                    id: event.data.messageId,
                        role: 'assistant' as const,
                        content: messageContent,
                        ts: Date.now(),
                      });
                    } catch (error) {
                      console.warn('[Chat] Failed to add message (component may have unmounted):', error);
                    }
                  }
                  
                  // Reset saved plan for next message
                  savedPlan = null;
                  
                  if (mountedRef.current) {
                    try {
                      const conversation = conversations.find((c: any) => c.id === targetConversationId);
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
                    }
                    
                    safeStateUpdate(setStreamingContent, prev => {
                      const next = { ...prev };
                      delete next[targetConversationId];
                      return next;
                    });
                  }
                  
                  setTimeout(() => {
                    setProgress(prev => {
                      const next = { ...prev };
                      delete next[targetConversationId];
                      return next;
                    });
                  }, 2000);
                  
                  setConversationStreaming(targetConversationId, false);
                  break;
                
                case 'error':
                  console.error('[Chat] Error:', event.data.message);
                  
                  let errorContent = event.data.message || '';
                  
                  // Strip HTML tags and clean error message
                  errorContent = errorContent
                    .replace(/<[^>]*>/g, '') // Remove HTML tags
                    .replace(/&[^;]+;/g, '') // Remove HTML entities
                    .replace(/<!DOCTYPE[^>]*>/gi, '') // Remove DOCTYPE
                    .replace(/<html[^>]*>/gi, '') // Remove HTML tag
                    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '') // Remove head section
                    .replace(/<body[^>]*>/gi, '') // Remove body tag
                    .replace(/<\/body>/gi, '') // Remove closing body tag
                    .replace(/<\/html>/gi, '') // Remove closing html tag
                    .split('\n')
                    .filter((line: string) => 
                    !line.includes('at ') && 
                    !line.includes('webpack-internal') &&
                    !line.includes('node:internal') &&
                      !line.trim().startsWith('at') &&
                      !line.trim().startsWith('<!') &&
                      !line.trim().startsWith('<meta') &&
                      !line.trim().startsWith('<script') &&
                      !line.trim().startsWith('<style')
                    )
                    .join('\n')
                    .replace(/\s+/g, ' ') // Normalize whitespace
                    .trim();
                  
                  // If error is mostly HTML structure, provide a cleaner message
                  if (errorContent.length < 20 || errorContent.toLowerCase().includes('doctype') || errorContent.toLowerCase().includes('data-critters')) {
                    errorContent = 'Server error occurred. Please try again or check server logs.';
                  }
                  
                  if (errorContent.includes('Troubleshooting:')) {
                    errorContent = errorContent.replace(/\n(\d+\.\s)/g, '\n- ');
                    errorContent = errorContent.replace(/`([^`]+)`/g, '`$1`');
                  }
                  
                  if (mountedRef.current) {
                    try {
                      addMessage(targetConversationId, {
                        id: uuidv4(),
                        role: 'assistant' as const,
                        content: errorContent,
                        ts: Date.now(),
                      });
                      setConversationStreaming(targetConversationId, false);
                      safeStateUpdate(setStreamingContent, prev => {
                        const next = { ...prev };
                        delete next[targetConversationId];
                        return next;
                      });
                    } catch (error) {
                      console.warn('[Chat] Failed to add error message (component may have unmounted):', error);
                    }
                  }
                  break;
              }
            } catch (error) {
              console.error('[Chat] Failed to parse event:', error);
            }
          }
        }
        
        // Power of 10 Rule 7: Guard undefined - Save message if stream ended without 'done' event
        // This handles cases where the stream closes unexpectedly or 'done' event is missed
        console.log('[Chat Stream] Stream ended. assistantContent length:', assistantContent.length, 'aborted:', abortController.signal.aborted, 'mounted:', mountedRef.current);
        if (!abortController.signal.aborted && assistantContent && mountedRef.current) {
          // Check if message was already added (via 'done' event) - use store's current state
          const currentStoreState = useChatStore.getState();
          const finalMessages = currentStoreState.messages[conversationId] || [];
          const lastMessage = finalMessages[finalMessages.length - 1];
          const messageAlreadyAdded = lastMessage && 
            lastMessage.role === 'assistant' && 
            lastMessage.content.includes(assistantContent.substring(0, 50));
          
          if (!messageAlreadyAdded) {
            try {
              // Include plan structure if available
              let messageContent = assistantContent;
              if (savedPlan) {
                messageContent += `\n\n<!-- PLAN_STRUCTURE:${JSON.stringify(savedPlan)} -->`;
              }
              
              addMessage(conversationId, {
                id: uuidv4(),
                role: 'assistant' as const,
                content: messageContent,
                ts: Date.now(),
              });
              
              // Clear streaming content
              safeStateUpdate(setStreamingContent, prev => {
                const next = { ...prev };
                delete next[conversationId];
                return next;
              });
              
              // Persist conversation - use store's current state after adding message
              try {
                const updatedStoreState = useChatStore.getState();
                const conversation = updatedStoreState.conversations.find((c: any) => c.id === conversationId);
                const currentMessages = updatedStoreState.messages[conversationId] || [];
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
                    messages: currentMessages,
                  }),
                });
              } catch (error) {
                console.error('[Chat] Failed to sync conversation:', error);
              }
            } catch (error) {
              console.warn('[Chat] Failed to add message on stream end:', error);
            }
          }
        }
        
        if (!abortController.signal.aborted) {
          abortControllerRef.current = null;
          readerRef.current = null;
        }
      } catch (error: any) {
        if (error.name === 'AbortError' || abortController.signal.aborted) {
          console.log('[Chat] Stream aborted by user');
          if (mountedRef.current) {
            try {
              addMessage(conversationId, {
                id: uuidv4(),
                role: 'assistant' as const,
                content: '⏹️ **Generation stopped**',
                ts: Date.now(),
              });
              setConversationStreaming(conversationId, false);
              safeStateUpdate(setStreamingContent, prev => {
                const next = { ...prev };
                delete next[conversationId];
                return next;
              });
            } catch (err) {
              // Component may have unmounted, ignore
            }
          }
          return;
        }
        
        const errorMsg = error.message || error.toString() || '';
        const isNetworkError = 
          errorMsg.includes('ERR_CONNECTION_REFUSED') ||
          errorMsg.includes('ECONNREFUSED') ||
          errorMsg.includes('Failed to fetch') ||
          errorMsg.includes('NetworkError') ||
          errorMsg.includes('network error') ||
          errorMsg.includes('Cannot connect to chat server') ||
          errorMsg.includes('Cannot connect to the server') ||
          (errorMsg.includes('fetch failed') && !errorMsg.includes('API error')) ||
          (error.name === 'TypeError' && errorMsg.includes('fetch')) ||
          error.code === 'ECONNREFUSED' ||
          error.cause?.code === 'ECONNREFUSED';
        
        const isNonRetryableError = 
          errorMsg.includes('API error') ||
          errorMsg.includes('parse') ||
          errorMsg.includes('JSON') ||
          (errorMsg.includes('timeout') && !errorMsg.includes('connection'));
        
        if (isNetworkError && !isNonRetryableError && retryCount < maxRetries) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000;
          
          if (mountedRef.current) {
            try {
              addMessage(conversationId, {
                id: uuidv4(),
                role: 'assistant' as const,
                content: `🔄 **Connection error** (attempt ${retryCount}/${maxRetries}). Retrying in ${delay / 1000}s...`,
                ts: Date.now(),
              });
            } catch (err) {
              // Component may have unmounted, ignore
            }
          }
          
          if (mountedRef.current) {
            setTimeout(() => {
              if (mountedRef.current) {
                attemptStream();
              }
            }, delay);
          }
          return;
        }
        
        console.error('[Chat] Stream error:', error);
        
        let errorMessage = error.message || 'Unknown error occurred';
        
        const isConnectionError = 
          errorMessage.includes('Cannot connect to chat server') || 
          errorMessage.includes('Cannot connect to the server') ||
          errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('NetworkError');
        
        if (isConnectionError) {
          errorMessage = `❌ **Connection Error**\n\nCannot connect to the chat server.\n\n**Troubleshooting:**\n1. Make sure the Next.js dev server is running: \`cd apps/scorpion && pnpm dev\`\n2. Check if the server is accessible at http://localhost:3003\n3. Verify there are no firewall or network restrictions\n4. Check the terminal for server errors`;
        }
        
        errorMessage = errorMessage.split('\n').filter((line: string) => 
          !line.includes('at ') && 
          !line.includes('webpack-internal') &&
          !line.includes('node:internal') &&
          !line.trim().startsWith('at')
        ).join('\n');
        
        if (errorMessage.includes('Troubleshooting:')) {
          errorMessage = errorMessage.replace(/\n(\d+\.\s)/g, '\n- ');
        }
        
        if (mountedRef.current) {
          try {
            addMessage(conversationId, {
              id: uuidv4(),
              role: 'assistant' as const,
              content: errorMessage,
              ts: Date.now(),
            });
            setConversationStreaming(conversationId, false);
            safeStateUpdate(setStreamingContent, prev => {
              const next = { ...prev };
              delete next[conversationId];
              return next;
            });
          } catch (err) {
            // Component may have unmounted, ignore
          }
        }
        abortControllerRef.current = null;
        readerRef.current = null;
      } finally {
        if (!abortController.signal.aborted && mountedRef.current) {
          try {
            setConversationStreaming(conversationId, false);
            safeStateUpdate(setStreamingContent, prev => {
              const next = { ...prev };
              delete next[conversationId];
              return next;
            });
          } catch (err) {
            // Component may have unmounted, ignore
          }
        }
      }
    };
    
    attemptStream();
  };

  return { handleSend, handleStop };
}

