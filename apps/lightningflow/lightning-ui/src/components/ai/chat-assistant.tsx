'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, Send, Sparkles, Zap, DollarSign } from 'lucide-react';
import { UniversalAssistant, Industry, UserRole, BusinessGoal } from '../../lib/ai/universal-assistant';
import { ToolFactory, BaseTool } from '../../lib/tools/tool-factory';
import { useBTC } from '../../hooks/useBTCContext';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actions?: Array<{
    type: 'create_tool' | 'show_info' | 'ask_question' | 'learn_more';
    data: any;
  }>;
  btc_info?: {
    amount_btc: number;
    amount_usd: string;
    amount_sats: number;
  };
}

interface ChatAssistantProps {
  industry: Industry;
  role: UserRole;
  userId: string;
  onToolCreated?: (tool: BaseTool) => void;
  className?: string;
}

export function ChatAssistant({ 
  industry, 
  role, 
  userId, 
  onToolCreated,
  className = '' 
}: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assistant, setAssistant] = useState<UniversalAssistant | null>(null);
  const [pendingTool, setPendingTool] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { breakdown, priceUSD } = useBTC();

  // Initialize assistant
  useEffect(() => {
    const initAssistant = async () => {
      try {
        // Create assistant without exposing API key on client-side
        const { createAssistant } = await import('../../lib/ai/universal-assistant');
        // Pass null for apiKey - the assistant will use server-side proxy calls
        const newAssistant = createAssistant(industry, role, userId, '');
        
        // Set BTC context
        newAssistant.setBTCContext({
          price_usd: priceUSD,
          breakdown
        });

        setAssistant(newAssistant);

        // Add welcome message
        addMessage({
          type: 'assistant',
          content: getWelcomeMessage(industry, role),
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Failed to initialize assistant:', error);
        toast.error('Failed to initialize AI assistant');
      }
    };

    initAssistant();
  }, [industry, role, userId, priceUSD, breakdown]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = async () => {
    if (!input.trim() || !assistant || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    addMessage({
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    try {
      // Get AI response
      const response = await assistant.generateResponse(userMessage);
      
      // Add assistant message
      addMessage({
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        actions: response.actions,
        btc_info: response.btc_info
      });

      // Handle actions
      if (response.actions) {
        for (const action of response.actions) {
          if (action.type === 'create_tool') {
            setPendingTool(action.data);
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      });
      toast.error('Failed to process your request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTool = async () => {
    if (!pendingTool) return;

    try {
      setIsLoading(true);
      
      const tool = await ToolFactory.createTool(
        pendingTool.tool_type,
        pendingTool.config,
        userId,
        industry
      );

      addMessage({
        type: 'system',
        content: `✅ Created ${tool.name}! You can find it in your dashboard.`,
        timestamp: new Date()
      });

      onToolCreated?.(tool);
      setPendingTool(null);
      toast.success(`${tool.name} created successfully!`);
    } catch (error) {
      console.error('Tool creation failed:', error);
      toast.error('Failed to create tool');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          AI Business Assistant
          <Badge variant="secondary" className="ml-auto">
            {industry.replace('_', ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : message.type === 'system'
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* BTC Info Display */}
                {message.btc_info && (
                  <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950 rounded border-l-2 border-orange-500">
                    <div className="flex items-center gap-2 text-xs">
                      <DollarSign className="h-3 w-3" />
                      <span>₿ {message.btc_info.amount_btc}</span>
                      <span>≈ ${message.btc_info.amount_usd}</span>
                      <span>({message.btc_info.amount_sats.toLocaleString()} sats)</span>
                    </div>
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {/* Pending Tool Creation */}
          {pendingTool && (
            <div className="flex justify-center">
              <Card className="max-w-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Ready to create tool</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {pendingTool.config?.description || 'Create this tool for your business?'}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateTool} size="sm" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Create Tool'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPendingTool(null)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What would you like to do? (e.g., 'Create a payment link for $50')"
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {getQuickActions(industry).map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInput(action)}
              disabled={isLoading}
              className="text-xs"
            >
              {action}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function getWelcomeMessage(industry: Industry, role: UserRole): string {
  const messages: Record<Industry, string> = {
    auto_finance: "Hi! I'm here to help you streamline your loan processing and client management. What would you like to work on today?",
    restaurant: "Welcome! I can help you set up payment systems, manage staff, and automate your restaurant operations. How can I assist?",
    freelance: "Hello! I'm here to help you manage clients, create contracts, and get paid faster. What project are you working on?",
    consulting: "Hi there! I can help you create engagement letters, track client progress, and manage your consulting business. What do you need?",
    retail: "Welcome! I can help you set up payment processing, manage inventory, and handle customer transactions. How can I help?",
    healthcare: "Hello! I'm here to help you manage patient payments, appointments, and treatment agreements. What would you like to set up?",
    real_estate: "Hi! I can help you create purchase agreements, manage commissions, and track property transactions. What are you working on?",
    education: "Welcome! I can help you manage tuition payments, student enrollment, and educational services. How can I assist?",
    general: "Hi! I'm your AI business assistant. I can help you create payment links, contracts, track projects, and automate your workflows. What would you like to do?"
  };
  
  return messages[industry] || messages.general;
}

function getQuickActions(industry: Industry): string[] {
  const actions: Record<Industry, string[]> = {
    auto_finance: [
      "Create loan application form",
      "Set up down payment collection",
      "Track loan status"
    ],
    restaurant: [
      "Create payment terminal",
      "Set up tip splitting",
      "Add team member"
    ],
    freelance: [
      "Create project contract",
      "Send invoice for $500",
      "Track project progress"
    ],
    consulting: [
      "Create engagement letter",
      "Set up monthly retainer",
      "Schedule consultation"
    ],
    retail: [
      "Create payment link",
      "Set up inventory tracker",
      "Add cashier access"
    ],
    healthcare: [
      "Create treatment agreement",
      "Set up appointment booking",
      "Collect co-payment"
    ],
    real_estate: [
      "Create purchase agreement",
      "Set up commission split",
      "Track property status"
    ],
    education: [
      "Create enrollment form",
      "Set up tuition payment",
      "Track student progress"
    ],
    general: [
      "Create payment link",
      "Set up contract",
      "Track project status"
    ]
  };
  
  return actions[industry] || actions.general;
} 