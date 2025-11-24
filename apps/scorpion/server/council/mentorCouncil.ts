// apps/scorpion/server/council/mentorCouncil.ts
// LLM Training & Evaluation - Evolved for new model system

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';

export const MentorCouncilMember: CouncilMember = {
  id: 'mentor',
  name: 'Mentor',
  description:
    'LLM Training & Evaluation Master - Guides LLM development, training strategies, fine-tuning, model evaluation, and prompt engineering. Focuses on model optimization and best practices.',
  weight: 1.2,

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    // Check for LLM/training concerns
    const mentionsLLM = /(llm|model|training|fine-tuning|fine tuning|prompt|evaluation|hyperparameter|loss|training data)/i.test(text);
    const mentionsModel = /(model|architecture|transformer|gpt|claude|llama)/i.test(text);

    if (!mentionsLLM && !mentionsModel) {
      return { approved: true, issues: [] };
    }

    // 1) Training strategy
    const mentionsTraining = /(train|fine-tun|fine tun|tune|optimize|improve)/i.test(text);
    if (mentionsTraining) {
      issues.push({
        severity: 2,
        tag: 'ai-foundations',
        message: 'LLM training operation detected.',
        recommendation:
          'Consider training strategy: LoRA vs full fine-tuning, data quality, hyperparameters, and evaluation metrics. Use proper training data collection and validation.',
        councillorId: 'mentor',
      });
    }

    // 2) Prompt engineering
    const mentionsPrompt = /(prompt|instruction|system.*prompt|user.*prompt)/i.test(text);
    if (mentionsPrompt) {
      issues.push({
        severity: 1,
        tag: 'prompt-quality',
        message: 'Prompt engineering detected.',
        recommendation:
          'Ensure prompt quality: clear instructions, proper formatting, and appropriate examples. PromptQualityCouncil will provide detailed prompt review.',
        councillorId: 'mentor',
      });
    }

    // 3) Model evaluation
    const mentionsEvaluation = /(evaluate|test|metric|score|quality|performance)/i.test(text);
    if (mentionsLLM && mentionsEvaluation) {
      issues.push({
        severity: 2,
        tag: 'ai-foundations',
        message: 'Model evaluation detected.',
        recommendation:
          'Use proper evaluation metrics: accuracy, latency, cost, and domain-specific metrics. Consider A/B testing and human evaluation for quality assessment.',
        councillorId: 'mentor',
      });
    }

    // 4) Model selection
    const mentionsSelection = /(choose|select|pick|which.*model|best.*model)/i.test(text);
    if (mentionsModel && mentionsSelection) {
      issues.push({
        severity: 1,
        tag: 'ai-foundations',
        message: 'Model selection decision detected.',
        recommendation:
          'Consider factors: task complexity, resource constraints, latency requirements, and cost. Use lightweight mode for resource-constrained scenarios. Leverage model selector utilities.',
        councillorId: 'mentor',
      });
    }

    // 5) Training data quality
    const mentionsData = /(training.*data|dataset|examples|samples)/i.test(text);
    if (mentionsTraining && mentionsData) {
      issues.push({
        severity: 2,
        tag: 'data-verification',
        message: 'Training data operation detected.',
        recommendation:
          'Ensure training data quality: proper formatting, diversity, relevance, and bias mitigation. Use data collection tools and validation processes.',
        councillorId: 'mentor',
      });
    }

    return {
      approved: true,
      issues,
    };
  },
};

