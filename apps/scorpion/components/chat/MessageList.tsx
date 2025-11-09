'use client';

import { useEffect, useRef } from 'react';
import { Bot, User, Sparkles } from 'lucide-react';
import { useChatStore } from '@/lib/chat/chatStore';
import type { Message } from '@/lib/chat/types';

interface MessageListProps {
  messages: Message[];
  streamingContent?: string;
}

/**
 * MessageList - Display conversation messages with streaming
 */
export function MessageList({ messages, streamingContent }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { setInputValue } = useChatStore();
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);
  
  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 bg-gradient-to-b from-[#0a0d10] via-[#0c1014] to-[#0a0d10]">
      {messages.length === 0 && !streamingContent && (
        <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in">
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <div className="relative w-28 h-28 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 transform group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-14 w-14 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full border-4 border-[#0a0d10] animate-pulse shadow-lg shadow-emerald-400/50" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 animate-slide-up">
            Welcome to <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent">SCORPION</span>
          </h2>
          <p className="text-base text-white/70 max-w-lg mb-4 leading-relaxed animate-slide-up delay-100">
            I'm your AI operations assistant with full access to Scorpion's backend systems, 
            workflows, and knowledge base.
          </p>
          <p className="text-sm text-emerald-400/90 mb-12 font-medium animate-slide-up delay-200">
            Powered by Council Deliberation • 162+ Workflows • RAG Knowledge Base
          </p>
          
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-2xl animate-slide-up delay-300">
            {[
              { title: 'Search Knowledge', cmd: '/kb mcp-status', icon: '🔍', color: 'emerald' },
              { title: 'Web Research', cmd: '/research latest AI trends', icon: '🌐', color: 'blue' },
              { title: 'Create Plan', cmd: '/plan integrate local model', icon: '⚡', color: 'yellow' },
              { title: 'Run Workflow', cmd: '/run workflow-123', icon: '🚀', color: 'purple' },
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setInputValue(suggestion.cmd)}
                className="group relative p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/30 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/10 backdrop-blur-sm"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{suggestion.icon}</div>
                <div className="text-sm font-semibold text-white mb-1.5">{suggestion.title}</div>
                <div className="text-xs text-white/50 font-mono">{suggestion.cmd}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`flex gap-4 items-start animate-fade-in-up ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          style={{ animationDelay: `${index * 30}ms` }}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-emerald-400/20 via-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-emerald-400" />
            </div>
          )}
          
          <div
            className={`max-w-2xl px-6 py-4 rounded-3xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
              message.role === 'user'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/30 hover:shadow-blue-500/40'
                : 'bg-white/10 border border-white/20 text-white hover:bg-white/15 hover:border-white/30'
            }`}
          >
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-[450]">{message.content}</div>
            
            {message.parts && message.parts.length > 0 && (
              <div className="mt-4 space-y-2 pt-4 border-t border-white/10">
                {message.parts.map((part, i) => (
                  <div key={i} className="text-xs">
                    {part.type === 'citation' && (
                      <a
                        href={part.url}
                        className="text-blue-400 hover:text-blue-300 underline transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {part.title}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-3 text-xs text-white/40 font-medium">
              {new Date(message.ts).toLocaleTimeString()}
            </div>
          </div>
          
          {message.role === 'user' && (
            <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <User className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
      ))}
      
      {/* Streaming message - Grok style */}
      {streamingContent && (
        <div className="flex gap-4 items-start justify-start animate-fade-in">
          <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-emerald-400/20 via-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 backdrop-blur-sm animate-pulse">
            <Sparkles className="h-6 w-6 text-emerald-400" />
          </div>
          
          <div className="max-w-2xl px-6 py-4 rounded-3xl bg-white/10 border border-white/20 text-white shadow-xl backdrop-blur-sm">
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-[450]">{streamingContent}</div>
            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-white/10">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-white/50 font-medium ml-1">Scorpion is thinking...</span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
}

