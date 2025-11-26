"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "../ui/button"

interface MockModeBannerProps {
  onReset?: () => void
}

export function MockModeBanner({ onReset }: MockModeBannerProps) {
  return (
    <div className="flex items-center justify-between bg-[#422519] text-[#e08974] border border-[#a9472b] px-4 py-2 rounded-md mb-6">
      <div className="flex items-center">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <span>Mock Mode Active</span>
      </div>
      {onReset && (
        <Button 
          variant="ghost"
          size="sm"
          className="text-sm text-muted-foreground hover:text-foreground ml-auto"
          onClick={onReset}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reset Data
        </Button>
      )}
    </div>
  )
} 