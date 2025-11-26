// Phase 4.1: Plan Validator - Extract plan validation/normalization from processStreamStart.ts
// Power of 10 Rule 4: Focused module for plan validation (<100 lines per function)

import type { Plan, PlanStep, ScorpionIntent } from '@/lib/chat/types';
import { parsePlannerResponse, createFallbackPlan, enforcePlanRules } from '@/lib/chat/planner-enforcement';
import { normalizePlanSteps } from './planHelpers';
import { applyPlanEnforcement } from './planEnforcement';

export interface PlanValidationResult {
  plan: Plan;
  issues: string[];
  isValid: boolean;
  warnings?: string[];
}

export interface PlanValidationOptions {
  intent: ScorpionIntent;
  userMessage: string;
  isFileQuery?: boolean;
  historyAnalysis?: any;
  conversationHistory?: Array<{ role: string; content: string }>;
}

/**
 * Validate and normalize a plan from the planner phase
 *
 * This function orchestrates all plan validation steps:
 * 1. Validates plan structure (normalizePlanSteps)
 * 2. Enforces intent-specific rules (enforcePlanRules)
 * 3. Injects missing tools for specific query types
 * 4. Corrects file paths based on question context
 * 5. Enforces system health/logs tools when needed
 *
 * Power of 10 Rule 4: Pure orchestration - delegates to focused helpers
 *
 * @param rawPlan - Raw plan from planner phase
 * @param options - Validation options (intent, message, etc.)
 * @returns PlanValidationResult with validated/normalized plan
 */
export function validateAndNormalizePlan(
  rawPlan: any,
  options: PlanValidationOptions
): PlanValidationResult {
  const { intent, userMessage, isFileQuery, historyAnalysis, conversationHistory } = options;
  const issues: string[] = [];
  const warnings: string[] = [];

  let plan = rawPlan;

  // Step 1: Plan structure validation and normalization (lines 1460-1488)
  // Power of 10 Rule 3: Use helper functions for plan validation and normalization
  // The plannerPhase module already returns a normalized plan, but we validate it here for safety
  if (!plan || typeof plan !== 'object' || !plan.plan || !Array.isArray(plan.plan)) {
    console.warn('[Planner] Plan structure invalid from plannerPhase, attempting tolerant parse...');
    // If plan is a string (raw response), try parsing it
    if (typeof plan === 'string') {
      const parsed = parsePlannerResponse(plan);
      if (parsed) {
        plan = parsed;
        console.log('[Planner] Successfully parsed plan from raw string');
      } else {
        issues.push('Failed to parse plan JSON even with tolerant parser');
        return {
          plan: plan as any, // Type assertion for error case
          issues,
          isValid: false,
          warnings,
        };
      }
    } else {
      issues.push('Plan structure invalid and not parseable');
      return {
        plan: plan as any, // Type assertion for error case
        issues,
        isValid: false,
        warnings,
      };
    }
  }

  // Log if reasoning is missing (for debugging)
  if (!plan.reasoning) {
    console.warn('[Planner] Plan generated without reasoning field. LLM may not be following instructions.');
    warnings.push('Plan missing reasoning field');
  } else {
    console.log('[Planner] Plan includes reasoning:', plan.reasoning.substring(0, 100) + '...');
  }

  // Power of 10 Rule 3: Use helper function for step normalization
  // Normalize plan steps to ensure all required fields are present
  const normalizedSteps = normalizePlanSteps(plan.plan);
  plan.plan = normalizedSteps;

  // Step 2: FRONTIER-LEVEL: Enforce plan rules (system health, tool validation, etc.)
  plan = enforcePlanRules(plan, intent, userMessage);

  // Step 3: Ensure plan has at least one step (even if it's a no-op)
  if (plan.plan.length === 0) {
    console.warn('[Chat Stream] Plan has no steps, using fallback plan');
    plan = createFallbackPlan(intent, userMessage);
  }

  // Step 4: Apply plan enforcement (existing helper)
  if (plan.plan && plan.plan.length > 0) {
    plan = applyPlanEnforcement({
      plan,
      userMessage,
      intent,
      historyAnalysis,
      isFileQuery: isFileQuery || false,
    });
  }

  // Step 5: Detect and fix kb.search-heavy plans
  plan = injectToolsForKbSearchPlans(plan, intent, userMessage, isFileQuery || false);

  // Step 6: Inject code.readFile steps for codebase questions
  plan = injectCodeReadSteps(plan, intent, userMessage, conversationHistory || []);

  // Step 7: Correct file paths based on question type
  plan = correctFilePaths(plan, userMessage);

  // Step 8: Enforce system health and logs tools
  plan = enforceSystemTools(plan, userMessage);

  return {
    plan,
    issues,
    isValid: issues.length === 0,
    warnings,
  };
}


