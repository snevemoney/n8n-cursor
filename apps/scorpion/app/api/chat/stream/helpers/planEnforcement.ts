// apps/scorpion/app/api/chat/stream/helpers/planEnforcement.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 2: All loops have fixed upper bounds
// Power of 10 Rule 7: Guard undefined

import type { Plan } from '@/lib/chat/types';
import type { HistoryAnalysisResult } from './historyAnalysis';

export interface PlanEnforcementInput {
  plan: Plan;
  userMessage: string;
  intent: string;
  historyAnalysis: HistoryAnalysisResult;
  isFileQuery: boolean;
}

/**
 * Apply enhanced plan enforcement based on history analysis
 * Power of 10 Rule 3: < 60 lines (orchestrates smaller helpers)
 * Power of 10 Rule 2: Bounded loops
 */
export function applyPlanEnforcement(input: PlanEnforcementInput): Plan {
  const { plan, userMessage, intent, historyAnalysis, isFileQuery } = input;

  if (!plan.plan || plan.plan.length === 0) {
    return plan;
  }

  // Apply file query enforcement first
  if (isFileQuery) {
    return applyFileQueryEnforcement(plan);
  }

  // Apply "what is" question enforcement
  const isWhatIsQuestion = (intent as string) !== 'identity' && 
    /^(what is|what are|who is|who are|tell me about|explain what|explain who)\s+(scorpion|lightningflow|lightning flow|n8n|the project|this app|this codebase)/i.test(userMessage);
  const isCodebaseWhatIs = (intent as string) !== 'identity' && 
    (isWhatIsQuestion || /^(what|who|tell me|explain)\s+(is|are)\s+(scorpion|lightningflow|lightning flow|n8n)/i.test(userMessage));

  if (isCodebaseWhatIs) {
    applyWhatIsEnforcement(plan, userMessage);
  }

  // Apply pattern/documentation query enforcement
  const isPatternQuery = detectPatternQuery(userMessage);
  const isDocumentationQuery = /(documentation|guide|doc|readme|performance.*optimization|orchestrator|workflow.*overview|n8n.*integration)/i.test(userMessage);

  if ((isPatternQuery || isDocumentationQuery) && !isFileQuery) {
    applyPatternDocumentationEnforcement(plan, userMessage);
  }

  // Apply history-based enforcement
  if (historyAnalysis.frequentlyUsedTools.length > 0) {
    applyHistoryBasedEnforcement(plan, userMessage, historyAnalysis);
  }

  // Final file query check (must be last)
  if (isFileQuery && plan.plan[0]?.tool !== 'files.recent') {
    return applyFileQueryEnforcement(plan);
  }

  return plan;
}

/**
 * Apply file query enforcement - ensure files.recent is used
 * Power of 10 Rule 3: < 60 lines
 */
function applyFileQueryEnforcement(plan: Plan): Plan {
  if (plan.plan[0]?.tool === 'files.recent') {
    return plan;
  }

  plan.plan[0] = {
    ...plan.plan[0],
    id: plan.plan[0]?.id || 's1',
    tool: 'files.recent',
    args: { limit: 10, source: 'upload' },
    title: 'Get recently uploaded files',
  };

  // Remove non-file-related steps
  plan.plan = plan.plan.filter((step: any, index: number) => {
    if (index === 0) return true;
    return step.tool === 'knowledge.get' || 
           step.tool === 'ocr.extract' || 
           step.tool === 'files.recent';
  });

  return plan;
}

/**
 * Apply "what is" question enforcement - prioritize README.md
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 2: Bounded loop
 */
