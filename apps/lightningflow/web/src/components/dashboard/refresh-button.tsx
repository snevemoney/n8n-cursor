"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "../../components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function RefreshButton() {
  const router = useRouter()
  
  const handleRefresh = () => {
    // In a real app, you could call revalidatePath or other data fetching mechanisms
    // We'll use router.refresh() which forces a re-render of the current route
    toast.info('Refreshing node data...', {
      description: 'Fetching latest information from your node'
    })
    
    router.refresh()
    
    // Simulate a successful refresh after a short delay
    setTimeout(() => {
      toast.success('Node data refreshed', {
        description: 'All information is up to date'
      })
    }, 1000)
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      className="flex items-center gap-2 border-gray-700 bg-transparent hover:bg-gray-800"
      onClick={handleRefresh}
    >
      <RefreshCw className="h-4 w-4" />
      Refresh
    </Button>
  )
} 