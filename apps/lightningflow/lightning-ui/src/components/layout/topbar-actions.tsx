"use client"

import {
  Bell,
  Settings,
  MailOpen,
  AlertCircle,
  Loader2,
  LogOut,
  UserCog,
  PaintBucket,
  Code,
  Shield,
  RefreshCw,
  Bitcoin,
  Network
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu"
import { Button } from "../../components/ui/button"
import { toast } from "sonner"
import { useDashboardActions } from "../../lib/actions"

export function TopbarActions() {
  const { goToSettings, goToBackups, goToSync, goToFeeSettings, syncNode } = useDashboardActions()
  
  const handleLogout = () => {
    toast.info("Logging out...", {
      description: "You would be logged out in a real app"
    })
  }

  return (
    <div className="flex items-center gap-3">
      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-y-auto">
            <DropdownMenuItem className="cursor-pointer py-3 px-3">
              <MailOpen className="mr-2 h-4 w-4 text-blue-500 flex-shrink-0" /> 
              <div>
                <div className="font-medium">New message from Node</div>
                <div className="text-xs text-gray-400 mt-1">Your remote node has a new important message regarding operations.</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-3 px-3">
              <AlertCircle className="mr-2 h-4 w-4 text-yellow-500 flex-shrink-0" /> 
              <div>
                <div className="font-medium">Channel nearing depletion</div>
                <div className="text-xs text-gray-400 mt-1">Channel with ACINQ has less than 10% outbound capacity left.</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-3 px-3" disabled>
              <Loader2 className="mr-2 h-4 w-4 text-blue-500 animate-spin flex-shrink-0" /> 
              <div>
                <div className="font-medium">Syncing with peers</div>
                <div className="text-xs text-gray-400 mt-1">Your node is currently syncing with 4 peers (82% complete).</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-3 px-3">
              <Bitcoin className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" /> 
              <div>
                <div className="font-medium">Payment received</div>
                <div className="text-xs text-gray-400 mt-1">You received 10,000 sats for invoice #89324.</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-3 px-3">
              <Network className="mr-2 h-4 w-4 text-purple-500 flex-shrink-0" /> 
              <div>
                <div className="font-medium">New channel established</div>
                <div className="text-xs text-gray-400 mt-1">Channel with Bitfinex is now active (500,000 sats).</div>
              </div>
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-center justify-center text-sm text-blue-500">
            View all notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Settings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white transition-colors">
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={goToSettings}>
            <UserCog className="mr-2 h-4 w-4 text-gray-400" />
            <span>Account Preferences</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={goToFeeSettings}>
            <Bitcoin className="mr-2 h-4 w-4 text-yellow-500" />
            <span>Fee Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={goToBackups}>
            <Shield className="mr-2 h-4 w-4 text-red-500" />
            <span>Backup & Security</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={goToSync}>
            <RefreshCw className="mr-2 h-4 w-4 text-green-500" />
            <span>Sync Node</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => syncNode()}>
            <Network className="mr-2 h-4 w-4 text-purple-500" />
            <span>Quick Sync</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <PaintBucket className="mr-2 h-4 w-4 text-gray-400" />
            <span>Theme Mode</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Code className="mr-2 h-4 w-4 text-gray-400" />
            <span>Developer Tools</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 