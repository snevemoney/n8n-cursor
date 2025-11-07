'use client';

import { Play, Pause, RotateCcw, Download, Share2 } from 'lucide-react';

interface TopActionsProps {
  isLive?: boolean;
  onToggleLive?: () => void;
  onReplay?: () => void;
  onExport?: () => void;
  onShare?: () => void;
}

/**
 * TopActions - Quick action buttons for chat controls
 */
export function TopActions({
  isLive = true,
  onToggleLive,
  onReplay,
  onExport,
  onShare,
}: TopActionsProps) {
  return (
    <div className="flex items-center gap-2 p-3 border-b border-white/10 bg-[#0a0e13]">
      <div className="flex-1 text-xs text-white/40">
        Quick Actions
      </div>
      
      <div className="flex items-center gap-2">
        {/* Live Toggle */}
        {onToggleLive && (
          <button
            onClick={onToggleLive}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              isLive
                ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400'
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
            }`}
            title={isLive ? 'Pause updates' : 'Resume updates'}
          >
            {isLive ? (
              <>
                <Pause className="h-3 w-3 inline mr-1" />
                Live
              </>
            ) : (
              <>
                <Play className="h-3 w-3 inline mr-1" />
                Paused
              </>
            )}
          </button>
        )}
        
        {/* Replay */}
        {onReplay && (
          <button
            onClick={onReplay}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white/60 hover:text-white transition-colors"
            title="Replay last interaction"
          >
            <RotateCcw className="h-3 w-3 inline mr-1" />
            Replay
          </button>
        )}
        
        {/* Export */}
        {onExport && (
          <button
            onClick={onExport}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white/60 hover:text-white transition-colors"
            title="Export conversation"
          >
            <Download className="h-3 w-3 inline mr-1" />
            Export
          </button>
        )}
        
        {/* Share */}
        {onShare && (
          <button
            onClick={onShare}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white/60 hover:text-white transition-colors"
            title="Share conversation"
          >
            <Share2 className="h-3 w-3 inline mr-1" />
            Share
          </button>
        )}
      </div>
    </div>
  );
}

