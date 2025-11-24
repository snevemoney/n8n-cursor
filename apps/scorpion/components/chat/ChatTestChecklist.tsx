'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Circle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface TestStep {
  id: string;
  label: string;
  query: string;
  expectedPanels: string[];
}

interface ChatTestChecklistProps {
  variant?: 'floating' | 'compact';
}

const TEST_STEPS: TestStep[] = [
  {
    id: 'research',
    label: 'Research',
    query: 'Research the latest Bitcoin + global macro news. Give top 3 with links.',
    expectedPanels: ['Plan', 'Tools'],
  },
  {
    id: 'workflows',
    label: 'Workflows',
    query: 'Explain my ElevenLabs workflow on n8ncloud.tech and how audio flows through it.',
    expectedPanels: ['Plan', 'Tools'],
  },
  {
    id: 'files-rag',
    label: 'Files → RAG',
    query: 'Pull my last uploaded file and add it to RAG; then show its title and storage path.',
    expectedPanels: ['Knowledge', 'Tools'],
  },
  {
    id: 'ontology',
    label: 'Ontology / KB',
    query: 'List all my side-hustles and group them by theme (use KB + ontology).',
    expectedPanels: ['Knowledge', 'Plan'],
  },
  {
    id: 'health',
    label: 'Health',
    query: 'How healthy is the system right now? List services up/down + warnings.',
    expectedPanels: ['Tools'],
  },
  {
    id: 'ops',
    label: 'Ops',
    query: 'Show the most recent operations with status, startedAt, endedAt.',
    expectedPanels: ['Tools'],
  },
  {
    id: 'code-skim',
    label: 'Code skim',
    query: 'Skim the orchestrator route and summarize the 4-phase pipeline.',
    expectedPanels: ['Plan', 'Tools'],
  },
  {
    id: 'logs',
    label: 'Logs',
    query: 'Check recent API logs; give top 3 errors/timeouts and likely causes.',
    expectedPanels: ['Tools'],
  },
  {
    id: 'agents',
    label: 'Agents',
    query: 'List my agents and inspect one in detail (capabilities, config).',
    expectedPanels: ['Tools'],
  },
  {
    id: 'notify',
    label: 'Notify',
    query: 'Post a notification that diagnostics ran; then show last 3 notifications.',
    expectedPanels: ['Tools'],
  },
];

export function ChatTestChecklist({ variant = 'floating' }: ChatTestChecklistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load completed steps from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat-test-checklist-completed');
    if (saved) {
      try {
        setCompletedSteps(new Set(JSON.parse(saved)));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Save completed steps to localStorage
  useEffect(() => {
    localStorage.setItem(
      'chat-test-checklist-completed',
      JSON.stringify(Array.from(completedSteps))
    );
  }, [completedSteps]);

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const resetAll = () => {
    setCompletedSteps(new Set());
  };

  const completedCount = completedSteps.size;
  const totalCount = TEST_STEPS.length;

  if (!isOpen) {
    // Compact variant for navigation bar
    if (variant === 'compact') {
      return (
        <button
          data-testid="chat-test-checklist-toggle"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded-md text-emerald-300 transition-all hover:scale-105"
          title="Open test checklist"
        >
          <span className="font-medium">Test Checklist</span>
          {completedCount > 0 && (
            <span className="text-emerald-400">
              {completedCount}/{totalCount}
            </span>
          )}
        </button>
      );
    }

    // Original floating button
    return (
      <button
        data-testid="chat-test-checklist-toggle"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[100] bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded-lg px-3 py-2 text-xs text-emerald-300 backdrop-blur-sm shadow-lg transition-all hover:scale-105 pointer-events-auto"
        style={{ pointerEvents: 'auto', zIndex: 100 }}
        title="Open test checklist"
      >
        <span className="font-medium">Test Checklist</span>
        {completedCount > 0 && (
          <span className="ml-2 text-emerald-400">
            {completedCount}/{totalCount}
          </span>
        )}
      </button>
    );
  }

  const overlayContent = (
    <div
      data-testid="chat-test-checklist-overlay"
      className={`fixed bottom-4 right-4 bg-[#0c1014]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl transition-all duration-200 pointer-events-auto max-w-[calc(100vw-2rem)] ${
        isCollapsed ? 'w-64' : 'w-[28rem]'
      }`}
      style={{ pointerEvents: 'auto', zIndex: 999999, position: 'fixed' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Test Checklist</h3>
          <span className="text-xs text-white/50">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            data-testid="chat-test-checklist-collapse"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-white/5 rounded transition-colors pointer-events-auto"
            style={{ pointerEvents: 'auto' }}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <ChevronUp className="h-4 w-4 text-white/60" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white/60" />
            )}
          </button>
          <button
            data-testid="chat-test-checklist-close"
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/5 rounded transition-colors pointer-events-auto"
            style={{ pointerEvents: 'auto' }}
            title="Close"
          >
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="p-4 space-y-3">
            {TEST_STEPS.map((step) => {
              const isCompleted = completedSteps.has(step.id);
              return (
                <div
                  key={step.id}
                  data-testid={`chat-test-checklist-step-${step.id}`}
                  className="flex items-start gap-2 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer pointer-events-auto"
                  style={{ pointerEvents: 'auto' }}
                  onClick={() => toggleStep(step.id)}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2
                        data-testid={`chat-test-checklist-step-${step.id}-checked`}
                        className="h-4 w-4 text-emerald-400"
                      />
                    ) : (
                      <Circle
                        data-testid={`chat-test-checklist-step-${step.id}-unchecked`}
                        className="h-4 w-4 text-white/40"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-white mb-1">
                      {step.label}
                    </div>
                    <div className="text-xs text-white/50 break-words whitespace-normal leading-relaxed">
                      {step.query}
                    </div>
                    {step.expectedPanels.length > 0 && (
                      <div className="text-[10px] text-emerald-400/70 mt-1.5 break-words">
                        Expect: {step.expectedPanels.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10 flex items-center justify-between">
            <button
              data-testid="chat-test-checklist-reset"
              onClick={resetAll}
              className="text-xs text-white/60 hover:text-white/80 transition-colors pointer-events-auto"
              style={{ pointerEvents: 'auto' }}
            >
              Reset
            </button>
            <div className="text-xs text-white/40">
              Copy/paste queries in /chat
            </div>
          </div>
        </div>
      )}

      {/* Collapsed view */}
      {isCollapsed && (
        <div className="p-3">
          <div className="text-xs text-white/60 text-center">
            {completedCount} of {totalCount} completed
          </div>
        </div>
      )}
    </div>
  );

  // Render overlay in a portal to escape stacking context
  return isMounted && typeof document !== 'undefined' 
    ? createPortal(overlayContent, document.body)
    : overlayContent;
}

