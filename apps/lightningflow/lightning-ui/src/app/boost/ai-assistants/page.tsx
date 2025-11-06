"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Card, CardContent } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Send, Upload, ArrowLeft, Database, Save } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useAI } from "../../../lib/use-ai"

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: string
  isStreaming?: boolean
}

// Simulating Supabase integration
interface SupabaseState {
  enabled: boolean
  syncing: boolean
  lastSynced: string | null
}

const mockResponses = {
  default: "I'm your Lightning Node Assistant. I can help you with node performance analysis, channel management, routing optimization, and more. How can I help you today?",
  fees: "Based on your node's historical data and network position, I recommend:\n\n1. Adjust your fee structure: Lower base fee to 200 sats, fee rate to 150 ppm\n\n2. Target high-traffic nodes: Add channels to major exchanges and mobile wallets\n\n3. Balance your channels: Aim for 40-60% local balance for optimal routing\n\n4. Consider circular rebalancing for channels with >80% local balance\n\nThis strategy has shown to increase routing volume by 28% on average for nodes with similar profiles.",
  liquidity: "Your current liquidity status:\n\n- Total inbound capacity: 5,240,000 sats (0.0524 BTC)\n- Total outbound capacity: 7,890,000 sats (0.0789 BTC)\n- Balanced channels (40-60%): 3 of 8\n- Channels needing rebalance: 2 (>80% local balance)\n\nRecommendation: Consider adding more inbound liquidity or rebalancing channels with ACINQ and Voltage for improved routing capability.",
  earnings: "Your routing earnings this month:\n\n- Total fees collected: 12,450 sats\n- Average daily earnings: 415 sats\n- Top earning channel: 'Bitfinex' (38% of earnings)\n- Lowest earning channel: 'LightningTo.Me' (3% of earnings)\n\nTrend: ↑ 12.3% increase from last month\nProjection: ~15,000 sats expected by month end",
  htlc: "Your last HTLC failure (#28192) was due to 'temporary_channel_failure'. This typically means the selected route didn't have sufficient outbound capacity at one of the hops.\n\nPossible causes:\n1. Outdated channel information in your node's network graph\n2. A channel in the path was depleted by another payment\n3. The destination node's inbound capacity was insufficient\n\nRecommendation: Try with a smaller amount or use the 'max_parts' parameter to split the payment."
}

