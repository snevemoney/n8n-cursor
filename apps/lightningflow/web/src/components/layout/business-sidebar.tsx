"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSmartRedirect } from "../../hooks/useSmartRedirect"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import {
  DollarSign,
  TrendingUp,
  Rocket,
  Settings,
  Zap,
  Send,
  Download,
  Receipt,
  History,
  BarChart3,
  Route,
  Coins,
  Target,
  Bot,
  Wrench,
  FileText,
  Cog,
  Shield,
  Database,
  Key,
  ChevronDown,
  ChevronRight,
  Home,
  Menu,
  X,
  Network
} from "lucide-react"

/**
 * Business-Focused Sidebar
 * 
 * Organized around 4 core pillars:
 * 1. Payments Hub (The Engine)
 * 2. Node Earnings (The Value Driver) 
 * 3. Business Boost (The Multiplier)
 * 4. Control Center (The Defense System)
 */

interface SidebarSection {
  id: string
  title: string
  icon: any
  color: string
  items: SidebarItem[]
  badge?: string
  description?: string
}

interface SidebarItem {
  id: string
  title: string
  icon: any
  path: string
  badge?: string
  description?: string
}

export function BusinessSidebar() {
  const pathname = usePathname()
  const { goTo } = useSmartRedirect({ context: 'business-sidebar' })
  const [expandedSections, setExpandedSections] = useState<string[]>(['payments'])
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const sections: SidebarSection[] = [
    {
      id: 'payments',
      title: 'Payments Hub',
      icon: DollarSign,
      color: 'text-blue-400',
      description: 'The Engine',
      items: [
        {
          id: 'send',
          title: 'Send Payment',
          icon: Send,
          path: '/payments/send',
          description: 'Pay anyone instantly'
        },
        {
          id: 'receive',
          title: 'Get Paid',
          icon: Download,
          path: '/payments/receive',
          description: 'Create invoices & requests'
        },
        {
          id: 'invoices',
          title: 'Invoices',
          icon: Receipt,
          path: '/payments/invoices',
          description: 'Manage payment requests'
        },
        {
          id: 'history',
          title: 'Payment History',
          icon: History,
          path: '/payments/history',
          description: 'View all transactions'
        }
      ]
    },
    {
      id: 'earnings',
      title: 'Node Income',
      icon: TrendingUp,
      color: 'text-green-400',
      description: 'The Value Driver',
      badge: '$247',
      items: [
        {
          id: 'overview',
          title: 'Earnings Overview',
          icon: BarChart3,
          path: '/earnings',
          description: 'Total revenue & growth'
        },
        {
          id: 'routing',
          title: 'Routing Income',
          icon: Route,
          path: '/earnings/routing',
          description: 'Fees from routing payments'
        },
        {
          id: 'network-monitor',
          title: 'Network Monitor',
          icon: Network,
          path: '/earnings/network-monitor',
          description: 'Lightning network status',
          badge: 'New'
        },
        {
          id: 'fees',
          title: 'Fee Revenue',
          icon: Coins,
          path: '/earnings/fees',
          description: 'Transaction fee earnings'
        },
        {
          id: 'growth',
          title: 'Growth Analytics',
          icon: Target,
          path: '/earnings/growth',
          description: 'Performance insights'
        }
      ]
    },
    {
      id: 'boost',
      title: 'Boost Business',
      icon: Rocket,
      color: 'text-purple-400',
      description: 'The Multiplier',
      items: [
        {
          id: 'ai-assistants',
          title: 'AI Assistants',
          icon: Bot,
          path: '/boost/ai-assistants',
          description: 'Automate with AI',
          badge: 'New'
        },
        {
          id: 'btc-training',
          title: 'BTC Training',
          icon: Target,
          path: '/boost/btc-training',
          description: 'Bitcoin mindset training',
          badge: 'New'
        },
        {
          id: 'client-tools',
          title: 'Client Tools',
          icon: Wrench,
          path: '/boost/client-tools',
          description: 'Tools for your customers'
        },
        {
          id: 'templates',
          title: 'Templates',
          icon: FileText,
          path: '/boost/templates',
          description: 'Pre-built workflows'
        },
        {
          id: 'automation',
          title: 'Automation',
          icon: Cog,
          path: '/boost/automation',
          description: 'Workflow automation'
        }
      ]
    },
    {
      id: 'settings',
      title: 'Control Center',
      icon: Settings,
      color: 'text-gray-400',
      description: 'The Defense System',
      items: [
        {
          id: 'wallet',
          title: 'Wallet',
          icon: Database,
          path: '/settings/wallet',
          description: 'Node & wallet settings'
        },
        {
          id: 'security',
          title: 'Security',
          icon: Shield,
          path: '/settings/security',
          description: 'Trust center & proofs'
        },
        {
          id: 'integrations',
          title: 'Integrations',
          icon: Key,
          path: '/settings/integrations',
          description: 'API keys & connections'
        },
        {
          id: 'backup',
          title: 'Backup',
          icon: Database,
          path: '/settings/backup',
          description: 'Secure backups'
        },
        {
          id: 'fee-management',
          title: 'Fee Management',
          icon: Coins,
          path: '/settings/fee-management',
          description: 'Manage transaction fees'
        }
      ]
    }
  ]

  if (isCollapsed) {
    return (
      <div className="w-16 bg-gray-900/50 border-r border-gray-800 flex flex-col items-center py-4 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="p-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {sections.map(section => {
          const Icon = section.icon
          return (
            <Button
              key={section.id}
              variant="ghost"
              size="sm"
              onClick={() => toggleSection(section.id)}
              className={`p-2 ${section.color}`}
            >
              <Icon className="h-5 w-5" />
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="w-80 bg-gray-900/50 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/20 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Lightning Business</h2>
              <p className="text-xs text-gray-400">Node Active</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(true)}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Dashboard Link */}
        <Button
          variant={pathname === '/dashboard' ? 'secondary' : 'ghost'}
          className="w-full justify-start mb-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (pathname !== '/dashboard') {
              goTo('HOME');
            }
          }}
          disabled={pathname === '/dashboard'}
        >
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sections.map(section => {
          const Icon = section.icon
          const isExpanded = expandedSections.includes(section.id)
          
          return (
            <div key={section.id} className="space-y-1">
              {/* Section Header */}
              <Button
                variant="ghost"
                className="w-full justify-between p-3 h-auto"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${section.color}`} />
                  <div className="text-left">
                    <div className="font-medium text-white">{section.title}</div>
                    <div className="text-xs text-gray-400">{section.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {section.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {section.badge}
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </Button>

              {/* Section Items */}
              {isExpanded && (
                <div className="ml-8 space-y-1">
                  {section.items.map(item => {
                    const ItemIcon = item.icon
                    const isActive = pathname === item.path
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? 'secondary' : 'ghost'}
                        className="w-full justify-start p-2 h-auto"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isActive) {
                            goTo(item.path);
                          }
                        }}
                        disabled={isActive}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <ItemIcon className="h-4 w-4 text-gray-400" />
                          <div className="text-left flex-1">
                            <div className="text-sm font-medium text-white">
                              {item.title}
                            </div>
                            <div className="text-xs text-gray-400">
                              {item.description}
                            </div>
                          </div>
                          {item.badge && (
                            <Badge variant="outline" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-center text-xs text-gray-400 mb-2">
          Sovereign • Non-custodial • Secure
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">Node Online</span>
        </div>
      </div>
    </div>
  )
} 