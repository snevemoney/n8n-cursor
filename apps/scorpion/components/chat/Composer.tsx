'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChatStore } from '@/lib/chat/chatStore';
import { Send, Square, Sparkles, ChevronDown, Check } from 'lucide-react';
import { listUserTools } from '@/lib/chat/tools/user-tools/client';
import { Button, Input, Textarea } from '@/components/scorpion';

interface ComposerProps {
  onSend: (message: string) => void;
  onStop?: () => void;
}

/**
 * Composer - Message input with slash commands
 */
export function Composer({ onSend, onStop }: ComposerProps) {
  const { inputValue, setInputValue, isStreaming, provider, model, setProvider, setModel } = useChatStore();
  const [showCommands, setShowCommands] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get user tools for slash commands
  const userTools = useMemo(() => listUserTools(), []);
  
  // Fetch models based on provider
  useEffect(() => {
    const fetchModels = async () => {
      if (provider === 'ollama') {
        try {
          const response = await fetch('/api/ollama/models');
          const data = await response.json();
          if (data.success && data.available && data.models?.length > 0) {
            const modelNames = data.models.map((m: any) => m.name);
            setAvailableModels(modelNames);
            if (modelNames.length > 0 && !modelNames.includes(model)) {
              setModel(modelNames[0]);
            }
          } else {
            setAvailableModels([]);
          }
        } catch (error) {
          console.error('Failed to fetch Ollama models:', error);
          setAvailableModels([]);
        }
      } else if (provider === 'openai') {
        const openaiModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
        setAvailableModels(openaiModels);
        if (!openaiModels.includes(model)) {
          setModel('gpt-4o-mini');
        }
      }
    };
    
    fetchModels();
  }, [provider, model, setModel]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    
    if (showModelDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showModelDropdown]);
  
  // Filter models based on search
  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) return availableModels;
    const search = modelSearch.toLowerCase();
    return availableModels.filter(m => m.toLowerCase().includes(search));
  }, [availableModels, modelSearch]);
  
  const aiCommands = [
    { cmd: '/kb', desc: 'Search knowledge base', example: '/kb mcp-status' },
    { cmd: '/research', desc: 'Run web research', example: '/research latest AI trends' },
    { cmd: '/plan', desc: 'Create a plan', example: '/plan integrate local model' },
    { cmd: '/council', desc: 'Run council meeting', example: '/council Should we deploy?' },
    { cmd: '/run', desc: 'Trigger workflow', example: '/run workflow-id {payload}' },
    { cmd: '/logs', desc: 'Tail system logs', example: '/logs' },
    { cmd: '/notice', desc: 'Post notification', example: '/notice Important update' },
    { cmd: '/remember', desc: 'Save to memory', example: '/remember API key location' },
  ];
  
  // Combine AI commands with user tool commands
  const userToolCommands = userTools.map(tool => ({
    cmd: tool.slashCommand,
    desc: tool.description,
    example: `${tool.slashCommand} [options]`,
  }));
  
  const commands = [...aiCommands, ...userToolCommands];
  
  // Smart command filtering: exact match > starts with > contains
  const filteredCommands = useMemo(() => {
    if (!inputValue.startsWith('/')) return [];
    
    const query = inputValue.toLowerCase().trim();
    if (query === '/') return commands;
    
    const exact = commands.filter(c => c.cmd.toLowerCase() === query);
    if (exact.length > 0) return exact;
    
    const startsWith = commands.filter(c => c.cmd.toLowerCase().startsWith(query));
    if (startsWith.length > 0) return startsWith;
    
    // Fuzzy match: contains the query (for typos)
    return commands.filter(c => 
      c.cmd.toLowerCase().includes(query) || 
      c.desc.toLowerCase().includes(query)
    );
  }, [inputValue]);
  
  // Show commands only when there's a valid match
  useEffect(() => {
    const shouldShow = inputValue.startsWith('/') && 
                      !inputValue.includes(' ') && 
                      filteredCommands.length > 0;
    setShowCommands(shouldShow);
    if (shouldShow) {
      setSelectedIndex(0); // Reset selection when commands change
    }
  }, [inputValue, filteredCommands.length]);
  
  // Auto-focus logic: only when value changes externally (not during typing)
  useEffect(() => {
    if (inputValue && textareaRef.current && !isStreaming && document.activeElement !== textareaRef.current) {
      // Use requestAnimationFrame for immediate focus without delay
      const timer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          textareaRef.current?.focus();
          const length = inputValue.length;
          textareaRef.current?.setSelectionRange(length, length);
        });
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [inputValue, isStreaming]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;
    
    onSend(inputValue.trim());
    setInputValue('');
    // Reset textarea height after submit
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Command palette navigation
    if (showCommands && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          insertCommand(selected.cmd);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommands(false);
        setInputValue('');
        return;
      }
    }
    
    // Enter = send, Shift+Enter = newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const insertCommand = (cmd: string) => {
    setInputValue(cmd + ' ');
    setShowCommands(false);
    // Focus immediately after state update using requestAnimationFrame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        const length = (cmd + ' ').length;
        textareaRef.current?.setSelectionRange(length, length);
      });
    });
  };
  
  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };
  
  // Sync textarea DOM value with React state (handles direct DOM manipulation from browser automation)
  // This is needed because browser automation tools type directly into the DOM, bypassing React's onChange
  useEffect(() => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    
    // Check periodically for direct DOM manipulation (browser automation)
    // Only sync if DOM value differs significantly to avoid interfering with normal typing
    const syncInterval = setInterval(() => {
      if (textarea && document.activeElement === textarea) {
        // Only sync when textarea is focused (user/browser automation is typing)
        const domValue = textarea.value;
        if (domValue !== inputValue) {
          setInputValue(domValue);
        }
      }
    }, 300); // Check every 300ms (less frequent to avoid performance issues)
    
    return () => clearInterval(syncInterval);
  }, [inputValue, setInputValue]);
  
  return (
    <div className="relative border-t border-white/10 bg-gradient-to-b from-[#0c1014]/90 to-[#0a0d10] backdrop-blur-xl">
      {/* Command palette */}
      {showCommands && filteredCommands.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-3 mx-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          <div className="p-3 border-b border-white/10 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">Commands</span>
            <span className="text-xs text-white/40 ml-auto">
              {filteredCommands.length} {filteredCommands.length === 1 ? 'match' : 'matches'}
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {filteredCommands.map((command, i) => (
              <button
                key={command.cmd}
                onClick={() => insertCommand(command.cmd)}
                onMouseEnter={() => setSelectedIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    insertCommand(command.cmd);
                  }
                }}
                className={`w-full text-left px-4 py-3 transition-all duration-100 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2 ${
                  i === selectedIndex
                    ? 'bg-emerald-500/20 border-l-2 border-emerald-400'
                    : 'hover:bg-white/10'
                }`}
                aria-label={`Use command ${command.cmd}: ${command.desc}`}
                aria-selected={i === selectedIndex}
                role="option"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`text-sm font-semibold font-mono transition-colors ${
                      i === selectedIndex ? 'text-emerald-300' : 'text-emerald-400 group-hover:text-emerald-300'
                    }`}>
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
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="px-6 py-4 sm:px-8 sm:py-6">
        <div className="flex items-end gap-4 sm:gap-5 max-w-5xl mx-auto">
          {/* Model Selector Dropdown - Minimal, secondary priority */}
          <div className="relative flex-shrink-0 hidden sm:block" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowModelDropdown(!showModelDropdown);
                }
              }}
              className="px-2.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg flex items-center gap-1.5 text-white transition-all duration-100 backdrop-blur-sm w-[140px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
              aria-label="Select model"
              aria-expanded={showModelDropdown}
              aria-haspopup="listbox"
            >
              <div className="flex-1 text-left min-w-0">
                <div className="text-[9px] text-white/40 mb-0.5 leading-tight uppercase tracking-wide">Model</div>
                <div className="text-xs font-medium truncate">{model?.split(':')[0] || 'Select'}</div>
              </div>
              <ChevronDown className={`h-3 w-3 text-white/40 transition-transform flex-shrink-0 ${showModelDropdown ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            
            {showModelDropdown && (
              <div 
                className="absolute bottom-full left-0 mb-2 min-w-[280px] max-w-[400px] w-[calc(100vw-2rem)] sm:w-auto bg-[#1a1f26] border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-up"
                role="listbox"
                aria-label="Model selection"
              >
                {/* Search Bar */}
                <div className="p-3 border-b border-white/10">
                  <Input
                    type="text"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="Search models"
                    autoFocus
                    aria-label="Search models"
                  />
                </div>
                
                {/* Provider Toggle */}
                <div className="p-3 border-b border-white/10 flex items-center justify-between gap-2">
                  <span className="text-xs text-white/60 whitespace-nowrap">Provider</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant={provider === 'ollama' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setProvider('ollama')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setProvider('ollama');
                        }
                      }}
                      aria-label="Select Ollama provider"
                      aria-pressed={provider === 'ollama'}
                    >
                      Ollama
                    </Button>
                    <Button
                      variant={provider === 'openai' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setProvider('openai')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setProvider('openai');
                        }
                      }}
                      aria-label="Select OpenAI provider"
                      aria-pressed={provider === 'openai'}
                    >
                      OpenAI
                    </Button>
                  </div>
                </div>
                
                {/* Model List */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredModels.length > 0 ? (
                    filteredModels.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setModel(m);
                          setShowModelDropdown(false);
                          setModelSearch('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setModel(m);
                            setShowModelDropdown(false);
                            setModelSearch('');
                          }
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between gap-2 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2 ${
                          model === m ? 'bg-emerald-500/10' : ''
                        }`}
                        role="option"
                        aria-selected={model === m}
                        aria-label={`Select model ${m}`}
                      >
                        <span className="text-sm text-white break-words break-all min-w-0 flex-1">{m}</span>
                        {model === m && <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-white/40">
                      {modelSearch ? 'No models found' : 'Loading models...'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Textarea - Primary priority, takes maximum space */}
          <div className="flex-1 relative min-w-0">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message Scorpion..."
              rows={1}
              disabled={isStreaming}
              className="px-5 py-4 sm:px-6 sm:py-4 rounded-2xl text-[15px] leading-relaxed backdrop-blur-sm shadow-lg focus:shadow-emerald-500/20"
              style={{ 
                minHeight: '56px',
                maxHeight: '200px',
              }}
              aria-label="Message input"
            />
          </div>
          
          {/* Action Button - Compact */}
          <div className="flex-shrink-0">
            {isStreaming ? (
              <Button
                variant="danger"
                size="lg"
                type="button"
                onClick={onStop}
                icon={<Square className="h-5 w-5" />}
                className="px-5 py-4 sm:px-6 sm:py-4 rounded-2xl shadow-lg shadow-red-500/10 backdrop-blur-sm hover:scale-105"
                title="Stop generation"
                aria-label="Stop message generation"
              >
                <span className="hidden sm:inline">Stop</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={!inputValue.trim()}
                icon={<Send className="h-5 w-5" />}
                className="px-5 py-4 sm:px-6 sm:py-4 rounded-2xl shadow-lg shadow-emerald-500/30 backdrop-blur-sm hover:scale-105"
                title="Send message (Enter)"
                aria-label="Send message"
              >
                <span className="hidden sm:inline">Send</span>
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

