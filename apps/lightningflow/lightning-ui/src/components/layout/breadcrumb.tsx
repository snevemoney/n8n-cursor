"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, ChevronRight } from "lucide-react"
import { NAV_LABELS, PAGE_TITLES } from "../../lib/labels"

interface BreadcrumbProps {
  className?: string
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const pathname = usePathname()
  
  // Skip the root path
  const segments = (pathname || '').split('/').filter(segment => segment)
  
  // Map paths to Apple-style readable titles
  const pathMap: Record<string, string> = {
    'dashboard': NAV_LABELS.dashboard,
    'payment-links': NAV_LABELS.paymentLinks,
    'team-wallets': NAV_LABELS.teamWallets,
    'ai-assistant': NAV_LABELS.aiAssistant,
    'analytics': NAV_LABELS.analytics,
    'transactions': NAV_LABELS.transactions,
    'channels': NAV_LABELS.channels,
    'settings': NAV_LABELS.settings,
    'guides': NAV_LABELS.guides,
    'earnings': 'Revenue',
    'receive': NAV_LABELS.receive,
    'send': NAV_LABELS.send,
    'routes': NAV_LABELS.routes,
    'vault': NAV_LABELS.vault,
    'trust-center': NAV_LABELS.trustCenter,
    'lightning-test': NAV_LABELS.lightningTest,
    'backup': NAV_LABELS.backup,
    'sync': NAV_LABELS.sync,
    'lightning-intelligence': 'Lightning Intelligence'
  }
  
  // Empty breadcrumb if we're at the root
  if (segments.length === 0) {
    return null
  }
  
  return (
    <div className={`flex items-center space-x-1 text-sm ${className}`}>
      <Link 
        href="/" 
        className="text-gray-400 hover:text-white transition-colors flex items-center"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      
      {segments.map((segment, index) => {
        // Build the path up to this segment
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1
        
        return (
          <span key={segment} className="flex items-center">
            <ChevronRight className="h-3.5 w-3.5 text-gray-500 mx-1" />
            <Link 
              href={href}
              className={`${isLast ? 'text-white font-medium' : 'text-gray-400 hover:text-white transition-colors'}`}
            >
              {pathMap[segment] || segment}
            </Link>
          </span>
        )
      })}
    </div>
  )
} 