// apps/scorpion/app/api/chat/stream/helpers/summarizerContext.ts
// Phase 4.3: Summarizer Context Builder - Extract context building from processStreamStart.ts
// Power of 10 Rule 4: Focused module for building summarizer context

import type { ProcessedResults } from './resultProcessor';

export interface SummarizerContextOptions {
  userMessage: string;
  questionType: string;
  intent: any;
  plan: any;
  results: any[];
  processedResults: ProcessedResults;
  prioritizedKnowledgeHits: any[];
  knowledgeSearchQuery: string;
  isCasual: boolean;
  isWhatIsQuestion: boolean;
  isFileQuery: boolean;
  needsCouncil: boolean;
  votes: any[];
  consensus: any;
  hasResearchKeys: boolean;
  executorResult?: any;
}

export interface SummarizerContext {
  summaryContext: string;
  hasKnowledge: boolean;
  hasResearch: boolean;
  hasSystemHealth: boolean;
  hasLogs: boolean;
  hasProjectAnalyze: boolean;
  hasFilesRecent: boolean;
  hasActualFiles: boolean;
  hasResults: boolean;
}

/**
 * Build comprehensive context for the summarizer phase
 *
 * Extracted from: processStreamStart.ts lines ~2480-3180
 *
 * This function:
 * - Builds tool testing results summary
 * - Adds question context
 * - Formats plan execution details
 * - Adds code.readFile results (highest priority)
 * - Formats system health, logs, project analysis results
 * - Formats files.recent results with special file query instructions
 * - Formats knowledge hits with README prioritization
 * - Formats research sources with anti-hallucination instructions
 * - Adds "what is" question specific instructions
 *
 * @param options - Context building options
 * @returns SummarizerContext with formatted context string
 */
