'use client';

import { CheckCircle, Circle, Loader2, XCircle } from 'lucide-react';
import type { PlanStep } from '@/lib/chat/types';

interface PlanTimelineProps {
  steps: Array<PlanStep & { status?: 'pending' | 'running' | 'completed' | 'failed' }>;
  plan?: { reasoning?: string; objective?: string; assumptions?: string[] } | null;
  onStepClick?: (stepId: string) => void;
}

/**
 * PlanTimeline - Visual timeline of plan execution
 */
export function PlanTimeline({ steps, plan, onStepClick }: PlanTimelineProps) {
  if (steps.length === 0) {
    return (
      <div className="text-sm text-white/40 text-center py-8">
        No plan steps yet
      </div>
    );
  }
  
  return (
    <div data-testid="plan-timeline" className="space-y-2">
      {/* Display plan reasoning if available */}
      {plan?.reasoning && (
        <div className="mb-4 p-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5">
          <div className="text-xs font-semibold text-emerald-400 mb-1.5 uppercase tracking-wider">Reasoning</div>
          <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{plan.reasoning}</div>
        </div>
      )}
      
      {/* Display objective if available */}
      {plan?.objective && (
        <div className="mb-3 p-2 rounded-lg border border-white/10 bg-white/5">
          <div className="text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Objective</div>
          <div className="text-sm text-white/90">{plan.objective}</div>
        </div>
      )}
      
      {/* Display assumptions if available */}
      {plan?.assumptions && plan.assumptions.length > 0 && (
        <div className="mb-3 p-2 rounded-lg border border-white/10 bg-white/5">
          <div className="text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Assumptions</div>
          <ul className="text-sm text-white/80 space-y-1">
            {plan.assumptions.map((assumption, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-white/40 mr-2">•</span>
                <span>{assumption}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {steps.map((step, index) => {
        const status = step.status || 'pending';
        
        const getIcon = () => {
          switch (status) {
            case 'completed':
              return <CheckCircle className="h-5 w-5 text-emerald-400" />;
            case 'failed':
              return <XCircle className="h-5 w-5 text-red-400" />;
            case 'running':
              return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
            default:
              return <Circle className="h-5 w-5 text-white/20" />;
          }
        };
        
        const getColor = () => {
          switch (status) {
            case 'completed': return 'border-emerald-400/30 bg-emerald-400/5';
            case 'failed': return 'border-red-400/30 bg-red-400/5';
            case 'running': return 'border-blue-400/30 bg-blue-400/5';
            default: return 'border-white/10 bg-transparent';
          }
        };
        
        return (
          <button
            key={step.id}
            data-testid={`plan-step-${step.id}`}
            onClick={() => onStepClick?.(step.id)}
            className={`w-full flex items-start gap-3 p-3 rounded-lg border ${getColor()} hover:bg-white/5 transition-colors text-left`}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-white/40">{step.id}</span>
                <span className="text-xs text-white/60 capitalize">{status}</span>
              </div>
              
              <div className="text-sm text-white mb-1">{step.title}</div>
              
              {step.tool && step.tool !== 'none' && (
                <div className="text-xs text-white/40">
                  Tool: <span className="font-mono text-emerald-400">{step.tool}</span>
                </div>
              )}
              
              {step.dependsOn && step.dependsOn.length > 0 && (
                <div className="text-xs text-white/30 mt-1">
                  Depends on: {step.dependsOn.join(', ')}
                </div>
              )}
            </div>
            
            {/* Progress indicator */}
            <div className="flex-shrink-0 text-xs text-white/40">
              Step {index + 1}/{steps.length}
            </div>
          </button>
        );
      })}
    </div>
  );
}

