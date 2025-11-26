'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HardDrive, Zap, RefreshCw, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface StorageStatus {
  storageType: 'ssd' | 'hdd';
  isSSD: boolean;
  dataPath: string;
  detectedSSDPath?: string | null;
  performance?: {
    readSpeed: string;
    writeSpeed: string;
    latency: string;
  };
  integrations?: {
    ssdDetected: boolean;
    ssdPath: string | null;
    integrations: Array<{
      name: string;
      description: string;
      currentPath: string;
      ssdPath: string | null;
      isOnSSD: boolean;
      canMigrate: boolean;
      migrationStatus: string;
      sizeGB?: string | null;
      recommendation?: string;
    }>;
  };
}

export function StorageModeIndicator() {
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [loading, setLoading] = useState(false); // Start false so component renders immediately
  const [refreshing, setRefreshing] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);

  const loadStorageStatus = useCallback(async (forceRefresh = false) => {
    try {
      // If force refresh, call POST endpoint first to clear cache
      // Only use force refresh on initial load or manual refresh, not on automatic intervals
      if (forceRefresh) {
        setRefreshing(true);
        try {
          const refreshResponse = await fetch('/api/storage/status', { method: 'POST' });
          if (!refreshResponse.ok) {
            // Don't throw - continue with GET request even if refresh fails
            console.warn('Failed to refresh storage detection, continuing with cached data');
          }
        } catch (refreshError) {
          // Ignore refresh errors and continue
          console.warn('Storage refresh failed:', refreshError);
        }
      }
      
      const response = await fetch('/api/storage/status', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const wasSSD = storageStatus?.isSSD;
          const wasPath = storageStatus?.dataPath;
          
          // Only update state if storage status actually changed to prevent unnecessary re-renders
          if (data.isSSD !== wasSSD || data.dataPath !== wasPath) {
            setStorageStatus(data);
            
            if (data.isSSD) {
              if (!wasSSD) {
                // First time detecting SSD - celebrate!
                console.log(
                  '%c⚡ SUPER POWERS ACTIVATED ⚡',
                  'font-size: 16px; font-weight: bold; color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);'
                );
                console.log(
                  '%c🚀 You\'re now running at maximum performance!',
                  'font-size: 12px; color: #f59e0b;'
                );
                console.log(
                  `%c✨ ${data.optimizationsActive?.length || 0} optimizations active • 4x faster • 3x more parallel`,
                  'font-size: 11px; color: #10b981;'
                );
              }
              console.log(`💾 SSD Mode: ${data.dataPath}`);
            } else {
              if (wasSSD) {
                // SSD was disconnected
                console.warn(`💾 SSD disconnected, switched to HDD Mode: ${data.dataPath}`);
              } else {
                console.log(`💾 HDD Mode: ${data.dataPath}`);
              }
            }
          }
          // If status hasn't changed, don't update state (prevents unnecessary re-renders)
        } else {
          // API returned error response
          console.warn('Storage status API error:', data.error || 'Unknown error');
          // Keep existing status on error
        }
      } else {
        // HTTP error
        console.warn(`Failed to load storage status: ${response.status} ${response.statusText}`);
        // Keep existing status on error
      }
    } catch (error) {
      console.error('Failed to load storage status:', error);
      // Keep existing status on error - don't clear it
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storageStatus]);

  useEffect(() => {
    setMounted(true);
    // Defer initial load to avoid blocking page render
    // Use GET first (faster), then refresh in background if needed
    const loadData = () => {
      // Start with GET (fast, cached) then refresh in background
      loadStorageStatus(false);
      // Refresh detection in background after page loads
      setTimeout(() => {
        loadStorageStatus(true);
      }, 2000);
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
    } else {
      setTimeout(loadData, 0); // Immediate fallback
    }
    
    // Refresh every 60 seconds WITHOUT force refresh to avoid clearing caches unnecessarily
    // Only use GET request for periodic checks - POST (force refresh) only on initial load or manual refresh
    const interval = setInterval(() => loadStorageStatus(false), 60000);
    return () => {
      clearInterval(interval);
    };
  }, [loadStorageStatus]);

  const handleManualRefresh = useCallback(() => {
    loadStorageStatus(true);
  }, [loadStorageStatus]);

  const handleMigrateToSSD = useCallback(async () => {
    if (migrating) return;
    
    setMigrating(true);
    setMigrationResult(null);
    
    try {
      const response = await fetch('/api/storage/migrate', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setMigrationResult(data.report);
        // Refresh storage status after migration
        setTimeout(() => {
          loadStorageStatus(true);
        }, 2000);
      } else {
        setMigrationResult({ error: data.error || 'Migration failed' });
      }
    } catch (error: any) {
      setMigrationResult({ error: error.message || 'Migration failed' });
    } finally {
      setMigrating(false);
    }
  }, [migrating, loadStorageStatus]);

  // Render immediately with placeholder - don't block on loading state
  // Show skeleton state while loading, but allow component to render
  if (!storageStatus) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <div className="px-2 py-1 rounded-sm border border-white/10 bg-white/5 animate-pulse">
          <span className="text-[10px] md:text-[11px] lg:text-xs text-white/40">...</span>
        </div>
      </div>
    );
  }

  const isSSD = storageStatus.isSSD;
  const Icon = isSSD ? Zap : HardDrive;
  const ssdDetected = storageStatus.detectedSSDPath && !isSSD;
  const canMigrate = ssdDetected && storageStatus.integrations?.integrations.some(i => i.canMigrate);

  const performanceInfo = storageStatus.performance ? (
    <div className="text-[10px] space-y-0.5 mt-1">
      <div className="flex justify-between gap-2">
        <span className="text-white/50">Read:</span>
        <span className="sc-mono text-emerald-300">{storageStatus.performance.readSpeed}</span>
      </div>
      <div className="flex justify-between gap-2">
        <span className="text-white/50">Write:</span>
        <span className="sc-mono text-emerald-300">{storageStatus.performance.writeSpeed}</span>
      </div>
      <div className="flex justify-between gap-2">
        <span className="text-white/50">Latency:</span>
        <span className="sc-mono text-emerald-300">{storageStatus.performance.latency}</span>
      </div>
    </div>
  ) : null;

  const optimizationsCount = storageStatus.optimizationsActive?.length || 0;
  const optimizationsText = optimizationsCount > 0 
    ? `${optimizationsCount} optimization${optimizationsCount !== 1 ? 's' : ''} active`
    : 'Standard mode';

  const migratableServices = storageStatus.integrations?.integrations.filter(i => i.canMigrate) || [];

  return (
    <>
      <div className="flex items-center gap-2 shrink-0 relative group">
        <button
          onClick={(e) => {
            if (isSSD) {
              e.stopPropagation();
              setShowPanel(!showPanel);
            } else if (canMigrate) {
              e.stopPropagation();
              setShowPanel(!showPanel);
            } else {
              handleManualRefresh();
            }
          }}
          disabled={refreshing || migrating}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
            isSSD
              ? 'bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-yellow-400/50 text-yellow-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30'
              : canMigrate
              ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border-blue-400/50 text-blue-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
          }`}
          title={
            isSSD 
              ? 'Click to toggle super powers panel' 
              : canMigrate
              ? 'SSD detected! Click to migrate to SSD'
              : `Storage: HDD - Click to refresh`
          }
        >
          {isSSD ? (
            <>
              <div className="relative">
                <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                <Sparkles className="w-2 h-2 text-yellow-300 absolute -top-0.5 -right-0.5 animate-ping" />
              </div>
              <span className="text-[10px] md:text-[11px] lg:text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                POWER
              </span>
            </>
          ) : canMigrate ? (
            <>
              <div className="relative">
                <ArrowRight className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <Sparkles className="w-2 h-2 text-blue-300 absolute -top-0.5 -right-0.5 animate-ping" />
              </div>
              <span className="text-[10px] md:text-[11px] lg:text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                UPGRADE
              </span>
            </>
          ) : (
            <>
              <Icon className="w-3 h-3 text-white/50" />
              <span className="text-[10px] md:text-[11px] lg:text-xs font-medium uppercase tracking-wide">
                HDD
              </span>
            </>
          )}
          {refreshing && (
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
          )}
          {migrating && (
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
          )}
          {isSSD && optimizationsCount > 0 && !refreshing && (
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shadow-sm shadow-yellow-400/50" />
          )}
          {canMigrate && !migrating && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-sm shadow-blue-400/50" />
          )}
        </button>
      </div>
      
      {/* Fixed super powers panel in front when SSD is active - rendered via portal */}
      {mounted && isSSD && showPanel && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99998]" 
            onClick={() => setShowPanel(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          {/* Panel - Fixed in center-top */}
          <div 
            className="fixed top-16 right-4 w-96 max-w-[calc(100vw-2rem)] p-5 bg-gradient-to-br from-[#0c1014] via-[#0f1419] to-[#0c1014] border-2 border-yellow-400/60 rounded-xl shadow-2xl shadow-yellow-500/40 backdrop-blur-md"
            style={{ 
              position: 'fixed',
              top: '4rem',
              right: '1rem',
              zIndex: 99999,
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
                <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent leading-tight mb-1">
                  ⚡ SUPER POWERS ACTIVATED ⚡
                </div>
                <div className="text-sm text-yellow-400/90">You're running at maximum performance</div>
              </div>
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="text-white/40 hover:text-white/80 transition-colors text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="text-xs sc-mono text-white/60 mb-4 break-all p-3 bg-white/5 rounded-lg border border-white/10">
            {storageStatus.dataPath}
          </div>
          {performanceInfo && (
            <div className="mb-4 p-3 bg-gradient-to-r from-emerald-500/10 to-yellow-500/10 rounded-lg border border-emerald-400/30">
              {performanceInfo}
            </div>
          )}
          {optimizationsCount > 0 && (
            <div className="mt-4 pt-4 border-t border-yellow-400/30">
              <div className="text-sm text-yellow-300 font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Active Super Powers:
              </div>
              <div className="flex flex-wrap gap-2">
                {storageStatus.optimizationsActive?.map((opt: string) => (
                  <span key={opt} className="text-xs px-3 py-1.5 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-200 rounded-lg border border-yellow-400/50 font-medium shadow-sm">
                    ✨ {opt}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-yellow-400/30">
            <div className="text-sm text-yellow-300/90 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-base">⚡</span>
                <span>4x faster operations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-base">🚀</span>
                <span>3x more parallelism</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-base">💨</span>
                <span>Extended cache & prefetching</span>
              </div>
            </div>
          </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

