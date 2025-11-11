'use client';

import { useState } from 'react';
import { Download, Upload, Check, X } from 'lucide-react';
import { exportConversations, importConversations } from '@/lib/chat/persistence';
import { useChatStore } from '@/lib/chat/chatStore';

export function ExportImport() {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { loadPersistedData, conversations } = useChatStore();
  
  const handleExport = () => {
    try {
      const data = exportConversations();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scorpion-conversations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[Export] Error:', error);
      alert('Failed to export conversations');
    }
  };
  
  const handleImport = () => {
    try {
      const result = importConversations(importText);
      if (result.success) {
        setImportStatus('success');
        loadPersistedData();
        // Show success briefly then hide (reduced delay for faster UX)
        setTimeout(() => {
          setShowImport(false);
          setImportText('');
          setImportStatus('idle');
        }, 1000);
      } else {
        setImportStatus('error');
      }
    } catch (error) {
      console.error('[Import] Error:', error);
      setImportStatus('error');
    }
  };
  
  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={handleExport}
        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/80 hover:text-white transition-all flex items-center gap-2"
        title={`Export ${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
      >
        <Download className="h-4 w-4" />
        <span>Export</span>
      </button>
      
      <button
        onClick={() => setShowImport(!showImport)}
        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/80 hover:text-white transition-all flex items-center gap-2"
        title="Import conversations"
      >
        <Upload className="h-4 w-4" />
        <span>Import</span>
      </button>
      
      {showImport && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-[#0c1014] border border-white/20 rounded-2xl shadow-2xl p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Import Conversations</h3>
            <button
              onClick={() => {
                setShowImport(false);
                setImportText('');
                setImportStatus('idle');
              }}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="h-4 w-4 text-white/60" />
            </button>
          </div>
          
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste JSON export here..."
            className="w-full h-32 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-emerald-400/50 font-mono"
          />
          
          {importStatus === 'success' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
              <Check className="h-4 w-4" />
              <span>Import successful!</span>
            </div>
          )}
          
          {importStatus === 'error' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
              <X className="h-4 w-4" />
              <span>Import failed. Check JSON format.</span>
            </div>
          )}
          
          <button
            onClick={handleImport}
            disabled={!importText.trim()}
            className="mt-3 w-full px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded-lg text-sm text-emerald-400 font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Import
          </button>
        </div>
      )}
    </div>
  );
}
