"use client"

import { Card, CardContent, CardHeader } from "../ui/card"
import { Database, Info } from "lucide-react"
import { mockNodeData } from "../../lib/mock-data"
import { Button } from "../ui/button"
import { toast } from "sonner"

export function NodeDetailsCard() {
  const { details } = mockNodeData

  const handleReplaceMockNode = () => {
    toast.success("Initializing new mock node...", {
      description: "This would replace the current node in production."
    })
  }

  return (
    <Card className="rounded-xl border border-border bg-muted/10 shadow-sm overflow-hidden col-span-3">
      <CardHeader className="bg-card border-b border-border/20 flex flex-row items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full flex items-center justify-center">
            <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-card-foreground">Node Details</h3>
        </div>
        <div className="px-2 py-1 bg-amber-900/30 text-amber-400 text-xs rounded-full">
          Mock Mode Active
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-2 gap-5 mb-5">
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Node ID</h4>
            <p className="text-sm text-white font-mono break-all">{details.nodeId}</p>
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Node Type</h4>
            <p className="text-sm text-white">{details.type}</p>
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Software Version</h4>
            <p className="text-sm text-white">{details.softwareVersion}</p>
          </div>
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Connected Peers</h4>
            <p className="text-sm text-white">{details.connectedPeers}</p>
          </div>
        </div>
        <div className="mt-2 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              Development Tools
            </div>
            <Button 
              variant="outline"
              size="sm"
              className="border-amber-700 bg-amber-900/20 text-amber-400 hover:bg-amber-900/40 text-xs"
              onClick={handleReplaceMockNode}
            >
              <Info className="h-3 w-3 mr-2" />
              Replace with New Mock Node
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 