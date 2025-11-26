'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function DashboardAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your Lightning platform assistant. Ask me anything about your node, dashboard features, or platform settings.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    "Why is my node offline?",
    "How do I increase my channel capacity?",
    "What's my email campaign performance?",
    "How do I upgrade my plan?",
    "Show me my recent transactions",
    "How do I set up AI agents?"
  ];

  const askQuestion = async (q?: string) => {
    const questionText = q || question;
    if (!questionText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: questionText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/agents/explain-dashboard-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'your-uuid-here-replace-me', // This should come from auth
          question: questionText
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply || 'Sorry, I could not process your question.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error asking question:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🤖 Lightning Assistant
          <Badge variant="secondary">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Questions */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => askQuestion(q)}
                className="text-xs"
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-3 py-2 rounded-lg">
                <div className="flex items-center space-x-1">
                  <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full"></div>
                  <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full delay-100"></div>
                  <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about your Lightning platform..."
            onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
            disabled={loading}
          />
          <Button onClick={() => askQuestion()} disabled={loading || !question.trim()}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 