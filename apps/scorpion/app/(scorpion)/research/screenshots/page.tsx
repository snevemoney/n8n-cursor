'use client';

import { useState, useEffect } from 'react';
import { Panel, PageLoadingBar } from '@/components/scorpion';
import { Image, Download, Eye, X } from 'lucide-react';

interface ScreenshotInfo {
  filename: string;
  sessionId?: string;
  timestamp?: string;
  url: string;
}

export default function ResearchScreenshotsPage() {
  const [screenshots, setScreenshots] = useState<ScreenshotInfo[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately

  useEffect(() => {
    // Note: This would need an API endpoint to list available screenshots
    // For now, we'll show a placeholder
    // Defer any data fetch so page renders first
    setTimeout(() => {
      // Future: load screenshots here when API is available
      setLoading(false);
    }, 0);
  }, []);

  const handleViewScreenshot = (filename: string) => {
    setSelectedScreenshot(filename);
  };

  const handleDownload = async (filename: string) => {
    try {
      const response = await fetch(`/api/research/screenshots/${filename}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      }
    } catch (error) {
      console.error('Failed to download screenshot:', error);
    }
  };

  return (
    <>
      <PageLoadingBar loading={loading && screenshots.length === 0} />
      <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
        <Panel title="Research Screenshots">
        <p className="text-sm text-white/60 mb-4">
          View screenshots captured during web research sessions. Screenshots are automatically saved when research agents browse websites.
        </p>

        {loading ? (
          <div className="text-center py-8 text-white/40">Loading screenshots...</div>
        ) : screenshots.length === 0 ? (
          <div className="text-center py-12">
            <Image className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <div className="text-sm text-white/60 mb-2">No screenshots available</div>
            <div className="text-xs text-white/40">
              Screenshots will appear here after research sessions capture them
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {screenshots.map((screenshot) => (
              <div
                key={screenshot.filename}
                className="group relative aspect-video bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-emerald-400/50 transition-all cursor-pointer"
                onClick={() => handleViewScreenshot(screenshot.filename)}
              >
                <img
                  src={`/api/research/screenshots/${screenshot.filename}`}
                  alt={screenshot.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewScreenshot(screenshot.filename);
                    }}
                    className="p-2 bg-white/20 rounded hover:bg-white/30 transition-all"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(screenshot.filename);
                    }}
                    className="p-2 bg-white/20 rounded hover:bg-white/30 transition-all"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 text-xs truncate">
                  {screenshot.filename}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/80 rounded hover:bg-black/60 transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={`/api/research/screenshots/${selectedScreenshot}`}
              alt={selectedScreenshot}
              className="max-w-full max-h-[90vh] object-contain rounded"
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => handleDownload(selectedScreenshot)}
                className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-sm hover:bg-emerald-500/30 transition-all flex items-center gap-2 mx-auto"
              >
                <Download className="h-4 w-4" />
                Download Screenshot
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

