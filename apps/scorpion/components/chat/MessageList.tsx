'use client';

import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
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
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.length === 0 && !streamingContent && (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <Bot className="h-12 w-12 text-emerald-400 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Welcome to Scorpion Chat-AGI
          </h2>
          <p className="text-sm text-white/60 max-w-md">
            I can help you with research, knowledge search, workflow automation, and more.
            <br />
            Try a slash command or ask me anything!
          </p>
          
          <div className="mt-8 grid grid-cols-2 gap-3 max-w-2xl">
            {[
              { title: 'Search Knowledge', cmd: '/kb mcp-status' },
              { title: 'Web Research', cmd: '/research latest AI trends' },
              { title: 'Create Plan', cmd: '/plan integrate local model' },
              { title: 'Run Workflow', cmd: '/run workflow-123' },
            ].map((suggestion, i) => (
              <button
                key={i}
                className="p-3 bg-[#0f1318] hover:bg-[#12161c] border border-white/10 rounded text-left transition-colors"
              >
                <div className="text-sm text-white mb-1">{suggestion.title}</div>
                <div className="text-xs text-white/40 font-mono">{suggestion.cmd}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-emerald-400" />
            </div>
          )}
          
          <div
            className={`max-w-3xl px-4 py-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 border border-white/10 text-white'
            }`}
          >
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            
            {message.parts && message.parts.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.parts.map((part, i) => (
                  <div key={i} className="text-xs">
                    {part.type === 'citation' && (
                      <a
                        href={part.url}
                        className="text-blue-400 hover:text-blue-300 underline"
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
            
            <div className="mt-2 text-xs text-white/40">
              {new Date(message.ts).toLocaleTimeString()}
            </div>
          </div>
          
          {message.role === 'user' && (
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      ))}
      
      {/* Streaming message */}
      {streamingContent && (
        <div className="flex gap-3 justify-start">
          <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-emerald-400 animate-pulse" />
          </div>
          
          <div className="max-w-3xl px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white">
            <div className="text-sm whitespace-pre-wrap">{streamingContent}</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/40">Thinking...</span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
}

