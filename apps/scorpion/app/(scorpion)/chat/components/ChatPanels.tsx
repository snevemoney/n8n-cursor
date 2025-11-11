'use client';

import { PlanTimeline } from '@/components/chat/PlanTimeline';
import { CouncilPanel } from '@/components/chat/CouncilPanel';
import { KnowledgePanel } from '@/components/chat/KnowledgePanel';
import { ToolCallCard } from '@/components/chat/ToolCallCard';
import { UserToolsPanel } from '@/components/tools/UserToolsPanel';
import { ChevronRight, Zap, Users, Sparkles, Brain, Wrench } from 'lucide-react';

interface ChatPanelsProps {
  showRightPanel: boolean;
  isMobile: boolean;
  isTablet: boolean;
  activePanel: 'plan' | 'council' | 'tools' | 'knowledge' | 'user-tools';
  currentPlanSteps: any[];
  currentCouncilVotes: any[];
  currentCouncilThinking: Record<string, string>;
  currentCouncilCommunications: any[];
  currentCouncilConsensus: { summary: string; score: number; approved: boolean } | null;
  currentToolCalls: any[];
  currentKnowledgeHits: any[];
  currentKnowledgeQuery?: string;
  currentProgress?: { phase: string; progress: number; message: string; step?: string };
  onToggle: () => void;
  onPanelChange: (panel: 'plan' | 'council' | 'tools' | 'knowledge' | 'user-tools') => void;
  onToolSelect: (toolName: string, slashCommand: string) => void;
}

