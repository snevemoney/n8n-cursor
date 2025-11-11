/**
 * Prompt Testing API
 * Test prompt variations against models
 */

import { NextRequest } from 'next/server';
import { withErrorHandling, createSuccessResponse, validateRequest } from '@/lib/api-error-handler';
import { runModel } from '@scorpion/core';
import { z } from 'zod';
import { calculateSimilarity } from '@/lib/utils/similarity';

const testPromptsSchema = z.object({
  prompts: z.array(z.object({
    name: z.string().min(1),
    prompt: z.string().min(1),
  })).min(1).max(10),
  models: z.array(z.string()).min(1).max(5),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  testCases: z.array(z.object({
    input: z.string(),
    expected: z.string().optional(),
  })).optional(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, testPromptsSchema);
  if (!validation.success) {
    return validation.error;
  }

  const { prompts, models, systemPrompt, temperature, testCases } = validation.data;

  const results = await Promise.all(
    prompts.map(async (promptConfig) => {
      const modelResults = await Promise.allSettled(
        models.map(async (modelName) => {
          const startTime = Date.now();
          try {
            const response = await runModel({
              prompt: promptConfig.prompt,
              system: systemPrompt,
              model: modelName,
              temperature: temperature || 0.7,
            });

            const duration = Date.now() - startTime;

            return {
              model: modelName,
              success: true,
              response: response.content,
              usage: response.usage,
              duration,
              error: null,
            };
          } catch (error: any) {
            return {
              model: modelName,
              success: false,
              response: null,
              usage: null,
              duration: Date.now() - startTime,
              error: error.message,
            };
          }
        })
      );

      const modelResultsData = modelResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            model: models[index],
            success: false,
            response: null,
            usage: null,
            duration: 0,
            error: result.reason?.message || 'Unknown error',
          };
        }
      });

      // If test cases provided, evaluate against them
      let testResults = null;
      if (testCases && testCases.length > 0) {
        testResults = modelResultsData
          .filter(r => r.success)
          .map(result => {
            const scores = testCases.map(testCase => {
              if (!testCase.expected) {
                return { input: testCase.input, score: null };
              }
              const similarity = calculateSimilarity(result.response || '', testCase.expected);
              return {
                input: testCase.input,
                expected: testCase.expected,
                score: similarity,
              };
            });

            const avgScore = scores
              .filter(s => s.score !== null)
              .reduce((sum, s) => sum + (s.score || 0), 0) / scores.filter(s => s.score !== null).length;

            return {
              model: result.model,
              testScores: scores,
              averageScore: avgScore || 0,
            };
          });
      }

      return {
        prompt: promptConfig.name,
        promptText: promptConfig.prompt,
        modelResults: modelResultsData,
        testResults,
        summary: {
          totalModels: modelResultsData.length,
          successful: modelResultsData.filter(r => r.success).length,
          failed: modelResultsData.filter(r => !r.success).length,
        },
      };
    })
  );

  // Determine winner if test cases provided
  let winner = null;
  if (testCases && testCases.length > 0) {
    const promptScores = results.map(r => {
      if (!r.testResults || r.testResults.length === 0) return null;
      const bestModelScore = Math.max(...r.testResults.map(tr => tr.averageScore));
      return {
        prompt: r.prompt,
        bestScore: bestModelScore,
      };
    }).filter(ps => ps !== null) as Array<{ prompt: string; bestScore: number }>;

    if (promptScores.length > 0) {
      const bestPrompt = promptScores.reduce((best, current) =>
        current.bestScore > best.bestScore ? current : best
      );
      winner = bestPrompt.prompt;
    }
  }

  return createSuccessResponse({
    results,
    winner,
    summary: {
      totalPrompts: results.length,
      totalModels: models.length,
      totalTests: testCases?.length || 0,
    },
  });
});

