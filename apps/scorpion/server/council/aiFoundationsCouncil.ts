// apps/scorpion/server/council/aiFoundationsCouncil.ts

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

export const AIFoundationsCouncilMember: CouncilMember = {
  id: 'ai-foundations',
  name: 'AI Foundations Councillor',
  description:
    'Ensures Scorpion uses correct AI subfields (ML, DL, NLP, LLMs, GenAI, CV). Fixes misunderstandings and wrong tool selection.',

  run(input: CouncilInput): CouncilOutput {
    const issues: CouncilIssue[] = [];
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '') +
      '\n' +
      (input.draftAnswer || '')
    ).toLowerCase();

    // AI subfield detection patterns
    const mlTerms = [
      'machine learning',
      'ml model',
      'prediction',
      'classify',
      'classification',
      'regression',
      'risk model',
      'recommendation system',
      'collaborative filtering',
    ];

    const dlTerms = [
      'deep learning',
      'neural network',
      'cnn',
      'rnn',
      'transformer',
      'multi-layer',
    ];

    const genAITerms = [
      'generate',
      'create new',
      'synthetic',
      'generative ai',
      'genai',
      'text generation',
      'image generation',
    ];

    const nlpTerms = [
      'natural language',
      'nlp',
      'text processing',
      'language model',
      'sentiment analysis',
      'named entity',
      'text classification',
    ];

    const llmTerms = [
      'llm',
      'large language model',
      'chatgpt',
      'gpt',
      'claude',
      'gemini',
      'conversational ai',
      'chatbot',
    ];

    const cvTerms = [
      'computer vision',
      'image recognition',
      'object detection',
      'image classification',
      'face detection',
      'visual',
      'photo',
      'image',
      'picture',
    ];

    // Detection
    const mentionsML = mlTerms.some((t) => text.includes(t));
    const mentionsDL = dlTerms.some((t) => text.includes(t));
    const mentionsGenAI = genAITerms.some((t) => text.includes(t));
    const mentionsNLP = nlpTerms.some((t) => text.includes(t));
    const mentionsLLM = llmTerms.some((t) => text.includes(t));
    const mentionsCV = cvTerms.some((t) => text.includes(t));

    // Issue detection patterns

    // 1. Mixing Computer Vision with NLP (wrong tool for images)
    if (mentionsCV && mentionsNLP && !mentionsLLM) {
      issues.push({
        severity: 4,
        tag: 'correctness',
        message:
          'Mixed Computer Vision with NLP. Images should use CV models, not text-based NLP.',
        recommendation:
          'Separate the tasks: Use Computer Vision for image analysis, NLP/LLMs for text. Do not mix pipelines.',
        councillorId: 'ai-foundations',
      });

      logImprovementSignal({
        type: 'MISCLASSIFIED_INTENT',
        message: 'User tried to use NLP for image tasks. Should use Computer Vision.',
        tag: 'ai-foundations',
        severity: 4,
      });
    }

    // 2. Confusing Generative AI with Predictive ML
    if (mentionsML && mentionsGenAI && !mentionsLLM) {
      // Check if they're trying to use GenAI for prediction
      const predictionContext =
        text.includes('predict') ||
        text.includes('forecast') ||
        text.includes('risk') ||
        text.includes('score') ||
        text.includes('classification');

      if (predictionContext) {
        issues.push({
          severity: 3,
          tag: 'correctness',
          message:
            'Machine learning (prediction/classification) is different from generative AI (creation).',
          recommendation:
            'For prediction/classification tasks, use traditional ML models. For generating new content, use GenAI/LLMs. Clarify the problem type.',
          councillorId: 'ai-foundations',
        });
      }
    }

    // 3. Using LLM for structured prediction when ML is better
    if (mentionsLLM && !mentionsNLP && !mentionsGenAI) {
      const structuredDataContext =
        text.includes('structured data') ||
        text.includes('database') ||
        text.includes('tabular') ||
        text.includes('csv') ||
        text.includes('spreadsheet');

      const predictionTask =
        text.includes('predict') ||
        text.includes('forecast') ||
        text.includes('risk score') ||
        text.includes('recommendation');

      if (structuredDataContext && predictionTask) {
        issues.push({
          severity: 2,
          tag: 'correctness',
          message:
            'Using LLM for structured prediction. Traditional ML may be more appropriate.',
          recommendation:
            'For structured data prediction tasks, consider traditional ML models (random forest, gradient boosting) instead of LLMs. LLMs excel at unstructured text.',
          councillorId: 'ai-foundations',
        });
      }
    }

    // 4. Using Deep Learning when simple ML would suffice
    if (mentionsDL && !mentionsCV && !mentionsGenAI) {
      const simpleTask =
        text.includes('simple') ||
        text.includes('basic') ||
        text.includes('rule-based') ||
        text.includes('if-then');

      if (simpleTask) {
        issues.push({
          severity: 2,
          tag: 'complexity',
          message:
            'Using deep learning for a simple task. Consider simpler ML approaches first.',
          recommendation:
            'Start with simpler ML models (linear regression, decision trees) before jumping to deep learning. DL is powerful but may be overkill.',
          councillorId: 'ai-foundations',
        });
      }
    }

    // 5. Missing subfield when task clearly needs one
    if (!mentionsML && !mentionsDL && !mentionsGenAI && !mentionsNLP && !mentionsLLM && !mentionsCV) {
      const needsML =
        text.includes('predict') ||
        text.includes('classify') ||
        text.includes('recommend') ||
        text.includes('risk');

      const needsGenAI =
        text.includes('generate') ||
        text.includes('create new') ||
        text.includes('write') ||
        text.includes('draft');

      const needsCV =
        text.includes('image') ||
        text.includes('photo') ||
        text.includes('visual') ||
        text.includes('picture');

      if (needsML) {
        issues.push({
          severity: 1,
          tag: 'correctness',
          message: 'Task appears to need machine learning but no ML approach mentioned.',
          recommendation:
            'Consider using ML for prediction/classification tasks. Specify the ML approach (supervised learning, etc.).',
          councillorId: 'ai-foundations',
        });
      } else if (needsGenAI) {
        issues.push({
          severity: 1,
          tag: 'correctness',
          message: 'Task appears to need generative AI but no GenAI approach mentioned.',
          recommendation:
            'For generating new content, consider using LLMs or other generative AI models.',
          councillorId: 'ai-foundations',
        });
      } else if (needsCV) {
        issues.push({
          severity: 1,
          tag: 'correctness',
          message: 'Task involves images but no Computer Vision approach mentioned.',
          recommendation:
            'For image analysis, use Computer Vision models (CNNs, vision transformers).',
          councillorId: 'ai-foundations',
        });
      }
    }

    return {
      approved: issues.length === 0,
      issues,
    };
  },
};

