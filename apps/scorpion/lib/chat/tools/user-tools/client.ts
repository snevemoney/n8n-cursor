/**
 * Client-safe exports for user tools
 * This file only exports metadata and doesn't import any server-side code
 * 
 * IMPORTANT: Do not import tool implementations here as they may contain
 * server-side code. Define metadata directly.
 */

import type { ToolSpec } from '../../types';

/**
 * User tools metadata (client-safe, no handlers or server-side imports)
 * Tools marked with implemented: false are incomplete and hidden from UI by default
 */
const userToolsMetadata: Array<{ name: string; label: string; description: string; implemented?: boolean }> = [
  { name: 'user.tutorial', label: 'Tutorial Generator', description: 'Record screen or browser tab and generate step-by-step tutorial with screenshots', implemented: true },
  { name: 'user.translate', label: 'Translation Tool', description: 'Translate text or documents between multiple languages with auto-detection', implemented: false },
  { name: 'user.content', label: 'Content Assistant', description: 'AI assistant for answering questions, drafting content, debugging code, and explaining concepts', implemented: true },
  { name: 'user.search', label: 'Search Assistant', description: 'Live web search with citations and summaries', implemented: true },
  { name: 'user.summarize', label: 'Document Summarizer', description: 'Summarize notes, docs, or project pages into bullet points and action items', implemented: true },
  { name: 'user.grammar', label: 'Grammar Checker', description: 'Check grammar, spelling, style, and tone with inline corrections', implemented: false },
  { name: 'user.design', label: 'Design Helper', description: 'Generate layout ideas, copy, and design specs for social posts and banners', implemented: true },
  { name: 'user.simplify', label: 'Text Simplifier', description: 'Rewrite complex text into clearer versions at different reading levels', implemented: false },
    { name: 'user.transcribe', label: 'Transcription Tool', description: 'Transcribe audio/video recordings and generate summaries with action items', implemented: true },
  { name: 'user.presentation', label: 'Presentation Generator', description: 'Generate slide deck structure from outline or prompt', implemented: false },
  { name: 'user.workflow', label: 'Workflow Automation', description: 'Create n8n workflows from natural language descriptions', implemented: false },
  { name: 'user.video-clip', label: 'Video Clip Generator', description: 'Analyze long videos and extract engaging segments for short clips', implemented: false },
  { name: 'user.storyboard', label: 'Storyboard Creator', description: 'Convert blog posts or scripts into video storyboards', implemented: true },
  { name: 'user.research', label: 'Research Engine', description: 'Deep research Q&A with multi-source aggregation', implemented: true },
  { name: 'user.seo', label: 'SEO Content Writer', description: 'Generate SEO-optimized articles and landing page copy', implemented: true },
  { name: 'user.media-edit', label: 'Media Editor', description: 'Edit audio/video using text commands', implemented: false },
  { name: 'user.marketing', label: 'Marketing Copywriter', description: 'Create high-conversion marketing copy with A/B variants', implemented: true },
  { name: 'user.purposeful-search', label: 'Purposeful Search', description: 'Search for responsible or sustainable options with impact ratings', implemented: true },
  { name: 'user.copy', label: 'Copy Generator', description: 'Generate ad, product, and email copy variations', implemented: true },
    { name: 'user.image', label: 'Image Generator', description: 'Generate images from text prompts with style and aspect ratio controls', implemented: true },
];

/**
 * Get slash command for a user tool
 */
function getSlashCommand(toolName: string): string {
  const mapping: Record<string, string> = {
    'user.tutorial': '/tutorial',
    'user.translate': '/translate',
    'user.content': '/content',
    'user.search': '/search',
    'user.summarize': '/summarize',
    'user.grammar': '/grammar',
    'user.design': '/design',
    'user.simplify': '/simplify',
    'user.transcribe': '/transcribe',
    'user.presentation': '/presentation',
    'user.workflow': '/workflow',
    'user.video-clip': '/video-clip',
    'user.storyboard': '/storyboard',
    'user.research': '/research-deep',
    'user.seo': '/seo',
    'user.media-edit': '/media-edit',
    'user.marketing': '/marketing',
    'user.purposeful-search': '/purposeful-search',
    'user.copy': '/copy',
    'user.image': '/image',
  };
  return mapping[toolName] || `/${toolName.replace('user.', '')}`;
}

/**
 * Get category for a user tool
 */
function getCategory(toolName: string): string {
  const categories: Record<string, string> = {
    'user.tutorial': 'media',
    'user.translate': 'content',
    'user.content': 'content',
    'user.search': 'research',
    'user.summarize': 'content',
    'user.grammar': 'content',
    'user.design': 'design',
    'user.simplify': 'content',
    'user.transcribe': 'media',
    'user.presentation': 'content',
    'user.workflow': 'automation',
    'user.video-clip': 'media',
    'user.storyboard': 'media',
    'user.research': 'research',
    'user.seo': 'content',
    'user.media-edit': 'media',
    'user.marketing': 'content',
    'user.purposeful-search': 'research',
    'user.copy': 'content',
    'user.image': 'design',
  };
  return categories[toolName] || 'content';
}

/**
 * Get icon for a user tool
 */
function getIcon(toolName: string): string {
  const icons: Record<string, string> = {
    'user.tutorial': '📹',
    'user.translate': '🌐',
    'user.content': '✍️',
    'user.search': '🔍',
    'user.summarize': '📝',
    'user.grammar': '✓',
    'user.design': '🎨',
    'user.simplify': '📖',
    'user.transcribe': '🎤',
    'user.presentation': '📊',
    'user.workflow': '⚙️',
    'user.video-clip': '✂️',
    'user.storyboard': '🎬',
    'user.research': '🔬',
    'user.seo': '📈',
    'user.media-edit': '🎞️',
    'user.marketing': '💼',
    'user.purposeful-search': '🌱',
    'user.copy': '📋',
    'user.image': '🖼️',
  };
  return icons[toolName] || '🔧';
}

/**
 * List all available user tools (client-safe)
 * Only returns implemented tools by default
 */
export function listUserTools(includeUnimplemented: boolean = false): Array<{ name: string; label: string; description: string; slashCommand: string; category: string; icon: string; implemented: boolean }> {
  return userToolsMetadata
    .filter(tool => includeUnimplemented || tool.implemented !== false)
    .map(tool => ({
      name: tool.name,
      label: tool.label,
      description: tool.description,
      slashCommand: getSlashCommand(tool.name),
      category: getCategory(tool.name),
      icon: getIcon(tool.name),
      implemented: tool.implemented !== false,
    }));
}

