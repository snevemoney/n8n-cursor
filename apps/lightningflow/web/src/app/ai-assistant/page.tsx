'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ChatAssistant } from '../../components/ai/chat-assistant';
import { BTCThinkingTrainer } from '../../components/btc/btc-thinking-trainer';
import { Input } from '../../components/ui/input';
import { Send, Upload, Database, Save, Sparkles, Zap, Users, Building, Stethoscope, Car, Utensils, Briefcase, GraduationCap, Home } from 'lucide-react';
import { Industry, UserRole } from '../../lib/ai/universal-assistant';
import { BaseTool } from '../../lib/tools/tool-factory';
import { toast } from 'sonner';
// import { useAI } from '../../lib/use-ai';

// Industry icons mapping
const industryIcons: Record<Industry, any> = {
  auto_finance: Car,
  restaurant: Utensils,
  freelance: Briefcase,
  consulting: Users,
  retail: Building,
  healthcare: Stethoscope,
  real_estate: Home,
  education: GraduationCap,
  general: Sparkles
};

// Industry descriptions
const industryDescriptions: Record<Industry, string> = {
  auto_finance: "Streamline loan processing, document collection, and client management",
  restaurant: "Manage payments, staff coordination, and customer orders",
  freelance: "Create contracts, track projects, and get paid faster",
  consulting: "Manage client engagements, track progress, and automate workflows",
  retail: "Handle transactions, inventory, and customer management",
  healthcare: "Manage patient payments, appointments, and treatment agreements",
  real_estate: "Create purchase agreements, track commissions, and manage properties",
  education: "Handle tuition, enrollment, and student management",
  general: "Universal business tools for any industry"
};

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  isStreaming?: boolean;
}

interface SupabaseState {
  enabled: boolean;
  syncing: boolean;
  lastSynced: string | null;
}