export function buildSummarizerContext(
  options: SummarizerContextOptions
): SummarizerContext {
  const {
    userMessage,
    questionType,
    intent,
    plan,
    results,
    processedResults,
    prioritizedKnowledgeHits,
    knowledgeSearchQuery,
    isCasual,
    isWhatIsQuestion,
    isFileQuery,
    needsCouncil,
    votes,
    consensus,
    hasResearchKeys,
    executorResult,
  } = options;

  const {
    codeReadResults,
    researchResults,
    researchSources,
    systemHealthResults,
    logsResults,
    projectAnalyzeResults,
    filesRecentResults,
  } = processedResults;

  // Calculate what results we have
  const hasKnowledge = prioritizedKnowledgeHits.length > 0;
  const hasResearch = researchResults.length > 0;
  const hasSystemHealth = systemHealthResults.length > 0;
  const hasLogs = logsResults.length > 0;
  const hasProjectAnalyze = projectAnalyzeResults.length > 0;
  const hasFilesRecent = filesRecentResults.length > 0;
  const hasActualFiles = hasFilesRecent && filesRecentResults.some(r => r.files && Array.isArray(r.files) && r.files.length > 0);
  const hasResults = hasKnowledge || hasResearch || hasSystemHealth || hasLogs || hasProjectAnalyze || codeReadResults.length > 0 || hasActualFiles;

  const finalQuestionType = questionType;
  let summaryContext = '';

  // For tool testing requests, add comprehensive tool result summary
  const isToolTestingRequest = /(test.*all.*tool|test.*your.*tool|test.*every.*tool|test.*each.*tool|verify.*all.*tool|check.*all.*tool)/i.test(userMessage);
  if (isToolTestingRequest && results && results.length > 0) {
    summaryContext += `TOOL TESTING RESULTS:\n\n`;

    const successfulTools: string[] = [];
    const failedTools: Array<{ tool: string; error: string }> = [];

    results.forEach((r: any) => {
      const step = plan.plan.find((s: any) => s && s.id === r.step);
      const toolName = step?.tool || r.step;

      if (r.result?.ok === true) {
        successfulTools.push(toolName);
      } else {
        const errorMsg = r.result?.error?.message || r.result?.error || 'Unknown error';
        failedTools.push({ tool: toolName, error: errorMsg });
      }
    });

    summaryContext += `✅ SUCCESSFUL TOOLS (${successfulTools.length}):\n`;
    successfulTools.forEach(tool => {
      summaryContext += `- ${tool}\n`;
    });

    if (failedTools.length > 0) {
      summaryContext += `\n❌ FAILED TOOLS (${failedTools.length}):\n`;
      failedTools.forEach(({ tool, error }) => {
        summaryContext += `- ${tool}: ${error}\n`;
      });
    }

    summaryContext += `\nSUMMARY: Tested ${results.length} tools. ${successfulTools.length} succeeded, ${failedTools.length} failed.\n\n`;
    summaryContext += `CRITICAL: Report the exact results above. List which tools succeeded and which failed with their error messages. Do not make up results or use generic language.\n\n`;
  }

  // Add question context in natural format
  summaryContext += `User Question: ${userMessage}\n`;
  summaryContext += `Question Type: ${finalQuestionType}\n`;
  if (needsCouncil) {
    summaryContext += `Expert review was consulted\n`;
  }

  // Add note if research was requested but tools are unavailable
  const isResearchQueryForSummary = /(research|find.*latest|latest.*news|current.*news|recent.*news|bitcoin|ethereum|crypto|stock|market|macro.*economic|give.*top.*with.*links)/i.test(userMessage.toLowerCase());
  if (isResearchQueryForSummary && !hasResearchKeys) {
    summaryContext += `\n⚠️ NOTE: This appears to be a research query, but research tools are currently unavailable (no API keys configured: TAVILY_API_KEY, NEWS_API_KEY, or SERPAPI_KEY). I've searched the knowledge base instead, but for real-time news and information, please configure a research API key.\n`;
  }

  summaryContext += `\n`;

  // Add plan details in natural language
  summaryContext += `To answer this question, I:\n`;
  plan.plan.forEach((step: any) => {
    const stepResult = results.find((r: any) => r.step === step.id);
    const toolName = step.tool.replace(/\./g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    const status = stepResult?.result?.ok ? 'successfully completed' : stepResult ? 'encountered an issue' : 'was not executed';
    summaryContext += `- ${toolName}: ${status}`;
    if (step.title) {
      summaryContext += ` (${step.title})`;
    }
    summaryContext += `\n`;
  });
  summaryContext += `\n`;

  // Build comprehensive context with code.readFile results (HIGHEST PRIORITY)
  if (codeReadResults.length > 0) {
    console.log('[Summarizer Context] Adding code.readFile results to summarizer context');
    summaryContext += `Code files reviewed (${codeReadResults.length} file${codeReadResults.length > 1 ? 's' : ''}):\n`;
    codeReadResults.forEach((file, idx) => {
      console.log(`[Summarizer Context] Adding file ${idx + 1}/${codeReadResults.length}: ${file.path} (${file.content.length} chars)`);
      summaryContext += `\nFile: ${file.path}`;
      if (file.language) {
        summaryContext += ` (${file.language})`;
      }
      summaryContext += `\n`;
      // CRITICAL: Include actual content, not empty string
      if (file.content && file.content.length > 0) {
        summaryContext += `${file.content}\n`;
      } else {
        console.warn(`[Summarizer Context] File ${file.path} has no content!`);
        summaryContext += `[File content not available]\n`;
      }
      if (file.dependencies && file.dependencies.length > 0) {
        summaryContext += `Dependencies: ${file.dependencies.join(', ')}\n`;
      }
      if (file.ast) {
        const classes = file.ast.classes?.length || 0;
        const functions = file.ast.functions?.length || 0;
        if (classes > 0 || functions > 0) {
          summaryContext += `Structure: ${classes} class${classes !== 1 ? 'es' : ''}, ${functions} function${functions !== 1 ? 's' : ''}\n`;
        }
      }
    });
    summaryContext += `\nIMPORTANT: Use the actual code content above to provide specific, detailed answers. Reference actual function names, endpoints, and file paths from the code. Explain what the code does with concrete examples, not generic descriptions.\n\n`;
  }

  if (isCasual) {
    // For casual questions, prioritize knowledge base results over council consensus
    summaryContext += `User Question: ${userMessage}\n\n`;

    // Add system health results if available
    if (hasSystemHealth) {
      summaryContext += formatSystemHealthResults(systemHealthResults);
    }

    // Add logs results if available
    if (hasLogs) {
      summaryContext += formatLogsResults(logsResults);
    } else if (intent === 'system_debug' && userMessage.toLowerCase().includes('log')) {
      // If logs were requested but not found, explain why
      summaryContext += `\n⚠️ Logs query detected but no logs.tail tool results found. The logs.tail tool may not have been executed or may have failed.\n\n`;
    }

    // Add project analysis results if available
    if (hasProjectAnalyze) {
      summaryContext += formatProjectAnalyzeResults(projectAnalyzeResults);
    }

    // Add files.recent results if available (CRITICAL for file queries)
    if (hasFilesRecent) {
      summaryContext += formatFilesRecentResults(filesRecentResults, isFileQuery);
    } else if (isFileQuery) {
      // File query but no files found
      summaryContext += `No recent files were found.\n\n`;
      summaryContext += `CRITICAL: The user asked about recent files, but no files were found. Clearly state that no recent files are available.\n\n`;
    }

    // Format knowledge hits
    if (hasKnowledge) {
      summaryContext += formatKnowledgeHits(prioritizedKnowledgeHits);
    } else {
      // Only mention KB search failure if we don't have research sources
      if (researchSources.length === 0) {
        summaryContext += `Knowledge base search: No results found for "${knowledgeSearchQuery || 'the query'}"\n\n`;
      } else {
        summaryContext += `Knowledge base search: No results found (using web research instead)\n\n`;
      }
    }

    // Add research sources to context (CRITICAL for research queries)
    if (researchSources.length > 0) {
      summaryContext += formatResearchSources(researchSources, executorResult);
    } else {
      summaryContext += formatNoResearchSourcesInstructions(hasResearch, researchResults, intent);
    }

    if (hasResearch) {
      summaryContext += `Web Research: Research session started. Check ${researchResults[0]?.viewUrl || 'research page'} for detailed findings.\n\n`;
    }

    // For "what is" questions, prioritize code files and README
    if (isWhatIsQuestion) {
      summaryContext += formatWhatIsInstructions(codeReadResults, hasKnowledge, needsCouncil, votes, consensus, userMessage);
    } else {
      summaryContext += formatGeneralInstructions(needsCouncil, votes, consensus);
    }
  } else {
    // Technical questions - use natural, conversational format
    summaryContext = `User Question: ${plan.objective || userMessage}\n\n`;

    // Describe what was done in natural language
    summaryContext += `To answer this question, I:\n`;
    plan.plan.forEach((step: any) => {
      const stepResult = results.find((r: any) => r.step === step.id);
      const status = stepResult?.result?.ok ? 'successfully completed' : stepResult ? 'encountered an issue' : 'was not executed';
      const toolName = step.tool.replace(/\./g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      summaryContext += `- ${toolName}: ${status}\n`;
    });
    summaryContext += `\n`;

    // Add results in natural format - extract key information
    const successfulResults = results.filter((r: any) => r.result?.ok);
    if (successfulResults.length > 0) {
      summaryContext += `Key findings:\n`;
      successfulResults.forEach((result: any) => {
        const step = plan.plan.find((s: any) => s.id === result.step);
        if (step) {
          const toolName = step.tool.replace(/\./g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
          const resultData = result.result;
          if (resultData) {
            const resultDataValue = resultData.data;
            if (resultDataValue) {
              const dataText = typeof resultDataValue === 'string' ? resultDataValue.substring(0, 200) : 'Results available';
              summaryContext += `- ${toolName} found: ${dataText}\n`;
            } else {
              const resultMessage = resultData.message;
              if (resultMessage) {
                summaryContext += `- ${toolName}: ${resultMessage}\n`;
              }
            }
          }
        }
      });
      summaryContext += `\n`;
    }

    // Council deliberation in natural format
    if (needsCouncil && votes.length > 0) {
      summaryContext += formatCouncilVotes(votes, consensus);
    } else if (consensus.summary) {
      summaryContext += `Expert consensus: ${consensus.summary}\n\n`;
    }

    // Knowledge base results in natural format
    if (hasKnowledge && prioritizedKnowledgeHits.length > 0) {
      summaryContext += `Found ${prioritizedKnowledgeHits.length} relevant document${prioritizedKnowledgeHits.length > 1 ? 's' : ''}:\n`;
      prioritizedKnowledgeHits.forEach((h: any) => {
        summaryContext += `- ${h.title}${h.url ? ` (${h.url})` : ''}\n`;
      });
      summaryContext += `\n`;
    }

    // Add files.recent results for technical questions too
    if (hasFilesRecent) {
      summaryContext += formatFilesRecentResultsSimple(filesRecentResults);
    }

    summaryContext += `IMPORTANT:
- Answer the question in a natural, conversational way
- Use the information above to provide a clear, helpful answer
- Be specific about what was found, but explain it simply
- NO technical jargon or raw data dumps
- Write like you're explaining to a colleague, not writing a technical report
- Keep it simple and friendly`;
  }

  return {
    summaryContext,
    hasKnowledge,
    hasResearch,
    hasSystemHealth,
    hasLogs,
    hasProjectAnalyze,
    hasFilesRecent,
    hasActualFiles,
    hasResults,
  };
}

// Helper functions for formatting specific result types

function formatSystemHealthResults(systemHealthResults: any[]): string {
  let context = `System status:\n`;
  systemHealthResults.forEach((result) => {
    const health = result.data || result;

    context += `Status: ${health.status || 'unknown'}\n`;
    if (health.uptime) {
      const hours = Math.floor(health.uptime / 3600);
      const minutes = Math.floor((health.uptime % 3600) / 60);
      context += `Uptime: ${hours}h ${minutes}m\n`;
    }
    if (health.services) {
      const serviceNames = Object.keys(health.services);
      if (serviceNames.length > 0) {
        context += `Services: ${serviceNames.join(', ')}\n`;
      }
    }
    if (health.agents) {
      context += `Agents: ${health.agents.active || 0} active out of ${health.agents.total || 0} total\n`;
    }
    if (health.workflows) {
      context += `Workflows: ${health.workflows.active || 0} active out of ${health.workflows.total || 0} total\n`;
    }
    if (health.alerts && Array.isArray(health.alerts) && health.alerts.length > 0) {
      context += `Alerts: ${health.alerts.length} alert${health.alerts.length > 1 ? 's' : ''} found\n`;
      health.alerts.slice(0, 3).forEach((alert: any) => {
        context += `- ${alert.message || alert.type || 'Alert'}\n`;
      });
    }
  });
  context += `\n`;
  return context;
}

function formatLogsResults(logsResults: any[]): string {
  let context = `Recent logs (${logsResults.reduce((sum, r) => {
    const logs = r.logs || r.data?.logs || [];
    return sum + (r.count || r.data?.count || logs.length || 0);
  }, 0)} entries):\n`;

  logsResults.forEach((result) => {
    const logs = result.logs || result.data?.logs || [];
    if (Array.isArray(logs) && logs.length > 0) {
      logs.slice(0, 10).forEach((log: any) => {
        const level = log.level || 'info';
        const message = log.message || log.content || 'Log entry';
        const timestamp = log.timestamp || log.time || '';
        context += `${timestamp ? `[${timestamp}] ` : ''}[${level}] ${message}\n`;
      });
    } else {
      context += `No log entries found.\n`;
    }
  });
  context += `\nCRITICAL: Summarize key errors, warnings, and patterns from the logs above. Don't just list them - explain what they mean.\n\n`;
  return context;
}

function formatProjectAnalyzeResults(projectAnalyzeResults: any[]): string {
  let context = `Project analysis:\n`;
  projectAnalyzeResults.forEach((result) => {
    if (result.summary) {
      const summary = typeof result.summary === 'string' ? result.summary : JSON.stringify(result.summary);
      context += `${summary}\n`;
    }
    const health = result.health;
    if (health) {
      const healthScore = health.score;
      context += `Health score: ${healthScore || 'N/A'}/10\n`;

      const healthIssues = health.issues;
      if (healthIssues && Array.isArray(healthIssues) && healthIssues.length > 0) {
        context += `Issues found: ${healthIssues.length}\n`;
        healthIssues.slice(0, 3).forEach((issue: any) => {
          const issueText = typeof issue === 'string' ? issue : issue.message || issue.type || 'Issue';
          context += `- ${issueText}\n`;
        });
      }

      const healthRecommendations = health.recommendations;
      if (healthRecommendations && Array.isArray(healthRecommendations) && healthRecommendations.length > 0) {
        context += `Recommendations:\n`;
        healthRecommendations.slice(0, 3).forEach((rec: any) => {
          const recText = typeof rec === 'string' ? rec : rec.message || rec.text || 'Recommendation';
          context += `- ${recText}\n`;
        });
      }
    }
  });
  context += `\n`;
  return context;
}

function formatFilesRecentResults(filesRecentResults: any[], isFileQuery: boolean): string {
  let context = `Recently uploaded/accessed files:\n`;

  filesRecentResults.forEach((result) => {
    if (result.files && Array.isArray(result.files) && result.files.length > 0) {
      context += `Found ${result.files.length} file${result.files.length > 1 ? 's' : ''}:\n`;
      result.files.forEach((file: any, index: number) => {
        context += `${index + 1}. ${file.path || 'Unknown file'}`;
        if (file.ageMinutes !== undefined) {
          const hours = Math.floor(file.ageMinutes / 60);
          const minutes = file.ageMinutes % 60;
          if (hours > 0) {
            context += ` (${hours}h ${minutes}m ago)`;
          } else {
            context += ` (${minutes}m ago)`;
          }
        }
        if (file.size) {
          const sizeKB = Math.round(file.size / 1024);
          context += ` - ${sizeKB}KB`;
        }
        if (file.isImage) {
          context += ` [IMAGE]`;
        }
        if (file.contentType) {
          context += ` (${file.contentType})`;
        }
        context += `\n`;
        if (file.contentPreview && file.contentPreview.length > 0) {
          context += `   Preview: ${file.contentPreview.substring(0, 200)}${file.contentPreview.length > 200 ? '...' : ''}\n`;
        }
      });
      context += `\n`;
    } else {
      context += `No recent files found.\n\n`;
    }
  });

  // Add special instructions for file queries
  if (isFileQuery) {
    const hasActualFiles = filesRecentResults.some(r => r.files && Array.isArray(r.files) && r.files.length > 0);
    if (hasActualFiles) {
      const totalFiles = filesRecentResults.reduce((sum, r) => sum + (r.files?.length || 0), 0);
      context += `\n🚨 CRITICAL FILE QUERY INSTRUCTIONS - FILES FOUND (${totalFiles} file${totalFiles > 1 ? 's' : ''}):\n`;
      context += `YOU MUST RESPOND WITH THE EXACT FILE LIST FROM ABOVE.\n`;
      context += `RESPONSE FORMAT (MANDATORY):\n`;
      context += `1. Start with: "Here are the ${totalFiles} recent file${totalFiles > 1 ? 's' : ''}:"\n`;
      context += `2. List each file EXACTLY as shown above with:\n`;
      context += `   - File number (1, 2, 3...)\n`;
      context += `   - Full file path\n`;
      context += `   - Timestamp (Xh Ym ago)\n`;
      context += `   - File size if available\n`;
      context += `   - File type if available\n`;
      context += `3. DO NOT use vague language like "looks like", "seems like", "appears"\n`;
      context += `4. DO NOT generalize - list the EXACT files\n`;
      context += `5. DO NOT say "we don't have files" - you HAVE ${totalFiles} file${totalFiles > 1 ? 's' : ''} listed above\n`;
      context += `EXAMPLE: "Here are the 2 recent files:\n1. /path/to/file1.txt (5m ago) - 2KB\n2. /path/to/file2.jpg (10m ago) [IMAGE]"\n\n`;
    } else {
      context += `\n🚨🚨🚨 CRITICAL FILE QUERY INSTRUCTIONS - NO FILES FOUND 🚨🚨🚨\n`;
      context += `The files.recent tool executed successfully but returned an EMPTY files array (files.length = 0, total = 0).\n`;
      context += `THIS MEANS THERE ARE ZERO FILES - NOT "looks like" or "seems like" - ZERO FILES.\n\n`;
      context += `YOUR RESPONSE MUST START WITH EXACTLY ONE OF THESE:\n`;
      context += `1. "No recent files were found."\n`;
      context += `2. "There are no recently uploaded files."\n`;
      context += `3. "No files have been uploaded recently."\n\n`;
      context += `FORBIDDEN PHRASES (DO NOT USE):\n`;
      context += `- "looks like we don't have any files"\n`;
      context += `- "it seems there are no files"\n`;
      context += `- "we don't have any files to share"\n`;
      context += `- "looks like we don't have any recently uploaded files"\n`;
      context += `- "it appears there are no files"\n`;
      context += `- Any phrase with "looks like", "seems like", "appears", "might be"\n\n`;
      context += `REQUIRED: State the fact directly. Be concise. One sentence is enough.\n\n`;
    }
  }

  return context;
}

function formatFilesRecentResultsSimple(filesRecentResults: any[]): string {
  let context = `Recently uploaded/accessed files:\n`;

  filesRecentResults.forEach((result) => {
    if (result.files && Array.isArray(result.files) && result.files.length > 0) {
      context += `Found ${result.files.length} file${result.files.length > 1 ? 's' : ''}:\n`;
      result.files.forEach((file: any, index: number) => {
        context += `${index + 1}. ${file.path || 'Unknown file'}`;
        if (file.ageMinutes !== undefined) {
          const hours = Math.floor(file.ageMinutes / 60);
          const minutes = file.ageMinutes % 60;
          if (hours > 0) {
            context += ` (${hours}h ${minutes}m ago)`;
          } else {
            context += ` (${minutes}m ago)`;
          }
        }
        if (file.size) {
          const sizeKB = Math.round(file.size / 1024);
          context += ` - ${sizeKB}KB`;
        }
        if (file.isImage) {
          context += ` [IMAGE]`;
        }
        context += `\n`;
      });
      context += `\n`;
    } else {
      context += `No recent files found.\n\n`;
    }
  });

  return context;
}

function formatKnowledgeHits(prioritizedKnowledgeHits: any[]): string {
  let context = '';

  const readmeHits = prioritizedKnowledgeHits.filter((h: any) => h.isReadme);
  const otherHits = prioritizedKnowledgeHits.filter((h: any) => !h.isReadme);

  context += `Found ${prioritizedKnowledgeHits.length} relevant document${prioritizedKnowledgeHits.length > 1 ? 's' : ''}:\n\n`;

  if (readmeHits.length > 0) {
    context += `README files (primary source - use these first):\n`;
    readmeHits.forEach((h: any) => {
      context += `- ${h.title || 'Untitled'}`;
      if (h.url) {
        context += ` (${h.url})`;
      }
      context += `\n`;
      if (h.spans?.[0]?.text) {
        context += `  ${h.spans[0].text.substring(0, 300)}${h.spans[0].text.length > 300 ? '...' : ''}\n`;
      }
    });
    context += `\n`;
  }

  if (otherHits.length > 0) {
    context += `Additional documents:\n`;
    otherHits.forEach((h: any) => {
      context += `- ${h.title || 'Untitled'}`;
      if (h.url) {
        context += ` (${h.url})`;
      }
      context += `\n`;
      if (h.spans?.[0]?.text) {
        context += `  ${h.spans[0].text.substring(0, 200)}${h.spans[0].text.length > 200 ? '...' : ''}\n`;
      }
    });
    context += `\n`;
  }

  return context;
}

function formatResearchSources(researchSources: any[], executorResult?: any): string {
  let context = '';

  console.log(`[Summarizer Context] ✅ Adding ${researchSources.length} research sources to summarizer context`);

  // Merge with executor knowledge hits if available
  const mergedSources = [...researchSources];
  if (executorResult && executorResult.scratchpad?.knowledge?.length > 0) {
    const executorSources = executorResult.scratchpad.knowledge;
    console.log(`[Summarizer Context] ✅ Also injecting ${executorSources.length} knowledge hits from executor`);
    const existingUrls = new Set(researchSources.map((s: any) => s.url));
    executorSources.forEach((hit: any) => {
      if (!existingUrls.has(hit.url)) {
        mergedSources.push({
          title: hit.title,
          url: hit.url,
          snippet: hit.snippet,
          score: hit.score,
          publishedAt: hit.publishedAt,
          source: hit.source,
        });
      }
    });
  }

  // CRITICAL: Put research sources FIRST and make them prominent
  context += `\n🚨🚨🚨 PRIMARY SOURCE: WEB RESEARCH RESULTS 🚨🚨🚨\n`;
  context += `RESEARCH COMPLETED SUCCESSFULLY - ${mergedSources.length} SOURCES FOUND\n`;
  context += `YOU HAVE CONCRETE RESEARCH RESULTS BELOW - USE THEM AS YOUR PRIMARY ANSWER\n\n`;

  context += `Web Research Sources (${mergedSources.length}):\n\n`;
  mergedSources.slice(0, 10).forEach((source: any, idx: number) => {
    const title = source.title || 'Untitled';
    const url = source.url || '';
    const snippet = source.snippet || '';

    // Format as markdown link for easy reference
    context += `${idx + 1}. [${title}](${url})\n`;
    if (snippet) {
      context += `   ${snippet.substring(0, 200)}${snippet.length > 200 ? '...' : ''}\n`;
    }
    if (source.score) {
      context += `   Relevance: ${(source.score * 100).toFixed(0)}%\n`;
    }
    context += `\n`;
  });

  if (mergedSources.length > 10) {
    context += `\n*Showing top 10 of ${mergedSources.length} research sources.*\n\n`;
  }

  // CRITICAL: Explicitly instruct summarizer to include links in response
  context += `\n🚨🚨🚨 CRITICAL RESEARCH QUERY INSTRUCTIONS 🚨🚨🚨\n`;
  context += `YOU HAVE ${mergedSources.length} RESEARCH SOURCES ABOVE - THEY ARE YOUR PRIMARY ANSWER\n`;
  context += `\nMANDATORY RESPONSE REQUIREMENTS:\n`;
  context += `1. START your answer with a confident synthesis based on the research sources above\n`;
  context += `2. You MUST include at least 2-3 source links formatted as markdown: [Title](URL)\n`;
  context += `3. Use the actual titles and URLs from the sources listed above\n`;
  context += `4. Include the top ${Math.min(3, mergedSources.length)} most relevant sources\n`;
  context += `5. Synthesize the information from the snippets/summaries provided\n\n`;
  context += `FORBIDDEN PHRASES (DO NOT USE):\n`;
  context += `- "I couldn't find sources" - YOU HAVE ${mergedSources.length} SOURCES ABOVE\n`;
  context += `- "no results were found" - YOU HAVE RESULTS ABOVE\n`;
  context += `- "unfortunately, I couldn't find" - YOU HAVE SOURCES\n`;
  context += `- "I don't have access to" - YOU HAVE RESEARCH RESULTS\n`;
  context += `- Any phrase suggesting sources weren't found\n\n`;
  context += `CORRECT APPROACH:\n`;
  context += `- Start confidently: "Based on recent research, here's what I found..."\n`;
  context += `- Synthesize the key findings from the snippets above\n`;
  context += `- List sources as: "Here are the top sources:\n  1. [Title](URL)\n  2. [Title](URL)\n  3. [Title](URL)"\n\n`;

  return context;
}

function formatNoResearchSourcesInstructions(hasResearch: boolean, researchResults: any[], intent: any): string {
  let context = '';

  const researchWasAttempted = hasResearch && researchResults.length > 0;
  const isResearchQuery = intent === 'general_question' || intent === 'project_help';

  if (researchWasAttempted && isResearchQuery) {
    // Research was attempted but returned no sources
    console.warn(`[Summarizer Context] ⚠️ NO research sources to add to summarizer context!`);

    context += `\n🚨🚨🚨🚨🚨 CRITICAL: WEB RESEARCH FAILED OR RETURNED NO RESULTS 🚨🚨🚨🚨🚨\n`;
    context += `\nTHE WEB RESEARCH TOOL WAS EXECUTED BUT RETURNED ZERO VALID SOURCES.\n`;
    context += `THIS MEANS YOU HAVE ABSOLUTELY NO WEB RESEARCH RESULTS AVAILABLE.\n`;
    context += `YOU CANNOT AND MUST NOT INVENT OR HALLUCINATE SOURCES.\n\n`;

    context += `🚨 STRICT RESPONSE REQUIREMENTS (MANDATORY):\n`;
    context += `1. You MUST start your response with: "I was unable to find web sources for this query" or "Web research returned no results"\n`;
    context += `2. You MUST NOT invent, fabricate, or hallucinate ANY source URLs\n`;
    context += `3. You MUST NOT cite Bloomberg, Reuters, IMF, NYT, WSJ, or ANY publication without a real URL provided above\n`;
    context += `4. You MUST NOT create fake links like "https://www.bloomberg.com/..." or any other domain\n`;
    context += `5. You MUST NOT pretend you found sources when you didn't\n`;
    context += `6. Instead, you MUST offer to help refine the search or suggest alternative approaches\n\n`;

    context += `🚨 FORBIDDEN BEHAVIORS (DO NOT DO THESE):\n`;
    context += `- Creating fake URLs of any kind\n`;
    context += `- Inventing article titles or publication names\n`;
    context += `- Using phrases like "According to Bloomberg" or "A report by Reuters" without real sources\n`;
    context += `- Saying "I found some interesting articles" when you have no sources\n`;
    context += `- Providing any markdown links [Title](URL) unless the URL was provided above\n`;
    context += `- Making up citations or references\n\n`;

    context += `✅ CORRECT RESPONSE FORMAT:\n`;
    context += `"I attempted to search for web sources on this topic, but the search didn't return any results. This could be due to:\n`;
    context += `- Search service connectivity issues\n`;
    context += `- The query might need refinement\n`;
    context += `- The topic might be too specific or recent\n\n`;
    context += `Would you like me to help refine the search query, or would you like to ask a different question?"\n\n`;

    context += `🚨 FINAL REMINDER: If you don't have real sources in the context above, you HAVE NO SOURCES. Do not invent them.\n\n`;
  } else if (intent === 'system_debug') {
    // For system_debug queries
    context += `\n📊 SYSTEM STATUS QUERY INSTRUCTIONS:\n`;
    context += `This is a system health/status query. Use ONLY the system tool results provided above.\n\n`;
    context += `🚨 CRITICAL RULES FOR SYSTEM_DEBUG QUERIES:\n`;
    context += `- DO NOT mention "knowledge base search" or "we didn't find any results in search"\n`;
    context += `- DO NOT mention "web sources" or "research" - this is an internal system query\n`;
    context += `- DO NOT reference external websites or publications\n`;
    context += `- DO NOT suggest searching online or using web-based resources\n`;
    context += `- DO NOT say "we didn't find any results" - instead explain what the tools returned\n`;
    context += `- This query uses system.health and logs.tail tools, NOT knowledge base search\n\n`;
  }

  return context;
}

function formatWhatIsInstructions(
  codeReadResults: any[],
  hasKnowledge: boolean,
  needsCouncil: boolean,
  votes: any[],
  consensus: any,
  userMessage: string
): string {
  let context = '';

  if (codeReadResults.length > 0) {
    const isWorkflowQuestionInContext = /(workflow|n8n|execution|orchestration)/i.test(userMessage);
    const hasN8nCursorFiles = codeReadResults.some((f: any) => f.path.includes('n8n-cursor'));
    const hasLightningFlowFiles = codeReadResults.some((f: any) => f.path.includes('lightningflow'));

    context += `🚨 CRITICAL INSTRUCTIONS FOR "WHAT IS SCORPION" QUESTIONS 🚨
- The README.md file above is the ABSOLUTE PRIMARY SOURCE - use it EXACTLY as written
- DO NOT invent features, CLI tools, or capabilities that are NOT in the README.md
- DO NOT say Scorpion is "built on top of LightningFlow" - README.md says LightningFlow is a SIDE HUSTLE managed BY Scorpion
- DO NOT invent a "Scorpion CLI tool" - only mention tools/features that are EXPLICITLY in the README
- DO NOT make up workflow examples or code snippets - only use what's in the provided files
- Use the EXACT language from README.md: "Scorpion is the Central Operations Orchestrator"
- Follow the EXACT structure from README.md: Architecture section, Features, etc.
- OUTPUT FORMAT: Start with "Here is a detailed answer based on the provided code:" then provide comprehensive answer
- Include sections: What is Scorpion, Key Features, Architecture, How it Works (all from README.md)
- Quote directly from README.md when possible - preserve the exact meaning
- If README.md says "Scorpion (scorpion.local / port 3003) - Main operations console and orchestrator", use that EXACTLY
- NEVER confuse Scorpion with LightningFlow - Scorpion is the CENTRAL SYSTEM, LightningFlow is a SIDE HUSTLE it manages`;

    if (isWorkflowQuestionInContext) {
      if (hasN8nCursorFiles) {
        context += `\n\n🎯 WORKFLOW QUESTION CONTEXT - BE SPECIFIC:
- You have n8n-cursor backend files - these are CORRECT for workflow execution questions
- Use SPECIFIC DETAILS from workflow-worker.ts: function names, workflow types, queue processing logic
- Use SPECIFIC DETAILS from backend README.md: actual endpoints (POST /api/workflows/0/run), architecture flow, dependencies
- Use SPECIFIC DETAILS from package.json: actual dependency versions (bullmq@4.15.0, express@4.18.2, etc.)
- Use SPECIFIC DETAILS from index.ts: actual API routes, middleware, error handling
- This is the n8n workflow automation system, NOT LightningFlow or Salesforce
- QUOTE ACTUAL CODE: "processWorkflow() function", "5 workflow types: ai-saas, research, content, support, analytics", "BullMQ queue", "Redis status storage"
- USE ACTUAL PATHS: "apps/n8n-cursor/backend/src/workers/workflow-worker.ts", not "the worker file"`;
      } else if (hasLightningFlowFiles) {
        context += `\n\n⚠️ ERROR DETECTED:
- This is a workflow question but you received LightningFlow files instead of n8n-cursor files
- Acknowledge this error: "The plan attempted to read incorrect files. Based on available information..."
- Do NOT confuse LightningFlow with the workflow execution system
- Work with what's available but note the mismatch`;
      }
    }
  } else if (hasKnowledge) {
    context += formatCouncilDetails(needsCouncil, votes, consensus);
    context += `CRITICAL INSTRUCTIONS FOR "WHAT IS" QUESTIONS:
- The README FILES above are the PRIMARY SOURCE - use them FIRST and MOST IMPORTANTLY
- If README files are provided, use their exact definition
- Documents about "Global Consistency System", "Implementation Status", etc. are about INTERNAL SYSTEMS within the product, NOT what the product IS
- Only use council consensus if README files don't have the answer
- If README files conflict with council consensus, TRUST THE README FILES
- DO NOT confuse internal systems documentation with product definitions
- DO NOT ask for clarification - answer based on what you have
- OUTPUT FORMAT: Use a natural, conversational format. Write like explaining to a friend. NO technical jargon. Start with: "Scorpion is..." or "LightningFlow is..." based on the README definition.`;
  } else {
    context += formatCouncilDetails(needsCouncil, votes, consensus);
    context += `IMPORTANT: Answer the question directly and naturally based on the information above. Use a conversational tone.`;
  }

  return context;
}

function formatGeneralInstructions(needsCouncil: boolean, votes: any[], consensus: any): string {
  let context = formatCouncilDetails(needsCouncil, votes, consensus);

  context += `IMPORTANT:
- Use ONLY the information provided above (code files, knowledge base results, research, council consensus)
- If code files are available, they are the PRIMARY SOURCE - use them first
- If no knowledge base results were found, state that clearly
- If web research was started, mention that research is available
- Base your answer on the available sources
- DO NOT make up information that isn't in the sources above
- DO NOT ask for clarification - answer based on what you have
- If you don't have enough information, say so clearly but still provide what you can
- OUTPUT FORMAT: Use a natural, conversational format. Keep it simple and friendly. NO technical jargon.`;

  return context;
}

function formatCouncilDetails(needsCouncil: boolean, votes: any[], consensus: any): string {
  let context = '';

  if (needsCouncil && votes.length > 0) {
    context += `Expert review by ${votes.length} specialist${votes.length > 1 ? 's' : ''}:\n`;
    votes.forEach((vote: any) => {
      const agentName = vote.agentName || vote.agentId || 'Expert';
      const confidence = Math.round((vote.confidence || 0.7) * 100);
      context += `- ${agentName} (${confidence}% confident): ${vote.rationale || 'No specific comment'}\n`;
    });
    context += `\nOverall consensus: ${consensus.summary}\n\n`;
  } else if (consensus.summary) {
    context += `Expert consensus (for reference - prioritize README files above): ${consensus.summary}\n\n`;
  }

  return context;
}

function formatCouncilVotes(votes: any[], consensus: any): string {
  let context = `Expert review:\n`;
  votes.forEach((vote: any) => {
    const agentName = vote.agentName || vote.agentId || 'Expert';
    const confidence = Math.round((vote.confidence || 0.7) * 100);
    context += `- ${agentName} (${confidence}% confident): ${vote.rationale || 'No specific comment'}\n`;
  });
  context += `\nOverall consensus: ${consensus.summary}\n\n`;
  return context;
}
