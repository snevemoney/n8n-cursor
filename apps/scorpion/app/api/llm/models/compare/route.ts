/**
 * Model Comparison API
 * Compare multiple models on the same prompt
 */

import { NextRequest } from 'next/server';
import { withErrorHandling, createSuccessResponse, validateRequest } from '@/lib/api-error-handler';
import { runModel } from '@scorpion/core';
import { z } from 'zod';
import { calculateSimilarity } from '@/lib/utils/similarity';

export const dynamic = 'force-dynamic';

const compareModelsSchema = z.object({
  prompt: z.string().min(1),
  models: z.array(z.object({
    name: z.string().min(1),
    provider: z.enum(['ollama', 'openai']).optional(),
  })).min(2).max(5),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, compareModelsSchema);
  if (!validation.success) {
    return validation.error;
  }

  const { prompt, models, systemPrompt, temperature } = validation.data;

  const results = await Promise.allSettled(
    models.map(async (modelConfig) => {
      const startTime = Date.now();
      try {
        const response = await runModel({
          prompt,
          system: systemPrompt,
          model: modelConfig.name,
          temperature: temperature || 0.7,
        });

        const duration = Date.now() - startTime;

        return {
          model: modelConfig.name,
          provider: modelConfig.provider || 'ollama',
          success: true,
          response: response.content,
          usage: response.usage,
          duration,
          error: null,
        };
      } catch (error: any) {
        return {
          model: modelConfig.name,
          provider: modelConfig.provider || 'ollama',
          success: false,
          response: null,
          usage: null,
          duration: Date.now() - startTime,
          error: error.message,
        };
      }
    })
  );

  const comparisons = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        model: models[index].name,
        provider: models[index].provider || 'ollama',
        success: false,
        response: null,
        usage: null,
        duration: 0,
        error: result.reason?.message || 'Unknown error',
      };
    }
  });

  // Calculate similarity scores (simple word overlap for now)
  const successfulResults = comparisons.filter(r => r.success && r.response);
  const similarityScores: Record<string, Record<string, number>> = {};

  for (let i = 0; i < successfulResults.length; i++) {
    for (let j = i + 1; j < successfulResults.length; j++) {
      const model1 = successfulResults[i].model;
      const model2 = successfulResults[j].model;
      const similarity = calculateSimilarity(
        successfulResults[i].response!,
        successfulResults[j].response!
      );

      if (!similarityScores[model1]) {
        similarityScores[model1] = {};
      }
      if (!similarityScores[model2]) {
        similarityScores[model2] = {};
      }

      similarityScores[model1][model2] = similarity;
      similarityScores[model2][model1] = similarity;
    }
  }

  return createSuccessResponse({
    comparisons,
    similarityScores,
    summary: {
      total: comparisons.length,
      successful: successfulResults.length,
      failed: comparisons.length - successfulResults.length,
    },
  });
});

