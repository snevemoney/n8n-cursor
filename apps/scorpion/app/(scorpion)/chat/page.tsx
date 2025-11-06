'use client';

import { useState, useRef, useEffect } from 'react';
import { Panel } from '@/components/scorpion';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ModelInfo {
  available: boolean;
  source: string;
  models: string[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkModelStatus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkModelStatus = async () => {
    try {
      const response = await fetch('/api/chat');
      if (response.ok) {
        const data = await response.json();
        setModelInfo(data);
        setModels(data.models || []);
        if (data.models && data.models.length > 0 && !selectedModel) {
          setSelectedModel(data.models[0]);
        }
      }
    } catch (error) {
      console.error('Failed to check model status:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          useRAG: true,
          model: selectedModel || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Chat request failed: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error instanceof Error
        ? error.message
        : 'Failed to get response. Check your model configuration.';
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${errorMsg}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <Panel className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="sc-title mb-1">Chat Interface</div>
            <div className="text-sm">Direct communication with Scorpion AI</div>
          </div>
          <div className="flex items-center gap-4">
            {modelInfo && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/40">Source:</span>
                <span className="text-white capitalize sc-mono">{modelInfo.source}</span>
              </div>
            )}
            {models.length > 0 && (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-white/5 border border-white/5 rounded-sm px-3 py-1 text-sm focus:outline-none focus:border-emerald-400/50 text-white"
              >
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            )}
            {modelInfo?.available === true && (
              <div className="flex items-center gap-2 text-emerald-300 text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Connected
              </div>
            )}
            {modelInfo?.available === false && (
              <div className="flex items-center gap-2 text-red-300 text-sm">
                <AlertCircle className="h-4 w-4" />
                Disconnected
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <Panel>
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Bot className="h-16 w-16 text-white/20 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-gray-400 mb-6">
                {modelInfo?.available
                  ? `Select a model and start chatting with ${modelInfo.source}`
                  : 'Model service is not available. Check your configuration.'}
              </p>
            </div>
          </Panel>
        ) : (
          <div className="space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-emerald-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-sm p-4 border ${
                    message.role === 'user'
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-white'
                      : 'bg-[#0f1318] border-white/5 text-gray-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-70 mt-2 sc-mono">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <User className="h-4 w-4 text-white/40" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="bg-[#0f1318] border border-white/5 rounded-sm p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <Panel>
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              modelInfo?.available && selectedModel
                ? `Message ${selectedModel}...`
                : modelInfo?.available
                  ? 'Select a model first...'
                  : 'Model not available...'
            }
            disabled={!modelInfo?.available || isLoading}
            className="flex-1 bg-white/5 border border-white/5 rounded-sm px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !modelInfo?.available}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 disabled:bg-white/5 disabled:cursor-not-allowed border border-emerald-400/50 px-6 py-3 rounded-sm font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </button>
        </form>
      </Panel>
    </div>
  );
}

