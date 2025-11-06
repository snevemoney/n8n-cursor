'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, ExternalLink } from 'lucide-react';
import ReactPlayer from 'react-player';
import FeedbackButtons from '@/components/ui/feedback-buttons';

interface TooltipData {
  id: string;
  x: number; // Percentage from left
  y: number; // Percentage from top
  timestamp?: number; // Show tooltip at specific time (seconds)
  title: string;
  text: string;
  embeddingId?: string; // For feedback tracking
  source?: string; // Link to documentation
}

interface TutorialPlayerProps {
  videoUrl: string;
  tooltips: TooltipData[];
  title?: string;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
}

export default function TutorialPlayer({
  videoUrl,
  tooltips,
  title,
  onProgress
}: TutorialPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTooltips, setActiveTooltips] = useState<TooltipData[]>([]);
  const playerRef = useRef<ReactPlayer>(null);

  // Filter tooltips based on current timestamp
  useEffect(() => {
    const visible = tooltips.filter(tooltip => {
      if (!tooltip.timestamp) return true; // Show non-time-based tooltips always
      const tolerance = 2; // Show tooltip 2 seconds before and after timestamp
      return Math.abs(currentTime - tooltip.timestamp) <= tolerance;
    });
    setActiveTooltips(visible);
  }, [currentTime, tooltips]);

  const handleProgress = (progress: { played: number; playedSeconds: number }) => {
    setCurrentTime(progress.playedSeconds);
    onProgress?.(progress);
  };

  const handleTooltipClick = (tooltip: TooltipData) => {
    if (tooltip.timestamp && playerRef.current) {
      playerRef.current.seekTo(tooltip.timestamp, 'seconds');
    }
  };

  const handleFeedback = (embeddingId: string, value: 'yes' | 'no') => {
    console.log(`Feedback for ${embeddingId}: ${value}`);
    // Additional analytics or tracking could be added here
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {title && (
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        )}
        
        <Card>
          <CardContent className="p-0">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                controls
                width="100%"
                height="auto"
                style={{ aspectRatio: '16/9' }}
                onProgress={handleProgress}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                config={{
                  youtube: {
                    playerVars: {
                      showinfo: 1,
                      controls: 1,
                      modestbranding: 1,
                    }
                  }
                }}
              />
              
              {/* Interactive Tooltips Overlay */}
              {activeTooltips.map((tooltip) => (
                <Tooltip key={tooltip.id}>
                  <TooltipTrigger asChild>
                    <button
                      className="absolute bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-all duration-200 transform hover:scale-110 shadow-lg"
                      style={{ 
                        left: `${tooltip.x}%`, 
                        top: `${tooltip.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={() => handleTooltipClick(tooltip)}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    className="max-w-xs bg-white border shadow-lg rounded-lg p-4"
                    side="top"
                  >
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">{tooltip.title}</h4>
                      <p className="text-sm text-gray-600">{tooltip.text}</p>
                      
                      {tooltip.source && (
                        <a
                          href={tooltip.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Learn more
                        </a>
                      )}
                      
                      {tooltip.embeddingId && (
                        <FeedbackButtons 
                          embeddingId={tooltip.embeddingId}
                          onFeedback={handleFeedback}
                          context={{
                            tooltip_id: tooltip.id,
                            source: 'tutorial_tooltip'
                          }}
                          variant="inline"
                          size="sm"
                        />
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Tooltips */}
        {tooltips.some(t => t.timestamp) && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Tutorial Timeline</h3>
              <div className="space-y-2">
                {tooltips
                  .filter(t => t.timestamp)
                  .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
                  .map((tooltip) => (
                    <div key={tooltip.id} className="space-y-2">
                      <button
                        onClick={() => handleTooltipClick(tooltip)}
                        className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-xs font-mono text-gray-500 min-w-[3rem]">
                          {Math.floor((tooltip.timestamp || 0) / 60)}:
                          {String(Math.floor((tooltip.timestamp || 0) % 60)).padStart(2, '0')}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{tooltip.title}</div>
                          <div className="text-xs text-gray-600">{tooltip.text}</div>
                        </div>
                      </button>
                      
                      {tooltip.embeddingId && (
                        <div className="ml-12">
                          <FeedbackButtons 
                            embeddingId={tooltip.embeddingId}
                            onFeedback={handleFeedback}
                            context={{
                              tooltip_id: tooltip.id,
                              source: 'tutorial_timeline'
                            }}
                            variant="minimal"
                            size="sm"
                            showText={true}
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
} 