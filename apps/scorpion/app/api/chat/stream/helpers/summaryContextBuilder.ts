// Power of 10 Rule 4: Extract summary context building to focused function
import type { Plan } from '@/lib/chat/types';
import type { KnowledgeHit } from '@/server/types/events';
import type { CouncilResult } from '@/server/types/council';

export interface SummaryContextInput {
    plan: Plan;
    results: Array<{ step: string; result: any }>;
    userMessage: string;
    intent: string;
    questionType: string;
    needsCouncil: boolean;
    votes: Array<{ member: string; approved: boolean; issues: number }>;
    consensus: { approved: boolean; score: number; summary: string; issues?: any[] };
    executorResult: { scratchpad: any; sumCtx: any; reason: string } | null;
    isFileQuery: boolean;
    hasResearchKeys: boolean;
    isCasual: boolean;
}

/**
 * Build summary context from execution results
 * Power of 10 Rule 4: Single responsibility - context building
 */
export function buildSummaryContext(input: SummaryContextInput): string {
    const {
        plan,
        results,
        userMessage,
        intent,
        questionType,
        needsCouncil,
        votes,
        consensus,
        executorResult,
        isFileQuery,
        hasResearchKeys,
        isCasual,
    } = input;

    // Extract code.readFile results from tool results
    const codeReadResults = results
        .filter(r => {
            if (!r || !r.step || !r.result) return false;
            const step = plan.plan.find(s => s && s.id === r.step);
            const isCodeRead = step?.tool === 'code.readFile';
            const isOk = r.result?.ok === true;
            return isCodeRead && isOk;
        })
        .map(r => {
            const step = plan.plan.find(s => s && s.id === r.step);
            return {
                path: step?.args?.['path'] || 'unknown',
                content: r.result?.content || '',
                ast: r.result?.ast,
                dependencies: Array.isArray(r.result?.dependencies) ? r.result.dependencies : [],
                language: r.result?.language || 'unknown'
            };
        });

    // Extract knowledge hits and research results from tool results
    const knowledgeHits = results
        .filter(r => {
            if (!r || !r.step || !r.result) return false;
            const step = plan.plan.find(s => s && s.id === r.step);
            return step?.tool === 'kb.search' && r.result?.ok === true && Array.isArray(r.result?.hits);
        })
        .flatMap(r => {
            const hits = r.result?.hits || [];
            return Array.isArray(hits) ? hits : [];
        });

    // Extract research.run results and their sources
    const researchResults = results
        .filter(r => {
            if (!r || !r.step || !r.result) return false;
            const step = plan.plan.find(s => s && s.id === r.step);
            const isResearchRun = step?.tool === 'research.run' && r.result?.ok === true && Array.isArray(r.result?.sources);
            const isResearchFallback = r.step === 'research_fallback' || (r.result?.ok === true && r.result?.sessionId);
            return isResearchRun || isResearchFallback;
        })
        .map(r => r.result)
        .filter(r => r && typeof r === 'object');

    // Collect all research sources for summarizer context
    const researchSources = researchResults
        .flatMap(r => {
            let sources: any[] = [];
            if (Array.isArray(r.sources)) {
                sources = r.sources;
            } else if (Array.isArray(r.data?.sources)) {
                sources = r.data.sources;
            } else if (Array.isArray(r.top3)) {
                sources = r.top3.map((item: any) => ({
                    title: item.title,
                    url: item.url,
                    snippet: item.snippet || item.excerpt || '',
                    score: item.score || item.relevance || 0.8,
                }));
            }
            return sources;
        })
        .filter((s: any) => s && s.url && typeof s.url === 'string' && s.url.length > 0)
        .map((s: any) => ({
            title: s.title || s.name || 'Untitled',
            url: s.url || s.link || '',
            snippet: s.snippet || s.excerpt || s.content || s.summary || '',
            score: s.score || s.relevance || s.relevanceScore || 0.8,
            publishedAt: s.publishedAt || s.date || null,
            source: s.source || s.domain || null,
        }));

    // Extract knowledge search query from plan steps
    const knowledgeSearchStep = plan.plan.find((s: any) => s.tool === 'kb.search');
    const knowledgeSearchQuery = knowledgeSearchStep?.args?.['query'] || userMessage;

    // Prioritize README files and main documentation for "what is" questions
    const userMessageLowerForWhatIs = userMessage.toLowerCase();
    const isWhatIsQuestion = /^(what is|who is|what are|who are|define|tell me about|explain what|explain who|more details|more analysis)/i.test(userMessageLowerForWhatIs) ||
        /^(what|who|which)\s+(is|are|was|were)/i.test(userMessageLowerForWhatIs);
    let prioritizedKnowledgeHits = knowledgeHits;

    if (isWhatIsQuestion && knowledgeHits.length > 0) {
        prioritizedKnowledgeHits = knowledgeHits
            .map((h: any) => ({
                ...h,
                isReadme: h.title?.toLowerCase().includes('readme') ||
                    h.id?.toLowerCase().includes('readme') ||
                    h.source?.toLowerCase().includes('readme') ||
                    h.url?.toLowerCase().includes('readme'),
                isInternalSystem: h.title?.toLowerCase().includes('consistency system') ||
                    h.title?.toLowerCase().includes('global consistency') ||
                    h.title?.toLowerCase().includes('implementation status') ||
                    h.title?.toLowerCase().includes('system status')
            }))
            .filter((h: any) => !h.isInternalSystem)
            .sort((a: any, b: any) => {
                if (a.isReadme && !b.isReadme) return -1;
                if (!a.isReadme && b.isReadme) return 1;
                return 0;
            });
    }

    // Extract tool results
    const systemHealthResults = results
        .filter(r => {
            if (!r || !r.step || !r.result) return false;
            const step = plan.plan.find(s => s && s.id === r.step);
            return step?.tool === 'system.health' && r.result?.ok === true;
        })
        .map(r => {
            const result = r.result;
            if (result.data && typeof result.data === 'object') {
                return { ...result.data, ok: result.ok };
            }
            return result;
        })
        .filter(r => r && typeof r === 'object');

    const logsResults = results
        .filter(r => {
            if (!r || !r.step || !r.result) return false;
            const step = plan.plan.find(s => s && s.id === r.step);
            return step?.tool === 'logs.tail' && r.result?.ok === true;
        })
        .map(r => {
            const result = r.result;
            if (result.data && typeof result.data === 'object') {
                return { ...result.data, ok: result.ok };
            }
            return result;
        })
        .filter(r => r && typeof r === 'object');

    const projectAnalyzeResults = results
        .filter(r => {
            if (!r || !r.step || !r.result) return false;
            const step = plan.plan.find(s => s && s.id === r.step);
            return step?.tool === 'project.analyze' && r.result?.ok === true;
        })
        .map(r => r.result)
        .filter(r => r && typeof r === 'object');

    const filesRecentResults = results
        .filter(r => {
            if (!r || !r.step || !r.result) return false;
            const step = plan.plan.find(s => s && s.id === r.step);
            return step?.tool === 'files.recent' && r.result?.ok === true && r.result?.files;
        })
        .map(r => r.result)
        .filter(r => r && typeof r === 'object' && Array.isArray(r.files));

    const hasKnowledge = prioritizedKnowledgeHits.length > 0;
    const hasResearch = researchResults.length > 0;
    const hasSystemHealth = systemHealthResults.length > 0;
    const hasLogs = logsResults.length > 0;
    const hasProjectAnalyze = projectAnalyzeResults.length > 0;
    const hasFilesRecent = filesRecentResults.length > 0;

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

    // Add question context
    summaryContext += `User Question: ${userMessage}\n`;
    summaryContext += `Question Type: ${questionType}\n`;
    if (needsCouncil) {
        summaryContext += `Expert review was consulted\n`;
    }

    // Add note if research was requested but tools are unavailable
    const isResearchQueryForSummary = /(research|find.*latest|latest.*news|current.*news|recent.*news|bitcoin|ethereum|crypto|stock|market|macro.*economic|give.*top.*with.*links)/i.test(userMessage.toLowerCase());
    if (isResearchQueryForSummary && !hasResearchKeys) {
        summaryContext += `\n⚠️ NOTE: This appears to be a research query, but research tools are currently unavailable (no API keys configured: TAVILY_API_KEY, NEWS_API_KEY, or SERPAPI_KEY). I've searched the knowledge base instead, but for real-time news and information, please configure a research API key.\n`;
    }

    summaryContext += `\n`;

    // Add plan details
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

    // Add code.readFile results
    if (codeReadResults.length > 0) {
        summaryContext += `Code files reviewed (${codeReadResults.length} file${codeReadResults.length > 1 ? 's' : ''}):\n`;
        codeReadResults.forEach((file, idx) => {
            summaryContext += `\nFile: ${file.path}`;
            if (file.language) {
                summaryContext += ` (${file.language})`;
            }
            summaryContext += `\n`;
            if (file.content && file.content.length > 0) {
                summaryContext += `${file.content}\n`;
            } else {
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
        // Casual questions logic
        summaryContext += `User Question: ${userMessage}\n\n`;

        if (hasSystemHealth) {
            summaryContext += `System status:\n`;
            systemHealthResults.forEach((result) => {
                const health = result.data || result;
                summaryContext += `Status: ${health.status || 'unknown'}\n`;
                if (health.uptime) {
                    const hours = Math.floor(health.uptime / 3600);
                    const minutes = Math.floor((health.uptime % 3600) / 60);
                    summaryContext += `Uptime: ${hours}h ${minutes}m\n`;
                }
                if (health.services) {
                    const serviceNames = Object.keys(health.services);
                    if (serviceNames.length > 0) {
                        summaryContext += `Services: ${serviceNames.join(', ')}\n`;
                    }
                }
                if (health.agents) {
                    summaryContext += `Agents: ${health.agents.active || 0} active out of ${health.agents.total || 0} total\n`;
                }
                if (health.workflows) {
                    summaryContext += `Workflows: ${health.workflows.active || 0} active out of ${health.workflows.total || 0} total\n`;
                }
                if (health.alerts && Array.isArray(health.alerts) && health.alerts.length > 0) {
                    summaryContext += `Alerts: ${health.alerts.length} alert${health.alerts.length > 1 ? 's' : ''} found\n`;
                    health.alerts.slice(0, 3).forEach((alert: any) => {
                        summaryContext += `- ${alert.message || alert.type || 'Alert'}\n`;
                    });
                }
            });
            summaryContext += `\n`;
        }

        if (hasLogs) {
            summaryContext += `Recent logs (${logsResults.reduce((sum, r) => {
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
                        summaryContext += `${timestamp ? `[${timestamp}] ` : ''}[${level}] ${message}\n`;
                    });
                } else {
                    summaryContext += `No log entries found.\n`;
                }
            });
            summaryContext += `\nCRITICAL: Summarize key errors, warnings, and patterns from the logs above. Don't just list them - explain what they mean.\n\n`;
        } else if (intent === 'system_debug' && userMessage.toLowerCase().includes('log')) {
            summaryContext += `\n⚠️ Logs query detected but no logs.tail tool results found. The logs.tail tool may not have been executed or may have failed.\n\n`;
        }

        if (hasProjectAnalyze) {
            summaryContext += `Project analysis:\n`;
            projectAnalyzeResults.forEach((result) => {
                if (result.summary) {
                    const summary = typeof result.summary === 'string' ? result.summary : JSON.stringify(result.summary);
                    summaryContext += `${summary}\n`;
                }
                const health = result.health;
                if (health) {
                    const healthScore = health.score;
                    summaryContext += `Health score: ${healthScore || 'N/A'}/10\n`;
                    const healthIssues = health.issues;
                    if (healthIssues && Array.isArray(healthIssues) && healthIssues.length > 0) {
                        summaryContext += `Issues found: ${healthIssues.length}\n`;
                        healthIssues.slice(0, 3).forEach((issue: any) => {
                            const issueText = typeof issue === 'string' ? issue : issue.message || issue.type || 'Issue';
                            summaryContext += `- ${issueText}\n`;
                        });
                    }
                    const healthRecommendations = health.recommendations;
                    if (healthRecommendations && Array.isArray(healthRecommendations) && healthRecommendations.length > 0) {
                        summaryContext += `Recommendations:\n`;
                        healthRecommendations.slice(0, 3).forEach((rec: any) => {
                            const recText = typeof rec === 'string' ? rec : rec.message || rec.text || 'Recommendation';
                            summaryContext += `- ${recText}\n`;
                        });
                    }
                }
            });
            summaryContext += `\n`;
        }

        if (hasFilesRecent) {
            summaryContext += `Recently uploaded/accessed files:\n`;
            filesRecentResults.forEach((result) => {
                if (result.files && Array.isArray(result.files) && result.files.length > 0) {
                    summaryContext += `Found ${result.files.length} file${result.files.length > 1 ? 's' : ''}:\n`;
                    result.files.forEach((file: any, index: number) => {
                        summaryContext += `${index + 1}. ${file.path || 'Unknown file'}`;
                        if (file.ageMinutes !== undefined) {
                            const hours = Math.floor(file.ageMinutes / 60);
                            const minutes = file.ageMinutes % 60;
                            if (hours > 0) {
                                summaryContext += ` (${hours}h ${minutes}m ago)`;
                            } else {
                                summaryContext += ` (${minutes}m ago)`;
                            }
                        }
                        if (file.size) {
                            const sizeKB = Math.round(file.size / 1024);
                            summaryContext += ` - ${sizeKB}KB`;
                        }
                        if (file.isImage) {
                            summaryContext += ` [IMAGE]`;
                        }
                        if (file.contentType) {
                            summaryContext += ` (${file.contentType})`;
                        }
                        summaryContext += `\n`;
                        if (file.contentPreview && file.contentPreview.length > 0) {
                            summaryContext += `   Preview: ${file.contentPreview.substring(0, 200)}${file.contentPreview.length > 200 ? '...' : ''}\n`;
                        }
                    });
                    summaryContext += `\n`;
                } else {
                    summaryContext += `No recent files found.\n\n`;
                }
            });

            if (isFileQuery) {
                const hasActualFiles = filesRecentResults.some(r => r.files && Array.isArray(r.files) && r.files.length > 0);
                if (hasActualFiles) {
                    const totalFiles = filesRecentResults.reduce((sum, r) => sum + (r.files?.length || 0), 0);
                    summaryContext += `\n🚨 CRITICAL FILE QUERY INSTRUCTIONS - FILES FOUND (${totalFiles} file${totalFiles > 1 ? 's' : ''}):\n`;
                    summaryContext += `YOU MUST RESPOND WITH THE EXACT FILE LIST FROM ABOVE.\n`;
                    summaryContext += `RESPONSE FORMAT (MANDATORY):\n`;
                    summaryContext += `1. Start with: "Here are the ${totalFiles} recent file${totalFiles > 1 ? 's' : ''}:"\n`;
                    summaryContext += `2. List each file EXACTLY as shown above with:\n`;
                    summaryContext += `   - File number (1, 2, 3...)\n`;
                    summaryContext += `   - Full file path\n`;
                    summaryContext += `   - Timestamp (Xh Ym ago)\n`;
                    summaryContext += `   - File size if available\n`;
                    summaryContext += `   - File type if available\n`;
                    summaryContext += `3. DO NOT use vague language like "looks like", "seems like", "appears"\n`;
                    summaryContext += `4. DO NOT generalize - list the EXACT files\n`;
                    summaryContext += `5. DO NOT say "we don't have files" - you HAVE ${totalFiles} file${totalFiles > 1 ? 's' : ''} listed above\n`;
                    summaryContext += `EXAMPLE: "Here are the 2 recent files:\n1. /path/to/file1.txt (5m ago) - 2KB\n2. /path/to/file2.jpg (10m ago) [IMAGE]"\n\n`;
                } else {
                    summaryContext += `\n🚨🚨🚨 CRITICAL FILE QUERY INSTRUCTIONS - NO FILES FOUND 🚨🚨🚨\n`;
                    summaryContext += `The files.recent tool executed successfully but returned an EMPTY files array (files.length = 0, total = 0).\n`;
                    summaryContext += `THIS MEANS THERE ARE ZERO FILES - NOT "looks like" or "seems like" - ZERO FILES.\n\n`;
                    summaryContext += `YOUR RESPONSE MUST START WITH EXACTLY ONE OF THESE:\n`;
                    summaryContext += `1. "No recent files were found."\n`;
                    summaryContext += `2. "There are no recently uploaded files."\n`;
                    summaryContext += `3. "No files have been uploaded recently."\n\n`;
                    summaryContext += `FORBIDDEN PHRASES (DO NOT USE):\n`;
                    summaryContext += `- "looks like we don't have any files"\n`;
                    summaryContext += `- "it seems there are no files"\n`;
                    summaryContext += `- "we don't have any files to share"\n`;
                    summaryContext += `- "looks like we don't have any recently uploaded files"\n`;
                    summaryContext += `- "it appears there are no files"\n`;
                    summaryContext += `- Any phrase with "looks like", "seems like", "appears", "might be"\n\n`;
                    summaryContext += `REQUIRED: State the fact directly. Be concise. One sentence is enough.\n\n`;
                }
            }
        } else if (isFileQuery) {
            summaryContext += `No recent files were found.\n\n`;
            summaryContext += `CRITICAL: The user asked about recent files, but no files were found. Clearly state that no recent files are available.\n\n`;
        }

        if (hasKnowledge) {
            const readmeHits = prioritizedKnowledgeHits.filter((h: any) => h.isReadme);
            const otherHits = prioritizedKnowledgeHits.filter((h: any) => !h.isReadme);

            summaryContext += `Found ${prioritizedKnowledgeHits.length} relevant document${prioritizedKnowledgeHits.length > 1 ? 's' : ''}:\n\n`;

            if (readmeHits.length > 0) {
                summaryContext += `README files (primary source - use these first):\n`;
                readmeHits.forEach((h: any) => {
                    summaryContext += `- ${h.title || 'Untitled'}`;
                    if (h.url) {
                        summaryContext += ` (${h.url})`;
                    }
                    summaryContext += `\n`;
                    if (h.spans?.[0]?.text) {
                        summaryContext += `  ${h.spans[0].text.substring(0, 300)}${h.spans[0].text.length > 300 ? '...' : ''}\n`;
                    }
                });
                summaryContext += `\n`;
            }

            if (otherHits.length > 0) {
                summaryContext += `Additional documents:\n`;
                otherHits.forEach((h: any) => {
                    summaryContext += `- ${h.title || 'Untitled'}`;
                    if (h.url) {
                        summaryContext += ` (${h.url})`;
                    }
                    summaryContext += `\n`;
                    if (h.spans?.[0]?.text) {
                        summaryContext += `  ${h.spans[0].text.substring(0, 200)}${h.spans[0].text.length > 200 ? '...' : ''}\n`;
                    }
                });
                summaryContext += `\n`;
            }
        } else {
            if (researchSources.length === 0) {
                summaryContext += `Knowledge base search: No results found for "${knowledgeSearchQuery || 'the query'}"\n\n`;
            } else {
                summaryContext += `Knowledge base search: No results found (using web research instead)\n\n`;
            }
        }

        if (researchSources.length > 0) {
            if (executorResult && executorResult.scratchpad?.knowledge?.length > 0) {
                const executorSources = executorResult.scratchpad.knowledge;
                const existingUrls = new Set(researchSources.map((s: any) => s.url));
                executorSources.forEach((hit: KnowledgeHit) => {
                    if (!existingUrls.has(hit.url)) {
                        researchSources.push({
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

            summaryContext += `\n🚨🚨🚨 PRIMARY SOURCE: WEB RESEARCH RESULTS 🚨🚨🚨\n`;
            summaryContext += `RESEARCH COMPLETED SUCCESSFULLY - ${researchSources.length} SOURCES FOUND\n`;
            summaryContext += `YOU HAVE CONCRETE RESEARCH RESULTS BELOW - USE THEM AS YOUR PRIMARY ANSWER\n\n`;

            summaryContext += `Web Research Sources (${researchSources.length}):\n\n`;
            researchSources.slice(0, 10).forEach((source: any, idx: number) => {
                const title = source.title || 'Untitled';
                const url = source.url || '';
                const snippet = source.snippet || '';
                summaryContext += `${idx + 1}. [${title}](${url})\n`;
                if (snippet) {
                    summaryContext += `   ${snippet.substring(0, 200)}${snippet.length > 200 ? '...' : ''}\n`;
                }
                if (source.score) {
                    summaryContext += `   Relevance: ${(source.score * 100).toFixed(0)}%\n`;
                }
                summaryContext += `\n`;
            });
            if (researchSources.length > 10) {
                summaryContext += `\n*Showing top 10 of ${researchSources.length} research sources.*\n\n`;
            }

            summaryContext += `\n🚨🚨🚨 CRITICAL RESEARCH QUERY INSTRUCTIONS 🚨🚨🚨\n`;
            summaryContext += `YOU HAVE ${researchSources.length} RESEARCH SOURCES ABOVE - THEY ARE YOUR PRIMARY ANSWER\n`;
            summaryContext += `\nMANDATORY RESPONSE REQUIREMENTS:\n`;
            summaryContext += `1. START your answer with a confident synthesis based on the research sources above\n`;
            summaryContext += `2. You MUST include at least 2-3 source links formatted as markdown: [Title](URL)\n`;
            summaryContext += `3. Use the actual titles and URLs from the sources listed above\n`;
            summaryContext += `4. Include the top ${Math.min(3, researchSources.length)} most relevant sources\n`;
            summaryContext += `5. Synthesize the information from the snippets/summaries provided\n\n`;
            summaryContext += `FORBIDDEN PHRASES (DO NOT USE):\n`;
            summaryContext += `- "I couldn't find sources" - YOU HAVE ${researchSources.length} SOURCES ABOVE\n`;
            summaryContext += `- "no results were found" - YOU HAVE RESULTS ABOVE\n`;
            summaryContext += `- "unfortunately, I couldn't find" - YOU HAVE SOURCES\n`;
            summaryContext += `- "I don't have access to" - YOU HAVE RESEARCH RESULTS\n`;
            summaryContext += `- Any phrase suggesting sources weren't found\n\n`;
            summaryContext += `CORRECT APPROACH:\n`;
            summaryContext += `- Start confidently: "Based on recent research, here's what I found..."\n`;
            summaryContext += `- Synthesize the key findings from the snippets above\n`;
            summaryContext += `- List sources as: "Here are the top sources:\n  1. [Title](URL)\n  2. [Title](URL)\n  3. [Title](URL)"\n\n`;
        } else {
            const researchWasAttempted = hasResearch && researchResults.length > 0;
            const isResearchQuery = intent === 'general_question' || intent === 'project_help';

            if (researchWasAttempted && isResearchQuery) {
                summaryContext += `\n🚨🚨🚨🚨🚨 CRITICAL: WEB RESEARCH FAILED OR RETURNED NO RESULTS 🚨🚨🚨🚨🚨\n`;
                summaryContext += `\nTHE WEB RESEARCH TOOL WAS EXECUTED BUT RETURNED ZERO VALID SOURCES.\n`;
                summaryContext += `THIS MEANS YOU HAVE ABSOLUTELY NO WEB RESEARCH RESULTS AVAILABLE.\n`;
                summaryContext += `YOU CANNOT AND MUST NOT INVENT OR HALLUCINATE SOURCES.\n\n`;

                summaryContext += `🚨 STRICT RESPONSE REQUIREMENTS (MANDATORY):\n`;
                summaryContext += `1. You MUST start your response with: "I was unable to find web sources for this query" or "Web research returned no results"\n`;
                summaryContext += `2. You MUST NOT invent, fabricate, or hallucinate ANY source URLs\n`;
                summaryContext += `3. You MUST NOT cite Bloomberg, Reuters, IMF, NYT, WSJ, or ANY publication without a real URL provided above\n`;
                summaryContext += `4. You MUST NOT create fake links like "https://www.bloomberg.com/..." or any other domain\n`;
                summaryContext += `5. You MUST NOT pretend you found sources when you didn't\n`;
                summaryContext += `6. Instead, you MUST offer to help refine the search or suggest alternative approaches\n\n`;

                summaryContext += `🚨 FORBIDDEN BEHAVIORS (DO NOT DO THESE):\n`;
                summaryContext += `- Creating fake URLs of any kind\n`;
                summaryContext += `- Inventing article titles or publication names\n`;
                summaryContext += `- Using phrases like "According to Bloomberg" or "A report by Reuters" without real sources\n`;
                summaryContext += `- Saying "I found some interesting articles" when you have no sources\n`;
                summaryContext += `- Providing any markdown links [Title](URL) unless the URL was provided above\n`;
                summaryContext += `- Making up citations or references\n\n`;

                summaryContext += `✅ CORRECT RESPONSE FORMAT:\n`;
                summaryContext += `"I attempted to search for web sources on this topic, but the search didn't return any results. This could be due to:\n`;
                summaryContext += `- Search service connectivity issues\n`;
                summaryContext += `- The query might need refinement\n`;
                summaryContext += `- The topic might be too specific or recent\n\n`;
                summaryContext += `Would you like me to help refine the search query, or would you like to ask a different question?"\n\n`;

                summaryContext += `🚨 FINAL REMINDER: If you don't have real sources in the context above, you HAVE NO SOURCES. Do not invent them.\n\n`;
            } else if (intent === 'system_debug') {
                summaryContext += `\n📊 SYSTEM STATUS QUERY INSTRUCTIONS:\n`;
                summaryContext += `This is a system health/status query. Use ONLY the system tool results provided above.\n\n`;
                summaryContext += `🚨 CRITICAL RULES FOR SYSTEM_DEBUG QUERIES:\n`;
                summaryContext += `- DO NOT mention "knowledge base search" or "we didn't find any results in search"\n`;
                summaryContext += `- DO NOT mention "web sources" or "research" - this is an internal system query\n`;
                summaryContext += `- DO NOT reference external websites or publications\n`;
                summaryContext += `- DO NOT suggest searching online or using web-based resources\n`;
                summaryContext += `- DO NOT say "we didn't find any results" - instead explain what the tools returned\n`;
                summaryContext += `- This query uses system.health and logs.tail tools, NOT knowledge base search\n\n`;

                if (!hasSystemHealth && !hasLogs) {
                    summaryContext += `⚠️ CRITICAL: NO TOOL RESULTS FOUND\n`;
                    summaryContext += `The system.health and logs.tail tools did not return any results.\n`;
                    summaryContext += `DO NOT invent or guess system status. Instead, state:\n`;
                    summaryContext += `"I attempted to check the system health and retrieve recent logs, but the tools did not return any data. This could indicate:\n`;
                    summaryContext += `- The tools failed to execute\n`;
                    summaryContext += `- The system health API is unavailable\n`;
                    summaryContext += `- There was an error retrieving system status or logs\n\n`;
                    summaryContext += `Please check the server logs or try again."\n\n`;
                } else {
                    summaryContext += `✅ TOOL RESULTS AVAILABLE - USE THEM:\n`;
                    summaryContext += `- If system health data is above, use the EXACT status, uptime, services, and metrics shown\n`;
                    summaryContext += `- If logs are above, summarize the actual log entries shown\n`;
                    summaryContext += `- DO NOT invent status values like "Urgent" or "Critical" unless they appear in the tool results\n`;
                    summaryContext += `- DO NOT mention knowledge base search - this query uses system tools, not KB search\n`;
                    summaryContext += `- If tool results show "healthy", say "healthy" - don't change it to "urgent" or other values\n\n`;
                }
            }
        }

        if (hasResearch) {
            summaryContext += `Web Research: Research session started. Check ${researchResults[0]?.viewUrl || 'research page'} for detailed findings.\n\n`;
        }

        if (isWhatIsQuestion) {
            if (codeReadResults.length > 0) {
                const isWorkflowQuestionInContext = /(workflow|n8n|execution|orchestration)/i.test(userMessage);
                const hasN8nCursorFiles = codeReadResults.some((f: any) => f.path.includes('n8n-cursor'));
                const hasLightningFlowFiles = codeReadResults.some((f: any) => f.path.includes('lightningflow'));

                summaryContext += `🚨 CRITICAL INSTRUCTIONS FOR "WHAT IS SCORPION" QUESTIONS 🚨
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
                        summaryContext += `\n\n🎯 WORKFLOW QUESTION CONTEXT - BE SPECIFIC:
- You have n8n-cursor backend files - these are CORRECT for workflow execution questions
- Use SPECIFIC DETAILS from workflow-worker.ts: function names, workflow types, queue processing logic
- Use SPECIFIC DETAILS from backend README.md: actual endpoints (POST /api/workflows/0/run), architecture flow, dependencies
- Use SPECIFIC DETAILS from package.json: actual dependency versions (bullmq@4.15.0, express@4.18.2, etc.)
- Use SPECIFIC DETAILS from index.ts: actual API routes, middleware, error handling
- This is the n8n workflow automation system, NOT LightningFlow or Salesforce
- QUOTE ACTUAL CODE: "processWorkflow() function", "5 workflow types: ai-saas, research, content, support, analytics", "BullMQ queue", "Redis status storage"
- USE ACTUAL PATHS: "apps/n8n-cursor/backend/src/workers/workflow-worker.ts", not "the worker file"`;
                    } else if (hasLightningFlowFiles) {
                        summaryContext += `\n\n⚠️ ERROR DETECTED:
- This is a workflow question but you received LightningFlow files instead of n8n-cursor files
- Acknowledge this error: "The plan attempted to read incorrect files. Based on available information..."
- Do NOT confuse LightningFlow with the workflow execution system
- Work with what's available but note the mismatch`;
                    }
                }
            } else if (hasKnowledge) {
                if (needsCouncil && votes.length > 0) {
                    summaryContext += `Expert review by ${votes.length} specialist${votes.length > 1 ? 's' : ''}:\n`;
                    votes.forEach((vote: any) => {
                        const agentName = vote.member || 'Expert';
                        const confidence = 70; // Default confidence
                        summaryContext += `- ${agentName} (${confidence}% confident): No specific comment\n`;
                    });
                    summaryContext += `\nOverall consensus: ${consensus.summary}\n\n`;
                } else if (consensus.summary) {
                    summaryContext += `Expert consensus (for reference - prioritize README files above): ${consensus.summary}\n\n`;
                }
                summaryContext += `CRITICAL INSTRUCTIONS FOR "WHAT IS" QUESTIONS:
- The README FILES above are the PRIMARY SOURCE - use them FIRST and MOST IMPORTANTLY
- If README files are provided, use their exact definition
- Documents about "Global Consistency System", "Implementation Status", etc. are about INTERNAL SYSTEMS within the product, NOT what the product IS
- Only use council consensus if README files don't have the answer
- If README files conflict with council consensus, TRUST THE README FILES
- DO NOT confuse internal systems documentation with product definitions
- DO NOT ask for clarification - answer based on what you have
- OUTPUT FORMAT: Use a natural, conversational format. Write like explaining to a friend. NO technical jargon. Start with: "Scorpion is..." or "LightningFlow is..." based on the README definition.`;
            } else {
                if (needsCouncil && votes.length > 0) {
                    summaryContext += `Expert review by ${votes.length} specialist${votes.length > 1 ? 's' : ''}:\n`;
                    votes.forEach((vote: any) => {
                        const agentName = vote.member || 'Expert';
                        const confidence = 70;
                        summaryContext += `- ${agentName} (${confidence}% confident): No specific comment\n`;
                    });
                    summaryContext += `\nOverall consensus: ${consensus.summary}\n\n`;
                } else if (consensus.summary) {
                    summaryContext += `Expert consensus: ${consensus.summary}\n\n`;
                }
                summaryContext += `IMPORTANT: Answer the question directly and naturally based on the information above. Use a conversational tone.`;
            }
        } else {
            if (needsCouncil && votes.length > 0) {
                summaryContext += `Expert review by ${votes.length} specialist${votes.length > 1 ? 's' : ''}:\n`;
                votes.forEach((vote: any) => {
                    const agentName = vote.member || 'Expert';
                    const confidence = 70;
                    summaryContext += `- ${agentName} (${confidence}% confident): No specific comment\n`;
                });
                summaryContext += `\nOverall consensus: ${consensus.summary}\n\n`;
            } else if (consensus.summary) {
                summaryContext += `Expert consensus: ${consensus.summary}\n\n`;
            }
            summaryContext += `IMPORTANT: 
- Use ONLY the information provided above (code files, knowledge base results, research, council consensus)
- If code files are available, they are the PRIMARY SOURCE - use them first
- If no knowledge base results were found, state that clearly
- If web research was started, mention that research is available
- Base your answer on the available sources
- DO NOT make up information that isn't in the sources above
- DO NOT ask for clarification - answer based on what you have
- If you don't have enough information, say so clearly but still provide what you can
- OUTPUT FORMAT: Use a natural, conversational format. Keep it simple and friendly. NO technical jargon.`;
        }
    } else {
        // Technical questions
        summaryContext = `User Question: ${plan.objective || userMessage}\n\n`;

        summaryContext += `To answer this question, I:\n`;
        plan.plan.forEach((step: any) => {
            const stepResult = results.find((r: any) => r.step === step.id);
            const status = stepResult?.result?.ok ? 'successfully completed' : stepResult ? 'encountered an issue' : 'was not executed';
            const toolName = step.tool.replace(/\./g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            summaryContext += `- ${toolName}: ${status}\n`;
        });
        summaryContext += `\n`;

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

        if (hasKnowledge) {
            summaryContext += `Relevant documentation found:\n`;
            prioritizedKnowledgeHits.slice(0, 3).forEach((h: any) => {
                summaryContext += `- ${h.title || 'Untitled'}\n`;
                if (h.spans?.[0]?.text) {
                    summaryContext += `  ${h.spans[0].text.substring(0, 150)}...\n`;
                }
            });
            summaryContext += `\n`;
        }

        if (researchSources.length > 0) {
            summaryContext += `Research findings:\n`;
            researchSources.slice(0, 3).forEach((s: any) => {
                summaryContext += `- ${s.title} (${s.url})\n`;
                if (s.snippet) {
                    summaryContext += `  ${s.snippet.substring(0, 150)}...\n`;
                }
            });
            summaryContext += `\n`;
        }

        if (needsCouncil) {
            if (votes.length > 0) {
                summaryContext += `Expert review by ${votes.length} specialist${votes.length > 1 ? 's' : ''}:\n`;
                votes.forEach((vote: any) => {
                    const agentName = vote.member || 'Expert';
                    summaryContext += `- ${agentName}: ${vote.approved ? 'Approved' : 'Issues found'}\n`;
                });
            }
            if (consensus.summary) {
                summaryContext += `Consensus: ${consensus.summary}\n`;
            }
            if (consensus.issues && consensus.issues.length > 0) {
                summaryContext += `Issues noted: ${consensus.issues.length}\n`;
            }
            summaryContext += `\n`;
        }

        summaryContext += `IMPORTANT: Provide a technical, precise answer based on the findings above. Include code snippets if available.`;
    }

    return summaryContext;
}