function applyWhatIsEnforcement(plan: Plan, userMessage: string): void {
  let projectPath = 'apps/scorpion';
  let readmePath = 'README.md';

  if (/scorpion/i.test(userMessage)) {
    readmePath = 'README.md';
    projectPath = '.';
  } else if (/lightningflow/i.test(userMessage)) {
    projectPath = 'apps/lightningflow';
    readmePath = 'apps/lightningflow/README.md';
  }

  const readmeStep = plan.plan.find((step: any) => 
    step.tool === 'code.readFile' && step.args?.path?.includes('README.md')
  );

  // Fix wrong README paths for Scorpion
  if (/scorpion/i.test(userMessage)) {
    const MAX_STEPS = 100; // Power of 10 Rule 2: Bounded loop
    const stepsToCheck = plan.plan.slice(0, MAX_STEPS);
    for (let i = 0; i < stepsToCheck.length; i++) {
      const step = stepsToCheck[i];
      if (!step || step.tool !== 'code.readFile' || !step.args?.['path']) continue;
      const path = step.args['path'] as string;
      if (path.includes('scorpion') && path.includes('README.md') && path !== 'README.md' && !path.startsWith('README.md')) {
        step.args['path'] = 'README.md';
        step.title = `Read README.md to understand Scorpion OS`;
      }
    }
  }

  if (!readmeStep) {
    if (plan.plan[0]?.tool === 'kb.search') {
      plan.plan[0] = {
        ...plan.plan[0],
        id: plan.plan[0]?.id || 's1',
        tool: 'code.readFile',
        args: { path: readmePath },
        title: `Read README.md to understand ${/scorpion/i.test(userMessage) ? 'Scorpion OS' : 'LightningFlow'}`,
      };
    } else {
      plan.plan.unshift({
        id: 's0',
        title: `Read README.md to understand ${/scorpion/i.test(userMessage) ? 'Scorpion OS' : 'LightningFlow'}`,
        tool: 'code.readFile',
        args: { path: readmePath },
        success: 'README.md read successfully',
      });
      // Update dependencies
      const MAX_STEPS = 100; // Power of 10 Rule 2: Bounded loop
      const stepsToUpdate = plan.plan.slice(1, MAX_STEPS);
      for (let i = 0; i < stepsToUpdate.length; i++) {
        const step = stepsToUpdate[i];
        if (!step || !step.id) continue;
        if (!step.dependsOn) step.dependsOn = [];
        if (!step.dependsOn.includes('s0')) {
          step.dependsOn.unshift('s0');
        }
      }
    }
  } else if (/scorpion/i.test(userMessage) && readmeStep.args?.['path'] && 
      readmeStep.args['path'] !== 'README.md' && 
      !readmeStep.args['path'].includes('/README.md') && 
      (readmeStep.args['path'] as string).includes('scorpion/README.md')) {
    readmeStep.args['path'] = 'README.md';
    readmeStep.title = `Read README.md to understand Scorpion OS`;
  }

  // Add package.json for non-root paths
  if (projectPath !== '.') {
    const hasPackageJson = plan.plan.some((step: any) => 
      step.tool === 'code.readFile' && step.args?.['path']?.includes('package.json')
    );
    if (!hasPackageJson && plan.plan.length > 1) {
      const readmeStepId = plan.plan.find((step: any) => 
        step.tool === 'code.readFile' && step.args?.['path']?.includes('README.md')
      )?.id || plan.plan[0]?.id || 's1';
      
      plan.plan.splice(1, 0, {
        id: `s${plan.plan.length + 1}`,
        title: `Read package.json for project metadata`,
        tool: 'code.readFile',
        args: { path: `${projectPath}/package.json` },
        dependsOn: [readmeStepId],
        success: 'package.json read successfully',
      });
    }
  }
}

/**
 * Detect pattern query
 * Power of 10 Rule 3: < 60 lines
 */
function detectPatternQuery(userMessage: string): boolean {
  const hasMacro = /\bmacro\b/i.test(userMessage);
  const hasMicro = /\bmicro\b/i.test(userMessage);
  const hasPattern = /\bpattern/i.test(userMessage);
  return (hasMacro && hasMicro && hasPattern) || 
         /(macro.*pattern|micro.*pattern|pattern.*macro|pattern.*micro|design.*pattern|architectural.*pattern)/i.test(userMessage);
}

/**
 * Apply pattern/documentation query enforcement
 * Power of 10 Rule 3: < 60 lines
 */
function applyPatternDocumentationEnforcement(plan: Plan, userMessage: string): void {
  const firstStepTool = plan.plan[0]?.tool;
  const isAlreadyReadingDoc = firstStepTool === 'code.readFile' && 
    plan.plan[0]?.args?.['path']?.includes('MACRO_AND_MICRO_PATTERNS.md');

  if (isAlreadyReadingDoc) {
    return;
  }

  let docPath = 'docs/MACRO_AND_MICRO_PATTERNS.md';
  if (/performance.*optimization/i.test(userMessage)) {
    docPath = 'docs/PERFORMANCE_OPTIMIZATIONS_COMPLETE.md';
  } else if (/orchestrator/i.test(userMessage)) {
    docPath = 'docs/ORCHESTRATOR_ARCHITECTURE.md';
  } else if (/workflow/i.test(userMessage)) {
    docPath = 'docs/workflows/workflow-overview.md';
  } else if (/n8n.*integration/i.test(userMessage)) {
    docPath = 'docs/N8N_INTEGRATION_GUIDE.md';
  }

  plan.plan[0] = {
    ...plan.plan[0],
    id: plan.plan[0]?.id || 's1',
    tool: 'code.readFile',
    args: { path: docPath, includeAST: false },
    title: `Read documentation: ${docPath}`,
  };
}

/**
 * Apply history-based enforcement - replace frequently used tools/files
 * Power of 10 Rule 3: < 60 lines (orchestrates helpers)
 * Power of 10 Rule 2: Bounded loop
 */
