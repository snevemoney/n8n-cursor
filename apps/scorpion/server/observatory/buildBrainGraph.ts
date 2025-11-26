/**
 * Build Scorpion Brain Graph
 * Power of 10 Rule 3: Functions ≤ 60 lines, Rule 1: No recursion
 */

import type { BrainNode, BrainEdge, BrainGraph } from './types';
import { toolRegistry } from '@/lib/orchestrator/tool-registry';
import { listTools } from '@/lib/chat/tools';
import { MEMBERS } from '../council';
import { EXPERTS } from '../orchestrator/experts';

// Power of 10 Rule 2: Bounded iterations
const MAX_NODES = 1000;
const MAX_EDGES = 5000;

/**
 * Create LLM/LRM nodes from config
 * Power of 10 Rule 3: ≤ 60 lines
 */
function createLLMNodes(): BrainNode[] {
  const nodes: BrainNode[] = [];
  
  // Core LLM - check environment
  const ollamaUrl = process.env['OLLAMA_BASE_URL'] || 'http://localhost:11434';
  const openaiKey = process.env['OPENAI_API_KEY'];
  
  nodes.push({
    id: 'llm:core',
    kind: 'llm',
    label: 'Core LLM',
    layer: 'llm',
    description: 'Primary language model for chat and orchestration',
    params: {
      provider: openaiKey ? 'openai' : 'ollama',
      model: process.env['OLLAMA_MODEL'] || 'qwen2.5:latest',
      baseUrl: ollamaUrl,
      toolCallingEnabled: true,
    },
  });
  
  // Reasoning model if configured
  if (process.env['REASONING_MODEL']) {
    nodes.push({
      id: 'lrm:reasoning',
      kind: 'lrm',
      label: 'Reasoning Model',
      layer: 'llm',
      description: 'Advanced reasoning model for complex tasks',
      params: {
        model: process.env['REASONING_MODEL'],
        provider: 'ollama',
      },
    });
  }
  
  return nodes;
}

/**
 * Create agent nodes
 * Power of 10 Rule 3: ≤ 60 lines
 */
function createAgentNodes(): BrainNode[] {
  const nodes: BrainNode[] = [];
  
  // Main orchestrator
  nodes.push({
    id: 'agent:orchestrator',
    kind: 'agent',
    label: 'Orchestrator',
    layer: 'agents',
    description: 'Main orchestration agent (Planner → Council → Executor → Summarizer)',
    params: {
      phases: ['PLAN', 'COUNCIL', 'TOOL_SELECT', 'KNOWLEDGE', 'USER_TOOLS', 'EXECUTE'],
    },
  });
  
  // Council members
  for (const member of MEMBERS) {
    nodes.push({
      id: `agent:council:${member.id}`,
      kind: 'agent',
      label: `Council: ${member.name}`,
      layer: 'agents',
      description: member.description || `Council member: ${member.name}`,
      params: {
        councilId: member.id,
        weight: member.weight || 1,
      },
    });
  }
  
  return nodes;
}

/**
 * Create tool nodes including voice tools
 * Power of 10 Rule 3: ≤ 60 lines
 */
function createToolNodes(): BrainNode[] {
  const nodes: BrainNode[] = [];
  
  // Get all registered tools
  const tools = listTools();
  for (const tool of tools) {
    const toolMeta = toolRegistry.get(tool.name);
    nodes.push({
      id: `tool:${tool.name}`,
      kind: 'tool',
      label: tool.name,
      layer: 'tools',
      description: tool.description || `Tool: ${tool.name}`,
      params: {
        toolName: tool.name,
        timeoutMs: toolMeta?.metadata?.timeoutMs || 60000,
        retries: toolMeta?.metadata?.maxRetries || 0,
        source: (toolMeta?.tags && Array.isArray(toolMeta.tags) && toolMeta.tags.some((tag: string) => tag.toLowerCase().includes('mcp'))) ? 'mcp' : 'internal',
      },
    });
  }
  
  // Voice tools (from Phase 1)
  nodes.push({
    id: 'tool:voice.speakText',
    kind: 'tool',
    label: 'Voice: Speak Text',
    layer: 'tools',
    description: 'Text-to-Speech via voice service',
    params: {
      toolName: 'voice.speakText',
      serviceUrl: process.env['VOICE_SERVICE_URL'] || 'http://localhost:7001',
      ttsModel: process.env['KOKORO_VOICE'] || 'en',
      sessionSupport: true,
    },
  });
  
  nodes.push({
    id: 'tool:voice.session',
    kind: 'tool',
    label: 'Voice: Session',
    layer: 'tools',
    description: 'Voice session management (start/stop)',
    params: {
      toolName: 'voice.session',
      serviceUrl: process.env['VOICE_SERVICE_URL'] || 'http://localhost:7001',
      sessionSupport: true,
    },
  });
  
  return nodes;
}

/**
 * Create Expert nodes (MoE system)
 * Power of 10 Rule 3: ≤ 60 lines, Rule 2: Bounded iteration
 */
function createExpertNodes(): BrainNode[] {
  const nodes: BrainNode[] = [];
  
  // Power of 10 Rule 2: Bounded loop
  for (let i = 0; i < EXPERTS.length; i++) {
    const expert = EXPERTS[i];
    if (!expert) continue;
    
    nodes.push({
      id: `expert:${expert.id}`,
      kind: 'expert',
      label: expert.name,
      layer: 'experts',
      description: expert.description,
      params: {
        priority: expert.priority,
        tags: expert.tags.join(','),
        maxSteps: expert.constraints?.maxSteps || null,
        maxTokens: expert.constraints?.maxTokens || null,
      },
    });
  }
  
  return nodes;
}

