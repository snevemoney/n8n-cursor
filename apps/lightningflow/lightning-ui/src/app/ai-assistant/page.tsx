'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ChatAssistant } from '../../components/ai/chat-assistant';
import { BTCThinkingTrainer } from '../../components/btc/btc-thinking-trainer';
import { Sparkles, Zap, Users, Building, Stethoscope, Car, Utensils, Briefcase, GraduationCap, Home } from 'lucide-react';
import { Industry, UserRole } from '../../lib/ai/universal-assistant';
import { BaseTool } from '../../lib/tools/tool-factory';
import { toast } from 'sonner';

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

export default function AIAssistantPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('general');
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [userTools, setUserTools] = useState<BaseTool[]>([]);
  const [mockUserId] = useState('demo_user_123');
  const [mockNodeBalance] = useState(250000); // 250k sats for demo

  // Load user tools on mount
  useEffect(() => {
    loadUserTools();
  }, []);

  const loadUserTools = async () => {
    try {
      const response = await fetch(`/api/ai/assistant?userId=${mockUserId}`);
      const data = await response.json();
      
      if (data.success) {
        setUserTools(data.tools);
      }
    } catch (error) {
      console.error('Failed to load tools:', error);
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

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">Universal AI Assistant</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create business tools through conversation. Works for any industry with Lightning-native payments.
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

      {/* Industry Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Choose Your Industry
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select your industry to get tailored AI assistance and terminology
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Object.entries(industryDescriptions).map(([industry, description]) => {
              const Icon = industryIcons[industry as Industry];
              const isSelected = selectedIndustry === industry;
              
              return (
                <Card 
                  key={industry}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleIndustryChange(industry as Industry)}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <Icon className={`h-8 w-8 mx-auto ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className="font-medium capitalize">
                      {industry.replace('_', ' ')}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Your Role:</span>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="assistant" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
                      <TabsTrigger value="tools" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Your Tools ({userTools?.length || 0})
            </TabsTrigger>
          <TabsTrigger value="btc-trainer" className="flex items-center gap-2">
            <span className="text-orange-500">₿</span>
            BTC Trainer
          </TabsTrigger>
        </TabsList>

        {/* AI Assistant Tab */}
        <TabsContent value="assistant" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChatAssistant
                industry={selectedIndustry}
                role={selectedRole}
                userId={mockUserId}
                onToolCreated={handleToolCreated}
              />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Examples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Try saying:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• "Create a payment link for $50"</li>
                      <li>• "I need to collect documents from clients"</li>
                      <li>• "Set up a contract for my services"</li>
                      <li>• "Track project status for clients"</li>
                      <li>• "Add a team member to my wallet"</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                      <span>Describe what you need in plain English</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                      <span>AI understands your industry context</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                      <span>Get a working tool with Lightning payments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Business Tools</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tools created through AI conversations
              </p>
            </CardHeader>
            <CardContent>
              {(userTools?.length || 0) === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">No tools yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the AI Assistant to create your first business tool
                    </p>
                  </div>
                  <Button onClick={() => {
                    const assistantTab = document.querySelector('[value="assistant"]') as HTMLElement;
                    assistantTab?.click();
                  }}>
                    Start Creating Tools
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(userTools || []).map((tool) => (
                    <Card key={tool.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{tool.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {tool.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {tool.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Created {(() => {
                              try {
                                if (!tool.created_at) return 'Unknown date';
                                const date = new Date(tool.created_at);
                                return isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString();
                              } catch {
                                return 'Unknown date';
                              }
                            })()}</span>
                            {tool.public && (
                              <Badge variant="secondary" className="text-xs">
                                Public
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BTC Trainer Tab */}
        <TabsContent value="btc-trainer" className="space-y-6">
          <BTCThinkingTrainer 
            showNodeEarnings={true}
            userNodeBalance={mockNodeBalance}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}