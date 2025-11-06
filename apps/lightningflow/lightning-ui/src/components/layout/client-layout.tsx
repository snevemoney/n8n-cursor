"use client"

import { memo } from "react"
import { BusinessSidebar } from "./business-sidebar"
import { Breadcrumb } from "./breadcrumb"
import { TopbarActions } from "./topbar-actions"
import { ErrorBoundary } from "../error-boundary"

function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <BusinessSidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold">LightningAI Flow</h1>
            <Breadcrumb className="ml-0.5" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              <div className="bg-green-500 w-2 h-2 rounded-full mr-2 animate-[pulse_2s_ease-in-out_infinite]"></div>
              <span className="text-sm text-green-400">Your node is running smoothly</span>
            </div>
            <TopbarActions />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

// Export as both named and default export
const MemoizedClientLayout = memo(ClientLayout)
export { MemoizedClientLayout as ClientLayout }
export default MemoizedClientLayout 