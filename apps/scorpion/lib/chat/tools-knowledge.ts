/**
 * Tools Knowledge Base Generator
 * Creates knowledge entries for all available tools so they can be discovered via RAG
 */

import { ExtractedKnowledge } from '@scorpion/core';
import { tools } from './tools';
import { userTools } from './tools/user-tools';

/**
 * Generate knowledge entries for all tools
 */
export function generateToolsKnowledge(): ExtractedKnowledge[] {
  const knowledge: ExtractedKnowledge[] = [];

  // AI-callable tools
  Object.entries(tools).forEach(([name, tool]) => {
    knowledge.push({
      id: `tool-${name}`,
      title: `Tool: ${tool.label || name}`,
      description: tool.description || `Tool for ${name}`,
      source: 'scorpion-tools',
      type: 'tool',
      category: 'ai-tools',
      tags: ['tool', 'ai-callable', name, ...(tool.label ? [tool.label.toLowerCase()] : [])],
      extractedAt: new Date().toISOString(),
      dependencies: [],
      codeSnippets: [],
    });
  });

  // User tools
  Object.entries(userTools).forEach(([name, tool]) => {
    if (tool.implemented !== false) {
      const slashCommand = getSlashCommand(name);
      const keywords = extractKeywords(tool.description || '', tool.label || name);
      
      knowledge.push({
        id: `user-tool-${name}`,
        title: `User Tool: ${tool.label || name}`,
        description: `${tool.description || `Tool for ${name}`}\n\nSlash Command: ${slashCommand}\n\nUse this tool to: ${getUseCase(name)}`,
        source: 'scorpion-user-tools',
        type: 'user-tool',
        category: getCategory(name),
        tags: [
          'tool',
          'user-tool',
          name,
          slashCommand,
          ...keywords,
          ...(tool.label ? [tool.label.toLowerCase()] : []),
        ],
        extractedAt: new Date().toISOString(),
        dependencies: [],
        codeSnippets: [],
      });
    }
  });

  return knowledge;
}

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

function getUseCase(toolName: string): string {
  const useCases: Record<string, string> = {
    'user.image': 'generate images from text prompts, create visual content, design graphics',
    'user.transcribe': 'transcribe audio/video files, convert speech to text, extract transcripts',
    'user.design': 'create design layouts, generate design specs, design social media posts',
    'user.content': 'answer questions, draft content, debug code, explain concepts',
    'user.search': 'search the web with live results and citations',
    'user.summarize': 'summarize documents, notes, or content into bullet points',
    'user.marketing': 'create marketing copy with A/B variants',
    'user.copy': 'generate ad copy, product descriptions, email content',
    'user.seo': 'create SEO-optimized articles and landing pages',
    'user.research': 'conduct deep research with multi-source aggregation',
    'user.storyboard': 'convert blog posts or scripts into video storyboards',
  };
  return useCases[toolName] || 'perform tasks related to this tool';
}

function extractKeywords(description: string, label: string): string[] {
  const keywords: string[] = [];
  const text = `${label} ${description}`.toLowerCase();
  
  // Common action keywords
  const actions = ['create', 'generate', 'make', 'build', 'design', 'write', 'search', 'transcribe', 'translate', 'summarize', 'analyze'];
  actions.forEach(action => {
    if (text.includes(action)) {
      keywords.push(action);
    }
  });
  
  // Content type keywords
  const contentTypes = ['image', 'audio', 'video', 'text', 'content', 'copy', 'design', 'layout', 'transcript'];
  contentTypes.forEach(type => {
    if (text.includes(type)) {
      keywords.push(type);
    }
  });
  
  return keywords;
}