// Component that uses search params - wrapped in Suspense
function AIAssistantContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingSpeed, setStreamingSpeed] = useState<'normal' | 'fast' | 'slow'>('normal')
  const [supabaseState, setSupabaseState] = useState<SupabaseState>({
    enabled: false,
    syncing: false,
    lastSynced: null
  })
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Node Assistant Tips\nAsk about your node's performance, channel balances, routing statistics, or fee optimization. You can also upload node logs for analysis.",
      sender: "assistant",
      timestamp: ""
    },
    {
      id: "2",
      content: "How do I create a new payment link?",
      sender: "user",
      timestamp: "07:55 AM"
    },
    {
      id: "3",
      content: "To create a new payment link, go to the \"Payment Links\" section in the sidebar. Click on the \"New Payment Link\" button, then enter the amount and description. You can then share the generated link with your customers.",
      sender: "assistant",
      timestamp: "07:55 AM"
    },
    {
      id: "4",
      content: "What's my current node status?",
      sender: "user",
      timestamp: "07:55 PM"
    },
    {
      id: "5",
      content: "Your node is currently online with 99.8% uptime. You have 8 active channels with a total capacity of 0.01235 BTC. Your node has processed 127 transactions in the current billing period.",
      sender: "assistant",
      timestamp: "07:55 PM"
    }
  ])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  // Handle scroll position to keep new messages in view
  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return
      
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      
      if (isNearBottom && isStreaming) {
        scrollToBottom()
      }
    }
    
    const chatContainer = chatContainerRef.current
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll)
    }
    
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isStreaming])

  // Simulated Supabase sync operation
  const syncWithSupabase = (silent = false) => {
    if (supabaseState.syncing) return
    
    setSupabaseState(prev => ({
      ...prev,
      syncing: true
    }))
    
    // Simulate network operation
    setTimeout(() => {
      const now = new Date().toLocaleTimeString()
      setSupabaseState(prev => ({
        ...prev,
        syncing: false,
        lastSynced: now
      }))
      
      // Only show notification if not silent
      if (!silent) {
        toast.success("Chat history synced", {
          description: `${messages.length} messages saved to Supabase at ${now}`
        })
      }
    }, 1200)
  }

  // Toggle Supabase integration
  const toggleSupabaseSync = () => {
    // Prevent toggling if already syncing
    if (supabaseState.syncing) return;
    
    const newEnabledState = !supabaseState.enabled;
    
    setSupabaseState(prev => ({
      ...prev, 
      enabled: newEnabledState
    }))
    
    if (newEnabledState) {
      // Only show toast when initially enabling
      toast.success("Memory storage enabled", {
        description: "Chat history will be synced with Supabase"
      })
      syncWithSupabase()
    } else {
      toast.info("Memory storage disabled", {
        description: "Chat history will remain local only"
      })
    }
  }

  useEffect(() => {
    // Auto-sync with Supabase when new messages are added (if enabled)
    if (supabaseState.enabled && !supabaseState.syncing && messages.length > 0) {
      // Don't sync while streaming is happening
      if (!isStreaming) {
        // Use silent mode to prevent notification spam
        syncWithSupabase(true)
      }
    }
  }, [messages, isStreaming, supabaseState.enabled, supabaseState.syncing])

  useEffect(() => {
    // Auto focus the input field
    const inputElem = document.querySelector('input')
    if (inputElem) inputElem.focus()
    
    // Check if user came from earnings guide
    const source = searchParams?.get('source')
    if (source === 'earnings-guide') {
      toast.info("Earnings optimization assistant activated", {
        description: "I'll help you analyze and optimize your node's earnings."
      })
      
      // Add a personalized message for earnings guide visitors
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "I see you're interested in optimizing your node's earnings. Based on your node's current performance, here are some personalized recommendations:\n\n1. Your channel with ACINQ has 95% local balance - consider rebalancing or requesting inbound liquidity\n\n2. Your fee rate (1000 base fee / 500 ppm) is higher than network average - consider lowering to 500 base fee / 200 ppm for potentially more volume\n\n3. Consider adding channels to Breez, BlueWallet Hub and Wallet of Satoshi to capture more mobile wallet traffic\n\nWhat specific aspect of earnings would you like to optimize?",
        sender: 'assistant' as const,
        timestamp: now
      }])
      
      // Set a relevant question in the input field
      setInput("Help me optimize my channel fees for maximum revenue")
    }
  }, [searchParams])

  // Initialize AI hook
  const { 
    generateResponse, 
    cancelRequest, 
    createSystemPrompt,
    isLoading: aiLoading
  } = useAI({
    model: "gpt-4-turbo",
    temperature: 0.7,
    onTokenUsage: (usage) => {
      // Log token usage to console (in production, would send to analytics)
      console.log("Token usage:", usage);
      
      // If Supabase syncing is enabled, update token usage in database
      if (supabaseState.enabled) {
        // In a real app, this would call a serverless function or API
        // to update the user's token usage in the database
        toast.info("Token usage recorded", {
          description: `${usage.total_tokens} tokens used (${usage.prompt_tokens} input, ${usage.completion_tokens} output)`
        });
      }
    },
    onError: (error) => {
      toast.error("AI error", {
        description: error.message
      });
    }
  });

  // Enhanced streaming text response with variable speed
  const streamResponse = async (content: string) => {
    const messageId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add temporary message showing streaming state
    setMessages(prev => [...prev, {
      id: messageId,
      content: "",
      sender: "assistant" as const,
      timestamp,
      isStreaming: true
    }]);
    
    setIsStreaming(true);
    
    // In a real implementation, we would use a streaming API
    // For now, we'll simulate streaming character by character
    let currentContent = "";
    const contentChars = content.split("");
    
    for (let i = 0; i < contentChars.length; i++) {
      currentContent += contentChars[i];
      
      // Update the message with the current content
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: currentContent }
            : msg
        )
      );
      
      // Adjust delay based on streaming speed
      let delay = 30; // normal speed (ms per character)
      if (streamingSpeed === 'fast') delay = 10;
      if (streamingSpeed === 'slow') delay = 50;
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Update the final message
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content, isStreaming: false }
          : msg
      )
    );
    
    setIsStreaming(false);
  };
  
  // Replace handleSend with this implementation
  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMessage = input.trim();
    setInput("");
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message to chat
    const newMessages = [
      ...messages,
      {
        id: Date.now().toString(),
        content: userMessage,
        sender: "user" as const,
        timestamp
      }
    ];
    
    setMessages(newMessages);
    
    try {
      // Convert chat history to OpenAI message format
      const messageHistory: Array<{role: 'user' | 'assistant' | 'system', content: string}> = newMessages
        .slice(-10) // Only use last 10 messages for context window
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant' as 'user' | 'assistant',
          content: msg.content
        }));
      
      // Add system prompt for context
      messageHistory.unshift(createSystemPrompt(
        "You are a helpful Lightning Node assistant for a Bitcoin Lightning Network business platform. " +
        "You can help with node performance, channel management, routing optimization, and general Lightning Network questions. " +
        "Be concise, accurate, and helpful. The user is running a Lightning Network node for their business."
      ));
      
      // Call the OpenAI API via our proxy
      const response = await generateResponse(messageHistory);
      
      // Stream the response to the UI
      await streamResponse(response.content);
      
    } catch (error) {
      // Error handling is managed by the useAI hook
      console.error("Error generating response:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Toggle streaming speed
  const toggleStreamingSpeed = () => {
    setStreamingSpeed(prev => {
      if (prev === 'normal') return 'fast'
      if (prev === 'fast') return 'slow'
      return 'normal'
    })
    
    toast.info(`Streaming speed set to ${streamingSpeed === 'normal' ? 'fast' : streamingSpeed === 'fast' ? 'slow' : 'normal'}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">
            <span className="inline-block mr-2">⚡</span>
            Lightning Node Assistant
          </h1>
        </div>
        
        <div className="flex items-center">
          {supabaseState.enabled && (
            <div className="mr-3 text-xs text-gray-400">
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
              className="ml-2 flex items-center gap-1"
              onClick={() => syncWithSupabase(false)}
              disabled={supabaseState.syncing || isStreaming}
            >
              <Save className="h-3.5 w-3.5" />
              <span>{supabaseState.syncing ? 'Syncing...' : 'Sync Now'}</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="ml-2 flex items-center gap-1"
            onClick={toggleStreamingSpeed}
            disabled={isStreaming}
          >
            <span>{streamingSpeed === 'normal' ? '🏃 Normal' : streamingSpeed === 'fast' ? '🚀 Fast' : '🐢 Slow'}</span>
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-md overflow-hidden border border-gray-800 bg-gray-850/80">
        <CardContent className="p-0">
          <div className="flex flex-col h-[600px]">
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            >
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in-up`}
                >
                  {message.sender === 'assistant' && (
                    <div className="chat-avatar-assistant">
                      ⚡
                    </div>
                  )}
                  <div 
                    className={message.sender === 'user' ? 'chat-message-user' : 'chat-message-assistant'}
                  >
                    <div className="whitespace-pre-wrap">
                      {message.content}
                      {message.isStreaming && (
                        <span className="ml-1 inline-block w-1.5 h-4 bg-blue-400 animate-typing-pulse"></span>
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
                    onClick={() => setInput("What's my node liquidity status?")}
                    disabled={isStreaming}
                  >
                    ⚡ What's my node liquidity status?
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-gray-700 bg-gray-800 hover:bg-gray-700"
                    onClick={() => setInput("Show my routing fee earnings")}
                    disabled={isStreaming}
                  >
                    ⚡ Show my routing fee earnings
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-gray-700 bg-gray-800 hover:bg-gray-700"
                    onClick={() => setInput("Help me optimize channel balances")}
                    disabled={isStreaming}
                  >
                    ⚡ Help me optimize channel balances
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-gray-700 bg-gray-800 hover:bg-gray-700"
                    onClick={() => setInput("How do I increase inbound liquidity?")}
                    disabled={isStreaming}
                  >
                    ⚡ How do I increase inbound liquidity?
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-gray-700 bg-gray-800 hover:bg-gray-700"
                    onClick={() => setInput("Explain channel rebalancing")}
                    disabled={isStreaming}
                  >
                    ⚡ Explain channel rebalancing
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-gray-700 bg-gray-800 hover:bg-gray-700"
                    onClick={() => setInput("Why did my last HTLC fail?")}
                    disabled={isStreaming}
                  >
                    ⚡ Why did my last HTLC fail?
                  </Button>
                </div>
              </div>
            
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
                  disabled={isStreaming}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your node's health, channels, or routing performance..."
                  className="bg-gray-800 border-gray-700 text-white"
                  disabled={isStreaming}
                />
                <Button 
                  variant={input.trim() ? "lightning" : "outline"}
                  size="icon" 
                  className={`text-white ${isStreaming ? 'opacity-50 cursor-not-allowed' : ''} ${!input.trim() ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : ''}`}
                  onClick={handleSend}
                  disabled={isStreaming || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AIAssistantPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-gray-700 rounded mr-2 animate-pulse"></div>
            <div className="h-8 w-64 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-[600px] bg-gray-800 rounded-2xl animate-pulse"></div>
      </div>
    }>
      <AIAssistantContent />
    </Suspense>
  )
} 