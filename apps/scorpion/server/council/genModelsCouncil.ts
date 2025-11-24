// apps/scorpion/server/council/genModelsCouncil.ts

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

export const GenerativeModelsCouncil: CouncilMember = {
  id: 'generative-models',
  name: 'Generative Model Architecture Councillor',
  description:
    'Ensures Scorpion correctly identifies and uses generative model architectures (GANs, VAEs, LLMs, Diffusion). Prevents mixing of prediction, analysis, and creation pipelines.',

  run(input: CouncilInput): CouncilOutput {
    const issues: CouncilIssue[] = [];
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '') +
      '\n' +
      (input.draftAnswer || '')
    ).toLowerCase();

    const wantsImages =
      text.includes('image') ||
      text.includes('picture') ||
      text.includes('photo') ||
      text.includes('visual') ||
      text.includes('generate picture') ||
      text.includes('create image') ||
      text.includes('logo') ||
      text.includes('graphic');

    const wantsText =
      text.includes('text') ||
      text.includes('essay') ||
      text.includes('story') ||
      text.includes('write') ||
      text.includes('article') ||
      text.includes('blog') ||
      text.includes('content');

    const mentionsGAN = text.includes('gan') || text.includes('generative adversarial');
    const mentionsVAE = text.includes('vae') || text.includes('variational autoencoder');
    const mentionsLLM = text.includes('llm') || text.includes('transformer') || text.includes('language model');
    const mentionsDiffusion = text.includes('diffusion') || text.includes('stable diffusion') || text.includes('dall-e');
    const mentionsPredictive = text.includes('predict') || text.includes('forecast') || text.includes('risk score') || text.includes('classification');

    // Error 1: Using LLM for image generation
    if (wantsImages && mentionsLLM && !mentionsDiffusion && !mentionsGAN && !mentionsVAE) {
      issues.push({
        severity: 4,
        tag: 'correctness',
        message:
          'Detected the use of LLMs for image generation, but LLMs generate text, not images.',
        recommendation:
          'Use a GAN, VAE, or Diffusion-based image generator (e.g., Stable Diffusion, DALL-E) for visual output.',
        councillorId: 'generative-models',
      });

      logImprovementSignal({
        type: 'MISCLASSIFIED_INTENT',
        message: 'User tried to use LLM for image generation. Should use image generator (GAN/VAE/Diffusion).',
        tag: 'generative-models',
        severity: 4,
      });
    }

    // Error 2: Using GAN/VAE for text generation
    if (wantsText && (mentionsGAN || mentionsVAE) && !mentionsLLM) {
      issues.push({
        severity: 3,
        tag: 'correctness',
        message:
          'Detected GAN/VAE use for text generation — these models are for images/latent encodings, not language.',
        recommendation:
          'Use an LLM (transformer-based model like GPT, Claude, or Gemini) for text generation tasks.',
        councillorId: 'generative-models',
      });
    }

    // Error 3: Mixing all architectures without clear purpose
    if (mentionsGAN && mentionsVAE && mentionsLLM && !wantsImages && !wantsText) {
      issues.push({
        severity: 2,
        tag: 'complexity',
        message: 'Mixed GAN, VAE, and LLM architectures without clear purpose.',
        recommendation:
          'Specify which modality is needed (text, image, variation) and choose one primary architecture.',
        councillorId: 'generative-models',
      });
    }

    // Error 4: Using generative models for predictive tasks
    if (mentionsPredictive && (mentionsGAN || mentionsVAE || mentionsLLM || mentionsDiffusion)) {
      const generativeContext = text.includes('generate') || text.includes('create');
      
      if (!generativeContext) {
        issues.push({
          severity: 3,
          tag: 'correctness',
          message:
            'Using generative models (GAN/VAE/LLM) for predictive/classification tasks. Generative models create new data, not predict outcomes.',
          recommendation:
            'For prediction/classification, use traditional ML models (random forest, gradient boosting, logistic regression) instead of generative architectures.',
          councillorId: 'generative-models',
        });
      }
    }

    // Error 5: Confusing VAE with GAN for image generation
    if (wantsImages && mentionsVAE && !mentionsGAN && !mentionsDiffusion) {
      const variationContext = text.includes('variation') || text.includes('variant') || text.includes('remix');
      
      if (!variationContext) {
        issues.push({
          severity: 2,
          tag: 'correctness',
          message:
            'Using VAE for new image generation. VAEs are better for variations of existing images, not creating new ones from scratch.',
          recommendation:
            'For generating new images, use GAN or Diffusion models. Use VAE for generating variations of existing images.',
          councillorId: 'generative-models',
        });
      }
    }

    // Error 6: Missing architecture when clearly needed
    if (wantsImages && !mentionsGAN && !mentionsVAE && !mentionsDiffusion && !mentionsLLM) {
      issues.push({
        severity: 1,
        tag: 'correctness',
        message: 'Image generation requested but no generative architecture specified.',
        recommendation:
          'Specify which image generation architecture to use: GAN for realistic images, VAE for variations, or Diffusion for high-quality generation.',
        councillorId: 'generative-models',
      });
    }

    return {
      approved: issues.length === 0,
      issues,
    };
  },
};

