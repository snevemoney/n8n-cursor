'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/chat/chatStore';
import { Send, Loader2, Square, Sparkles } from 'lucide-react';

interface ComposerProps {
  onSend: (message: string) => void;
  onStop?: () => void;
}

/**
 * Composer - Message input with slash commands
 */
export function Composer({ onSend, onStop }: ComposerProps) {
  const { inputValue, setInputValue, isStreaming } = useChatStore();
  const [showCommands, setShowCommands] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const commands = [
    { cmd: '/kb', desc: 'Search knowledge base', example: '/kb mcp-status' },
    { cmd: '/research', desc: 'Run web research', example: '/research latest AI trends' },
    { cmd: '/plan', desc: 'Create a plan', example: '/plan integrate local model' },
    { cmd: '/council', desc: 'Run council meeting', example: '/council Should we deploy?' },
    { cmd: '/run', desc: 'Trigger workflow', example: '/run workflow-id {payload}' },
    { cmd: '/logs', desc: 'Tail system logs', example: '/logs' },
    { cmd: '/notice', desc: 'Post notification', example: '/notice Important update' },
    { cmd: '/remember', desc: 'Save to memory', example: '/remember API key location' },
  ];
  
  useEffect(() => {
    // Show commands if input starts with /
    setShowCommands(inputValue.startsWith('/') && !inputValue.includes(' '));
  }, [inputValue]);
  
  // Auto-focus textarea when input value changes (from example cards)
  useEffect(() => {
    if (inputValue && textareaRef.current && !isStreaming) {
      textareaRef.current.focus();
      // Move cursor to end
      const length = inputValue.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [inputValue, isStreaming]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;
    
    onSend(inputValue);
    setInputValue('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter = send, Shift+Enter = newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const insertCommand = (cmd: string) => {
    setInputValue(cmd + ' ');
    textareaRef.current?.focus();
  };
  
  return (
    <div className="relative border-t border-white/10 bg-gradient-to-b from-[#0c1014]/90 to-[#0a0d10] backdrop-blur-xl">
      {/* Command palette - Grok style */}
      {showCommands && (
        <div className="absolute bottom-full left-0 right-0 mb-3 mx-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          <div className="p-3 border-b border-white/10 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">Commands</span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {commands
              .filter(c => c.cmd.startsWith(inputValue))
              .map((command, i) => (
                <button
                  key={i}
                  onClick={() => insertCommand(command.cmd)}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-emerald-400 font-mono group-hover:text-emerald-300 transition-colors">
                        {command.cmd}
                      </div>
                      <div className="text-xs text-white/60 mt-0.5">{command.desc}</div>
                    </div>
                    <div className="text-xs text-white/30 font-mono ml-4">{command.example}</div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
      
      {/* Input form - Grok style */}
      <form onSubmit={handleSubmit} className="px-8 py-6">
        <div className="flex items-end gap-4 max-w-5xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                // Auto-resize
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto';
                  textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Message Scorpion..."
              rows={1}
              disabled={isStreaming}
              className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/20 focus:border-emerald-400/50 rounded-2xl text-white placeholder-white/40 resize-none focus:outline-none disabled:opacity-50 transition-all duration-300 text-[15px] leading-relaxed backdrop-blur-sm shadow-lg focus:shadow-emerald-500/20"
              style={{ 
                minHeight: '56px',
                maxHeight: '200px',
              }}
            />
          </div>
          
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="px-6 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-2xl flex items-center gap-2 text-red-400 transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/10 backdrop-blur-sm font-medium"
              title="Stop generation"
            >
              <Square className="h-5 w-5" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-white/10 disabled:to-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl flex items-center gap-2 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/30 disabled:shadow-none backdrop-blur-sm"
              title="Send message (Enter)"
            >
              <Send className="h-5 w-5" />
              <span>Send</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

