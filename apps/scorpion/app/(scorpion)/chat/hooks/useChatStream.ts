import { useRef } from 'react';
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
  activePanel: 'plan' | 'council' | 'tools' | 'knowledge' | 'user-tools';
}

export function useChatStream({
  currentConversation,
  conversations,
  messages,
  provider,
  model,
  setStreamingContent,
  setPlanSteps,
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
  activePanel,
}: UseChatStreamProps) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const { addMessage, setConversationStreaming } = useChatStore();

  const handleStop = () => {
    console.log('[Chat] Stop requested');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (readerRef.current) {
      readerRef.current.cancel().catch(err => {
        console.warn('[Chat] Error canceling reader:', err);
      });
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
        useChatStore.getState().setCurrentConversation(state.conversations[0].id);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const finalConversationId = useChatStore.getState().currentConversation;
    if (!finalConversationId) {
      console.error('[Chat] Failed to initialize conversation');
      return;
    }
    
    handleStop();
    
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
      const title = firstSentence.length <= 50 ? firstSentence : cleaned.slice(0, 47) + '...';
      if (title && title !== 'New Chat') {
        useChatStore.getState().updateConversation(conversationId, { title });
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
    
    const attemptStream = async (): Promise<void> => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      try {
        const conversationMessages = messages[conversationId] || [];
        
        let response: Response;
        try {
          response = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId,
              messages: [...conversationMessages, userMsg],
              provider,
              model,
            }),
            signal: abortController.signal,
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
            throw new Error(`API error (${response.status}): ${errorText.substring(0, 200)}`);
          }
        }
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');
        
        readerRef.current = reader;
        const decoder = new TextDecoder();
        let buffer = '';
        let assistantContent = '';
        
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
            if (!line.startsWith('data: ')) continue;
            
            try {
              const event = JSON.parse(line.slice(6));
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
                      const existing = prev[targetConversationId]?.find((s: any) => s.id === event.data.id);
                      if (existing) {
                        return prev[targetConversationId].map((s: any) => s.id === event.data.id ? { ...s, ...event.data } : s);
                      }
                      return [...(prev[targetConversationId] || []), event.data];
                    })(),
                  }));
                  if (targetConversationId === currentConversation && !activePanel) {
                    setActivePanel('plan');
                  }
                  break;
                
                case 'council_start':
                  setCouncilVotes(prev => ({ ...prev, [targetConversationId]: [] }));
                  setCouncilThinking(prev => ({ ...prev, [targetConversationId]: {} }));
                  setCouncilCommunications(prev => ({ ...prev, [targetConversationId]: [] }));
                  setCouncilConsensus(prev => ({ ...prev, [targetConversationId]: null }));
                  if (targetConversationId === currentConversation) {
                    setActivePanel('council');
                  }
                  break;
                
                case 'council_thinking':
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
                  setCouncilThinking(prev => ({
                    ...prev,
                    [targetConversationId]: {
                      ...(prev[targetConversationId] || {}),
                      [event.data.memberId]: event.data.accumulated,
                    },
                  }));
                  break;
                
                case 'council_communication':
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
                
                case 'council_consensus':
                  setCouncilConsensus(prev => ({
                    ...prev,
                    [targetConversationId]: event.data,
                  }));
                  if (targetConversationId === currentConversation) {
                    setActivePanel('council');
                  }
                  break;
                
                case 'council_error':
                  console.error('[Council] Error:', event.data.message);
                  break;
                
                case 'tool':
                  setToolCalls(prev => ({
                    ...prev,
                    [targetConversationId]: (() => {
                      const existing = prev[targetConversationId]?.find((t: any) => t.callId === event.data.callId);
                      if (existing) {
                        return prev[targetConversationId].map((t: any) => t.callId === event.data.callId ? { ...t, ...event.data } : t);
                      }
                      return [...(prev[targetConversationId] || []), event.data];
                    })(),
                  }));
                  
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
                    
                    if (targetConversationId === currentConversation) {
                      setActivePanel('knowledge');
                    }
                  }
                  break;
                
                case 'knowledge':
                  setKnowledgeHits(prev => ({
                    ...prev,
                    [targetConversationId]: event.data.hits || [],
                  }));
                  
                  if (event.data.query) {
                    setKnowledgeSearchQuery(prev => ({
                      ...prev,
                      [targetConversationId]: event.data.query,
                    }));
                  }
                  
                  if (targetConversationId === currentConversation) {
                    setActivePanel('knowledge');
                  }
                  break;
                
                case 'status':
                  if (targetConversationId === currentConversation) {
                    if (event.data.phase === 'planning') {
                      setActivePanel('plan');
                    } else if (event.data.phase === 'council') {
                      setActivePanel('council');
                    } else if (event.data.phase === 'executing' || event.data.phase === 'searching') {
                      setActivePanel('tools');
                    }
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
                    if (event.data.phase === 'planning') {
                      setActivePanel('plan');
                    } else if (event.data.phase === 'council') {
                      setActivePanel('council');
                    } else if (event.data.phase === 'executing' || event.data.phase === 'searching') {
                      setActivePanel('tools');
                    }
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
                    setActivePanel('tools');
                  }
                  break;
                
                case 'done':
                  addMessage(targetConversationId, {
                    id: event.data.messageId,
                    role: 'assistant' as const,
                    content: assistantContent,
                    ts: Date.now(),
                  });
                  
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
                  
                  setStreamingContent(prev => {
                    const next = { ...prev };
                    delete next[targetConversationId];
                    return next;
                  });
                  
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
                  
                  let errorContent = event.data.message;
                  errorContent = errorContent.split('\n').filter((line: string) => 
                    !line.includes('at ') && 
                    !line.includes('webpack-internal') &&
                    !line.includes('node:internal') &&
                    !line.trim().startsWith('at')
                  ).join('\n');
                  
                  if (errorContent.includes('Troubleshooting:')) {
                    errorContent = errorContent.replace(/\n(\d+\.\s)/g, '\n- ');
                    errorContent = errorContent.replace(/`([^`]+)`/g, '`$1`');
                  }
                  
                  addMessage(targetConversationId, {
                    id: uuidv4(),
                    role: 'assistant' as const,
                    content: errorContent,
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
        
        if (!abortController.signal.aborted) {
          abortControllerRef.current = null;
          readerRef.current = null;
        }
      } catch (error: any) {
        if (error.name === 'AbortError' || abortController.signal.aborted) {
          console.log('[Chat] Stream aborted by user');
          addMessage(conversationId, {
            id: uuidv4(),
            role: 'assistant' as const,
            content: '⏹️ **Generation stopped**',
            ts: Date.now(),
          });
          setConversationStreaming(conversationId, false);
          setStreamingContent(prev => {
            const next = { ...prev };
            delete next[conversationId];
            return next;
          });
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
          
          addMessage(conversationId, {
            id: uuidv4(),
            role: 'assistant' as const,
            content: `🔄 **Connection error** (attempt ${retryCount}/${maxRetries}). Retrying in ${delay / 1000}s...`,
            ts: Date.now(),
          });
          
          setTimeout(() => {
            attemptStream();
          }, delay);
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
        
        addMessage(conversationId, {
          id: uuidv4(),
          role: 'assistant' as const,
          content: errorMessage,
          ts: Date.now(),
        });
        setConversationStreaming(conversationId, false);
        setStreamingContent(prev => {
          const next = { ...prev };
          delete next[conversationId];
          return next;
        });
        abortControllerRef.current = null;
        readerRef.current = null;
      } finally {
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
    
    attemptStream();
  };

  return { handleSend, handleStop };
}

