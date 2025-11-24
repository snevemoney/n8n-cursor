'use client';

/**
 * Transformer Lens View Component
 * 
 * Toggle between normal view and transformer-analogy view,
 * showing how Scorpion architecture maps to transformer concepts.
 * 
 * Power of 10 Rule 3: Functions ≤ 60 lines
 */


interface TransformerLensProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const TRANSFORMER_MAPPING = {
  'Input & Context': {
    transformer: 'Tokenization + Embeddings',
    description: 'Text → tokens → dense vectors',
  },
  'Planner': {
    transformer: 'Encoder Self-Attention',
    description: 'Understands source sentence context',
  },
  'Council / Debate': {
    transformer: 'Multi-Head Attention',
    description: 'Multiple perspectives in parallel',
  },
  'Tools & RAG': {
    transformer: 'Cross-Attention',
    description: 'Query external knowledge sources',
  },
  'Executor': {
    transformer: 'Decoder',
    description: 'Generates output step by step',
  },
  'Summarizer / Output': {
    transformer: 'Output Projection',
    description: 'Final linear layer + softmax',
  },
};

export function TransformerLens({ enabled, onToggle }: TransformerLensProps) {
  const handleToggle = () => {
    onToggle(!enabled);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Transformer Lens</h3>
        <button
          onClick={handleToggle}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            enabled
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      
      {enabled && (
        <div className="space-y-2 text-xs">
          <p className="text-white/60 mb-3">
            View showing how Scorpion maps to transformer architecture:
          </p>
          {Object.entries(TRANSFORMER_MAPPING).map(([scorpion, transformer]) => (
            <div key={scorpion} className="p-2 bg-gray-800 rounded">
              <div className="font-semibold text-white/90">{scorpion}</div>
              <div className="text-blue-400 mt-1">→ {transformer.transformer}</div>
              <div className="text-white/50 text-xs mt-1">{transformer.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

