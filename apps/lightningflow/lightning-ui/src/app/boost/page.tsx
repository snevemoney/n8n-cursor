"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { useSmartRedirect } from "../../hooks/useSmartRedirect"
import {
  Rocket,
  Bot,
  Wrench,
  FileText,
  Cog,
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
  Bitcoin
} from "lucide-react"

export default function BoostOverviewPage() {
  const { goTo } = useSmartRedirect({ context: 'boost-overview' })

  const boostTools = [
    {
      title: "AI Assistants",
      description: "Intelligent automation for your business",
      icon: Bot,
      badge: "Popular",
      action: () => goTo('/boost/ai-assistants'),
      color: "text-purple-400",
      bgColor: "bg-purple-900/20",
      borderColor: "border-purple-700/30",
      features: ["Customer Support", "Lead Qualification", "Task Automation"]
    },
    {
      title: "Client Tools",
      description: "Professional tools for client management",
      icon: Users,
      action: () => goTo('/boost/client-tools'),
      color: "text-blue-400",
      bgColor: "bg-blue-900/20",
      borderColor: "border-blue-700/30",
      features: ["CRM Integration", "Project Management", "Communication"]
    },
    {
      title: "BTC Training",
      description: "Bitcoin mindset training for business",
      icon: Bitcoin,
      badge: "New",
      action: () => goTo('/boost/btc-training'),
      color: "text-orange-400",
      bgColor: "bg-orange-900/20",
      borderColor: "border-orange-700/30",
      features: ["Mindset Training", "Value Breakdown", "Financial Planning"]
    },
    {
      title: "Templates",
      description: "Ready-to-use business templates",
      icon: FileText,
      action: () => goTo('/boost/templates'),
      color: "text-green-400",
      bgColor: "bg-green-900/20",
      borderColor: "border-green-700/30",
      features: ["Email Templates", "Invoice Templates", "Workflows"]
    },
    {
      title: "Automation",
      description: "Advanced workflow automation",
      icon: Cog,
      action: () => goTo('/boost/automation'),
      color: "text-amber-400",
      bgColor: "bg-amber-900/20",
      borderColor: "border-amber-700/30",
      features: ["Auto-invoicing", "Payment Routing", "Notifications"]
    }
  ]

  const businessMetrics = {
    automationSavings: 15.5,
    timesSaved: 8.2,
    clientSatisfaction: 94,
    revenueIncrease: 23
  }

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-purple-900/30 p-2 rounded-full">
          <Rocket className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Boost Business</h1>
          <p className="text-gray-400">The multiplier for your Lightning business</p>
        </div>
      </div>

      {/* Value Proposition */}
      <Card className="border-gray-800 bg-gradient-to-r from-purple-900/20 to-blue-900/20 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-900/30 p-3 rounded-full">
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">
                Scale Your Business with AI & Automation
              </h2>
              <p className="text-gray-300">
                Leverage cutting-edge tools to automate operations, enhance customer experience, 
                and multiply your revenue potential.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-400">3x</div>
              <div className="text-sm text-gray-400">Revenue Multiplier</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {businessMetrics.automationSavings}h
              </div>
              <div className="text-sm text-gray-400">Hours Saved/Week</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {businessMetrics.timesSaved}x
              </div>
              <div className="text-sm text-gray-400">Faster Operations</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {businessMetrics.clientSatisfaction}%
              </div>
              <div className="text-sm text-gray-400">Client Satisfaction</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                +{businessMetrics.revenueIncrease}%
              </div>
              <div className="text-sm text-gray-400">Revenue Growth</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boost Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {boostTools.map((tool, index) => {
          const Icon = tool.icon
          return (
            <Card 
              key={index}
              className={`border-gray-800 ${tool.bgColor} ${tool.borderColor} hover:bg-opacity-80 transition-all cursor-pointer`}
              onClick={tool.action}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${tool.color}`} />
                  {tool.title}
                  {tool.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {tool.badge}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-1">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                        <Zap className="h-3 w-3 text-amber-400" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-400">
                      {tool.features.length} features available
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Getting Started */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-400" />
            Getting Started with Business Boost
          </CardTitle>
          <CardDescription>
            Recommended steps to maximize your business potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800/30 rounded">
              <div className="bg-purple-900/30 p-2 rounded-full w-fit mx-auto mb-2">
                <Bot className="h-5 w-5 text-purple-400" />
              </div>
              <div className="font-medium text-white mb-1">1. Start with AI</div>
              <div className="text-sm text-gray-400">
                Set up your first AI assistant for customer support
              </div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded">
              <div className="bg-blue-900/30 p-2 rounded-full w-fit mx-auto mb-2">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="font-medium text-white mb-1">2. Use Templates</div>
              <div className="text-sm text-gray-400">
                Deploy pre-built workflows for common tasks
              </div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded">
              <div className="bg-amber-900/30 p-2 rounded-full w-fit mx-auto mb-2">
                <Cog className="h-5 w-5 text-amber-400" />
              </div>
              <div className="font-medium text-white mb-1">3. Automate</div>
              <div className="text-sm text-gray-400">
                Scale with advanced automation workflows
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 