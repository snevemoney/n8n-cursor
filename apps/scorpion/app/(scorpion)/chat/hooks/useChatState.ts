import { useState, useEffect } from 'react';
import { useChatStore } from '@/lib/chat/chatStore';
import { v4 as uuidv4 } from 'uuid';
import { loadMessages } from '@/lib/chat/persistence';
import type { CouncilVote } from '@/lib/chat/types';

export function useChatState() {
  const {
    currentConversation,
    conversations,
    messages,
    addConversation,
    setCurrentConversation,
    provider,
    model,
    setProvider,
    setModel,
    setInputValue,
  } = useChatStore();
  
  const [streamingContent, setStreamingContent] = useState<Record<string, string>>({});
  const [planSteps, setPlanSteps] = useState<Record<string, any[]>>({});
  const [councilVotes, setCouncilVotes] = useState<Record<string, CouncilVote[]>>({});
  const [councilThinking, setCouncilThinking] = useState<Record<string, Record<string, string>>>({});
  const [councilCommunications, setCouncilCommunications] = useState<Record<string, any[]>>({});
  const [councilConsensus, setCouncilConsensus] = useState<Record<string, { summary: string; score: number; approved: boolean } | null>>({});
  const [knowledgeHits, setKnowledgeHits] = useState<Record<string, any[]>>({});
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState<Record<string, string>>({});
  const [toolCalls, setToolCalls] = useState<Record<string, any[]>>({});
  const [activePanel, setActivePanel] = useState<'plan' | 'council' | 'tools' | 'knowledge' | 'user-tools'>('plan');
  const [showSettings, setShowSettings] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [researchParam, setResearchParam] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, { phase: string; progress: number; message: string; step?: string }>>({});
  const [toolProgress, setToolProgress] = useState<Record<string, Record<string, { tool: string; progress: string; status: string }>>>({});
  
  // Set mounted state after hydration and load client-side state
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setResearchParam(params.get('research'));
      
      const savedProvider = localStorage.getItem('chat-provider');
      const savedModel = localStorage.getItem('chat-model');
      if (savedProvider && (savedProvider === 'ollama' || savedProvider === 'openai')) {
        setProvider(savedProvider as 'ollama' | 'openai');
      }
      if (savedModel) {
        setModel(savedModel);
      }
      
      const checkScreenSize = () => {
        const width = window.innerWidth;
        setIsMobile(width <= 767);
        setIsTablet(width >= 768 && width < 1280);
        if (width >= 1280) {
          const savedRight = localStorage.getItem('chat-right-panel-open');
          setShowRightPanel(savedRight !== null ? savedRight === 'true' : false);
        } else {
          setShowRightPanel(false);
        }
        const savedLeft = localStorage.getItem('chat-conversation-list-open');
        if (width >= 1280) {
          setShowConversationList(savedLeft !== null ? savedLeft === 'true' : false);
        } else {
          setShowConversationList(false);
        }
      };
      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
    }
  }, [setProvider, setModel]);
  
  // Fetch available models based on provider
  useEffect(() => {
    const fetchModels = async () => {
      if (provider === 'ollama') {
        try {
          const response = await fetch('/api/ollama/models');
          const data = await response.json();
          
          if (data.success && data.available && data.models?.length > 0) {
            const modelNames = data.models.map((m: any) => m.name);
            setAvailableModels(modelNames);
            if (modelNames.length > 0 && !modelNames.includes(model)) {
              setModel(modelNames[0]);
            }
            return;
          }
          
          console.warn('[Chat] Ollama models unavailable:', {
            error: data.error || data.message,
            details: data.details
          });
          setAvailableModels([]);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('[Chat] Failed to fetch Ollama models:', errorMessage);
          setAvailableModels([]);
        }
      } else if (provider === 'openai') {
        const openaiModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
        setAvailableModels(openaiModels);
        if (!openaiModels.includes(model)) {
          setModel('gpt-4o-mini');
        }
      }
    };
    fetchModels();
  }, [provider, model, setModel]);
  
  // Pre-populate input from research session
  useEffect(() => {
    if (researchParam && currentConversation) {
      setInputValue(`Discuss the research findings from session ${researchParam}. What are the key insights and how can we use them?`);
    }
  }, [researchParam, currentConversation, setInputValue]);
  
  // Initialize and load persisted data
  useEffect(() => {
    useChatStore.getState().loadPersistedData();
    
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
      setCurrentConversation(state.conversations[0].id);
    }
  }, [addConversation, setCurrentConversation]);
  
  // Reload messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      const persistedMessages = loadMessages(currentConversation);
      if (persistedMessages.length > 0) {
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
  
  // Get current conversation's state
  const currentMessages = currentConversation ? messages[currentConversation] || [] : [];
  const currentStreamingContent = currentConversation ? streamingContent[currentConversation] || '' : '';
  const currentPlanSteps = currentConversation ? planSteps[currentConversation] || [] : [];
  const currentCouncilVotes = currentConversation ? councilVotes[currentConversation] || [] : [];
  const currentCouncilThinking = currentConversation ? councilThinking[currentConversation] || {} : {};
  const currentCouncilCommunications = currentConversation ? councilCommunications[currentConversation] || [] : [];
  const currentCouncilConsensus = currentConversation ? councilConsensus[currentConversation] : null;
  const currentToolCalls = currentConversation ? toolCalls[currentConversation] || [] : [];
  const currentKnowledgeHits = currentConversation ? knowledgeHits[currentConversation] || [] : [];
  const currentKnowledgeQuery = currentConversation ? knowledgeSearchQuery[currentConversation] : undefined;
  const currentProgress = currentConversation ? progress[currentConversation] : undefined;
  
  return {
    // Store state
    currentConversation,
    conversations,
    messages,
    provider,
    model,
    setProvider,
    setModel,
    setInputValue,
    
    // Local state
    streamingContent,
    setStreamingContent,
    planSteps,
    setPlanSteps,
    councilVotes,
    setCouncilVotes,
    councilThinking,
    setCouncilThinking,
    councilCommunications,
    setCouncilCommunications,
    councilConsensus,
    setCouncilConsensus,
    knowledgeHits,
    setKnowledgeHits,
    knowledgeSearchQuery,
    setKnowledgeSearchQuery,
    toolCalls,
    setToolCalls,
    activePanel,
    setActivePanel,
    showSettings,
    setShowSettings,
    showRightPanel,
    setShowRightPanel,
    showConversationList,
    setShowConversationList,
    availableModels,
    mounted,
    isMobile,
    isTablet,
    researchParam,
    progress,
    setProgress,
    toolProgress,
    setToolProgress,
    
    // Current conversation state
    currentMessages,
    currentStreamingContent,
    currentPlanSteps,
    currentCouncilVotes,
    currentCouncilThinking,
    currentCouncilCommunications,
    currentCouncilConsensus,
    currentToolCalls,
    currentKnowledgeHits,
    currentKnowledgeQuery,
    currentProgress,
    
    // Actions
    addConversation,
    setCurrentConversation,
  };
}

