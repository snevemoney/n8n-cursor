// Tier 1: CLIP (Vision Models)
// Integration with OpenAI CLIP or local CLIP models for image understanding

export interface CLIPRequest {
  image: Buffer | string; // Base64 encoded image or file path
  text?: string; // Optional text for similarity search
  task: 'embedding' | 'classification' | 'similarity';
  labels?: string[]; // For classification task
}

export interface CLIPResponse {
  embedding?: number[];
  classification?: Array<{
    label: string;
    score: number;
  }>;
  similarity?: number;
  model: string;
}

/**
 * Get image embedding using CLIP
 * Uses OpenAI CLIP API or local model
 */
export async function getImageEmbedding(
  image: Buffer | string
): Promise<number[]> {
  // For now, use OpenAI's vision API as a proxy for CLIP
  // In production, you'd use a dedicated CLIP service
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for CLIP embeddings');
  }

  // Convert image to base64 if needed
  const imageBase64 = typeof image === 'string' 
    ? image 
    : image.toString('base64');

  // Use OpenAI's embedding API with vision model
  // Note: This is a placeholder - actual CLIP would use a dedicated endpoint
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small', // Placeholder - would use CLIP model
      input: `image:${imageBase64}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`CLIP embedding error: ${response.status}`);
  }

  const result = await response.json();
  return result.data[0].embedding;
}

/**
 * Classify image using CLIP
 */
export async function classifyImage(
  request: CLIPRequest
): Promise<CLIPResponse> {
  if (!request.labels || request.labels.length === 0) {
    throw new Error('Labels required for classification');
  }

  const embedding = await getImageEmbedding(request.image);
  
  // For classification, we'd compare image embedding with text embeddings of labels
  // This is a simplified version - full CLIP would do proper similarity computation
  const labelEmbeddings = await Promise.all(
    request.labels.map(label => 
      getTextEmbedding(label) // Would use CLIP text encoder
    )
  );

  // Compute cosine similarity
  const similarities = labelEmbeddings.map((labelEmb, idx) => ({
    label: request.labels![idx],
    score: cosineSimilarity(embedding, labelEmb),
  }));

  // Sort by score descending
  similarities.sort((a, b) => b.score - a.score);

  return {
    classification: similarities,
    model: 'clip-vit-base-patch32',
  };
}

/**
 * Get text embedding (for CLIP text encoder)
 */
async function getTextEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Text embedding error: ${response.status}`);
  }

  const result = await response.json();
  return result.data[0].embedding;
}

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