export function ChatPanels({
  showRightPanel,
  isMobile,
  isTablet,
  activePanel,
  currentPlanSteps,
  currentCouncilVotes,
  currentCouncilThinking,
  currentCouncilCommunications,
  currentCouncilConsensus,
  currentToolCalls,
  currentKnowledgeHits,
  currentKnowledgeQuery,
  currentProgress,
  onToggle,
  onPanelChange,
  onToolSelect,
}: ChatPanelsProps) {
  return (
    <div className="pointer-events-none" style={{ position: 'relative' }}>
      {/* Toggle Button */}
      {!showRightPanel && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
            if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
              localStorage.setItem('chat-right-panel-open', 'true');
            }
          }}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-[70] bg-[#0c1014]/95 backdrop-blur-xl border-l-2 border-t border-b border-emerald-400/30 rounded-l-lg hover:bg-emerald-400/10 hover:border-emerald-400/50 transition-all duration-150 shadow-lg max-md:px-2 max-md:py-3 md:px-2 md:py-3 lg:px-3 lg:py-4 pointer-events-auto"
          aria-label="Show right panel"
          title="Show panel (Plan, Council, Tools, Knowledge)"
        >
          <ChevronRight className="max-md:h-4 max-md:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-emerald-400" />
        </button>
      )}

      {/* Overlay */}
      {showRightPanel && (isMobile || isTablet) && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] transition-opacity duration-150 pointer-events-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onToggle();
            }
          }}
          aria-hidden="true"
        />
      )}

      {/* Panels */}
      {showRightPanel && (
        <div className={`border-l border-white/10 bg-[#0c1014]/30 backdrop-blur-xl flex flex-col flex-shrink-0 transition-all duration-150 pointer-events-auto ${
          isMobile || isTablet
            ? isMobile 
              ? 'w-72 fixed z-[65] h-full right-0 top-0'
              : 'w-64 fixed z-[65] h-full right-0 top-0'
            : 'lg:w-64 lg:relative lg:z-auto'
        }`}>
          {/* Panel Header */}
          <div className="flex items-center border-b border-white/10 shrink-0">
            <div className="flex-1 flex max-md:overflow-x-auto min-w-0">
              {(['plan', 'council', 'tools', 'knowledge', 'user-tools'] as const).map((panel) => (
                <button
                  key={panel}
                  onClick={() => onPanelChange(panel)}
                  className={`flex-1 max-md:flex-shrink-0 px-1 max-md:px-1 md:px-1.5 lg:px-2 py-2 max-md:py-1.5 md:py-2 lg:py-2.5 max-md:text-[10px] md:text-[11px] lg:text-xs font-semibold uppercase tracking-wider transition-all ${
                    activePanel === panel
                      ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  {panel === 'plan' && <Zap className="max-md:h-2.5 max-md:w-2.5 md:h-3 md:w-3 lg:h-3 lg:w-3 inline max-md:mr-0.5 md:mr-1" />}
                  {panel === 'council' && <Users className="max-md:h-2.5 max-md:w-2.5 md:h-3 md:w-3 lg:h-3 lg:w-3 inline max-md:mr-0.5 md:mr-1" />}
                  {panel === 'tools' && <Sparkles className="max-md:h-2.5 max-md:w-2.5 md:h-3 md:w-3 lg:h-3 lg:w-3 inline max-md:mr-0.5 md:mr-1" />}
                  {panel === 'knowledge' && <Brain className="max-md:h-2.5 max-md:w-2.5 md:h-3 md:w-3 lg:h-3 lg:w-3 inline max-md:mr-0.5 md:mr-1" />}
                  {panel === 'user-tools' && <Wrench className="max-md:h-2.5 max-md:w-2.5 md:h-3 md:w-3 lg:h-3 lg:w-3 inline max-md:mr-0.5 md:mr-1" />}
                  <span className="max-md:hidden md:inline lg:inline">{panel === 'user-tools' ? 'tools' : panel}</span>
                </button>
              ))}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
                if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
                  localStorage.setItem('chat-right-panel-open', 'false');
                }
              }}
              className="max-md:px-2 max-md:py-1.5 md:px-2 md:py-2 lg:px-3 lg:py-2.5 border-l border-white/10 hover:bg-white/10 active:bg-white/20 transition-colors flex items-center justify-center shrink-0 pointer-events-auto"
              aria-label="Hide right panel"
              title="Hide panel (Plan, Council, Tools, Knowledge)"
            >
              <ChevronRight className="max-md:h-3 max-md:w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-white/70 hover:text-white" />
            </button>
          </div>

          {/* Progress Bar */}
          {currentProgress && currentProgress.progress > 0 && (
            <div className="px-4 py-2 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/70 truncate flex-1 mr-2">{currentProgress.message}</span>
                <span className="text-xs text-white/50 font-mono">{currentProgress.progress}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-150 ease-out"
                  style={{ width: `${currentProgress.progress}%` }}
                />
              </div>
              <div className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">
                {currentProgress.phase}
              </div>
            </div>
          )}

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto max-md:p-3 md:p-4 lg:p-6">
            {activePanel === 'plan' && (
              currentPlanSteps.length > 0 ? (
                <PlanTimeline steps={currentPlanSteps} />
              ) : (
                <div className="text-center text-white/40 text-sm py-8">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-white/20" />
                  <p>No plan steps yet</p>
                </div>
              )
            )}

            {activePanel === 'council' && (
              currentCouncilVotes.length > 0 || Object.keys(currentCouncilThinking).length > 0 || currentCouncilCommunications.length > 0 ? (
                <CouncilPanel 
                  votes={currentCouncilVotes} 
                  thinking={currentCouncilThinking}
                  communications={currentCouncilCommunications}
                  consensus={currentCouncilConsensus}
                />
              ) : (
                <div className="text-center text-white/40 text-sm py-8">
                  <Users className="h-8 w-8 mx-auto mb-2 text-white/20" />
                  <p>No council votes yet</p>
                </div>
              )
            )}

            {activePanel === 'tools' && (
              currentToolCalls.length > 0 ? (
                <div className="space-y-2">
                  {currentToolCalls.map((tool, i) => (
                    <ToolCallCard key={i} {...tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-white/40 text-sm py-8">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-white/20" />
                  <p>No tool calls yet</p>
                </div>
              )
            )}

            {activePanel === 'knowledge' && (
              <KnowledgePanel 
                hits={currentKnowledgeHits} 
                searchQuery={currentKnowledgeQuery}
                onSelect={(hit) => {
                  window.open(hit.url, '_blank');
                }}
              />
            )}

            {activePanel === 'user-tools' && (
              <UserToolsPanel onToolSelect={onToolSelect} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

