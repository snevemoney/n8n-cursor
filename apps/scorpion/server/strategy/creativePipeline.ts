// apps/scorpion/server/strategy/creativePipeline.ts

export type Modality =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'multimodal'
  | 'unknown';

export type CreativeGoal =
  | 'generate_new'
  | 'refine_or_edit'
  | 'style_transfer'
  | 'variation'
  | 'analyze_only'
  | 'predictive'
  | 'unknown';

export type PipelineId =
  | 'TEXT_LLM'
  | 'TEXT_LLM_EDIT'
  | 'IMAGE_GAN'
  | 'IMAGE_VAE'
  | 'IMAGE_DIFFUSION'
  | 'IMAGE_UPSCALE'
  | 'AUDIO_GEN'
  | 'VIDEO_GEN'
  | 'MULTIMODAL_LLM'
  | 'PREDICTIVE_ML'
  | 'NO_CREATIVE_PIPELINE';

export interface CreativePipelineDecision {
  id: PipelineId;
  modality: Modality;
  goal: CreativeGoal;
  modelFamilyHint?: string; // e.g. 'LLM', 'GAN', 'VAE', 'Diffusion'
  toolTags: string[]; // tags you can map to actual tools: ['llm.text.gen', 'image.diffusion', ...]
  confidence: number; // 0–1
  notes?: string;
}

/**
 * Simple heuristic intent classifier for creative requests.
 * You can later replace this with your planner or classifier.
 */
export function inferCreativeIntent(text: string): {
  modality: Modality;
  goal: CreativeGoal;
} {
  const t = text.toLowerCase();

  // Modality detection
  let modality: Modality = 'unknown';
  if (t.includes('image') || t.includes('picture') || t.includes('photo') || t.includes('logo') || t.includes('graphic')) {
    modality = 'image';
  } else if (t.includes('audio') || t.includes('sound') || t.includes('music') || t.includes('voice')) {
    modality = 'audio';
  } else if (t.includes('video') || t.includes('clip') || t.includes('animation') || t.includes('movie')) {
    modality = 'video';
  } else if (t.includes('text') || t.includes('story') || t.includes('essay') || t.includes('article') || t.includes('blog') || t.includes('content')) {
    modality = 'text';
  }

  // Multimodal hints
  if ((t.includes('describe this image') || t.includes('caption this') || t.includes('what\'s in this image')) && modality === 'image') {
    modality = 'multimodal'; // image in, text out
  }

  // Goal detection
  let goal: CreativeGoal = 'unknown';
  if (
    t.includes('generate') ||
    t.includes('create') ||
    t.includes('write me') ||
    t.includes('make a') ||
    t.includes('produce') ||
    t.includes('build a')
  ) {
    goal = 'generate_new';
  }

  if (
    t.includes('edit') ||
    t.includes('improve') ||
    t.includes('rewrite') ||
    t.includes('polish') ||
    t.includes('correct') ||
    t.includes('refine') ||
    t.includes('fix')
  ) {
    goal = 'refine_or_edit';
  }

  if (
    t.includes('style transfer') ||
    t.includes('in the style of') ||
    t.includes('make it look like') ||
    t.includes('apply this style') ||
    t.includes('stylize')
  ) {
    goal = 'style_transfer';
  }

  if (
    t.includes('variation') ||
    t.includes('variant') ||
    t.includes('another version') ||
    t.includes('remix') ||
    t.includes('different version')
  ) {
    goal = 'variation';
  }

  if (t.includes('classify') || t.includes('detect') || t.includes('analyze') || t.includes('explain') || t.includes('identify')) {
    // If no explicit create/generate verbs, assume analysis
    if (goal === 'unknown') {
      goal = 'analyze_only';
    }
  }

  if (
    t.includes('predict') ||
    t.includes('forecast') ||
    t.includes('estimate probability') ||
    t.includes('risk score') ||
    t.includes('pricing model') ||
    t.includes('churn') ||
    t.includes('recommendation')
  ) {
    goal = 'predictive';
  }

  return { modality, goal };
}

/**
 * Main creative pipeline selector.
 * Input: user message + optional tags.
 * Output: which pipeline Scorpion should use.
 */
