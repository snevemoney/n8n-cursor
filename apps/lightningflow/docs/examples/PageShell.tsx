import React from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { SystemStatusBadge } from '@/components/ui/SystemStatusBadge';

interface PageShellProps {
  /**
   * The main title displayed at the top of the page
   */
  title: string;
  
  /**
   * Optional description displayed below the title
   */
  description?: string;
  
  /**
   * Actions to be displayed in the top-right of the page header
   */
  actions?: React.ReactNode;
  
  /**
   * The main content of the page
   */
  children: React.ReactNode;
  
  /**
   * Whether this page requires advanced mode
   */
  requiresAdvancedMode?: boolean;
  
  /**
   * Whether to show the system status badge
   */
  showSystemStatus?: boolean;
}

/**
 * PageShell - Consistent layout wrapper for all pages
 * 
 * This component ensures all pages follow the UI consistency guidelines:
 * - Includes TopBar with node status indicators
 * - Includes Sidebar navigation
 * - Proper responsive padding and layout
 * - Consistent overflow handling
 * - Dark mode compatibility
 */
export function PageShell({
  title,
  description,
  actions,
  children,
  requiresAdvancedMode = false,
  showSystemStatus = true
}: PageShellProps) {
  // Access user settings (mock implementation)
  const { advancedMode } = useUserSettings();
  
  // If page requires advanced mode and user doesn't have it enabled,
  // show the advanced mode required message
  if (requiresAdvancedMode && !advancedMode) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {description && <p className="text-muted-foreground mt-1">{description}</p>}
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-500">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Advanced Mode Required</h2>
              </div>
              <p className="mt-2 text-muted-foreground">
                This page requires Advanced Mode to be enabled. You can enable it in your user settings.
              </p>
              <Button className="mt-4" variant="outline" asChild>
                <Link href="/settings">Go to Settings</Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {showSystemStatus && <SystemStatusBadge />}
              </div>
              {description && <p className="text-muted-foreground mt-1">{description}</p>}
            </div>
            
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
}

// Mock hook for example purposes
function useUserSettings() {
  return {
    advancedMode: false
  };
} 