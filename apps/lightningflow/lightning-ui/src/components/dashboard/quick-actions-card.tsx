"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSmartRedirect } from "@/hooks/useSmartRedirect"
import { NAV_LABELS, ACTION_LABELS } from "@/lib/labels"
import { 
  Send, 
  QrCode, 
  Network, 
  RefreshCw, 
  Settings, 
  Bot,
  Zap,
  TrendingUp
} from "lucide-react"

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  badge?: string;
  variant?: "default" | "secondary" | "outline";
}

export function QuickActionsCard() {
  const { quickActions, goTo, refresh } = useSmartRedirect({ 
    context: 'dashboard-quick-actions',
    trackAnalytics: true 
  });

  const actions: QuickAction[] = [
    {
      id: 'receive',
      label: NAV_LABELS.receive,
      description: "Create payment request",
      icon: QrCode,
      action: () => quickActions.createInvoice(),
      variant: "default"
    },
    {
      id: 'send',
      label: NAV_LABELS.send,
      description: "Send Lightning payment",
      icon: Send,
      action: () => quickActions.sendPayment(),
      variant: "default"
    },
    {
      id: 'channels',
      label: NAV_LABELS.network,
      description: "Manage Lightning channels",
      icon: Network,
      action: () => quickActions.checkChannels(),
      badge: "Pro",
      variant: "outline"
    },
    {
      id: 'earnings',
      label: NAV_LABELS.earnings,
      description: "View Lightning earnings",
      icon: TrendingUp,
      action: () => quickActions.viewEarnings(),
      variant: "outline"
    },
    {
      id: 'automations',
      label: NAV_LABELS.automations,
      description: "AI-powered automations",
      icon: Bot,
      action: () => goTo('AUTOMATIONS'),
      badge: "AI",
      variant: "outline"
    },
    {
      id: 'settings',
      label: NAV_LABELS.settings,
      description: "Node configuration",
      icon: Settings,
      action: () => goTo('SETTINGS'),
      variant: "outline"
    },
    {
      id: 'refresh',
      label: "Refresh",
      description: "Sync with network",
      icon: RefreshCw,
      action: () => refresh(),
      variant: "secondary"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          <CardTitle>Quick Actions</CardTitle>
        </div>
        <CardDescription>
          Common Lightning operations and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant || "outline"}
                className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                onClick={action.action}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 