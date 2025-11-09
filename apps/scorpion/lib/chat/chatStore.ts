import { create } from 'zustand';
import type { Message, Conversation } from './types';
import { loadConversations, loadMessages, saveConversation, saveMessages, deleteConversation as deleteConversationStorage } from './persistence';

/**
 * Chat store for managing conversations and messages with persistence
 */

interface ChatState {
  // Current conversation
  currentConversation: string | null;
  conversations: Conversation[];
  
  // Messages
  messages: Record<string, Message[]>; // conversationId -> messages
  
  // UI state
  inputValue: string;
  isStreaming: boolean;
  streamingConversations: Set<string>; // Track which conversations are streaming
  
  // Model config
  provider: 'ollama' | 'openai' | 'azure' | 'local';
  model: string;
  
  // Actions
  setCurrentConversation: (id: string | null) => void;
  addConversation: (conversation: Conversation) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, update: Partial<Message>) => void;
  deleteConversation: (id: string) => void;
  loadPersistedData: () => void;
  setInputValue: (value: string) => void;
  setStreaming: (streaming: boolean) => void;
  setConversationStreaming: (conversationId: string, streaming: boolean) => void;
  setProvider: (provider: 'ollama' | 'openai' | 'azure' | 'local') => void;
  setModel: (model: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state - don't access localStorage during SSR
  currentConversation: null,
  conversations: [],
  messages: {},
  inputValue: '',
  isStreaming: false,
  streamingConversations: new Set(),
  provider: 'ollama', // Default, will be loaded from localStorage in useEffect
  model: 'llama3.2:1b', // Default, optimized for 8GB RAM systems
  
  // Actions
  setCurrentConversation: (id) => {
    set({ currentConversation: id });
    
    // Always reload messages from storage when switching conversations
    // This ensures we have the latest persisted state
    if (id) {
      const state = get();
      const persistedMessages = loadMessages(id);
      
      // Only update if persisted messages exist or if we don't have messages in memory
      // This prevents overwriting with empty array if storage hasn't been initialized yet
      if (persistedMessages.length > 0 || !state.messages[id]) {
        set(state => ({
          messages: { ...state.messages, [id]: persistedMessages },
        }));
      }
    }
  },
  
  addConversation: (conversation) => {
    set(state => ({
      conversations: [conversation, ...state.conversations],
      currentConversation: conversation.id,
    }));
    
    // Persist
    saveConversation(conversation);
  },
  
  addMessage: (conversationId, message) => {
    set(state => {
      const updatedMessages = [...(state.messages[conversationId] || []), message];
      
      // Persist
      saveMessages(conversationId, updatedMessages);
      
      // Update conversation timestamp
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        const updated = { ...conversation, updatedAt: Date.now() };
        saveConversation(updated);
        
        return {
          messages: { ...state.messages, [conversationId]: updatedMessages },
          conversations: state.conversations.map(c => c.id === conversationId ? updated : c),
        };
      }
      
      return {
        messages: { ...state.messages, [conversationId]: updatedMessages },
      };
    });
  },
  
  updateMessage: (conversationId, messageId, update) => {
    set(state => {
      const updatedMessages = (state.messages[conversationId] || []).map(msg =>
        msg.id === messageId ? { ...msg, ...update } : msg
      );
      
      // Persist
      saveMessages(conversationId, updatedMessages);
      
      return {
        messages: { ...state.messages, [conversationId]: updatedMessages },
      };
    });
  },
  
  deleteConversation: (id) => {
    set(state => ({
      conversations: state.conversations.filter(c => c.id !== id),
      messages: Object.fromEntries(
        Object.entries(state.messages).filter(([key]) => key !== id)
      ),
      currentConversation: state.currentConversation === id ? null : state.currentConversation,
    }));
    
    // Persist
    deleteConversationStorage(id);
  },
  
  loadPersistedData: () => {
    const conversations = loadConversations();
    set({ conversations });
  },
  
  setInputValue: (value) => set({ inputValue: value }),
  setStreaming: (streaming) => {
    const state = get();
    set({ 
      isStreaming: streaming,
      streamingConversations: streaming && state.currentConversation
        ? new Set([...state.streamingConversations, state.currentConversation])
        : state.streamingConversations
    });
  },
  setConversationStreaming: (conversationId, streaming) => {
    set(state => {
      const newSet = new Set(state.streamingConversations);
      if (streaming) {
        newSet.add(conversationId);
      } else {
        newSet.delete(conversationId);
      }
      return {
        streamingConversations: newSet,
        isStreaming: newSet.size > 0,
      };
    });
  },
  setProvider: (provider) => {
    set({ provider });
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-provider', provider);
    }
  },
  setModel: (model) => {
    set({ model });
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-model', model);
    }
  },
}));