export function selectCreativePipeline(input: {
  text: string;
  domainTags?: string[]; // optional tags from intent classifier/planner
}): CreativePipelineDecision {
  const { modality, goal } = inferCreativeIntent(input.text);
  const tags = new Set(input.domainTags ?? []);

  // If domain is clearly predictive (risk, pricing, etc.), prefer ML
  if (goal === 'predictive' || tags.has('risk-model') || tags.has('pricing-model')) {
    return {
      id: 'PREDICTIVE_ML',
      modality: modality === 'unknown' ? 'text' : modality,
      goal: 'predictive',
      modelFamilyHint: 'ML',
      toolTags: ['ml.predictive'],
      confidence: 0.9,
      notes:
        'Task looks predictive/analytical. Use a predictive ML model instead of a generative model.',
    };
  }

  // No creative goal detected: no pipeline
  if (goal === 'analyze_only' || (goal === 'unknown' && modality === 'unknown')) {
    return {
      id: 'NO_CREATIVE_PIPELINE',
      modality: 'unknown',
      goal: 'unknown',
      toolTags: [],
      confidence: 0.2,
      notes:
        'No obvious creative generation requested. Likely a pure reasoning/analysis task.',
    };
  }

  // TEXT pipelines
  if (modality === 'text' || modality === 'unknown') {
    if (goal === 'refine_or_edit') {
      return {
        id: 'TEXT_LLM_EDIT',
        modality: 'text',
        goal: 'refine_or_edit',
        modelFamilyHint: 'LLM',
        toolTags: ['llm.text.edit'],
        confidence: 0.95,
        notes: 'Use LLM edit/refine pipeline (grammar, style, tone adjustments).',
      };
    }

    // default for text = generate new
    return {
      id: 'TEXT_LLM',
      modality: 'text',
      goal: goal === 'unknown' ? 'generate_new' : goal,
      modelFamilyHint: 'LLM',
      toolTags: ['llm.text.gen'],
      confidence: 0.95,
      notes: 'Use standard LLM text generation pipeline.',
    };
  }

  // IMAGE pipelines
  if (modality === 'image') {
    if (goal === 'variation' || tags.has('logo-variation') || tags.has('design-variation')) {
      return {
        id: 'IMAGE_VAE',
        modality: 'image',
        goal: 'variation',
        modelFamilyHint: 'VAE',
        toolTags: ['image.vae.variation'],
        confidence: 0.85,
        notes:
          'Use VAE-style pipeline for generating coherent variations of existing images/logos.',
      };
    }

    if (goal === 'refine_or_edit' || goal === 'style_transfer') {
      return {
        id: 'IMAGE_DIFFUSION',
        modality: 'image',
        goal: goal === 'style_transfer' ? 'style_transfer' : 'refine_or_edit',
        modelFamilyHint: 'Diffusion',
        toolTags: ['image.diffusion.edit'],
        confidence: 0.9,
        notes: 'Use diffusion-based pipeline for image editing/inpainting/style transfer.',
      };
    }

    const inputText = input.text.toLowerCase();
    if (inputText.includes('upscale') || inputText.includes('enhance resolution') || inputText.includes('higher quality')) {
      return {
        id: 'IMAGE_UPSCALE',
        modality: 'image',
        goal: 'refine_or_edit',
        modelFamilyHint: 'Upscaler',
        toolTags: ['image.upscale'],
        confidence: 0.9,
        notes: 'Use image upscaling pipeline to enhance resolution.',
      };
    }

    // default: generate a new image
    return {
      id: 'IMAGE_DIFFUSION',
      modality: 'image',
      goal: 'generate_new',
      modelFamilyHint: 'Diffusion',
      toolTags: ['image.diffusion.gen'],
      confidence: 0.9,
      notes: 'Use diffusion or GAN-based image generator for new images.',
    };
  }

  // MULTIMODAL pipelines (image in, text out or vice versa)
  if (modality === 'multimodal') {
    // If user describes an image and wants text (caption, explanation)
    if (goal === 'analyze_only' || goal === 'unknown') {
      return {
        id: 'MULTIMODAL_LLM',
        modality: 'multimodal',
        goal: 'analyze_only',
        modelFamilyHint: 'LLM',
        toolTags: ['multimodal.llm.analyze'],
        confidence: 0.85,
        notes: 'Use multimodal LLM to analyze image and generate textual explanation/caption.',
      };
    }

    // If they clearly want cross-modal generation
    return {
      id: 'MULTIMODAL_LLM',
      modality: 'multimodal',
      goal: goal,
      modelFamilyHint: 'LLM',
      toolTags: ['multimodal.llm.gen'],
      confidence: 0.8,
      notes: 'Use multimodal LLM pipeline for cross-modal generation.',
    };
  }

  // AUDIO pipelines
  if (modality === 'audio') {
    return {
      id: 'AUDIO_GEN',
      modality: 'audio',
      goal: goal === 'unknown' ? 'generate_new' : goal,
      modelFamilyHint: 'AudioGen',
      toolTags: ['audio.gen'],
      confidence: 0.8,
      notes: 'Use audio generation pipeline (music, sound, voice).',
    };
  }

  // VIDEO pipelines
  if (modality === 'video') {
    return {
      id: 'VIDEO_GEN',
      modality: 'video',
      goal: goal === 'unknown' ? 'generate_new' : goal,
      modelFamilyHint: 'VideoGen',
      toolTags: ['video.gen'],
      confidence: 0.7,
      notes: 'Use video generation pipeline (short clips, animations).',
    };
  }

  // Fallback
  return {
    id: 'NO_CREATIVE_PIPELINE',
    modality,
    goal,
    toolTags: [],
    confidence: 0.3,
    notes: 'Could not confidently infer a creative pipeline.',
  };
}

