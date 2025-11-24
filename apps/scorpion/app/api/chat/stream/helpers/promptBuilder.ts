// apps/scorpion/app/api/chat/stream/helpers/promptBuilder.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 2: All loops have fixed upper bounds

import type { ScorpionIntent } from '@/lib/chat/types';

/**
 * Generate tools list for planner prompt
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 2: Bounded loops
 */
export function generateToolsList(
  intent: ScorpionIntent,
  userMessage: string,
  tools: Record<string, unknown>,
  userTools: Record<string, unknown>,
  allowedTools: string[]
): string {
  let toolsList = '\n=== AVAILABLE AI-CALLABLE TOOLS ===\n';

  if ((intent as string) === 'identity') {
    toolsList += 'INTENT: identity - NO TOOLS AVAILABLE\n';
    toolsList += 'This is an identity question about Scorpion itself.\n';
    toolsList += 'Answer directly as Scorpion - do NOT use tools, do NOT search knowledge base.\n';
    toolsList += 'Answer in terms of your identity as the Scorpion AI orchestrator.\n';
    toolsList += 'DO NOT provide dictionary-style meanings (insect, email client, sports team, etc.).\n\n';
    return toolsList;
  }

  if ((intent as string) === 'small_talk') {
    toolsList += 'INTENT: small_talk - NO TOOLS AVAILABLE\n';
    toolsList += 'You should respond conversationally without using any tools.\n';
    toolsList += 'Just recognize the greeting and respond politely.\n\n';
    return toolsList;
  }

  // FRONTIER MODEL APPROACH: If allowedTools is empty, all tools are available
  const isToolTestingRequest = /(test.*all.*tool|test.*your.*tool|test.*every.*tool|test.*each.*tool|verify.*all.*tool|check.*all.*tool)/i.test(userMessage.toLowerCase());
  const useAllTools = allowedTools.length === 0 || isToolTestingRequest;

  // Add AI tools
  try {
    if (tools && typeof tools === 'object') {
      const toolEntries = Object.entries(tools);
      const MAX_TOOLS = 1000; // Power of 10 Rule 2: Bounded loop
      const toolsToProcess = toolEntries.slice(0, MAX_TOOLS);

      if (useAllTools || toolsToProcess.length === 0) {
        toolsList += `Total: ${toolsToProcess.length} AI tools available\n\n`;
      } else {
        const filteredTools = toolsToProcess.filter(([name]) => allowedTools.includes(name));
        toolsList += `Total: ${filteredTools.length} AI tools available (filtered by intent)\n\n`;
      }

      const toolsToShow = useAllTools ? toolsToProcess : toolsToProcess.filter(([name]) => allowedTools.includes(name));
      const MAX_TOOLS_TO_SHOW = 100; // Power of 10 Rule 2: Bounded loop
      const toolsToDisplay = toolsToShow.slice(0, MAX_TOOLS_TO_SHOW);

      for (let i = 0; i < toolsToDisplay.length; i++) {
        const [name, toolSpec] = toolsToDisplay[i];
        if (!name || !toolSpec) continue;

        const tool = toolSpec as Record<string, unknown>;
        const desc = (tool.description as string) || (tool.label as string) || name;
        const schema = tool.schema;

        let argsInfo = '';
        if (schema && typeof schema === 'object' && 'parse' in schema) {
          try {
            const schemaDef = (schema as any)._def;
            if (schemaDef?.shape) {
              const fields = Object.keys(schemaDef.shape);
              if (fields.length > 0) {
                const MAX_FIELDS = 3; // Power of 10 Rule 2: Bounded loop
                const fieldsToShow = fields.slice(0, MAX_FIELDS);
                argsInfo = ` (args: ${fieldsToShow.join(', ')}${fields.length > MAX_FIELDS ? '...' : ''})`;
              }
            }
          } catch (e) {
            // Ignore schema parsing errors
          }
        }

        toolsList += `- ${name}${argsInfo} → ${desc}\n`;
      }
    } else {
      toolsList += '- No AI tools available\n';
    }
  } catch (e) {
    console.error('[Planner] Error generating AI tools list:', e);
    toolsList += '- Error loading AI tools\n';
  }

  toolsList += '\n=== USER TOOLS (execute directly, don\'t plan) ===\n';

  // Add implemented user tools
  try {
    if (userTools && typeof userTools === 'object') {
      const userToolEntries = Object.entries(userTools).filter(([_, tool]) => {
        const t = tool as Record<string, unknown>;
        return t && t.implemented !== false;
      });
      toolsList += `Total: ${userToolEntries.length} user tools available\n\n`;

      const MAX_USER_TOOLS = 100; // Power of 10 Rule 2: Bounded loop
      const userToolsToShow = userToolEntries.slice(0, MAX_USER_TOOLS);
      for (let i = 0; i < userToolsToShow.length; i++) {
        const [name, tool] = userToolsToShow[i];
        if (!name || !tool) continue;
        const t = tool as Record<string, unknown>;
        const desc = (t.description as string) || (t.label as string) || name;
        toolsList += `- ${name} → ${desc}\n`;
      }
    } else {
      toolsList += '- No user tools available\n';
    }
  } catch (e) {
    console.error('[Planner] Error generating user tools list:', e);
    toolsList += '- Error loading user tools\n';
  }

  // Check if research tools are available
  const hasResearchKeys = !!(process.env['TAVILY_API_KEY'] || process.env['NEWS_API_KEY'] || process.env['SERPAPI_KEY']);
  const researchToolsAvailable = allowedTools.includes('research.run') || allowedTools.includes('research.start');

  toolsList += '\n=== TOOL USAGE GUIDANCE ===\n';
  if (intent === 'general_question') {
    toolsList += 'INTENT: general_question - Use research and knowledge base tools (kb.search, research.run)\n';
    toolsList += 'DO NOT use project/repo tools (project.analyze, code.readFile) - these are for project-specific questions only.\n';
    if (researchToolsAvailable && hasResearchKeys) {
      toolsList += 'For research queries, use research.run. For knowledge queries, use kb.search.\n';
    } else {
      toolsList += '⚠️ NOTE: Web research tools are disabled (no API keys configured). Use kb.search for knowledge queries only.\n';
    }
  } else if (intent === 'project_help' || intent === 'system_debug') {
    toolsList += 'INTENT: project_help/system_debug - Full tool access available\n';
    toolsList += 'You can use project/repo tools (project.analyze, code.readFile) as needed.\n';
    toolsList += 'For workflow questions, use workflows.list or workflows.get.\n';
    const isResearchQuery = /(research|find.*latest|latest.*news|current.*news|recent.*news|bitcoin|ethereum|crypto|stock|market|macro.*economic|give.*top.*with.*links)/i.test(userMessage);
    if (isResearchQuery) {
      toolsList += '🚨 THIS IS A RESEARCH QUERY - YOU MUST USE research.run TOOL! DO NOT JUST RESPOND!\n';
      toolsList += 'Create a plan step with tool: "research.run" and appropriate query args.\n';
      toolsList += 'DuckDuckGo is built-in and works without API keys - use it!\n';
    }
  }

  // CRITICAL: Research queries for general_question intent MUST use research.run
  if (intent === 'general_question') {
    const isResearchQuery = /(research|find.*latest|latest.*news|current.*news|recent.*news|bitcoin|ethereum|crypto|stock|market|macro.*economic|give.*top.*with.*links)/i.test(userMessage);
    if (isResearchQuery) {
      toolsList += '\n🚨🚨🚨 CRITICAL: THIS IS A RESEARCH QUERY! 🚨🚨🚨\n';
      toolsList += 'YOU MUST USE research.run TOOL - DO NOT USE kb.search OR JUST RESPOND!\n';
      toolsList += 'Create a plan step with tool: "research.run" and args: { query: user message, depth: "medium", maxSites: extract number if present }\n';
      toolsList += 'DuckDuckGo is built-in and works without API keys - use it!\n';
    }
  }

  toolsList += '- Don\'t repeat the same tools!\n';
  toolsList += '- Vary your approach based on the question\n';
  toolsList += '=== END TOOLS LIST ===\n';

  return toolsList;
}