/**
 * Create RAG/data source nodes
 * Power of 10 Rule 3: ≤ 60 lines
 */
function createRAGNodes(): BrainNode[] {
  const nodes: BrainNode[] = [];
  
  nodes.push({
    id: 'rag:vector-store',
    kind: 'rag',
    label: 'Vector Store',
    layer: 'rag',
    description: 'RAG vector database for knowledge retrieval',
    params: {
      indexName: process.env['VECTOR_DB_INDEX'] || 'scorpion-knowledge',
      embeddingModel: process.env['EMBEDDING_MODEL'] || 'text-embedding-3-small',
      maxChunks: 10,
    },
  });
  
  return nodes;
}

/**
 * Create edges between nodes
 * Power of 10 Rule 3: ≤ 60 lines
 */
function createEdges(nodes: BrainNode[]): BrainEdge[] {
  const edges: BrainEdge[] = [];
  let edgeId = 0;
  
  // Helper to find node by pattern
  const findNode = (pattern: string): BrainNode | undefined => {
    return nodes.find(n => n.id.includes(pattern));
  };
  
  // Orchestrator → LLM (high attention - core dependency)
  const orchestrator = findNode('agent:orchestrator');
  const coreLLM = findNode('llm:core');
  if (orchestrator && coreLLM) {
    edges.push({
      id: `edge:${edgeId++}`,
      from: orchestrator.id,
      to: coreLLM.id,
      label: 'calls',
      attentionWeight: 1.0, // Maximum attention - always used
    });
  }
  
  // Orchestrator → Experts (MoE routing) - attention based on expert priority
  nodes.filter(n => n.kind === 'expert').forEach(expert => {
    if (orchestrator) {
      const priority = (expert.params?.priority as number) || 5;
      const maxPriority = Math.max(...EXPERTS.map(e => e.priority || 5), 5);
      const attentionWeight = Math.min(1.0, priority / maxPriority);
      
      edges.push({
        id: `edge:${edgeId++}`,
        from: orchestrator.id,
        to: expert.id,
        label: 'routes',
        attentionWeight: attentionWeight,
      });
    }
  });
  
  // Orchestrator → Voice tools (moderate attention)
  const voiceSpeak = findNode('tool:voice.speakText');
  if (orchestrator && voiceSpeak) {
    edges.push({
      id: `edge:${edgeId++}`,
      from: orchestrator.id,
      to: voiceSpeak.id,
      label: 'uses',
      attentionWeight: 0.5, // Moderate attention for voice tools
    });
  }
  
  // Orchestrator → Council members (with attention weights based on member weight)
  nodes.filter(n => n.id.startsWith('agent:council:')).forEach(council => {
    if (orchestrator) {
      // Extract member weight from node params, normalize to 0-1
      const memberWeight = (council.params?.weight as number) || 1.0;
      const maxWeight = Math.max(...MEMBERS.map(m => m.weight || 1.0), 1.0);
      const attentionWeight = Math.min(1.0, memberWeight / maxWeight);
      
      edges.push({
        id: `edge:${edgeId++}`,
        from: orchestrator.id,
        to: council.id,
        label: 'delegates',
        attentionWeight: attentionWeight,
      });
    }
  });
  
  // Orchestrator → Tools (sample) - moderate attention for commonly used tools
  nodes.filter(n => n.kind === 'tool' && !n.id.includes('voice')).slice(0, 5).forEach(tool => {
    if (orchestrator) {
      // Default attention for tools (can be enhanced with actual usage metrics)
      edges.push({
        id: `edge:${edgeId++}`,
        from: orchestrator.id,
        to: tool.id,
        label: 'uses',
        attentionWeight: 0.6, // Moderate attention for tool usage
      });
    }
  });
  
  // Orchestrator → RAG (high attention - knowledge retrieval)
  const ragStore = findNode('rag:vector-store');
  if (orchestrator && ragStore) {
    edges.push({
      id: `edge:${edgeId++}`,
      from: orchestrator.id,
      to: ragStore.id,
      label: 'queries',
      attentionWeight: 0.8, // High attention for knowledge retrieval
    });
  }
  
  return edges.slice(0, MAX_EDGES); // Power of 10 Rule 2: Bounded
}

/**
 * Build complete brain graph
 * Power of 10 Rule 3: ≤ 60 lines, Rule 1: No recursion
 */
export async function buildBrainGraph(): Promise<BrainGraph> {
  // Power of 10 Rule 5: Assertions
  const nodes: BrainNode[] = [];
  
  // Gather nodes from all layers
  nodes.push(...createLLMNodes());
  nodes.push(...createAgentNodes());
  nodes.push(...createExpertNodes()); // MoE experts
  nodes.push(...createToolNodes());
  nodes.push(...createRAGNodes());
  
  // Power of 10 Rule 2: Bounded size
  const boundedNodes = nodes.slice(0, MAX_NODES);
  
  // Create edges
  const edges = createEdges(boundedNodes);
  
  // Power of 10 Rule 5: Assertion - no duplicate IDs
  const nodeIds = new Set(boundedNodes.map(n => n.id));
  if (nodeIds.size !== boundedNodes.length) {
    throw new Error('Duplicate node IDs detected');
  }
  
  return {
    nodes: boundedNodes,
    edges,
    generatedAt: new Date().toISOString(),
  };
}

