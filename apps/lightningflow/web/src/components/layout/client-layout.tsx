"use client"

import { memo } from "react"
import { BusinessSidebar } from "./business-sidebar"
import { Breadcrumb } from "./breadcrumb"
import { TopbarActions } from "./topbar-actions"
import { ErrorBoundary } from "../error-boundary"
import { Toaster } from "sonner"

function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <BusinessSidebar />
      {/* Mobile overlay for sidebar */}
      <div className="max-md:fixed max-md:inset-0 max-md:bg-black/60 max-md:z-40 max-md:hidden" aria-hidden="true" />
      <div className="flex-1 flex flex-col min-w-0 max-md:ml-0 md:ml-0 lg:ml-0">
        <header className="flex items-center justify-between border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-md:px-3 max-md:py-2 md:px-4 md:py-3 lg:px-6 lg:py-4">
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="max-md:text-sm md:text-base lg:text-lg font-semibold truncate">LightningAI Flow</h1>
            <Breadcrumb className="ml-0.5 max-md:hidden md:block" />
          </div>
          <div className="flex items-center gap-2 max-md:gap-1 md:gap-3 lg:gap-4 shrink-0">
            <div className="flex items-center bg-green-500/10 rounded-full border border-green-500/20 max-md:px-2 max-md:py-0.5 md:px-2 md:py-1 lg:px-3 lg:py-1">
              <div className="bg-green-500 w-2 h-2 rounded-full max-md:mr-1 md:mr-2 animate-[pulse_2s_ease-in-out_infinite]"></div>
              <span className="max-md:text-xs md:text-xs lg:text-sm text-green-400 max-md:hidden md:inline">Your node is running smoothly</span>
              <span className="max-md:inline md:hidden text-green-400 text-xs">Online</span>
            </div>
            <TopbarActions />
          </div>
        </header>
        <main className="flex-1 overflow-auto max-md:p-3 md:p-4 lg:p-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  )
}

// Export as both named and default export
const MemoizedClientLayout = memo(ClientLayout)
export { MemoizedClientLayout as ClientLayout }
export default MemoizedClientLayout 