export default function UnifiedAIAssistantPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'universal' | 'node'>('universal');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('general');
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [userTools, setUserTools] = useState<BaseTool[]>([]);
  const [mockUserId] = useState('demo_user_123');
  const [mockNodeBalance] = useState(250000); // 250k sats for demo
  const [toolsLoaded, setToolsLoaded] = useState(false);
  
  // Node assistant specific state
  const [nodeInput, setNodeInput] = useState('');
  const [nodeMessages, setNodeMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Node Assistant Tips\nAsk about your node's performance, channel balances, routing statistics, or fee optimization. You can also upload node logs for analysis.",
      sender: "assistant",
      timestamp: ""
    },
    {
      id: "2",
      content: "What's my current node status?",
      sender: "user",
      timestamp: "07:55 PM"
    },
    {
      id: "3",
      content: "Your node is currently online with 99.8% uptime. You have 8 active channels with a total capacity of 0.01235 BTC. Your node has processed 127 transactions in the current billing period.",
      sender: "assistant",
      timestamp: "07:55 PM"
    }
  ]);
  const [isNodeStreaming, setIsNodeStreaming] = useState(false);
  const [streamingSpeed, setStreamingSpeed] = useState<'normal' | 'fast' | 'slow'>('normal');
  const [supabaseState, setSupabaseState] = useState<SupabaseState>({
    enabled: false,
    syncing: false,
    lastSynced: null
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load user tools on mount
  useEffect(() => {
    loadUserTools();
  }, []);

  // Handle URL parameters for tab selection
  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam === 'node') {
      setActiveTab('node');
    }
  }, [searchParams]);

  const loadUserTools = async () => {
    try {
      const response = await fetch(`/api/ai/assistant?userId=${mockUserId}`);
      
      // Check if response is ok and content type is JSON
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        throw new Error('Response is not JSON');
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        console.error('Response text:', await response.text());
        throw new Error('Invalid JSON response from server');
      }
      
      if (data.success) {
        setUserTools(data.tools || []);
      } else {
        setUserTools([]);
      }
    } catch (error) {
      console.error('Failed to load tools:', error);
      setUserTools([]);
    } finally {
      setToolsLoaded(true);
    }
  };

  const handleToolCreated = (tool: BaseTool) => {
    setUserTools(prev => [tool, ...prev]);
    toast.success(`${tool.name} created successfully!`);
  };

  const handleIndustryChange = (industry: Industry) => {
    setSelectedIndustry(industry);
    toast.info(`Switched to ${industry.replace('_', ' ')} mode`);
  };

  // Node assistant functions
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [nodeMessages]);

  const syncWithSupabase = (silent = false) => {
    if (supabaseState.syncing) return;
    
    setSupabaseState(prev => ({
      ...prev,
      syncing: true
    }));
    
    // Simulate network operation
    setTimeout(() => {
      const now = new Date().toLocaleTimeString();
      setSupabaseState(prev => ({
        ...prev,
        syncing: false,
        lastSynced: now
      }));
      
      if (!silent) {
        toast.success("Chat history synced", {
          description: `${nodeMessages.length} messages saved to Supabase at ${now}`
        });
      }
    }, 1200);
  };

  const toggleSupabaseSync = () => {
    if (supabaseState.syncing) return;
    
    const newEnabledState = !supabaseState.enabled;
    
    setSupabaseState(prev => ({
      ...prev, 
      enabled: newEnabledState
    }));
    
    if (newEnabledState) {
      toast.success("Memory storage enabled", {
        description: "Chat history will be synced with Supabase"
      });
      syncWithSupabase();
    } else {
      toast.info("Memory storage disabled", {
        description: "Chat history will remain local only"
      });
    }
  };

  const streamNodeResponse = async (content: string) => {
    const messageId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setNodeMessages(prev => [...prev, {
      id: messageId,
      content: "",
      sender: "assistant" as const,
      timestamp,
      isStreaming: true
    }]);
    
    setIsNodeStreaming(true);
    
    let currentContent = "";
    const contentChars = content.split("");
    
    for (let i = 0; i < contentChars.length; i++) {
      currentContent += contentChars[i];
      
      setNodeMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: currentContent }
            : msg
        )
      );
      
      let delay = 30;
      if (streamingSpeed === 'fast') delay = 10;
      if (streamingSpeed === 'slow') delay = 50;
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setNodeMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content, isStreaming: false }
          : msg
      )
    );
    
    setIsNodeStreaming(false);
  };

  const handleNodeSend = async () => {
    if (!nodeInput.trim() || isNodeStreaming) return;
    
    const userMessage = nodeInput.trim();
    setNodeInput("");
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newMessages = [
      ...nodeMessages,
      {
        id: Date.now().toString(),
        content: userMessage,
        sender: "user" as const,
        timestamp
      }
    ];
    
    setNodeMessages(newMessages);
    
    // Simulate AI response for demo
    setTimeout(() => {
      const responses = [
        "Based on your node's current performance, I can see that your routing fees are optimized well. Your channel balance distribution looks healthy with 60% local and 40% remote capacity.",
        "Your node is performing excellently! The 99.8% uptime is above average, and your 8 active channels provide good network coverage.",
        "For channel optimization, I recommend focusing on high-traffic nodes like major exchanges and mobile wallet hubs to increase your routing volume.",
        "Your current fee structure (1000 base fee, 500 ppm) is competitive. Consider A/B testing with slightly lower fees to see if it increases routing volume."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      streamNodeResponse(randomResponse);
    }, 1000);
  };

  const handleNodeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNodeSend();
    }
  };

  const toggleStreamingSpeed = () => {
    setStreamingSpeed(prev => {
      if (prev === 'normal') return 'fast';
      if (prev === 'fast') return 'slow';
      return 'normal';
    });
    
    toast.info(`Streaming speed set to ${streamingSpeed === 'normal' ? 'fast' : streamingSpeed === 'fast' ? 'slow' : 'normal'}`);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = industryIcons[iconName] || Sparkles;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">Unified AI Assistant</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          One powerful AI assistant for all your business needs and Lightning node management.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary" className="text-sm">
            ⚡ Lightning Network
          </Badge>
          <Badge variant="secondary" className="text-sm">
            🤖 AI-Powered
          </Badge>
          <Badge variant="secondary" className="text-sm">
            🔧 No-Code Tools
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'universal' | 'node')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="universal" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Business Tools
          </TabsTrigger>
          <TabsTrigger value="node" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Node Assistant
          </TabsTrigger>
        </TabsList>

        {/* Universal Business Tools Tab */}
        <TabsContent value="universal" className="space-y-6">
          {/* Industry Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Choose Your Industry
              </CardTitle>
              <p className="text-muted-foreground">
                Select your industry to get tailored AI assistance and terminology
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(industryIcons).map(([industry, Icon]) => (
                  <Button
                    key={industry}
                    variant={selectedIndustry === industry ? 'default' : 'outline'}
                    className="h-auto p-4 flex flex-col items-center gap-3"
                    onClick={() => handleIndustryChange(industry as Industry)}
                  >
                    <Icon className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-semibold capitalize">
                        {industry.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {industryDescriptions[industry as Industry]}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Role
              </CardTitle>
              <p className="text-muted-foreground">
                Select your role to get personalized assistance
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['owner', 'manager', 'employee', 'consultant'] as UserRole[]).map((role) => (
                  <Button
                    key={role}
                    variant={selectedRole === role ? 'default' : 'outline'}
                    className="capitalize"
                    onClick={() => setSelectedRole(role)}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Chat Assistant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Business Assistant
              </CardTitle>
              <p className="text-muted-foreground">
                Create business tools through conversation. Works for any industry with Lightning-native payments.
              </p>
            </CardHeader>
            <CardContent>
              <ChatAssistant
                industry={selectedIndustry}
                userRole={selectedRole}
                onToolCreated={handleToolCreated}
              />
            </CardContent>
          </Card>

          {/* User Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Your Tools ({toolsLoaded ? userTools.length : '...'})
              </CardTitle>
              <p className="text-muted-foreground">
                Tools created by your AI assistant
              </p>
            </CardHeader>
            <CardContent>
              {userTools.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tools created yet. Start a conversation with your AI assistant!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userTools.map((tool) => (
                    <Card key={tool.id} className="p-4">
                      <CardHeader className="p-0 pb-3">
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Created {new Date(tool.created_at).toLocaleDateString()}</span>
                          {tool.public && (
                            <Badge variant="secondary" className="text-xs">
                              Public
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* BTC Training */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-orange-500">₿</span>
                BTC Thinking Trainer
              </CardTitle>
              <p className="text-muted-foreground">
                Practice thinking in Bitcoin terms and understand Lightning Network concepts
              </p>
            </CardHeader>
            <CardContent>
              <BTCThinkingTrainer />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lightning Node Assistant Tab */}
        <TabsContent value="node" className="space-y-6">
          {/* Node Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Node Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-300">
                  Your node is currently online with 99.8% uptime. You have 8 active channels with a total capacity of 0.01235 BTC. Your node has processed 127 transactions in the current billing period.
                </p>
                <div className="text-xs text-gray-500 mt-2">07:55 PM</div>
              </div>
            </CardContent>
          </Card>

          {/* Node Chat Interface */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Lightning Node Assistant
                </CardTitle>
                <div className="flex items-center gap-2">
                  {supabaseState.enabled && (
                    <div className="text-xs text-gray-400">
                      {supabaseState.lastSynced ? 
                        `Last synced: ${supabaseState.lastSynced}` : 
                        'Not synced yet'}
                    </div>
                  )}
                  <Button
                    variant={supabaseState.enabled ? "secondary" : "outline"}
                    size="sm"
                    onClick={toggleSupabaseSync}
                    className="flex items-center gap-1"
                  >
                    <Database className="h-3.5 w-3.5" />
                    <span>{supabaseState.enabled ? 'Memory Enabled' : 'Enable Memory'}</span>
                  </Button>
                  
                  {supabaseState.enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => syncWithSupabase(false)}
                      disabled={supabaseState.syncing || isNodeStreaming}
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>{supabaseState.syncing ? 'Syncing...' : 'Sync Now'}</span>
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={toggleStreamingSpeed}
                    disabled={isNodeStreaming}
                  >
                    <span>{streamingSpeed === 'normal' ? '🏃 Normal' : streamingSpeed === 'fast' ? '🚀 Fast' : '🐢 Slow'}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[500px]">
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
                >
                  {nodeMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      {message.sender === 'assistant' && (
                        <div className="chat-avatar-assistant">
                          ⚡
                        </div>
                      )}
                      <div 
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">
                          {message.content}
                          {message.isStreaming && (
                            <span className="ml-1 inline-block w-1.5 h-4 bg-blue-400 animate-pulse"></span>
                          )}
                        </div>
                        {message.timestamp && (
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp}
                          </div>
                        )}
                      </div>
                      {message.sender === 'user' && (
                        <div className="chat-avatar-user">
                          🧑
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="border-t border-gray-700 p-4 bg-gray-900/60">
                  <div className="mb-2">
                    <div className="text-sm text-gray-400 mb-2">📍 Popular node questions:</div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs border-gray-700 bg-gray-800 hover:bg-gray-700"
                        onClick={() => setNodeInput("What's my node liquidity status?")}
                        disabled={isNodeStreaming}
                      >
                        ⚡ What's my node liquidity status?
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs border-gray-700 bg-gray-800 hover:bg-gray-700"
                        onClick={() => setNodeInput("Show my routing fee earnings")}
                        disabled={isNodeStreaming}
                      >
                        ⚡ Show my routing fee earnings
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs border-gray-700 bg-gray-800 hover:bg-gray-700"
                        onClick={() => setNodeInput("Help me optimize channel balances")}
                        disabled={isNodeStreaming}
                      >
                        ⚡ Help me optimize channel balances
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs border-gray-700 bg-gray-800 hover:bg-gray-700"
                        onClick={() => setNodeInput("How do I increase inbound liquidity?")}
                        disabled={isNodeStreaming}
                      >
                        ⚡ How do I increase inbound liquidity?
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs border-gray-700 bg-gray-800 hover:bg-gray-700"
                        onClick={() => setNodeInput("Explain channel rebalancing")}
                        disabled={isNodeStreaming}
                      >
                        ⚡ Explain channel rebalancing
                      </Button>
                    </div>
                  </div>
                
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
                      disabled={isNodeStreaming}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Input
                      value={nodeInput}
                      onChange={(e) => setNodeInput(e.target.value)}
                      onKeyDown={handleNodeKeyDown}
                      placeholder="Ask about your node's health, channels, or routing performance..."
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={isNodeStreaming}
                    />
                    <Button 
                      variant={nodeInput.trim() ? "default" : "outline"}
                      size="icon" 
                      className={`text-white ${isNodeStreaming ? 'opacity-50 cursor-not-allowed' : ''} ${!nodeInput.trim() ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : ''}`}
                      onClick={handleNodeSend}
                      disabled={isNodeStreaming || !nodeInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}