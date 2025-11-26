'use client';

// TODO: Audit reported "Unexpected eof" syntax errors for this file
// File appears complete and passes linter checks - may be false positive
// Verify in browser DevTools if errors persist during hot reload

import { useState, useEffect, useRef, memo } from 'react';
import { MessageSquare, Plus, Loader2, Trash2, X } from 'lucide-react';
import type { Conversation } from '@/lib/chat/types';
import { useChatStore } from '@/lib/chat/chatStore';
import { Modal, Button } from '@/components/scorpion';
import { safeFocus, safeQuerySelector, safeQuerySelectorAll } from '@/lib/utils/dom-safe';

interface ConversationListProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete?: (id: string) => void;
}

export const ConversationList = memo(function ConversationList({ 
  conversations, 
  currentId, 
  onSelect, 
  onNew,
  onDelete 
}: ConversationListProps) {
  const { streamingConversations } = useChatStore();
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  const conversationToDelete = confirmingDelete 
    ? conversations.find(c => c.id === confirmingDelete)
    : null;
  
  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmingDelete(id);
  };
  
  const handleConfirmDelete = () => {
    if (confirmingDelete && onDelete) {
      onDelete(confirmingDelete);
      setConfirmingDelete(null);
    }
  };
  
  const handleCancelDelete = () => {
    setConfirmingDelete(null);
  };
  
  // Focus trap for modal
  useEffect(() => {
    if (confirmingDelete && modalRef.current) {
      // Store the previously focused element (safely)
      try {
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
          previousFocusRef.current = document.activeElement;
        }
      } catch (error) {
        console.debug('[ConversationList] Could not store previous focus:', error);
      }
      
      // Focus the modal (safely)
      const firstFocusable = safeQuerySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        modalRef.current || undefined
      );
      safeFocus(firstFocusable);
      
      // Handle Tab key to trap focus
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        
        const focusableElements = safeQuerySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          modalRef.current || undefined
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            safeFocus(lastElement);
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            safeFocus(firstElement);
          }
        }
      };
      
      // Handle Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCancelDelete();
        }
      };
      
      document.addEventListener('keydown', handleTab);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleTab);
        document.removeEventListener('keydown', handleEscape);
        // Restore focus to previously focused element (safely)
        safeFocus(previousFocusRef.current);
      };
    }
  }, [confirmingDelete]);
  
  return (
    <div className="w-full h-full border-r border-white/10 bg-[#0c1014]/40 backdrop-blur-xl flex flex-col pointer-events-auto">
      {/* Header - Grok style */}
      <div className="p-5 border-b border-white/10">
        <button
          onClick={onNew}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNew();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 border border-emerald-400/30 rounded-2xl text-emerald-400 font-semibold transition-all duration-100 hover:scale-[1.02] shadow-lg shadow-emerald-500/10 backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
          aria-label="Create new chat conversation"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span>New Chat</span>
        </button>
      </div>
      
      {/* Conversations - Grok style */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4 animate-fade-in">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10" aria-hidden="true">
              <MessageSquare className="h-8 w-8 text-white/30" aria-hidden="true" />
            </div>
            <div className="text-sm text-white/50 font-medium">No conversations yet</div>
            <div className="text-xs text-white/30 mt-1">Start a new chat to begin</div>
          </div>
        ) : (
          conversations.map((conv, index) => {
            const isStreaming = streamingConversations.has(conv.id);
            const isActive = currentId === conv.id;
            
            return (
              <div
                key={conv.id}
                className={`w-full group flex items-center gap-3 p-3 rounded-2xl transition-all duration-100 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 shadow-lg shadow-emerald-500/10'
                    : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                } backdrop-blur-sm animate-fade-in-up`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <button
                  onClick={() => onSelect(conv.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(conv.id);
                    }
                  }}
                  className="flex-1 flex items-center gap-3 text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
                    isActive
                      ? 'bg-emerald-500/20 border border-emerald-400/30'
                      : 'bg-white/5 border border-white/10 group-hover:bg-white/10'
                  }`}>
                    {isStreaming ? (
                      <Loader2 className={`h-5 w-5 animate-spin ${
                        isActive ? 'text-emerald-400' : 'text-white/60'
                      }`} aria-label="Streaming conversation" aria-hidden="true" />
                    ) : (
                      <MessageSquare className={`h-5 w-5 ${
                        isActive ? 'text-emerald-400' : 'text-white/40'
                      }`} aria-hidden="true" />
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
                </button>
                
                {onDelete && (
                  <button
                    onClick={(e) => handleDeleteClick(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-xl transition-all"
                    title="Delete conversation"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-4 w-4 text-white/40 hover:text-red-400 transition-colors" aria-hidden="true" />
                  </button>
                )}
              </div>
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
      
      {/* Delete Confirmation Dialog */}
      {confirmingDelete && conversationToDelete && (
        <Modal
          open={!!confirmingDelete}
          onClose={handleCancelDelete}
          title="Delete Conversation?"
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </>
          }
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 border border-red-400/30 rounded-xl flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/60">
                Are you sure you want to delete <span className="text-white font-medium">"{conversationToDelete.title}"</span>? This action cannot be undone.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
});

