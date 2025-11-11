'use client';

import { useEffect } from 'react';
import { Settings, Zap } from 'lucide-react';
import { ExportImport } from './ExportImport';

/**
 * ChatHeader - Header with title and actions
 * Model selector is now in the Composer component
 */
export function ChatHeader() {
  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || 
          (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-command-palette'));
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  
  return (
    <header className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0f1318]">
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <Zap className="h-5 w-5 text-emerald-400" />
        <h1 className="text-lg font-semibold text-white">Scorpion Chat-AGI</h1>
        <div className="px-2 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded text-xs text-emerald-300">
          Beta
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <ExportImport />
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white/60 hover:text-white transition-colors"
          title="Command Palette (⌘K / Ctrl+K)"
        >
          ⌘K
        </button>
        <button
          className="p-2 hover:bg-white/10 rounded transition-colors"
          title="Settings"
        >
          <Settings className="h-4 w-4 text-white/60" />
        </button>
      </div>
    </header>
  );
}

