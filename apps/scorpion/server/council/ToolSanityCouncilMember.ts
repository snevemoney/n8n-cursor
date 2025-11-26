// apps/scorpion/server/council/ToolSanityCouncilMember.ts

import { CouncilInput, CouncilIssue, CouncilOutput, CouncilMember } from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';
import { listTools } from '@/lib/chat/tools';
import { getUserTool } from '@/lib/chat/tools/user-tools';

// Get actual tool names from registry
function getAvailableToolNames(): Set<string> {
  const tools = listTools();
  const toolNames = new Set(tools.map(t => t.name));
  
  // Add special "none" tool - it means "no tool needed" for steps that don't require tool execution
  toolNames.add('none');
  
  // Also check user tools
  try {
    const userTools = require('@/lib/chat/tools/user-tools').listUserTools();
    userTools.forEach((t: any) => toolNames.add(t.name));
  } catch (e) {
    // Ignore if user tools not available
  }
  
  return toolNames;
}

export class ToolSanityCouncilMember implements CouncilMember {
  id = 'tools';
  name = 'Tool Sanity Councillor';
  private availableTools: Set<string>;

  constructor() {
    this.availableTools = getAvailableToolNames();
  }

  run(input: CouncilInput): CouncilOutput {
    const issues: CouncilIssue[] = [];

    // Check for hallucinated tools
    if (input.toolsUsed && input.toolsUsed.length > 0) {
      const invalidTools: string[] = [];
      for (const tool of input.toolsUsed) {
        if (tool && !this.availableTools.has(tool)) {
          // Allow user tools (they may not be in the main registry)
          // Allow "none" - it's a special tool meaning "no tool needed"
          if (!tool.startsWith('user.') && tool !== 'none') {
            invalidTools.push(tool);
          }
        }
      }

      if (invalidTools.length > 0) {
        logImprovementSignal({
          type: 'HALLUCINATED_ENDPOINT',
          message: `Plan references potentially invalid tools: ${invalidTools.join(', ')}`,
          tag: 'tools',
          severity: 3,
        });

        issues.push({
          severity: 4,
          tag: 'tools',
          message: `Plan references potentially invalid or hallucinated tools: ${invalidTools.join(', ')}`,
          recommendation: 'Verify tool names exist in the tool registry. Remove or replace invalid tools.',
          councillorId: this.id,
        });
      }
    }

    // Check plan summary for tool references
    if (input.planSummary) {
      const toolPattern = /(?:tool|call|use|execute)\s+['"]?([a-z]+\.[a-z]+)['"]?/gi;
      const matches = input.planSummary.matchAll(toolPattern);
      const mentionedTools: string[] = [];

      for (const match of matches) {
        if (match[1]) {
          mentionedTools.push(match[1]);
        }
      }

      // Check if mentioned tools are valid
      for (const tool of mentionedTools) {
        // Allow "none" - it's a special tool meaning "no tool needed"
        if (!this.availableTools.has(tool) && !tool.startsWith('user.') && tool !== 'none') {
          issues.push({
            severity: 3,
            tag: 'tools',
            message: `Plan mentions tool "${tool}" which may not exist.`,
            recommendation: 'Verify tool exists before including in plan.',
            councillorId: this.id,
          });
        }
      }
    }

    // Check for duplicate tool usage
    if (input.toolsUsed && input.toolsUsed.length > 1) {
      const toolCounts = new Map<string, number>();
      for (const tool of input.toolsUsed) {
        toolCounts.set(tool, (toolCounts.get(tool) || 0) + 1);
      }
      
      const duplicates = Array.from(toolCounts.entries())
        .filter(([_, count]) => count > 1)
        .map(([tool]) => tool);
      
      if (duplicates.length > 0) {
        issues.push({
          severity: 2,
          tag: 'tools',
          message: `Plan uses the same tool multiple times: ${duplicates.join(', ')}. This may indicate redundant steps.`,
          recommendation: 'Consider if duplicate tool calls can be merged or if the plan can be simplified.',
          councillorId: this.id,
        });
      }
    }

    // Check for tool misuse patterns
    if (input.planSummary) {
      const misusePatterns = [
        { pattern: /code\.writeFile.*without.*backup/i, message: 'Writing files without backup' },
        { pattern: /workflow\.(create|update).*without.*validation/i, message: 'Creating workflows without validation' },
      ];

      for (const { pattern, message } of misusePatterns) {
        if (pattern.test(input.planSummary)) {
          issues.push({
            severity: 2,
            tag: 'safety',
            message,
            recommendation: 'Add safety checks and validation steps.',
            councillorId: this.id,
          });
        }
      }
    }

    return {
      approved: true,
      issues,
    };
  }
}

