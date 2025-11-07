'use client';

import { MessageSquare, Plus, MoreVertical } from 'lucide-react';
import type { Conversation } from '@/lib/chat/types';

interface ConversationListProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete?: (id: string) => void;
}

/**
 * ConversationList - Sidebar with conversation history
 */
export function ConversationList({ 
  conversations, 
  currentId, 
  onSelect, 
  onNew,
  onDelete 
}: ConversationListProps) {
  return (
    <div className="w-64 border-r border-white/5 bg-[#0a0e13] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded text-emerald-400 font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>
      
      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <MessageSquare className="h-8 w-8 text-white/20 mb-2" />
            <div className="text-xs text-white/40">No conversations yet</div>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full group flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                currentId === conv.id
                  ? 'bg-emerald-500/20 border border-emerald-400/30'
                  : 'hover:bg-white/5'
              }`}
            >
              <MessageSquare className="h-4 w-4 text-white/40 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{conv.title}</div>
                <div className="text-xs text-white/40">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </div>
              </div>
              
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
                  title="Delete conversation"
                >
                  <MoreVertical className="h-3 w-3 text-white/40" />
                </button>
              )}
            </button>
          ))
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/30 text-center">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}

