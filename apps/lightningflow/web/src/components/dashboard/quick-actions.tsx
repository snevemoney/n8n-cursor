"use client"

import { Button } from "../../components/ui/button"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Network,
  RefreshCw,
  Shield,
  LineChart
} from "lucide-react"
import { useDashboardActions } from "../../lib/actions"

export function QuickActions() {
  const {
    goToReceive,
    goToSend,
    goToChannels,
    syncNode,
    goToBackups,
    goToRoutePlanner
  } = useDashboardActions()

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button
        variant="outline"
        className="flex flex-col items-center justify-center py-3 h-auto border-gray-700 hover:bg-gray-800/50"
        onClick={goToReceive}
      >
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
          <ArrowDownToLine className="h-5 w-5 text-blue-500" />
        </div>
        <span className="text-xs">Receive</span>
      </Button>
      
      <Button
        variant="outline"
        className="flex flex-col items-center justify-center py-3 h-auto border-gray-700 hover:bg-gray-800/50"
        onClick={goToSend}
      >
        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-2">
          <ArrowUpFromLine className="h-5 w-5 text-amber-500" />
        </div>
        <span className="text-xs">Send</span>
      </Button>
      
      <Button
        variant="outline"
        className="flex flex-col items-center justify-center py-3 h-auto border-gray-700 hover:bg-gray-800/50"
        onClick={goToChannels}
      >
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
          <Network className="h-5 w-5 text-purple-500" />
        </div>
        <span className="text-xs">Channels</span>
      </Button>
      
      <Button
        variant="outline"
        className="flex flex-col items-center justify-center py-3 h-auto border-gray-700 hover:bg-gray-800/50"
        onClick={syncNode}
      >
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
          <RefreshCw className="h-5 w-5 text-green-500" />
        </div>
        <span className="text-xs">Sync</span>
      </Button>
      
      <Button
        variant="outline"
        className="flex flex-col items-center justify-center py-3 h-auto border-gray-700 hover:bg-gray-800/50"
        onClick={goToBackups}
      >
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
          <Shield className="h-5 w-5 text-red-500" />
        </div>
        <span className="text-xs">Backup</span>
      </Button>
      
      <Button
        variant="outline"
        className="flex flex-col items-center justify-center py-3 h-auto border-gray-700 hover:bg-gray-800/50"
        onClick={goToRoutePlanner}
      >
        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2">
          <LineChart className="h-5 w-5 text-yellow-500" />
        </div>
        <span className="text-xs">Routes</span>
      </Button>
    </div>
  )
} 