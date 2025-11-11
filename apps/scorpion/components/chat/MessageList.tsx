'use client';

// TODO: Audit reported "Unexpected eof" syntax errors for this file
// File appears complete and passes linter checks - may be false positive
// Verify in browser DevTools if errors persist during hot reload

import { useEffect, useRef, useState, useMemo, memo } from 'react';
import { User, Sparkles } from 'lucide-react';
import { useChatStore } from '@/lib/chat/chatStore';
import type { Message } from '@/lib/chat/types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore - ESM import path
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageListProps {
  messages: Message[];
  streamingContent?: string;
}

/**
 * MessageList - Display conversation messages with streaming
 */
export const MessageList = memo(function MessageList({ messages, streamingContent }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setInputValue } = useChatStore();
  const [userScrolled, setUserScrolled] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  // Track if user manually scrolled up
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setUserScrolled(!isNearBottom);
      setShouldAutoScroll(isNearBottom);
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Smart auto-scroll: only if user hasn't scrolled up
  useEffect(() => {
    if (shouldAutoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent, shouldAutoScroll]);
  
  // Reset scroll tracking when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setShouldAutoScroll(true);
    }
  }, [messages.length]);
  
  // Memoize rendered messages for performance
  const renderedMessages = useMemo(() => {
    return messages.map((message, index) => (
      <div
        key={message.id}
        className={`flex gap-4 items-start animate-fade-in-up ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        style={{ animationDelay: `${index * 30}ms` }}
      >
        {message.role === 'assistant' && (
          <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-emerald-400/20 via-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 backdrop-blur-sm" aria-hidden="true">
            <Sparkles className="h-6 w-6 text-emerald-400" aria-hidden="true" />
          </div>
        )}
        
        <div
          className={`max-w-2xl px-6 py-4 rounded-3xl shadow-xl backdrop-blur-sm transition-all duration-100 hover:shadow-2xl break-words ${
            message.role === 'user'
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/30 hover:shadow-blue-500/40'
              : 'bg-white/10 border border-white/20 text-white hover:bg-white/15 hover:border-white/30'
          }`}
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
        >
          {/* Enhanced markdown rendering */}
          <div className="text-[15px] leading-relaxed font-[450] prose prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-code:text-emerald-400 prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 max-w-none overflow-visible">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  
                  return !inline && match ? (
                    <div className="my-3">
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={language}
                        PreTag="div"
                        className="rounded-lg !bg-black/40 !border !border-white/10"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="px-1.5 py-0.5 bg-black/40 rounded text-emerald-400 font-mono text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                a({ node, href, children, ...props }: any) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline transition-colors"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
                p({ node, children, ...props }: any) {
                  return <p className="mb-2 last:mb-0" {...props}>{children}</p>;
                },
                ul({ node, children, ...props }: any) {
                  return <ul className="list-disc list-inside mb-2 space-y-1" {...props}>{children}</ul>;
                },
                ol({ node, children, ...props }: any) {
                  return <ol className="list-decimal list-inside mb-2 space-y-1" {...props}>{children}</ol>;
                },
                li({ node, children, ...props }: any) {
                  return <li className="ml-2" {...props}>{children}</li>;
                },
                blockquote({ node, children, ...props }: any) {
                  return (
                    <blockquote className="border-l-4 border-emerald-400/50 pl-4 italic my-2" {...props}>
                      {children}
                    </blockquote>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          
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
          <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30" aria-hidden="true">
            <User className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
        )}
      </div>
    ));
  }, [messages]);
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-8 py-10 space-y-8 bg-gradient-to-b from-[#0a0d10] via-[#0c1014] to-[#0a0d10]"
    >
      {messages.length === 0 && !streamingContent && (
        <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in">
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-150" />
            <div className="relative w-28 h-28 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 transform group-hover:scale-110 transition-transform duration-100" aria-hidden="true">
              <Sparkles className="h-14 w-14 text-white" aria-hidden="true" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full border-4 border-[#0a0d10] animate-pulse shadow-lg shadow-emerald-400/50" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 animate-slide-up">
            Welcome to <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent">SCORPION</span>
          </h1>
          <p className="text-base text-white/70 max-w-lg mb-4 leading-relaxed animate-slide-up delay-100">
            I'm your AI operations assistant with full access to Scorpion's backend systems, 
            workflows, and knowledge base.
          </p>
          <p className="text-sm text-emerald-400/90 mb-12 font-medium animate-slide-up delay-200">
            Powered by Council Deliberation • 162+ Workflows • RAG Knowledge Base
          </p>
          
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-2xl animate-slide-up delay-300">
            {[
              { title: 'List n8n Workflows', cmd: 'list all n8n workflows', icon: '📋', color: 'emerald' },
              { title: 'Create AI Agent', cmd: 'create an AI agent workflow that processes webhooks', icon: '🤖', color: 'blue' },
              { title: 'Search n8n Nodes', cmd: 'search for n8n nodes that handle HTTP requests', icon: '🔍', color: 'yellow' },
              { title: 'Validate Workflow', cmd: 'validate my n8n workflow configuration', icon: '✅', color: 'purple' },
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setInputValue(suggestion.cmd)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setInputValue(suggestion.cmd);
                  }
                }}
                className="group relative p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/30 rounded-2xl text-left transition-all duration-100 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/10 backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
                aria-label={`Use suggestion: ${suggestion.title}`}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-100">{suggestion.icon}</div>
                <div className="text-sm font-semibold text-white mb-1.5">{suggestion.title}</div>
                <div className="text-xs text-white/50 font-mono">{suggestion.cmd}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {renderedMessages}
      
      {/* Streaming message */}
      {streamingContent && (
        <div className="flex gap-4 items-start justify-start animate-fade-in">
          <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-emerald-400/20 via-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 backdrop-blur-sm animate-pulse" aria-hidden="true">
            <Sparkles className="h-6 w-6 text-emerald-400" aria-hidden="true" />
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
});