function applyHistoryBasedEnforcement(
  plan: Plan,
  userMessage: string,
  historyAnalysis: HistoryAnalysisResult
): void {
  let planModified = false;
  const MAX_STEPS = 100; // Power of 10 Rule 2: Bounded loop
  const stepsToCheck = plan.plan.slice(0, MAX_STEPS);

  for (let i = 0; i < stepsToCheck.length; i++) {
    const step = stepsToCheck[i];
    if (!step) continue;

    const stepTool = step.tool;
    const stepFile = step.args?.['path'] as string | undefined;

    const isFrequentlyUsedTool = historyAnalysis.frequentlyUsedTools.includes(stepTool);
    const isFrequentlyUsedFile = stepFile && historyAnalysis.frequentlyUsedFiles.some(file => 
      stepFile.includes(file) || file.includes(stepFile)
    );

    const currentSequence = plan.plan.slice(0, i + 1).map(s => s.tool).filter(Boolean);
    const matchesPreviousSequence = historyAnalysis.usedSequences.some(seq => {
      if (seq.length !== currentSequence.length) return false;
      return seq.every((tool, idx) => tool === currentSequence[idx]);
    });

    const shouldReplace = isFrequentlyUsedTool || (isFrequentlyUsedFile && i === 0) || (matchesPreviousSequence && i === 0);

    if (shouldReplace) {
      const replacement = determineReplacement(userMessage, historyAnalysis);
      
      plan.plan[i] = {
        ...step,
        id: step.id || `s${i + 1}`,
        tool: replacement.tool || step.tool,
        args: replacement.args,
        title: replacement.title || step.title || 'Execute step',
      };

      planModified = true;
      if (i === 0) break; // Only replace first step
    }
  }

  if (planModified) {
    console.debug('[Chat Stream] Plan modified by enforcement logic');
  }
}

/**
 * Determine replacement tool/args based on question type
 * Power of 10 Rule 3: < 60 lines
 */
function determineReplacement(
  userMessage: string,
  historyAnalysis: HistoryAnalysisResult
): { tool: string; args: Record<string, unknown>; title: string } {
  const messageLower = userMessage.toLowerCase();
  const isCodebaseQuestion = /(lightningflow|lightning flow|scorpion|n8n|workflow|codebase|project|app|code|implementation|architecture|structure)/i.test(messageLower);
  const isOperationalQuestion = /(system|health|status|logs|metrics|uptime)/i.test(messageLower);

  let replacementTool = historyAnalysis.unusedTools.length > 0 
    ? historyAnalysis.unusedTools[0] 
    : 'project.analyze';
  let replacementArgs: Record<string, unknown> = {};
  let replacementTitle = 'Analyze project structure';

  if (isCodebaseQuestion) {
    const preferredTools = ['project.analyze', 'code.readFile', 'logs.tail', 'system.health'];
    const availablePreferred = preferredTools.find(t => 
      historyAnalysis.unusedTools.includes(t) || !historyAnalysis.frequentlyUsedTools.includes(t)
    );
    
    replacementTool = availablePreferred || 'project.analyze';
    
    if (replacementTool === 'project.analyze') {
      replacementArgs = { path: 'apps/scorpion', includeAST: true, includeDependencies: true };
      replacementTitle = 'Analyze project structure and dependencies';
    } else if (replacementTool === 'code.readFile') {
      const alternativeFiles = [
        'apps/scorpion/tsconfig.json',
        'apps/scorpion/next.config.js',
        'apps/scorpion/tailwind.config.ts',
        'apps/scorpion/.env.example',
        'apps/scorpion/lib/chat/types.ts',
      ];
      const unusedFile = alternativeFiles.find(f => 
        !historyAnalysis.frequentlyUsedFiles.some(uf => f.includes(uf) || uf.includes(f))
      ) || alternativeFiles[0];
      
      if (unusedFile) {
        replacementArgs = { path: unusedFile };
        replacementTitle = `Read ${unusedFile.split('/').pop()}`;
      }
    } else {
      replacementArgs = {};
      replacementTitle = `Execute ${replacementTool}`;
    }
  } else if (isOperationalQuestion) {
    const preferredTools = ['system.health', 'logs.tail', 'project.analyze'];
    const availablePreferred = preferredTools.find(t => 
      historyAnalysis.unusedTools.includes(t) || !historyAnalysis.frequentlyUsedTools.includes(t)
    );
    replacementTool = availablePreferred || 'system.health';
    replacementArgs = {};
    replacementTitle = 'Check system health and status';
  } else {
    if (historyAnalysis.unusedTools.length > 0) {
      replacementTool = historyAnalysis.unusedTools[0];
      replacementArgs = {};
      replacementTitle = `Execute ${replacementTool}`;
    } else {
      replacementTool = 'project.analyze';
      replacementArgs = { path: 'apps/scorpion' };
      replacementTitle = 'Analyze project structure';
    }
  }

  return { tool: replacementTool, args: replacementArgs, title: replacementTitle };
}

