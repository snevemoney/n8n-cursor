import { z } from 'zod';

export const name = 'llm.train';
export const label = 'Start LLM Training';
export const description = 'Start a new LLM training experiment with specified hyperparameters';

export const schema = z.object({
  name: z.string().min(1).describe('Experiment name'),
  baseModel: z.string().min(1).describe('Base model to fine-tune (e.g., llama3.2:3b)'),
  strategy: z.enum(['lora', 'qlora', 'full-finetune', 'adapter']).describe('Training strategy'),
  learningRate: z.number().positive().optional().describe('Learning rate (default: 0.0001)'),
  batchSize: z.number().int().positive().optional().describe('Batch size (default: 4)'),
  epochs: z.number().int().positive().optional().describe('Number of epochs (default: 3)'),
  datasetName: z.string().min(1).describe('Dataset name'),
  datasetSize: z.number().int().positive().describe('Dataset size'),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    const { getExperimentTracker } = await import('@/lib/llm/experiment-tracker');
    const tracker = getExperimentTracker();
    await tracker.initialize();

    const experiment = await tracker.createExperiment({
      name: args.name,
      baseModel: args.baseModel,
      strategy: args.strategy,
      hyperparameters: {
        learningRate: args.learningRate || 0.0001,
        batchSize: args.batchSize || 4,
        epochs: args.epochs || 3,
      },
      dataset: {
        name: args.datasetName,
        size: args.datasetSize,
      },
    });

    return {
      ok: true,
      experimentId: experiment.id,
      name: experiment.name,
      status: experiment.status,
      message: `Training experiment "${experiment.name}" created successfully. Status: ${experiment.status}`,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

