'use client';

import { PlanTimeline } from '@/components/chat/PlanTimeline';
import { CouncilPanel } from '@/components/chat/CouncilPanel';
import { KnowledgePanel } from '@/components/chat/KnowledgePanel';
import { ToolCallCard } from '@/components/chat/ToolCallCard';
import { UserToolsPanel } from '@/components/tools/UserToolsPanel';
import { PhaseBadge } from '@/components/PhaseBadge';
import { NextBestActionCard } from '@/app/(scorpion)/components/NextBestActionCard';
import { CouncilNotes } from './CouncilNotes';
import { AIFoundationsDebugPanel } from '@/app/(scorpion)/components/AIFoundationsDebugPanel';
import { GenModelsDebugPanel } from '@/app/(scorpion)/components/GenModelsDebugPanel';
import { CreativePipelinePanel } from '@/app/(scorpion)/components/CreativePipelinePanel';
import { PromptQualityPanel } from '@/app/(scorpion)/components/PromptQualityPanel';
import { DataOpsDebugPanel } from '@/app/(scorpion)/components/DataOpsDebugPanel';
import { useOpsPipeline } from '@/lib/useOpsPipeline';
import { useMemo, useEffect } from 'react';
import { ChevronRight, Zap, Users, Sparkles, Brain, Wrench } from 'lucide-react';

// Helper to defer non-critical operations
const defer = (fn: () => void) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(fn, { timeout: 100 });
  } else {
    setTimeout(fn, 0);
  }
};

