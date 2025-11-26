// apps/scorpion/app/api/chat/stream/helpers/historyAnalysis.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 2: All loops have fixed upper bounds

export interface HistoryAnalysisResult {
  historyText: string;
  frequentlyUsedTools: string[];
  frequentlyUsedFiles: string[];
  unusedTools: string[];
  usedSequences: string[][];
  usedPatterns: string[];
}

/**
 * Analyze conversation history to identify previously used tools and files
 * Power of 10 Rule 3: < 60 lines (orchestrates smaller helpers)
 * Power of 10 Rule 2: Bounded loops
 */
export function analyzeConversationHistory(
  conversationHistory: Array<{ role: string; content?: string; parts?: unknown[] }>,
  tools: Record<string, unknown>
): HistoryAnalysisResult {
  // Power of 10 Rule 7: Guard empty history
  if (!conversationHistory || conversationHistory.length === 0) {
    return {
      historyText: '',
      frequentlyUsedTools: [],
      frequentlyUsedFiles: [],
      unusedTools: [],
      usedSequences: [],
      usedPatterns: [],
    };
  }

  // Extract assistant messages and plans
  const extractedPlans: any[] = [];
  const assistantMessages = extractAssistantMessages(conversationHistory, extractedPlans);

  // Extract user questions
  const userQuestions = extractUserQuestions(conversationHistory);

  // Detect used tools and files
  const { usedTools, usedFiles, usedToolSequences, usedPlanPatterns } = detectUsedToolsAndFiles(
    assistantMessages,
    extractedPlans
  );

  // Get unused tools
  const unusedTools = getUnusedTools(usedTools, tools);

  // Sort and get top items
  const sortedUsedTools = Array.from(usedTools.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const sortedUsedFiles = Array.from(usedFiles.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const frequentlyUsedTools = sortedUsedTools.map(([tool]) => tool);
  const frequentlyUsedFiles = sortedUsedFiles.map(([file]) => file);

  // Build history context text
  const historyText = buildHistoryContextText(
    userQuestions,
    sortedUsedTools,
    sortedUsedFiles,
    unusedTools,
    usedToolSequences,
    usedPlanPatterns
  );

  return {
    historyText,
    frequentlyUsedTools,
    frequentlyUsedFiles,
    unusedTools,
    usedSequences: usedToolSequences,
    usedPatterns: Array.from(new Set(usedPlanPatterns)),
  };
}

/**
 * Extract assistant messages and plans from conversation history
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 2: Bounded loop
 */
function extractAssistantMessages(
  conversationHistory: Array<{ role: string; content?: string; parts?: unknown[] }>,
  extractedPlans: any[]
): string {
  const MAX_MESSAGES = 1000; // Power of 10 Rule 2: Bounded loop
  const messagesToProcess = conversationHistory.slice(0, MAX_MESSAGES);

  return messagesToProcess
    .filter((msg) => msg.role === 'assistant')
    .map((msg) => {
      let content = msg.content || '';

      // Extract plan structure from hidden JSON comment
      const planMatch = content.match(/<!-- PLAN_STRUCTURE:(.+?) -->/);
      if (planMatch) {
        try {
          const plan = JSON.parse(planMatch[1]);
          extractedPlans.push(plan);
          if (plan.plan && Array.isArray(plan.plan)) {
            const MAX_PLAN_STEPS = 100; // Power of 10 Rule 2: Bounded loop
            const stepsToAdd = plan.plan.slice(0, MAX_PLAN_STEPS);
            for (let i = 0; i < stepsToAdd.length; i++) {
              const step = stepsToAdd[i];
              if (step && step.id && step.tool) {
                content += `\nPlan step ${step.id}: ${step.tool} ${step.args ? JSON.stringify(step.args) : ''}`;
              }
            }
          }
        } catch (e) {
          console.debug('[History Analysis] Failed to parse plan structure:', e);
        }
      }

      // Extract from parts if they exist
      if (msg.parts && Array.isArray(msg.parts)) {
        const MAX_PARTS = 100; // Power of 10 Rule 2: Bounded loop
        const partsToProcess = msg.parts.slice(0, MAX_PARTS);
        for (let i = 0; i < partsToProcess.length; i++) {
          const part = partsToProcess[i] as any;
          if (part && part.type === 'plan_step' && part.plan) {
            extractedPlans.push(part.plan);
            // Power of 10 Rule 8: Reduce deep property access to ≤2 levels
            const planObj = part.plan;
            if (planObj.plan && Array.isArray(planObj.plan)) {
              const MAX_STEPS = 100; // Power of 10 Rule 2: Bounded loop
              const stepsToAdd = planObj.plan.slice(0, MAX_STEPS);
              for (let j = 0; j < stepsToAdd.length; j++) {
                const step = stepsToAdd[j];
                if (step && step.id && step.tool) {
                  content += `\nPlan step ${step.id}: ${step.tool} ${step.args ? JSON.stringify(step.args) : ''}`;
                }
              }
            }
          } else if (part && part.type === 'plan_step' && part.tool) {
            content += `\nPlan step: ${part.tool} ${part.args ? JSON.stringify(part.args) : ''}`;
          }
        }
      }
      return content;
    })
    .join('\n');
}

/**
 * Extract user questions from conversation history
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 2: Bounded loop
 */
function extractUserQuestions(
  conversationHistory: Array<{ role: string; content?: string }>
): string[] {
  const MAX_QUESTIONS = 5;
  const MAX_MESSAGES = 1000; // Power of 10 Rule 2: Bounded loop
  const messagesToProcess = conversationHistory.slice(0, MAX_MESSAGES);

  return messagesToProcess
    .filter((msg) => msg.role === 'user')
    .map((msg) => msg.content || '')
    .slice(-MAX_QUESTIONS);
}

/**
 * Detect used tools and files from messages and plans
 * Power of 10 Rule 3: < 60 lines (orchestrates helpers)
 * Power of 10 Rule 2: Bounded loops
 */
function detectUsedToolsAndFiles(
  assistantMessages: string,
  extractedPlans: any[]
): {
  usedTools: Map<string, number>;
  usedFiles: Map<string, number>;
  usedToolSequences: string[][];
  usedPlanPatterns: string[];
} {
  const usedTools = new Map<string, number>();
  const usedFiles = new Map<string, number>();
  const usedToolSequences: string[][] = [];
  const usedPlanPatterns: string[] = [];

  // Comprehensive tool patterns
  const allToolPatterns = [
    { pattern: /kb\.search/gi, name: 'kb.search' },
    { pattern: /code\.readFile/gi, name: 'code.readFile' },
    { pattern: /project\.analyze/gi, name: 'project.analyze' },
    { pattern: /system\.health/gi, name: 'system.health' },
    { pattern: /logs\.tail/gi, name: 'logs.tail' },
    { pattern: /research\.run/gi, name: 'research.run' },
    { pattern: /workflows\.trigger/gi, name: 'workflows.trigger' },
    { pattern: /notifications\.post/gi, name: 'notifications.post' },
    { pattern: /agent\.deploy/gi, name: 'agent.deploy' },
    { pattern: /backup\.create/gi, name: 'backup.create' },
    { pattern: /llm\.train/gi, name: 'llm.train' },
    { pattern: /llm\.evaluate/gi, name: 'llm.evaluate' },
    { pattern: /user\.search/gi, name: 'user.search' },
    { pattern: /user\.research/gi, name: 'user.research' },
  ];

  // Power of 10 Rule 2: Bounded loop
  const MAX_PATTERNS = 100;
  const patternsToCheck = allToolPatterns.slice(0, MAX_PATTERNS);
  for (let i = 0; i < patternsToCheck.length; i++) {
    const { pattern, name } = patternsToCheck[i];
    if (!pattern || !name) continue;
    const matches = assistantMessages.match(pattern);
    if (matches) {
      usedTools.set(name, (usedTools.get(name) || 0) + matches.length);
    }
  }

  // Extract from plans
  const MAX_PLANS = 100; // Power of 10 Rule 2: Bounded loop
  const plansToProcess = extractedPlans.slice(0, MAX_PLANS);
  for (let i = 0; i < plansToProcess.length; i++) {
    const plan = plansToProcess[i];
    if (!plan || !plan.plan || !Array.isArray(plan.plan)) continue;

    const sequence: string[] = [];
    const MAX_STEPS = 100; // Power of 10 Rule 2: Bounded loop
    const stepsToProcess = plan.plan.slice(0, MAX_STEPS);
    for (let j = 0; j < stepsToProcess.length; j++) {
      const step = stepsToProcess[j];
      if (!step || !step.tool) continue;

      sequence.push(step.tool);
      usedTools.set(step.tool, (usedTools.get(step.tool) || 0) + 1);

      // Extract file paths from args
      if (step.args && typeof step.args === 'object' && 'path' in step.args) {
        const filePath = (step.args as { path?: string }).path;
        if (filePath && typeof filePath === 'string') {
          usedFiles.set(filePath, (usedFiles.get(filePath) || 0) + 1);
        }
      }
    }

    if (sequence.length > 0) {
      usedToolSequences.push(sequence);
      usedPlanPatterns.push(sequence.join(' → '));
    }
  }

  // Extract from text patterns
  const planStepPattern = /Plan step[^:]*:\s*([a-z]+\.[a-z]+)(?:[\s\S]*?path[\s\S]*?["']([^"']+)["'])?/gi;
  let match;
  const currentSequence: string[] = [];
  let matchCount = 0;
  const MAX_MATCHES = 1000; // Power of 10 Rule 2: Bounded loop
  while ((match = planStepPattern.exec(assistantMessages)) !== null && matchCount < MAX_MATCHES) {
    matchCount++;
    const tool = match[1];
    const file = match[2];
    if (tool && !currentSequence.includes(tool)) {
      currentSequence.push(tool);
    }
    if (file) {
      usedFiles.set(file, (usedFiles.get(file) || 0) + 1);
    }
  }
  if (currentSequence.length > 0 && usedToolSequences.length === 0) {
    usedToolSequences.push(currentSequence);
  }

  // Extract plan patterns
  const planPatternRegex = /(?:plan|steps?)[\s\S]{0,500}?(?:kb\.search|code\.readFile|project\.analyze)[\s\S]{0,500}?(?:code\.readFile|project\.analyze|system\.health)/gi;
  const planMatches = assistantMessages.match(planPatternRegex);
  if (planMatches) {
    const MAX_MATCHES = 100; // Power of 10 Rule 2: Bounded loop
    const matchesToProcess = planMatches.slice(0, MAX_MATCHES);
    for (let i = 0; i < matchesToProcess.length; i++) {
      const pattern = matchesToProcess[i];
      if (!pattern) continue;
      const toolsInPattern = allToolPatterns
        .filter(({ name }) => pattern.includes(name))
        .map(({ name }) => name);
      if (toolsInPattern.length >= 2) {
        usedPlanPatterns.push(toolsInPattern.join(' → '));
      }
    }
  }

  // Look for file paths
  const filePatterns = [
    { pattern: /README\.md/gi, name: 'README.md' },
    { pattern: /package\.json/gi, name: 'package.json' },
    { pattern: /src\/index\.ts/gi, name: 'src/index.ts' },
    { pattern: /app\/page\.tsx/gi, name: 'app/page.tsx' },
    { pattern: /tsconfig\.json/gi, name: 'tsconfig.json' },
    { pattern: /next\.config\.js/gi, name: 'next.config.js' },
    { pattern: /app\/layout\.tsx/gi, name: 'app/layout.tsx' },
    { pattern: /\.env\.example/gi, name: '.env.example' },
    { pattern: /tailwind\.config/gi, name: 'tailwind.config' },
    { pattern: /lib\/chat\/types\.ts/gi, name: 'lib/chat/types.ts' },
    { pattern: /components\/[^"'\s]+/gi, name: 'components/*' },
  ];

  const MAX_FILE_PATTERNS = 100; // Power of 10 Rule 2: Bounded loop
  const filePatternsToCheck = filePatterns.slice(0, MAX_FILE_PATTERNS);
  for (let i = 0; i < filePatternsToCheck.length; i++) {
    const { pattern, name } = filePatternsToCheck[i];
    if (!pattern || !name) continue;
    const matches = assistantMessages.match(pattern);
    if (matches) {
      usedFiles.set(name, (usedFiles.get(name) || 0) + matches.length);
    }
  }

  return { usedTools, usedFiles, usedToolSequences, usedPlanPatterns };
}

/**
 * Get unused tools by comparing available tools with used tools
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 2: Bounded loop
 */
function getUnusedTools(
  usedTools: Map<string, number>,
  tools: Record<string, unknown>
): string[] {
  const allAvailableTools = new Set<string>();
  try {
    if (tools && typeof tools === 'object') {
      const toolKeys = Object.keys(tools);
      const MAX_TOOLS = 1000; // Power of 10 Rule 2: Bounded loop
      const toolsToCheck = toolKeys.slice(0, MAX_TOOLS);
      for (let i = 0; i < toolsToCheck.length; i++) {
        const name = toolsToCheck[i];
        if (name && tools[name]) {
          allAvailableTools.add(name);
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }

  return Array.from(allAvailableTools).filter((tool) => !usedTools.has(tool));
}

/**
 * Build history context text from analysis results
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 2: Bounded loops
 */
function buildHistoryContextText(
  userQuestions: string[],
  sortedUsedTools: Array<[string, number]>,
  sortedUsedFiles: Array<[string, number]>,
  unusedTools: string[],
  usedToolSequences: string[][],
  usedPlanPatterns: string[]
): string {
  if (sortedUsedTools.length === 0 && sortedUsedFiles.length === 0 && unusedTools.length === 0) {
    return '';
  }

  let historyContext = '\n\n=== CONVERSATION HISTORY ANALYSIS - AVOID REPETITION ===\n';

  if (userQuestions.length > 0) {
    historyContext += `PREVIOUS QUESTIONS (last ${userQuestions.length}):\n`;
    const MAX_QUESTIONS = 5; // Power of 10 Rule 2: Bounded loop
    const questionsToShow = userQuestions.slice(0, MAX_QUESTIONS);
    for (let i = 0; i < questionsToShow.length; i++) {
      const q = questionsToShow[i];
      if (!q) continue;
      historyContext += `  ${i + 1}. ${q.substring(0, 100)}${q.length > 100 ? '...' : ''}\n`;
    }
    historyContext += '\n';
  }

  historyContext += `MOST FREQUENTLY USED TOOLS (avoid repeating these!):\n`;
  const MAX_TOOLS = 10; // Power of 10 Rule 2: Bounded loop
  const toolsToShow = sortedUsedTools.slice(0, MAX_TOOLS);
  for (let i = 0; i < toolsToShow.length; i++) {
    const [tool, count] = toolsToShow[i];
    if (!tool) continue;
    historyContext += `  - ${tool} (used ${count} time${count > 1 ? 's' : ''})\n`;
  }

  historyContext += `\nMOST FREQUENTLY READ FILES (try different files!):\n`;
  const MAX_FILES = 10; // Power of 10 Rule 2: Bounded loop
  const filesToShow = sortedUsedFiles.slice(0, MAX_FILES);
  for (let i = 0; i < filesToShow.length; i++) {
    const [file, count] = filesToShow[i];
    if (!file) continue;
    historyContext += `  - ${file} (read ${count} time${count > 1 ? 's' : ''})\n`;
  }

  if (unusedTools.length > 0) {
    historyContext += `\n🚀 AVAILABLE BUT UNUSED TOOLS (${unusedTools.length} - USE THESE INSTEAD!):\n`;
    const MAX_UNUSED = 20; // Power of 10 Rule 2: Bounded loop
    const unusedToShow = unusedTools.slice(0, MAX_UNUSED);
    for (let i = 0; i < unusedToShow.length; i++) {
      const tool = unusedToShow[i];
      if (!tool) continue;
      historyContext += `  - ${tool}\n`;
    }
    historyContext += '\n';
  }

  if (usedToolSequences.length > 0) {
    historyContext += `\n⚠️ PREVIOUS TOOL SEQUENCES (DO NOT REPEAT THESE EXACT PATTERNS!):\n`;
    const MAX_SEQUENCES = 5; // Power of 10 Rule 2: Bounded loop
    const sequencesToShow = usedToolSequences.slice(0, MAX_SEQUENCES);
    for (let i = 0; i < sequencesToShow.length; i++) {
      const seq = sequencesToShow[i];
      if (!seq || !Array.isArray(seq)) continue;
      historyContext += `  ${i + 1}. ${seq.join(' → ')}\n`;
    }
    historyContext += '\n';
  }

  if (usedPlanPatterns.length > 0) {
    historyContext += `\n⚠️ REPEATED PLAN PATTERNS (AVOID THESE!):\n`;
    const uniquePatterns = Array.from(new Set(usedPlanPatterns));
    const MAX_PATTERNS = 5; // Power of 10 Rule 2: Bounded loop
    const patternsToShow = uniquePatterns.slice(0, MAX_PATTERNS);
    for (let i = 0; i < patternsToShow.length; i++) {
      const pattern = patternsToShow[i];
      if (!pattern) continue;
      historyContext += `  ${i + 1}. ${pattern}\n`;
    }
    historyContext += '\n';
  }

  historyContext += '\n🎯 CRITICAL ANTI-REPETITION INSTRUCTIONS (SYSTEM ENFORCEMENT ACTIVE):\n';
  historyContext += '⚠️ WARNING: The system will AUTOMATICALLY replace any tools/files/patterns you use that match the forbidden lists below!\n\n';

  historyContext += '1. 🚫 FORBIDDEN TOOLS (System will replace these automatically):\n';
  if (sortedUsedTools.length > 0) {
    const MAX_FORBIDDEN = 10; // Power of 10 Rule 2: Bounded loop
    const forbiddenToShow = sortedUsedTools.slice(0, MAX_FORBIDDEN);
    for (let i = 0; i < forbiddenToShow.length; i++) {
      const [tool, count] = forbiddenToShow[i];
      if (!tool) continue;
      historyContext += `   - ${tool} (used ${count} time${count > 1 ? 's' : ''}) → SYSTEM WILL REPLACE THIS!\n`;
    }
  } else {
    historyContext += '   (none yet - but avoid repetition!)\n';
  }

  historyContext += '\n2. ✅ RECOMMENDED TOOLS (System prefers these - use them!):\n';
  if (unusedTools.length > 0) {
    const MAX_RECOMMENDED = 8; // Power of 10 Rule 2: Bounded loop
    const recommendedToShow = unusedTools.slice(0, MAX_RECOMMENDED);
    for (let i = 0; i < recommendedToShow.length; i++) {
      const tool = recommendedToShow[i];
      if (!tool) continue;
      historyContext += `   - ${tool} (unused - excellent choice!)\n`;
    }
    if (unusedTools.length > MAX_RECOMMENDED) {
      historyContext += `   ... and ${unusedTools.length - MAX_RECOMMENDED} more unused tools\n`;
    }
  } else {
    // Suggest alternatives
    if (sortedUsedTools.length > 0) {
      const alternatives: Record<string, string[]> = {
        'kb.search': ['project.analyze', 'code.readFile', 'system.health', 'logs.tail'],
        'code.readFile': ['project.analyze', 'system.health', 'logs.tail'],
        'project.analyze': ['code.readFile', 'system.health', 'logs.tail'],
        'system.health': ['logs.tail', 'project.analyze', 'code.readFile'],
      };
      const topUsed = sortedUsedTools[0]?.[0] || 'project.analyze';
      const alt = alternatives[topUsed] || ['project.analyze', 'code.readFile', 'system.health'];
      historyContext += `   - ${alt.join(', ')} (alternatives to ${topUsed})\n`;
    } else {
      historyContext += '   - project.analyze, code.readFile, system.health, logs.tail\n';
    }
  }

  historyContext += '\n3. 🚫 FORBIDDEN FILES (System will replace these automatically):\n';
  if (sortedUsedFiles.length > 0) {
    const MAX_FORBIDDEN_FILES = 10; // Power of 10 Rule 2: Bounded loop
    const forbiddenFilesToShow = sortedUsedFiles.slice(0, MAX_FORBIDDEN_FILES);
    for (let i = 0; i < forbiddenFilesToShow.length; i++) {
      const [file, count] = forbiddenFilesToShow[i];
      if (!file) continue;
      historyContext += `   - ${file} (read ${count} time${count > 1 ? 's' : ''}) → SYSTEM WILL REPLACE THIS!\n`;
    }
  } else {
    historyContext += '   (none yet - but avoid repetition!)\n';
  }

  historyContext += '\n4. ✅ RECOMMENDED FILE TYPES (Try these instead):\n';
  const recommendedFiles = [
    'Config files: tsconfig.json, next.config.js, tailwind.config.ts, .env.example',
    'Source files: lib/chat/types.ts, components/*, utils/*, hooks/*',
    'Documentation: docs/*, README files in subdirectories',
    'Tests: *.test.ts, *.spec.ts',
    'Entry points: src/index.ts, app/page.tsx, app/layout.tsx',
  ];
  const MAX_RECOMMENDED_FILES = 5; // Power of 10 Rule 2: Bounded loop
  const recommendedFilesToShow = recommendedFiles.slice(0, MAX_RECOMMENDED_FILES);
  for (let i = 0; i < recommendedFilesToShow.length; i++) {
    const fileType = recommendedFilesToShow[i];
    if (!fileType) continue;
    historyContext += `   - ${fileType}\n`;
  }

  if (usedToolSequences.length > 0) {
    historyContext += '\n5. 🚫 FORBIDDEN SEQUENCES (System will break these patterns):\n';
    const MAX_FORBIDDEN_SEQ = 3; // Power of 10 Rule 2: Bounded loop
    const sequencesToShow = usedToolSequences.slice(0, MAX_FORBIDDEN_SEQ);
    for (let i = 0; i < sequencesToShow.length; i++) {
      const seq = sequencesToShow[i];
      if (!seq || !Array.isArray(seq)) continue;
      historyContext += `   ${i + 1}. ${seq.join(' → ')} → SYSTEM WILL BREAK THIS PATTERN!\n`;
    }
  }

  if (usedPlanPatterns.length > 0) {
    historyContext += '\n6. 🚫 FORBIDDEN PATTERNS (System will modify these):\n';
    const uniquePatterns = Array.from(new Set(usedPlanPatterns));
    const MAX_FORBIDDEN_PATTERNS = 3; // Power of 10 Rule 2: Bounded loop
    const patternsToShow = uniquePatterns.slice(0, MAX_FORBIDDEN_PATTERNS);
    for (let i = 0; i < patternsToShow.length; i++) {
      const pattern = patternsToShow[i];
      if (!pattern) continue;
      historyContext += `   ${i + 1}. ${pattern} → SYSTEM WILL MODIFY THIS!\n`;
    }
  }

  historyContext += '\n\n💡 ACTIONABLE RECOMMENDATIONS:\n';
  historyContext += '1. START WITH UNUSED TOOLS: Choose from the recommended tools list above\n';
  historyContext += '2. READ DIFFERENT FILES: Use the recommended file types, avoid forbidden files\n';
  historyContext += '3. VARY SEQUENCES: Don\'t repeat the forbidden sequences - create new patterns\n';
  historyContext += '4. BE CREATIVE: Mix tools in novel combinations that haven\'t been tried\n';
  historyContext += '5. PROACTIVE PLANNING: The system will enforce these rules automatically - plan wisely!\n';

  historyContext += '\n=== END HISTORY ANALYSIS ===\n';

  return historyContext;
}

