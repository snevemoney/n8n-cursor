'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from '@/lib/chat/chatStore';
import { MessageList } from '@/components/chat/MessageList';
import { Composer } from '@/components/chat/Composer';
import { Settings, Sparkles } from 'lucide-react';
import { useChatState } from './hooks/useChatState';
import { useChatStream } from './hooks/useChatStream';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatPanels } from './components/ChatPanels';
import { PageLoadingBar } from '@/components/scorpion';

/**
 * Chat-AGI Page - Integrated with Scorpion layout
 */
export default function ChatPage() {
  const state = useChatState();
  const {
    currentConversation,
    conversations,
    messages,
    setInputValue,
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
    isMobile,
    isTablet,
    progress,
    setProgress,
    toolProgress,
    setToolProgress,
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
    addConversation,
    setCurrentConversation,
  } = state;

  const { provider, model } = useChatStore();

  const { handleSend, handleStop } = useChatStream({
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
  });

  const handleNewConversation = async () => {
    const newConv = {
      id: uuidv4(),
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addConversation(newConv);
    
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
    }
  };

  return (
    <>
      <PageLoadingBar loading={currentStreamingContent !== null && currentStreamingContent.length > 0} />
    <div className="h-full flex flex-col bg-gradient-to-br from-[#0a0d10] via-[#0c1014] to-[#0a0d10] relative" style={{ zIndex: 1 }}>
      {/* Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-white/10 bg-[#0c1014]/50 backdrop-blur-xl px-3 py-2 md:px-4 md:py-3 lg:px-6 lg:py-4 min-w-0 pointer-events-auto">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm md:text-base lg:text-lg font-bold text-white tracking-tight truncate">SCORPION</h1>
            <p className="text-[10px] md:text-xs lg:text-xs text-white/50 mt-0.5 hidden md:block">Chat-AGI Interface</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 md:p-1.5 lg:p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Settings className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-white/60" />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-w-0 relative pointer-events-none">
        <ChatSidebar
          showConversationList={showConversationList}
          isMobile={isMobile}
          onToggle={() => {
            setShowConversationList(prev => !prev);
          }}
          onNewConversation={handleNewConversation}
        />
        
        {/* Center: Chat */}
        <div className="flex-1 flex flex-col relative min-w-0 transition-all duration-150 pointer-events-auto">
          <MessageList messages={currentMessages} streamingContent={currentStreamingContent} />
          <Composer onSend={handleSend} onStop={handleStop} />
        </div>
        
        <ChatPanels
          showRightPanel={showRightPanel}
          isMobile={isMobile}
          isTablet={isTablet}
          activePanel={activePanel}
          currentPlanSteps={currentPlanSteps}
          currentCouncilVotes={currentCouncilVotes}
          currentCouncilThinking={currentCouncilThinking}
          currentCouncilCommunications={currentCouncilCommunications}
          currentCouncilConsensus={currentCouncilConsensus}
          currentToolCalls={currentToolCalls}
          currentKnowledgeHits={currentKnowledgeHits}
          currentKnowledgeQuery={currentKnowledgeQuery}
          currentProgress={currentProgress}
          onToggle={() => {
            setShowRightPanel(prev => !prev);
          }}
          onPanelChange={setActivePanel}
          onToolSelect={(toolName, slashCommand) => {
            setInputValue(slashCommand + ' ');
            // Use requestAnimationFrame for immediate focus without delay
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const composer = document.querySelector('textarea');
                composer?.focus();
              });
            });
          }}
        />
      </div>
      </div>
    </>
  );
}