/**
 * Detect kb.search-heavy plans and inject appropriate tools
 *
 * Extracted from: processStreamStart.ts lines ~1929-1982
 *
 * Logic:
 * - Count kb.search steps in plan
 * - Determine if plan is kb.search-heavy (only kb.search OR multiple kb.search)
 * - Based on query type, inject appropriate tool:
 *   - Operational questions → system.health
 *   - Workflow questions → project.analyze
 *   - Analysis questions → project.analyze
 *   - General questions → research.run
 *
 * @param plan - Current plan
 * @param intent - Current intent
 * @param userMessage - User's message
 * @param isFileQuery - Whether this is a file query
 * @returns Plan with injected tools if needed
 */
export function injectToolsForKbSearchPlans(
  plan: Plan,
  intent: ScorpionIntent,
  userMessage: string,
  isFileQuery: boolean
): Plan {
  // Plan validation: Detect and fix kb.search-heavy plans
  // BUT ONLY for intents that allow project tools - skip for small_talk AND file queries
  // CRITICAL: Skip this validation for file queries - they should use files.recent, not project.analyze/research.run
  if ((intent as string) === 'small_talk' || isFileQuery) {
    return plan;
  }

  const kbSearchSteps = plan.plan.filter(step => step.tool === 'kb.search');
  const hasOnlyKbSearch = plan.plan.length === kbSearchSteps.length && kbSearchSteps.length > 0;
  const hasMultipleKbSearch = kbSearchSteps.length > 1;

  // If plan has only kb.search or multiple kb.search steps, inject appropriate tools
  if (hasOnlyKbSearch || hasMultipleKbSearch) {
    console.log('[Chat Stream] Plan validation: Detected kb.search-heavy plan, injecting appropriate tools');

    // Helper patterns for question detection
    const isOperationalQuestion = /(system|health|status|logs|metrics|uptime|performance|errors|crashes|alerts)/i.test(userMessage);
    const isWorkflowQuestion = /(workflow|n8n|execution|orchestration|automation|trigger workflow|run workflow)/i.test(userMessage);
    const isAnalysisQuestion = /(analyze|analysis|architecture|design|structure|components|modules|dependencies)/i.test(userMessage);
    const isCodebaseQuestionCheck = /(lightningflow|lightning flow|scorpion|n8n|workflow|codebase|project|app|code|implementation)/i.test(userMessage);

    // Determine what tool to add based on question type AND intent
    if (isOperationalQuestion && (intent === 'project_help' || intent === 'system_debug')) {
      // Replace kb.search with system.health (only for project/system intents)
      plan.plan = plan.plan.map(step =>
        step.tool === 'kb.search'
          ? { ...step, tool: 'system.health', title: 'Check system health', args: { includeMetrics: true, includeAlerts: true } }
          : step
      );
    } else if (isWorkflowQuestion && (intent === 'project_help' || intent === 'system_debug')) {
      // Replace kb.search with project.analyze (only for project/system intents)
      plan.plan = plan.plan.map(step =>
        step.tool === 'kb.search'
          ? { ...step, tool: 'project.analyze', title: 'Analyze project and workflows', args: { includeFiles: true, includeDependencies: true } }
          : step
      );
    } else if (isAnalysisQuestion && (intent === 'project_help' || intent === 'system_debug')) {
      // Replace kb.search with project.analyze (only for project/system intents)
      plan.plan = plan.plan.map(step =>
        step.tool === 'kb.search'
          ? { ...step, tool: 'project.analyze', title: 'Analyze project structure', args: { includeFiles: true, includeDependencies: true } }
          : step
      );
    } else if (intent === 'general_question' || !isCodebaseQuestionCheck) {
      // For general questions, add research.run as follow-up (allowed for general_question)
      const lastKbSearch = kbSearchSteps[kbSearchSteps.length - 1];
      // Power of 10 Rule 7: Guard undefined
      if (lastKbSearch && lastKbSearch.id) {
        const lastKbSearchIndex = plan.plan.indexOf(lastKbSearch);
        if (lastKbSearchIndex >= 0) {
          plan.plan.splice(lastKbSearchIndex + 1, 0, {
            id: `s${plan.plan.length + 1}`,
            title: 'Research online if knowledge base insufficient',
            tool: 'research.run',
            args: { query: userMessage, depth: 'medium', category: 'general', maxSites: 5 },
            dependsOn: [lastKbSearch.id],
            success: 'Research completed'
          });
        }
      }
    }
  }

  return plan;
}

