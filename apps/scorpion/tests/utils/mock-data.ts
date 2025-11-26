/**
 * Mock data for tests
 */

export const mockAgents = [
  {
    id: 'E-001',
    codename: 'Engineer',
    role: 'Software Engineer',
    specialty: 'Full-stack development',
    status: 'active',
    weight: 1.0,
  },
  {
    id: 'A-002',
    codename: 'Analyst',
    role: 'Data Analyst',
    specialty: 'Data analysis',
    status: 'active',
    weight: 0.8,
  },
];

export const mockWorkflows = [
  {
    id: 'wf-1',
    name: 'Test Workflow',
    active: true,
    nodes: [],
    connections: {},
  },
  {
    id: 'wf-2',
    name: 'Another Workflow',
    active: false,
    nodes: [],
    connections: {},
  },
];

export const mockSettings = {
  ragIndexing: true,
  autoTrigger: false,
  councilAutoContext: true,
  modelSource: 'ollama',
  ollamaUrl: 'http://localhost:11434',
  openaiKey: '',
  entityRetention: '90 days',
  ragModel: 'nomic-embed-text',
  useOpenAIEmbeddings: false,
  useOpenAIFunctionCalling: true,
  maxAgents: 4,
  requestTimeout: 30000,
};

export const mockTableData = [
  { id: '1', name: 'Item 1', status: 'active', description: 'First item' },
  { id: '2', name: 'Item 2', status: 'inactive', description: 'Second item' },
  { id: '3', name: 'Item 3', status: 'active', description: 'Third item with a very long description that should be truncated' },
];

export const mockSpecializedAgents = [
  {
    id: 'data-analytics',
    name: 'Data Analytics Agent',
    description: 'Analyzes data and generates insights',
    methods: ['analyze', 'recommendVisualization', 'suggestMetrics'],
  },
  {
    id: 'system-design',
    name: 'System Design Agent',
    description: 'Designs system architectures',
    methods: ['design', 'reviewArchitecture', 'suggestTechnologies'],
  },
];

