'use client';

import { Globe, MousePointer, Type, Eye, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface BrowserAction {
  type: 'navigate' | 'click' | 'type' | 'scroll' | 'screenshot' | 'extract' | 'wait';
  timestamp: number;
  url: string;
  selector?: string;
  data?: any;
  screenshot?: string; // base64 encoded
}

interface BrowserActionCardProps {
  action: BrowserAction;
}

/**
 * BrowserActionCard - Display real-time browser activity
 * Shows what the research agent is doing (navigation, clicks, screenshots)
 */
export function BrowserActionCard({ action }: BrowserActionCardProps) {
  const [showScreenshot, setShowScreenshot] = useState(false);

  const getIcon = () => {
    switch (action.type) {
      case 'navigate':
        return <Globe className="h-4 w-4 text-blue-400" />;
      case 'click':
        return <MousePointer className="h-4 w-4 text-purple-400" />;
      case 'type':
        return <Type className="h-4 w-4 text-green-400" />;
      case 'screenshot':
        return <Eye className="h-4 w-4 text-amber-400" />;
      case 'extract':
        return <ExternalLink className="h-4 w-4 text-emerald-400" />;
      default:
        return <div className="w-4 h-4 border-2 border-white/20 rounded-full" />;
    }
  };

  const getActionText = () => {
    switch (action.type) {
      case 'navigate':
        const hostname = new URL(action.url).hostname;
        return `Visiting ${hostname}`;
      case 'click':
        return `Clicked ${action.selector || 'element'}`;
      case 'type':
        return `Typed in ${action.selector || 'field'}`;
      case 'screenshot':
        return 'Captured screenshot';
      case 'extract':
        const count = action.data?.count || 0;
        return `Extracted ${count} ${count === 1 ? 'item' : 'items'}`;
      case 'wait':
        return 'Waiting for page load';
      default:
        return action.type;
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="border border-white/10 bg-white/5 rounded-lg p-3 mb-2">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium text-white/90">
              {getActionText()}
            </span>
            <span className="text-xs text-white/50">
              {formatTime(action.timestamp)}
            </span>
          </div>

          {action.type === 'navigate' && (
            <a
              href={action.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 truncate block"
            >
              {action.url}
            </a>
          )}

          {action.type === 'extract' && action.data?.count > 0 && (
            <div className="text-xs text-white/60 mt-1">
              Found {action.data.count} results from {action.selector || 'page'}
            </div>
          )}

          {action.screenshot && (
            <div className="mt-2">
              {!showScreenshot ? (
                <button
                  onClick={() => setShowScreenshot(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View screenshot
                </button>
              ) : (
                <div className="relative rounded border border-white/20 overflow-hidden">
                  <img
                    src={`data:image/png;base64,${action.screenshot}`}
                    alt="Browser screenshot"
                    className="w-full h-auto"
                  />
                  <button
                    onClick={() => setShowScreenshot(false)}
                    className="absolute top-2 right-2 bg-black/50 text-white/90 text-xs px-2 py-1 rounded hover:bg-black/70"
                  >
                    Hide
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
