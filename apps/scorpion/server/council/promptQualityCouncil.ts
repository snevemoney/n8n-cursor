// apps/scorpion/server/council/promptQualityCouncil.ts

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

export const PromptQualityCouncil: CouncilMember = {
  id: 'prompt-quality',
  name: 'Prompt Quality Councillor',
  description:
    'Evaluates prompt clarity, detects missing elements (role, context, task, format, example), and ensures Scorpion breaks down complex tasks or asks clarifying questions.',

  run(input: CouncilInput): CouncilOutput {
    const issues: CouncilIssue[] = [];
    const text =
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '') +
      '\n' +
      (input.draftAnswer || '');

    const t = text.toLowerCase();

    // Detect complexity / too broad
    const tooBroad =
      t.includes('everything') ||
      t.includes('all at once') ||
      t.includes('do it all') ||
      t.includes('complete solution') ||
      (t.length > 800 && !t.includes('\n') && !t.includes('step'));

    if (tooBroad) {
      issues.push({
        severity: 2,
        tag: 'complexity',
        message:
          'The request appears too broad or complex for a single step.',
        recommendation:
          'Break the task down into smaller, clear steps. Ask the user for the first action or prioritize the most important part.',
        councillorId: 'prompt-quality',
      });

      logImprovementSignal({
        type: 'OVERCOMPLEX_PLAN',
        message: 'User prompt is too broad and needs to be broken down.',
        tag: 'prompt-quality',
        severity: 2,
      });
    }

    // Missing role/persona
    const hasRole =
      t.includes('role:') ||
      t.includes('as a') ||
      t.includes('act as') ||
      t.includes('you are a') ||
      t.includes('be a') ||
      t.includes('pretend to be');

    if (!hasRole && t.length > 50) {
      // Only flag if prompt is substantial
      issues.push({
        severity: 1,
        tag: 'prompt',
        message: 'No role or persona detected in the prompt.',
        recommendation:
          'Consider asking which role Scorpion should take (e.g., "act as a developer, advisor, researcher...") or specify the perspective needed.',
        councillorId: 'prompt-quality',
      });
    }

    // Missing context
    const hasContext =
      t.includes('context:') ||
      t.includes('background') ||
      t.includes('given that') ||
      t.includes('considering') ||
      t.includes('with the following') ||
      t.includes('constraints:') ||
      t.includes('requirements:');

    if (!hasContext && t.length > 100) {
      issues.push({
        severity: 1,
        tag: 'prompt',
        message: 'Limited context provided in the prompt.',
        recommendation:
          'Ask for key context, constraints, or relevant background information to improve accuracy.',
        councillorId: 'prompt-quality',
      });
    }

    // Missing explicit request
    const requestPatterns = [
      'task',
      'request',
      'objective',
      'goal',
      'need',
      'want',
      'help me',
      'create',
      'build',
      'generate',
      'analyze',
      'find',
    ];
    const hasExplicitRequest = requestPatterns.some((p) => t.includes(p));

    if (!hasExplicitRequest && t.length > 50) {
      issues.push({
        severity: 1,
        tag: 'prompt',
        message: 'No explicit task statement found.',
        recommendation:
          'Ask the user to clarify exactly what they want done. Use action verbs (create, analyze, find, etc.).',
        councillorId: 'prompt-quality',
      });
    }

    // Missing output structure
    const hasFormat =
      t.includes('format') ||
      t.includes('structure') ||
      t.includes('output as') ||
      t.includes('in the form of') ||
      t.includes('as a list') ||
      t.includes('as a table') ||
      t.includes('as steps') ||
      t.includes('bullet points') ||
      t.includes('json') ||
      t.includes('markdown');

    if (!hasFormat && t.length > 100) {
      issues.push({
        severity: 1,
        tag: 'prompt',
        message: 'No output format or structure specified.',
        recommendation:
          'Ask the user how the answer should be structured (list, steps, table, summary, JSON, markdown, etc.).',
        councillorId: 'prompt-quality',
      });
    }

    // Missing examples / references
    const hasExample =
      t.includes('example') ||
      t.includes('reference') ||
      t.includes('similar to') ||
      t.includes('like this') ||
      t.includes('following format') ||
      t.includes('see below');

    if (!hasExample && t.length > 150 && (t.includes('generate') || t.includes('create') || t.includes('write'))) {
      issues.push({
        severity: 1,
        tag: 'prompt',
        message: 'No example or reference detected for creative tasks.',
        recommendation:
          'Ask the user for an example of the style, tone, structure, or format they want.',
        councillorId: 'prompt-quality',
      });
    }

    // Conversational improvement suggestions
    if (
      t.includes('not working') ||
      t.includes('incorrect') ||
      t.includes('wrong') ||
      t.includes('fix this') ||
      t.includes('try again')
    ) {
      issues.push({
        severity: 2,
        tag: 'prompt',
        message:
          'User expresses dissatisfaction with the response.',
        recommendation:
          'Use conversational refinement techniques: ask what to keep, what to change, request specific feedback, and iterate.',
        councillorId: 'prompt-quality',
      });
    }

    // Vague requests
    const vaguePhrases = [
      'make it better',
      'improve this',
      'do something',
      'figure it out',
      'you know what i mean',
    ];
    const isVague = vaguePhrases.some((phrase) => t.includes(phrase));

    if (isVague) {
      issues.push({
        severity: 3,
        tag: 'prompt',
        message: 'Request is too vague to act on effectively.',
        recommendation:
          'Ask the user to be more specific: what exactly should be improved? What does "better" mean? What specific outcome do they want?',
        councillorId: 'prompt-quality',
      });
    }

    return {
      approved: issues.length === 0,
      issues,
    };
  },
};

