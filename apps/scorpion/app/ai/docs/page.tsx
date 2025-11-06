'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Bot, User, Loader2, AlertCircle, FileText, Upload, X } from 'lucide-react';
import { OllamaClient, OllamaModel } from '../../../lib/ollama-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface Document {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
}

export default function DocsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ollamaClient = useRef<OllamaClient>(new OllamaClient(ollamaUrl));

  useEffect(() => {
    checkOllama();
  }, [ollamaUrl]);

  useEffect(() => {
    if (ollamaAvailable && models.length === 0) {
      loadModels();
    }
  }, [ollamaAvailable]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkOllama = async () => {
    ollamaClient.current = new OllamaClient(ollamaUrl);
    const available = await ollamaClient.current.isAvailable();
    setOllamaAvailable(available);
    if (available) {
      loadModels();
    }
  };

  const loadModels = async () => {
    try {
      const modelList = await ollamaClient.current.listModels();
      setModels(modelList);
      if (modelList.length > 0 && !selectedModel) {
        setSelectedModel(modelList[0].name);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const doc: Document = {
        id: Date.now().toString(),
        name: file.name,
        content: text,
        uploadedAt: new Date(),
      };
      setDocuments((prev) => [...prev, doc]);
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedModel || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Simple RAG: Search documents for relevant content
      let context = '';
      if (documents.length > 0) {
        // Simple keyword matching (in production, use embeddings + vector search)
        const queryLower = userInput.toLowerCase();
        const relevantDocs = documents
          .map((doc) => {
            const matches = doc.content.toLowerCase().includes(queryLower);
            if (matches) {
              // Extract relevant snippet (first 500 chars)
              const index = doc.content.toLowerCase().indexOf(queryLower);
              const start = Math.max(0, index - 100);
              const end = Math.min(doc.content.length, index + queryLower.length + 400);
              return {
                name: doc.name,
                snippet: doc.content.substring(start, end),
              };
            }
            return null;
          })
          .filter((d) => d !== null);

        if (relevantDocs.length > 0) {
          context = `\n\nRelevant context from documents:\n${relevantDocs.map((d) => `[${d.name}]: ${d.snippet}...`).join('\n\n')}`;
        }
      }

      // Build prompt with context
      const prompt = documents.length > 0
        ? `You are a helpful assistant with access to the following documents. Use this context to answer questions accurately.\n\n${context}\n\nQuestion: ${userInput}\n\nAnswer based on the provided context:`
        : userInput;

      const response = await ollamaClient.current.chat({
        model: selectedModel,
        messages: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: prompt },
        ],
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sources: documents.length > 0 ? documents.map((d) => d.name) : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error instanceof Error
        ? error.message
        : `Failed to get response from Ollama. Make sure Ollama is running at ${ollamaUrl}`;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-purple-400" />
                  Document Chat & RAG
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Ollama URL Input */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Ollama:</label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  onBlur={checkOllama}
                  className="bg-gray-700/50 border border-gray-600 rounded px-3 py-1 text-sm w-48 focus:outline-none focus:border-purple-500"
                  placeholder="http://localhost:11434"
                />
              </div>
              {/* Model Selector */}
              {models.length > 0 && (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-gray-700/50 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
                >
                  {models.map((model) => (
                    <option key={model.name} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>
              )}
              {/* Status Indicator */}
              {ollamaAvailable === true && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Connected
                </div>
              )}
              {ollamaAvailable === false && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Disconnected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Documents Sidebar */}
        <div className="w-64 border-r border-gray-700 bg-gray-800/30 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Documents</h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-1.5 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Upload document"
            >
              <Upload className="h-4 w-4" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          {isUploading && (
            <div className="text-sm text-gray-400 mb-2">Uploading...</div>
          )}
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-700/50 rounded p-2 text-sm flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{doc.name}</div>
                  <div className="text-xs text-gray-400">
                    {Math.round(doc.content.length / 1000)}k chars
                  </div>
                </div>
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {documents.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">
                No documents uploaded
                <br />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-400 hover:text-purple-300 mt-2"
                >
                  Upload one
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto container mx-auto px-4 py-6 max-w-4xl">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FileText className="h-16 w-16 text-gray-600 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Start chatting with your documents</h2>
                <p className="text-gray-400 mb-6">
                  {documents.length === 0
                    ? 'Upload documents first, then ask questions about them'
                    : `You have ${documents.length} document${documents.length > 1 ? 's' : ''} loaded. Ask questions!`}
                </p>
                {!ollamaAvailable && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-md">
                    <p className="text-sm text-yellow-300">
                      Ollama is not accessible at {ollamaUrl}. Make sure Ollama is running:
                    </p>
                    <code className="block mt-2 bg-gray-800 px-3 py-2 rounded text-sm">
                      ollama serve
                    </code>
                  </div>
                )}
              </div>
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
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-purple-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800/50 text-gray-100'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-600">
                          <div className="text-xs text-gray-400">Sources:</div>
                          <div className="text-xs text-gray-300 mt-1">
                            {message.sources.join(', ')}
                          </div>
                        </div>
                      )}
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 max-w-4xl">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    documents.length === 0
                      ? 'Upload documents first, then ask questions...'
                      : ollamaAvailable && selectedModel
                        ? `Ask about your ${documents.length} document${documents.length > 1 ? 's' : ''}...`
                        : 'Connect to Ollama first...'
                  }
                  disabled={!ollamaAvailable || !selectedModel || isLoading || documents.length === 0}
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || !selectedModel || isLoading || !ollamaAvailable || documents.length === 0}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
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
              {documents.length === 0 && (
                <div className="mt-2 text-xs text-gray-400 text-center">
                  💡 Upload documents using the sidebar to enable RAG chat
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