/**
 * Inject code.readFile steps for codebase questions
 *
 * Extracted from: processStreamStart.ts lines ~1984-2148
 *
 * Logic:
 * - Detect codebase questions (mentions lightningflow, scorpion, n8n, etc.)
 * - Check if plan already has code.readFile steps
 * - Determine which app/package to read based on question
 * - Analyze conversation history to avoid reading same files twice
 * - Create varied file selection to avoid repetition
 * - Inject code.readFile steps after kb.search step
 *
 * @param plan - Current plan
 * @param intent - Current intent
 * @param userMessage - User's message
 * @param conversationHistory - Recent conversation history
 * @returns Plan with injected code.readFile steps if needed
 */
export function injectCodeReadSteps(
  plan: Plan,
  intent: ScorpionIntent,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): Plan {
  // Detect if this is a codebase question and enforce code.readFile steps
  // BUT ONLY for project_help/system_debug intents - skip for small_talk/general_question
  // Improved detection: Check for codebase-related keywords or questions about projects/apps
  const userMessageLower = userMessage.toLowerCase();
  // Codebase question if it mentions codebase keywords (from pipelineConfig)
  const codebaseKeywords = /(lightningflow|lightning flow|scorpion|n8n|workflow|codebase|project|app|code|implementation|repository|repo|package|module)/i;
  const isCodebaseQuestion = codebaseKeywords.test(userMessage);
  const hasCodeReadSteps = plan.plan.some(step => step.tool === 'code.readFile');

  // If codebase question but no code.readFile steps, inject them
  // BUT ONLY if intent allows project/repo tools
  if (isCodebaseQuestion && !hasCodeReadSteps && (intent === 'project_help' || intent === 'system_debug')) {
    console.log('[Chat Stream] Codebase question detected but no code.readFile steps - injecting them');

    // Extract the subject (e.g., "LightningFlow" from various question patterns)
    const subjectPatterns = [
      /(?:what is|who is|tell me about|more details about|detailed analysis of|even more|even more detailed)\s+(?:about\s+)?([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
      /(?:about|on|regarding)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i
    ];

    let subject = null;
    for (const pattern of subjectPatterns) {
      const match = userMessage.match(pattern);
      if (match && match[1]) {
        subject = match[1].trim();
        break;
      }
    }

    const subjectLower = subject ? subject.toLowerCase() : userMessageLower;

    // Determine which app/package to read based on subject or message content
    // IMPORTANT: Check for workflow-related questions FIRST (before defaulting)
    const isWorkflowQuestion = /(workflow|n8n|execution|orchestration|automation|trigger workflow|run workflow)/i.test(userMessageLower) ||
      /(workflow|n8n|execution|orchestration)/i.test(subjectLower);

    let appPath = 'apps/scorpion'; // Default to Scorpion (the chat system itself)
    if (isWorkflowQuestion) {
      appPath = 'apps/n8n-cursor';
    } else if (userMessageLower.includes('scorpion') || subjectLower.includes('scorpion')) {
      appPath = 'apps/scorpion';
    } else if (userMessageLower.includes('n8n') || subjectLower.includes('n8n')) {
      appPath = 'apps/n8n-cursor';
    } else if (userMessageLower.includes('lightningflow') || userMessageLower.includes('lightning flow') || subjectLower.includes('lightningflow') || subjectLower.includes('lightning')) {
      appPath = 'apps/lightningflow';
    }

    // Find kb.search step to insert after it
    const kbSearchStep = plan.plan.find(s => s.tool === 'kb.search');
    const kbSearchIndex = kbSearchStep ? plan.plan.indexOf(kbSearchStep) : -1;

    // Analyze conversation history to see what files were read before
    const previouslyReadFiles = new Set<string>();
    if (conversationHistory && conversationHistory.length > 0) {
      const assistantMessages = conversationHistory
        .filter((msg: any) => msg.role === 'assistant')
        .map((msg: any) => msg.content)
        .join('\n');

      // Detect previously read files
      const filePatterns = [
        /README\.md/gi,
        /package\.json/gi,
        /src\/index\.ts/gi,
        /app\/page\.tsx/gi,
        /tsconfig\.json/gi,
      ];

      filePatterns.forEach(pattern => {
        if (pattern.test(assistantMessages)) {
          const fileName = pattern.source.replace(/[\\^$.*+?()[\]{}|]/g, '');
          previouslyReadFiles.add(fileName.toLowerCase());
        }
      });
    }

    // Create code.readFile steps with VARIED file selection to avoid repetition
    const codeReadSteps: PlanStep[] = [];
    let stepCounter = plan.plan.length + 1;

    // Define available file options for different apps
    const fileOptions: Record<string, Array<{ path: string, title: string, includeAST?: boolean, includeDependencies?: boolean }>> = {
      'apps/scorpion': [
        { path: `${appPath}/README.md`, title: 'Read main README', includeDependencies: true },
        { path: `${appPath}/package.json`, title: 'Read package.json' },
        { path: `${appPath}/app/page.tsx`, title: 'Read main page component', includeAST: true },
        { path: `${appPath}/tsconfig.json`, title: 'Read TypeScript configuration' },
        { path: `${appPath}/next.config.js`, title: 'Read Next.js configuration' },
        { path: `${appPath}/app/layout.tsx`, title: 'Read root layout', includeAST: true },
        { path: `${appPath}/lib/chat/types.ts`, title: 'Read type definitions' },
        { path: `${appPath}/tailwind.config.ts`, title: 'Read Tailwind configuration' },
      ],
      'apps/lightningflow': [
        { path: `${appPath}/README.md`, title: 'Read main README', includeDependencies: true },
        { path: `${appPath}/package.json`, title: 'Read package.json' },
        { path: `${appPath}/src/index.ts`, title: 'Read main entry point', includeAST: true, includeDependencies: true },
        { path: `${appPath}/tsconfig.json`, title: 'Read TypeScript configuration' },
        { path: `${appPath}/lightning-ui/README.md`, title: 'Read UI README', includeDependencies: true },
        { path: `${appPath}/lightning-ui/package.json`, title: 'Read UI package.json' },
        { path: `${appPath}/.env.example`, title: 'Read environment configuration' },
      ],
      'apps/n8n-cursor': [
        { path: `${appPath}/backend/README.md`, title: 'Read backend README', includeDependencies: true },
        { path: `${appPath}/backend/src/workers/workflow-worker.ts`, title: 'Read workflow worker implementation', includeAST: true },
        { path: `${appPath}/backend/src/index.ts`, title: 'Read backend entry point', includeAST: true },
        { path: `${appPath}/backend/package.json`, title: 'Read backend package.json' },
        { path: `docs/workflows/master-orchestration-guide.md`, title: 'Read workflow orchestration guide' },
        { path: `docs/workflows/workflow-overview.md`, title: 'Read workflow overview documentation' },
      ],
    };

    // Get file options for this app, or use default
    const availableFiles = fileOptions[appPath] || fileOptions['apps/scorpion'];

    // Power of 10 Rule 7: Guard undefined
    if (!availableFiles || availableFiles.length === 0) {
      console.warn('[Chat Stream] No available files for codebase question');
      return plan;
    }

    // Filter out files that were read before (to avoid repetition)
    const unusedFiles = availableFiles.filter(file => {
      const fileName = file.path.split('/').pop() || '';
      return !previouslyReadFiles.has(fileName.toLowerCase());
    });

    // Use unused files if available, otherwise use all files but shuffle
    const filesToRead = unusedFiles.length > 0
      ? unusedFiles.slice(0, Math.min(3, unusedFiles.length)) // Read up to 3 different files
      : availableFiles.slice(0, Math.min(3, availableFiles.length)); // Fallback: read first 3

    // If we still don't have enough variety, shuffle and pick different ones
    if (filesToRead.length < 2 && availableFiles.length > 2) {
      const shuffled = [...availableFiles].sort(() => Math.random() - 0.5);
      filesToRead.push(...shuffled.slice(0, 2 - filesToRead.length));
    }

    // Create steps for selected files
    filesToRead.forEach((file, index) => {
      codeReadSteps.push({
        id: `s${stepCounter++}`,
        title: (file.title || 'Read file') + ` to understand ${appPath.includes('lightningflow') ? 'LightningFlow' : appPath.includes('scorpion') ? 'Scorpion' : 'the codebase'}`,
        tool: 'code.readFile',
        args: {
          path: file.path || '',
          includeAST: file.includeAST || false,
          includeDependencies: file.includeDependencies || false
        },
        dependsOn: kbSearchStep?.id ? [kbSearchStep.id] : (index > 0 && codeReadSteps[index - 1] && codeReadSteps[index - 1]!.id ? [codeReadSteps[index - 1]!.id] : undefined),
        success: `${file.path.split('/').pop()} read successfully`
      });
    });

    // Insert code.readFile steps after kb.search
    if (kbSearchIndex >= 0) {
      plan.plan.splice(kbSearchIndex + 1, 0, ...codeReadSteps);
    } else {
      // If no kb.search, prepend code.readFile steps
      plan.plan.unshift(...codeReadSteps);
    }

    console.log('[Chat Stream] Injected code.readFile steps for codebase question');
  }

  return plan;
}

/**
 * Correct file paths based on question type
 *
 * Extracted from: processStreamStart.ts lines ~2460-2492
 *
 * Logic:
 * - Detect workflow questions
 * - Find code.readFile steps with incorrect paths
 * - Map lightningflow paths to correct n8n-cursor paths
 *
 * @param plan - Current plan
 * @param userMessage - User's message
 * @returns Plan with corrected file paths
 */
export function correctFilePaths(
  plan: Plan,
  userMessage: string
): Plan {
  // FIX INCORRECT FILE PATHS: Correct paths based on question type
  const isWorkflowQuestionForPathFix = /(workflow|n8n|execution|orchestration|automation|trigger workflow|run workflow)/i.test(userMessage.toLowerCase());

  if (isWorkflowQuestionForPathFix && plan.plan) {
    console.debug('[Chat Stream] Fixing file paths for workflow question');
    plan.plan.forEach((step: any) => {
      if (step.tool === 'code.readFile' && step.args && step.args.path) {
        // If step is trying to read lightningflow files for a workflow question, fix it
        // Power of 10 Rule 8: Limit pointer dereferencing - use intermediate variable
        const stepPath = step.args?.['path'];
        if (stepPath && typeof stepPath === 'string' && stepPath.includes('apps/lightningflow')) {
          const fileName = stepPath.split('/').pop();
          // Map to correct n8n-cursor paths
          if (fileName === 'tsconfig.json') {
            step.args.path = 'apps/n8n-cursor/backend/tsconfig.json';
            step.title = 'Read n8n-cursor backend TypeScript configuration';
          } else if (fileName === 'README.md' && stepPath.includes('lightning-ui')) {
            step.args.path = 'apps/n8n-cursor/backend/README.md';
            step.title = 'Read n8n-cursor backend README';
          } else if (fileName === 'README.md') {
            step.args.path = 'apps/n8n-cursor/backend/README.md';
            step.title = 'Read n8n-cursor backend README';
          } else {
            // Default to workflow worker
            step.args.path = 'apps/n8n-cursor/backend/src/workers/workflow-worker.ts';
            step.title = 'Read workflow worker implementation';
          }
          console.debug(`[Chat Stream] Fixed path: ${step.args.path}`);
        }
      }
    });
  }

  return plan;
}

/**
 * Enforce system health and logs tools for operational queries
 *
 * Extracted from: processStreamStart.ts lines ~2364-2458
 *
 * Logic:
 * - Detect operational questions (system health, logs, metrics)
 * - Inject system.health tool if missing
 * - Inject logs.tail tool if missing
 * - Enforce logs.tail for standalone logs queries
 *
 * @param plan - Current plan
 * @param userMessage - User's message
 * @returns Plan with enforced system tools
 */
export function enforceSystemTools(
  plan: Plan,
  userMessage: string
): Plan {
  // ABSOLUTE FINAL ENFORCEMENT: System health queries MUST use system.health
  const isSystemHealthQuery = /(check system health|system health|health check|test system health|system.*health|analyze.*system.*health)/i.test(userMessage.toLowerCase());
  const isLogsQuery = /(check.*logs|recent.*logs|show.*logs|tail.*logs|get.*logs|analyze.*logs)/i.test(userMessage.toLowerCase());
  const isCombinedQuery = isSystemHealthQuery && isLogsQuery;

  if (isSystemHealthQuery && plan.plan) {
    const hasSystemHealth = plan.plan.some((step: any) => step.tool === 'system.health');
    const hasStatsGet = plan.plan.some((step: any) => step.tool === 'stats.get');
    const hasLogsTail = plan.plan.some((step: any) => step.tool === 'logs.tail');

    if (!hasSystemHealth) {
      console.log('[Chat Stream] 🚨 ABSOLUTE FINAL Enforcement: System health query detected - FORCING system.health');

      // Replace first step with system.health if it's not already a system health tool - Power of 10 Rule 7: Guard undefined
      if (plan.plan[0] && plan.plan[0].tool !== 'system.health' && plan.plan[0].tool !== 'stats.get' && plan.plan[0].tool !== 'logs.tail') {
        console.log('[Chat Stream] Replacing first step tool from', plan.plan[0].tool, 'to system.health');
        plan.plan[0] = {
          ...plan.plan[0],
          id: plan.plan[0]?.id || 's1',
          tool: 'system.health',
          title: 'Check system health and status',
          args: { includeMetrics: true, includeAlerts: true },
        };
      }

      // Add stats.get as second step if not present - Power of 10 Rule 7: Guard undefined
      if (!hasStatsGet && plan.plan.length > 0 && plan.plan[0]) {
        plan.plan.splice(1, 0, {
          id: 's2',
          title: 'Get system statistics',
          tool: 'stats.get',
          args: {},
          dependsOn: [plan.plan[0].id],
          success: 'System statistics retrieved'
        });
      }

      // For combined queries, also add logs.tail
      if (isCombinedQuery && !hasLogsTail) {
        console.log('[Chat Stream] 🚨 Combined query detected - FORCING logs.tail');
        const lastStep = plan.plan[plan.plan.length - 1];
        // Power of 10 Rule 7: Guard undefined
        if (lastStep && lastStep.id) {
          plan.plan.push({
            id: `s${plan.plan.length + 1}`,
            title: 'Get recent system logs',
            tool: 'logs.tail',
            args: { window: 300000, level: 'error' }, // Last 5 minutes, error level
            dependsOn: [lastStep.id],
            success: 'Recent logs retrieved'
          });
        }
      }

      console.log('[Chat Stream] ✅ ABSOLUTE FINAL: Enforced system.health. Final plan steps:', plan.plan.map((s: any) => s.tool).join(', '));
    } else {
      console.log('[Chat Stream] ✅ System health query already uses system.health correctly');

      // Still check for logs in combined queries
      if (isCombinedQuery && !hasLogsTail) {
        console.log('[Chat Stream] 🚨 Combined query - adding logs.tail');
        const lastStep = plan.plan[plan.plan.length - 1];
        // Power of 10 Rule 7: Guard undefined
        if (lastStep && lastStep.id) {
          plan.plan.push({
            id: `s${plan.plan.length + 1}`,
            title: 'Get recent system logs',
            tool: 'logs.tail',
            args: { window: 300000, level: 'error' },
            dependsOn: [lastStep.id],
            success: 'Recent logs retrieved'
          });
        }
      }
    }
  }

  // Also enforce logs.tail for standalone logs queries
  if (isLogsQuery && !isSystemHealthQuery && plan.plan) {
    const hasLogsTail = plan.plan.some((step: any) => step.tool === 'logs.tail');
    if (!hasLogsTail) {
      console.log('[Chat Stream] 🚨 Logs query detected - FORCING logs.tail');
      const firstStep = plan.plan[0];
      // Power of 10 Rule 7: Guard undefined
      if (firstStep && firstStep.tool !== 'logs.tail') {
        plan.plan[0] = {
          ...firstStep,
          id: firstStep.id || 's1',
          tool: 'logs.tail',
          title: 'Get recent system logs',
          args: { window: 300000, level: 'error' },
        };
      }
    }
  }

  return plan;
}

