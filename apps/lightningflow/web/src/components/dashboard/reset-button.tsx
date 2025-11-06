"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "../../components/ui/button"
import { toast } from "sonner"

export function ResetDataButton() {
  const handleReset = async () => {
    try {
      // In a production app, this would be a real API endpoint
      // await fetch("/api/mock/reset", { method: "POST" })
      
      toast.success('Mock data has been reset', {
        description: 'Node data has been restored to initial values'
      })
      
      // For demo purposes, we'll just reload the page
      window.location.reload()
    } catch (error) {
      toast.error('Failed to reset data', {
        description: 'There was an error resetting the mock data'
      })
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="text-amber-500 hover:text-amber-400 hover:bg-amber-950/50"
      onClick={handleReset}
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Reset Data
    </Button>
  )
} 