interface ChatPanelsProps {
  showRightPanel: boolean;
  isMobile: boolean;
  isTablet: boolean;
  activePanel: 'plan' | 'council' | 'tools' | 'knowledge' | 'user-tools';
  currentPlanSteps: any[];
  currentPlan: any | null;
  currentCouncilVotes: any[];
  currentCouncilThinking: Record<string, string>;
  currentCouncilCommunications: any[];
  currentCouncilConsensus: { summary: string; score: number; approved: boolean } | null;
  currentToolCalls: any[];
  currentKnowledgeHits: any[];
  currentKnowledgeQuery?: string;
  currentProgress?: { phase: string; progress: number; message: string; step?: string };
  currentToolProgress?: Record<string, Record<string, { tool: string; progress: string; status: string }>>;
  currentConversationId?: string | null;
  currentMessage: string; // Added currentMessage prop
  currentNextBestAction?: any;
  currentCouncilResult?: any; // CouncilResult from quality review
  currentCreativePipeline?: any; // CreativePipelineDecision
  currentDataWorkflow?: any; // DataWorkflowDecision
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
  currentPlan,
  currentCouncilVotes,
  currentCouncilThinking,
  currentCouncilCommunications,
  currentCouncilConsensus,
  currentToolCalls,
  currentKnowledgeHits,
  currentKnowledgeQuery,
  currentProgress,
  currentToolProgress,
  currentConversationId,
  currentMessage,
  currentNextBestAction,
  currentCouncilResult,
  currentCreativePipeline,
  currentDataWorkflow,
  onToggle,
  onPanelChange,
  onToolSelect,
}: ChatPanelsProps) {
  // Use new pipeline hook if we have a current message (only for research queries)
  const isResearchQuery = currentMessage && /(research|latest|news|bitcoin|crypto|find|search)/i.test(currentMessage);
  const { events: pipelineEvents, done: pipelineDone } = useOpsPipeline(
    isResearchQuery ? currentMessage : '',
    { conversationId: currentConversationId }
  );

  // Debug logging
  useEffect(() => {
    if (isResearchQuery && currentMessage) {
      console.log('[ChatPanels] Pipeline hook triggered:', {
        message: currentMessage,
        eventsCount: pipelineEvents.length,
        done: pipelineDone,
        events: pipelineEvents.map(e => e.type)
      });
    }
  }, [isResearchQuery, currentMessage, pipelineEvents.length, pipelineDone, pipelineEvents]);

  // Extract phase statuses from pipeline events
  const phaseStatuses = useMemo(() => {
    const phases: Record<string, { status: string; reason?: string; payload?: any }> = {};
    for (const e of pipelineEvents) {
      if (e.type === 'phase.end') {
        phases[e.phase] = e.result;
      }
    }
    return phases;
  }, [pipelineEvents]);

  const toolEvent = pipelineEvents.find((e: any) => e.type === 'tools.selected') as any;
  const kbEvent = pipelineEvents.find((e: any) => e.type === 'kb.query') as any;
  const userToolsEvent = pipelineEvents.find((e: any) => e.type === 'userTools.list') as any;
  // execEvent available for future use if needed
  // const execEvent = pipelineEvents.find((e: any) => e.type === 'exec.result') as any;

  // Use pipeline events if available, otherwise fall back to old system
  const usePipeline = pipelineEvents.length > 0;

  return (
    <div className="pointer-events-none" style={{ position: 'relative' }}>
      {/* Toggle Button */}
      {!showRightPanel && (
        <button
          data-testid="chat-right-panel-toggle"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggle();
            // Defer localStorage to avoid blocking UI update
            if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
              defer(() => {
                localStorage.setItem('chat-right-panel-open', 'true');
              });
            }
          }}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-[70] bg-[#0c1014]/95 backdrop-blur-xl border-l-2 border-t border-b border-emerald-400/30 rounded-l-lg hover:bg-emerald-400/10 hover:border-emerald-400/50 transition-colors duration-75 shadow-lg max-md:px-2 max-md:py-3 md:px-2 md:py-3 lg:px-3 lg:py-4 pointer-events-auto"
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
        <div className={`border-l border-white/10 bg-[#0c1014]/95 backdrop-blur-xl flex flex-col flex-shrink-0 transition-all duration-150 pointer-events-auto ${
          isMobile || isTablet
            ? isMobile 
              ? 'w-72 fixed z-[65] h-full right-0 top-0'
              : 'w-64 fixed z-[65] h-full right-0 top-0'
            : 'lg:w-64 lg:relative lg:z-[10] lg:flex-shrink-0'
        }`} style={{ 
          minHeight: '500px', 
          height: isMobile || isTablet ? '100%' : '100%',
          maxHeight: isMobile || isTablet ? '100%' : '100%',
          display: 'flex', 
          flexDirection: 'column',
          ...(isMobile || isTablet ? {} : { alignSelf: 'stretch' })
        }}>
          {/* Panel Header */}
          <div className="flex items-center border-b border-white/10 shrink-0 relative z-[20] bg-[#0c1014]/95">
            <div className="flex-1 flex max-md:overflow-x-auto min-w-0">
              {(['plan', 'council', 'tools', 'knowledge', 'user-tools'] as const).map((panel) => (
                <button
                  key={panel}
                  data-testid={`chat-panel-tab-${panel}`}
                  onClick={() => onPanelChange(panel)}
                  className={`flex-1 max-md:flex-shrink-0 px-1 max-md:px-1 md:px-1.5 lg:px-2 py-2 max-md:py-1.5 md:py-2 lg:py-2.5 max-md:text-[10px] md:text-[11px] lg:text-xs font-semibold uppercase tracking-wider transition-all pointer-events-auto ${
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
              data-testid="chat-right-panel-close"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onToggle();
                // Defer localStorage to avoid blocking UI update
                if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
                  defer(() => {
                    localStorage.setItem('chat-right-panel-open', 'false');
                  });
                }
              }}
              className="max-md:px-2 max-md:py-1.5 md:px-2 md:py-2 lg:px-3 lg:py-2.5 border-l border-white/10 hover:bg-white/10 active:bg-white/20 transition-colors duration-75 flex items-center justify-center shrink-0 pointer-events-auto"
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

          {/* Panel Content - Always visible with explicit height */}
          <div
            className="overflow-y-auto max-md:p-3 md:p-4 lg:p-6 bg-[#0c1014]"
            style={{
              flex: '1 1 0%',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            {activePanel === 'plan' && (
              <div data-testid="plan-panel" className="flex-1 w-full">
                {usePipeline && phaseStatuses['plan'] && (
                  <div className="mb-4">
                    <PhaseBadge result={phaseStatuses['plan']} />
                    {phaseStatuses['plan'].payload?.steps && (
                      <div className="mt-2 text-xs text-white/60">
                        {phaseStatuses['plan'].payload.steps.length} step{phaseStatuses['plan'].payload.steps.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}
                {currentNextBestAction && (
                  <div className="mb-4">
                    <NextBestActionCard nba={currentNextBestAction} />
                  </div>
                )}
                {currentPlanSteps && currentPlanSteps.length > 0 ? (
                  <PlanTimeline steps={currentPlanSteps} plan={currentPlan} />
                ) : (
                  <div className="text-center text-white/60 text-sm py-12 w-full">
                    <Zap className="h-10 w-10 mx-auto mb-3 text-white/40" />
                    <p className="text-white/70 text-base mb-2">No plan steps yet</p>
                    <p className="text-xs text-white/50 mt-2">Plan will appear here when available</p>
                  </div>
                )}
              </div>
            )}

            {activePanel === 'council' && (
              <div data-testid="council-panel" className="flex-1">
                {usePipeline && phaseStatuses['council'] && (
                  <div className="mb-4">
                    <PhaseBadge result={phaseStatuses['council']} />
                  </div>
                )}
                
                {/* New Council Notes (Quality Review) */}
                {currentCouncilResult && (
                  <div className="mb-4 space-y-3">
                    <CouncilNotes councilResult={currentCouncilResult} />
                    {currentCouncilResult.councillorOutputs && (
                      <>
                        <AIFoundationsDebugPanel
                          memberIssues={currentCouncilResult.councillorOutputs.map((co: { councillorId: string; councillorName: string; issues: any[]; approved: boolean }) => ({
                            memberId: co.councillorId,
                            issues: co.issues,
                          }))}
                        />
                        <GenModelsDebugPanel
                          memberIssues={currentCouncilResult.councillorOutputs.map((co: { councillorId: string; councillorName: string; issues: any[]; approved: boolean }) => ({
                            memberId: co.councillorId,
                            issues: co.issues,
                          }))}
                        />
                        <PromptQualityPanel
                          memberIssues={currentCouncilResult.councillorOutputs.map((co: { councillorId: string; councillorName: string; issues: any[]; approved: boolean }) => ({
                            memberId: co.councillorId,
                            issues: co.issues,
                          }))}
                        />
                        <DataOpsDebugPanel
                          memberIssues={currentCouncilResult.councillorOutputs.map((co: { councillorId: string; councillorName: string; issues: any[]; approved: boolean }) => ({
                            memberId: co.councillorId,
                            issues: co.issues,
                          }))}
                          dataWorkflow={currentDataWorkflow}
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Creative Pipeline Selector */}
                {currentCreativePipeline && (
                  <div className="mb-4">
                    <CreativePipelinePanel pipeline={currentCreativePipeline} />
                  </div>
                )}

                {/* Legacy Council Panel (Deliberation) */}
                {(currentCouncilVotes && currentCouncilVotes.length > 0) || (currentCouncilThinking && Object.keys(currentCouncilThinking).length > 0) || (currentCouncilCommunications && currentCouncilCommunications.length > 0) ? (
                  <div className={currentCouncilResult ? 'mt-4' : ''}>
                    <h3 className="text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                      Deliberation
                    </h3>
                  <CouncilPanel 
                    votes={currentCouncilVotes || []} 
                    thinking={currentCouncilThinking || {}}
                    communications={currentCouncilCommunications || []}
                    consensus={currentCouncilConsensus}
                  />
                  </div>
                ) : !currentCouncilResult && (
                  <div className="text-center text-white/40 text-sm py-8">
                    <Users className="h-8 w-8 mx-auto mb-2 text-white/20" />
                    <p>No council review yet</p>
                    <p className="text-xs text-white/20 mt-2">Council deliberations will appear here</p>
                  </div>
                )}
              </div>
            )}

            {activePanel === 'tools' && (
              <div data-testid="tools-panel" className="flex-1 w-full">
                {usePipeline && phaseStatuses['tools'] && (
                  <div className="mb-4">
                    {toolEvent && (
                      <div className="text-xs text-white/80 mb-2">
                        Matched <b className="text-emerald-400">{toolEvent.matched_count}</b> of{' '}
                        <b className="text-white/60">{toolEvent.installed_count}</b> • {toolEvent.rationale}
                      </div>
                    )}
                    <PhaseBadge result={phaseStatuses['tools']} />
                  </div>
                )}
                {currentToolCalls && currentToolCalls.length > 0 ? (
                  <div className="space-y-2">
                    {currentToolCalls.map((tool, i) => {
                      const toolProgress = currentToolProgress?.[currentConversationId || '']?.[tool.callId || ''];
                      const startTime = tool.status === 'running' ? (tool.startTime || Date.now()) : undefined;
                      return (
                        <ToolCallCard 
                          key={i} 
                          {...tool} 
                          progress={toolProgress}
                          startTime={startTime}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-white/40 text-sm py-8">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-white/20" />
                    <p>No tool calls yet</p>
                    <p className="text-xs text-white/20 mt-2">Tool executions will appear here</p>
                  </div>
                )}
              </div>
            )}

            {activePanel === 'knowledge' && (
              <div data-testid="knowledge-panel" className="flex-1 w-full">
                {usePipeline && phaseStatuses['knowledge'] && (
                  <div className="mb-4">
                    {kbEvent && (
                      <div className="text-xs text-white/80 mb-2">
                        Hits: <b className="text-emerald-400">{kbEvent.hitCount}</b>
                      </div>
                    )}
                    <PhaseBadge result={phaseStatuses['knowledge']} />
                  </div>
                )}
                {currentKnowledgeHits && currentKnowledgeHits.length > 0 ? (
                <KnowledgePanel 
                  hits={currentKnowledgeHits} 
                  searchQuery={currentKnowledgeQuery}
                  onSelect={(hit) => {
                    window.open(hit.url, '_blank');
                  }}
                />
                ) : (
                  <div className="text-center text-white/40 text-sm py-8">
                    <Brain className="h-8 w-8 mx-auto mb-2 text-white/20" />
                    <p>No knowledge hits yet</p>
                    <p className="text-xs text-white/20 mt-2">Knowledge base results will appear here</p>
                  </div>
                )}
              </div>
            )}

            {activePanel === 'user-tools' && (
              <div className="flex-1">
                {usePipeline && phaseStatuses['user_tools'] && (
                  <div className="mb-4">
                    {userToolsEvent && (
                      <div className="text-xs text-white/80 mb-2">
                        Installed: <b className="text-emerald-400">{userToolsEvent.count}</b>
                      </div>
                    )}
                    <PhaseBadge result={phaseStatuses['user_tools']} />
                  </div>
                )}
                <UserToolsPanel onToolSelect={onToolSelect} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

