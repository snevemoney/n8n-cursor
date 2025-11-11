'use client';

import { ConversationList } from '@/components/chat/ConversationList';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useChatStore } from '@/lib/chat/chatStore';

interface ChatSidebarProps {
  showConversationList: boolean;
  isMobile: boolean;
  onToggle: () => void;
  onNewConversation: () => void;
}

export function ChatSidebar({ showConversationList, isMobile, onToggle, onNewConversation }: ChatSidebarProps) {
  const { conversations, currentConversation, setCurrentConversation } = useChatStore();

  return (
    <div className="pointer-events-none" style={{ position: 'relative' }}>
      {/* Mobile Overlay */}
      {showConversationList && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] max-md:block md:hidden pointer-events-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onToggle();
            }
          }}
          aria-hidden="true"
        />
      )}

      {/* Conversation List */}
      {showConversationList && (
        <div className="max-md:w-72 max-md:fixed max-md:z-[65] max-md:h-full max-md:left-0 max-md:top-0 md:w-40 lg:w-48 border-r border-white/10 bg-[#0c1014]/40 backdrop-blur-xl flex flex-col flex-shrink-0 transition-all duration-150 relative z-[65] pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 max-md:px-3 max-md:py-2">
            <h3 className="max-md:text-sm md:text-xs lg:text-xs font-semibold text-white/90 uppercase tracking-wider">Conversations</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
                if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
                  localStorage.setItem('chat-conversation-list-open', 'false');
                }
              }}
              className="p-1 hover:bg-white/10 rounded transition-colors pointer-events-auto"
              aria-label="Hide conversation list"
              title="Hide conversations"
            >
              <ChevronLeft className="max-md:h-4 max-md:w-4 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-white/70 hover:text-white" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              currentId={currentConversation}
              onSelect={(id) => {
                setCurrentConversation(id);
                if (isMobile) {
                  onToggle();
                }
              }}
              onNew={() => {
                onNewConversation();
                if (isMobile) {
                  onToggle();
                }
              }}
              onDelete={(id) => useChatStore.getState().deleteConversation(id)}
            />
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!showConversationList && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
            if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
              localStorage.setItem('chat-conversation-list-open', 'true');
            }
          }}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-[70] bg-[#0c1014]/95 backdrop-blur-xl border-r-2 border-t border-b border-emerald-400/30 rounded-r-lg hover:bg-emerald-400/10 hover:border-emerald-400/50 transition-all duration-150 shadow-lg max-md:px-2 max-md:py-3 md:px-2 md:py-3 lg:px-3 lg:py-4 pointer-events-auto"
          aria-label="Show conversation list"
          title="Show conversations"
        >
          <ChevronRight className="max-md:h-4 max-md:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-emerald-400" />
        </button>
      )}
    </div>
  );
}

