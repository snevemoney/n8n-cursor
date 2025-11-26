'use client';

import { useState } from 'react';
import { Terminal, RefreshCw, Trash2, Play } from 'lucide-react';

/**
 * CommandBar - Control commands (restart, drain, replay)
 * Requires confirmation for dangerous operations
 */
export function CommandBar() {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  
  const executeCommand = async (command: string, args: any = {}) => {
    setExecuting(true);
    try {
      const response = await fetch('/api/telemetry/socket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, args }),
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Command executed successfully');
      } else {
        alert('Command failed');
      }
    } catch (error) {
      console.error('Command error:', error);
      alert('Command failed');
    } finally {
      setExecuting(false);
      setConfirming(null);
    }
  };
  
  const commands = [
    {
      id: 'restart',
      label: 'Restart Worker',
      icon: RefreshCw,
      description: 'Restart a worker process',
      dangerous: true,
    },
    {
      id: 'drain',
      label: 'Drain Queue',
      icon: Trash2,
      description: 'Stop accepting new jobs',
      dangerous: true,
    },
    {
      id: 'replay',
      label: 'Replay Run',
      icon: Play,
      description: 'Replay a failed execution',
      dangerous: false,
    },
  ];
  
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm text-white transition-colors"
        title="Open command bar"
      >
        <Terminal className="h-4 w-4" />
        Commands
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-[#0f1318] border border-white/20 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-emerald-400" />
            <h3 className="font-medium text-white">Command Center</h3>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {/* Commands */}
        <div className="p-4 space-y-2">
          {commands.map(cmd => {
            const Icon = cmd.icon;
            const isConfirming = confirming === cmd.id;
            
            return (
              <div
                key={cmd.id}
                className={`p-3 rounded border transition-colors ${
                  cmd.dangerous
                    ? 'border-red-400/30 bg-red-400/5'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={`h-5 w-5 flex-shrink-0 ${
                      cmd.dangerous ? 'text-red-400' : 'text-emerald-400'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">{cmd.label}</div>
                      <div className="text-xs text-white/60 mt-0.5">{cmd.description}</div>
                    </div>
                  </div>
                  
                  {!isConfirming ? (
                    <button
                      onClick={() => {
                        if (cmd.dangerous) {
                          setConfirming(cmd.id);
                        } else {
                          executeCommand(cmd.id);
                        }
                      }}
                      disabled={executing}
                      className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors text-white disabled:opacity-40"
                    >
                      Run
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => executeCommand(cmd.id)}
                        disabled={executing}
                        className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors text-white disabled:opacity-40"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirming(null)}
                        disabled={executing}
                        className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors text-white disabled:opacity-40"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

