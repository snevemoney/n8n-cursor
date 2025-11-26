import { totalmem } from 'os';

/**
 * Model recommendations based on available RAM
 * Based on Ollama quantization and model sizes:
 * - llama3.2:1b-instruct-q4_K_M: ~700MB (best for 8GB)
 * - llama3.2:3b-instruct-q4_K_M: ~2GB (good for 8-16GB)
 * - llama3.2:3b: ~2.4GB (unquantized, needs 16GB+)
 * - llama3.2:13b-instruct-q4_K_M: ~7.4GB (needs 16GB+)
 */
export interface ModelRecommendation {
  model: string;
  size: string;
  ramRequired: string;
  description: string;
  quantized: boolean;
}

/**
 * Get recommended model based on available system RAM
 * Prefers scorpion:latest (personal training AI) when available
 * Falls back to smaller models for low-RAM systems
 */
export function getRecommendedModelForRAM(): string {
  // Always prefer scorpion:latest as the default (personal training AI)
  // It's a 3.2B quantized model (Q4_K_M) that works well on 8GB+ systems
  return 'scorpion:latest';
}

/**
 * Get all model recommendations for current system
 */
export function getModelRecommendations(): ModelRecommendation[] {
  const ramGB = totalmem() / (1024 * 1024 * 1024);
  
  const recommendations: ModelRecommendation[] = [
    {
      model: 'llama3.2:1b-instruct-q4_K_M',
      size: '~700MB',
      ramRequired: '4GB+',
      description: 'Smallest model, fastest inference, best for 8GB systems',
      quantized: true,
    },
    {
      model: 'llama3.2:3b-instruct-q4_K_M',
      size: '~2GB',
      ramRequired: '8GB+',
      description: 'Good balance of quality and speed for 8-16GB systems',
      quantized: true,
    },
    {
      model: 'llama3.2:3b',
      size: '~2.4GB',
      ramRequired: '16GB+',
      description: 'Unquantized version, better quality but slower',
      quantized: false,
    },
  ];
  
  // Add larger models if system has enough RAM
  if (ramGB >= 16) {
    recommendations.push({
      model: 'llama3.2:13b-instruct-q4_K_M',
      size: '~7.4GB',
      ramRequired: '16GB+',
      description: 'Larger model, better quality, needs 16GB+ RAM',
      quantized: true,
    });
  }
  
  return recommendations;
}

/**
 * Get the best available model, preferring quantized versions
 * Checks if quantized version exists, falls back to base model
 */
export async function getBestAvailableModel(
  baseModel: string,
  availableModels: string[] = []
): Promise<string> {
  // If we have a list of available models, use it
  if (availableModels.length > 0) {
    // Prefer quantized versions
    const quantizedVariants = [
      `${baseModel}-q4_K_M`,
      `${baseModel}-q4_0`,
      `${baseModel}-q5_K_M`,
      `${baseModel}-q8_0`,
    ];
    
    for (const variant of quantizedVariants) {
      if (availableModels.includes(variant)) {
        return variant;
      }
    }
    
    // Check if base model exists
    if (availableModels.includes(baseModel)) {
      return baseModel;
    }
    
    // Fallback to first available model
    return availableModels[0];
  }
  
  // No model list available, return recommended model for RAM
  return getRecommendedModelForRAM();
}

/**
 * Check if a model name is quantized
 */
export function isQuantizedModel(modelName: string): boolean {
  return /-q\d+(_K_M|_0)$/.test(modelName);
}

/**
 * Get model size estimate in GB
 */
export function estimateModelSize(modelName: string): number {
  if (modelName.includes('1b')) {
    return isQuantizedModel(modelName) ? 0.7 : 1.2;
  } else if (modelName.includes('3b')) {
    return isQuantizedModel(modelName) ? 2.0 : 2.4;
  } else if (modelName.includes('13b')) {
    return isQuantizedModel(modelName) ? 7.4 : 13.0;
  } else if (modelName.includes('70b')) {
    return isQuantizedModel(modelName) ? 40.0 : 140.0;
  }
  return 2.0; // Default estimate
}

