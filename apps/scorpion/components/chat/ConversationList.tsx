'use client';

import { MessageSquare, Plus, MoreVertical, Loader2 } from 'lucide-react';
import type { Conversation } from '@/lib/chat/types';
import { useChatStore } from '@/lib/chat/chatStore';

interface ConversationListProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete?: (id: string) => void;
}

export function ConversationList({ 
  conversations, 
  currentId, 
  onSelect, 
  onNew,
  onDelete 
}: ConversationListProps) {
  const { streamingConversations } = useChatStore();
  
  return (
    <div className="w-full h-full border-r border-white/10 bg-[#0c1014]/40 backdrop-blur-xl flex flex-col">
      {/* Header - Grok style */}
      <div className="p-5 border-b border-white/10">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 border border-emerald-400/30 rounded-2xl text-emerald-400 font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-emerald-500/10 backdrop-blur-sm"
        >
          <Plus className="h-5 w-5" />
          <span>New Chat</span>
        </button>
      </div>
      
      {/* Conversations - Grok style */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4 animate-fade-in">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
              <MessageSquare className="h-8 w-8 text-white/30" />
            </div>
            <div className="text-sm text-white/50 font-medium">No conversations yet</div>
            <div className="text-xs text-white/30 mt-1">Start a new chat to begin</div>
          </div>
        ) : (
          conversations.map((conv, index) => {
            const isStreaming = streamingConversations.has(conv.id);
            const isActive = currentId === conv.id;
            
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full group flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 shadow-lg shadow-emerald-500/10'
                    : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                } backdrop-blur-sm animate-fade-in-up`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
                  isActive
                    ? 'bg-emerald-500/20 border border-emerald-400/30'
                    : 'bg-white/5 border border-white/10 group-hover:bg-white/10'
                }`}>
                  {isStreaming ? (
                    <Loader2 className={`h-5 w-5 animate-spin ${
                      isActive ? 'text-emerald-400' : 'text-white/60'
                    }`} />
                  ) : (
                    <MessageSquare className={`h-5 w-5 ${
                      isActive ? 'text-emerald-400' : 'text-white/40'
                    }`} />
                  )}
                  {isStreaming && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0c1014] animate-pulse shadow-lg shadow-emerald-400/50" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate flex items-center gap-2 ${
                    isActive ? 'text-white' : 'text-white/80'
                  }`}>
                    {conv.title}
                    {isStreaming && !isActive && (
                      <span className="text-xs text-emerald-400 font-normal">(streaming...)</span>
                    )}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-xl transition-all"
                    title="Delete conversation"
                  >
                    <MoreVertical className="h-4 w-4 text-white/40" />
                  </button>
                )}
              </button>
            );
          })
        )}
      </div>
      
      {/* Footer - Grok style */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/40 text-center font-medium">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          {streamingConversations.size > 0 && (
            <span className="text-emerald-400 ml-1">
              • {streamingConversations.size} active
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

