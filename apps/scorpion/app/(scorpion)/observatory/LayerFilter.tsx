'use client';

/**
 * Layer Filter Component
 * Power of 10 Rule 3: Functions ≤ 60 lines
 */

interface LayerFilterProps {
  filters: Record<string, boolean>;
  onFilterChange: (filters: Record<string, boolean>) => void;
}

const LAYERS = ['llm', 'agents', 'experts', 'tools', 'rag', 'data', 'workflows', 'safety', 'telemetry'];

/**
 * Layer Filter - Power of 10 Rule 3: ≤ 60 lines
 */
export function LayerFilter({ filters, onFilterChange }: LayerFilterProps) {
  const handleToggle = (layer: string) => {
    onFilterChange({
      ...filters,
      [layer]: !filters[layer],
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold mb-2">Layers</h3>
      {LAYERS.map(layer => (
        <label key={layer} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters[layer] !== false}
            onChange={() => handleToggle(layer)}
            className="w-4 h-4"
          />
          <span className="text-sm capitalize">{layer}</span>
        </label>
      ))}
    </div>
  );
}