/**
 * Add question type hints to planner prompt
 * Power of 10 Rule 3: < 60 lines
 */
export function addQuestionTypeHints(
  plannerPrompt: string,
  userMessage: string
): string {
  const codebaseKeywords = /(lightningflow|lightning flow|scorpion|n8n|workflow|codebase|project|app|code|implementation|repository|repo|package|module)/i;
  const operationalKeywords = /(system health|check system|system status|show logs|recent errors|system metrics|uptime|health check)/i;
  const workflowKeywords = /(trigger workflow|run workflow|workflow status|execute workflow|workflow id)/i;
  const analysisKeywords = /(analyze project|project structure|dependencies|project health|project analysis)/i;
  const fileQueryKeywords = /(recent files|last uploaded files|uploaded files|accessed files|show me files|what files|file list|JPEG|PNG|image|what does the image contain|what's in the image)/i;

  const isCodebaseQuestionCheck = codebaseKeywords.test(userMessage);
  const isOperationalQuestion = operationalKeywords.test(userMessage);
  const isWorkflowQuestion = workflowKeywords.test(userMessage);
  const isAnalysisQuestion = analysisKeywords.test(userMessage);
  const isFileQuery = fileQueryKeywords.test(userMessage);

  if (isFileQuery) {
    plannerPrompt += `\n\n🚨 CRITICAL: This is a FILE QUERY. You MUST use files.recent() FIRST - NEVER use kb.search, project.analyze, or research.run for file tracking queries! If files.recent() returns images (isImage=true), you MUST process them with knowledge.get() or ocr.extract() to tell the user what they contain.`;
  } else if (isCodebaseQuestionCheck) {
    const isResearchQueryHint = /(research|find.*latest|latest.*news|current.*news|recent.*news|bitcoin|ethereum|crypto|stock|market|macro.*economic|give.*top.*with.*links)/i.test(userMessage);
    if (isResearchQueryHint) {
      plannerPrompt += `\n\n🚨🚨🚨 CRITICAL: THIS IS A RESEARCH QUERY! 🚨🚨🚨\n`;
      plannerPrompt += `YOU MUST USE research.run TOOL - DO NOT USE project.analyze, code.readFile, or kb.search!\n`;
      plannerPrompt += `Create a plan step with tool: "research.run" and args: { query: "${userMessage}", depth: "medium", maxSites: 5 }\n`;
      plannerPrompt += `DO NOT create a plan that just responds - research queries REQUIRE tool usage!\n`;
    } else {
      plannerPrompt += `\n\n💡 HINT: This appears to be a codebase question. Consider using code.readFile or project.analyze to get direct information. Vary your approach - don't always start with kb.search. Be creative with which files you read!`;
    }
  } else if (isOperationalQuestion) {
    plannerPrompt += `\n\n💡 HINT: This appears to be an operational question. Consider system.health, logs.tail, or project.analyze - choose the tool(s) that best answer the question. Vary your approach!`;
  } else if (isWorkflowQuestion) {
    plannerPrompt += `\n\n💡 HINT: This appears to be a workflow question. Consider workflows.trigger or project.analyze - adapt to what information you need. Try different approaches!`;
  } else if (isAnalysisQuestion) {
    plannerPrompt += `\n\n💡 HINT: This appears to be an analysis question. Consider project.analyze, code.readFile, or logs.tail - mix tools creatively for comprehensive analysis!`;
  } else {
    plannerPrompt += `\n\n💡 HINT: Think creatively about tool selection. Vary your approach - don't repeat the same plan structure. Consider multiple tools and different sequences!`;
  }

  return plannerPrompt;
}

