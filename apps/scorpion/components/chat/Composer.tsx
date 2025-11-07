'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/chat/chatStore';
import { Send, Loader2, Square } from 'lucide-react';

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
    <div className="relative border-t border-white/5 bg-[#0f1318]">
      {/* Command palette */}
      {showCommands && (
        <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-[#0f1318] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/5 text-xs text-white/40">
            Slash Commands
          </div>
          <div className="max-h-64 overflow-y-auto">
            {commands
              .filter(c => c.cmd.startsWith(inputValue))
              .map((command, i) => (
                <button
                  key={i}
                  onClick={() => insertCommand(command.cmd)}
                  className="w-full text-left px-3 py-2 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-emerald-400 font-mono">{command.cmd}</div>
                      <div className="text-xs text-white/60">{command.desc}</div>
                    </div>
                    <div className="text-xs text-white/30 font-mono">{command.example}</div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message or use / for commands..."
            rows={3}
            disabled={isStreaming}
            className="flex-1 px-4 py-3 bg-[#0a0e13] border border-white/10 rounded text-white placeholder-white/30 resize-none focus:outline-none focus:border-emerald-400/50 disabled:opacity-50"
          />
          
          <div className="flex flex-col gap-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded flex items-center gap-2 text-red-400 transition-colors"
                title="Stop generation"
              >
                <Square className="h-4 w-4" />
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 disabled:opacity-40 disabled:cursor-not-allowed rounded flex items-center gap-2 text-emerald-400 transition-colors"
                title="Send message (Enter)"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            )}
            
            <div className="text-xs text-white/40 text-center">
              {isStreaming ? 'Generating...' : 'Enter to send'}
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-white/30">
          Tip: Use Shift+Enter for new line, / for commands
        </div>
      </form>
    </div>
  );
}

