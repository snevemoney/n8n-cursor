'use client';

interface CreativePipelineDecision {
  id: string;
  modality: string;
  goal: string;
  modelFamilyHint?: string;
  toolTags: string[];
  confidence: number;
  notes?: string;
}

interface Props {
  pipeline?: CreativePipelineDecision | null;
}

export function CreativePipelinePanel({ pipeline }: Props) {
  if (!pipeline || pipeline.id === 'NO_CREATIVE_PIPELINE') return null;

  const confidenceColor =
    pipeline.confidence >= 0.8
      ? 'text-emerald-400'
      : pipeline.confidence >= 0.5
        ? 'text-yellow-400'
        : 'text-orange-400';

  return (
    <section className="mt-2 rounded border border-emerald-500/30 p-3 bg-emerald-500/10 text-xs">
      <h3 className="font-semibold mb-1">Creative Pipeline Selector</h3>
      <p className="text-neutral-400 mb-2 text-[10px]">
        Scorpion&apos;s inferred creative pipeline for this request.
      </p>
      <div className="space-y-1">
        <p>
          <span className="font-semibold">Pipeline:</span>{' '}
          <span className="text-emerald-400">{pipeline.id}</span>
        </p>
        <p>
          <span className="font-semibold">Modality:</span> {pipeline.modality}
        </p>
        <p>
          <span className="font-semibold">Goal:</span> {pipeline.goal}
        </p>
        {pipeline.modelFamilyHint && (
          <p>
            <span className="font-semibold">Model family:</span>{' '}
            {pipeline.modelFamilyHint}
          </p>
        )}
        <p>
          <span className="font-semibold">Tool tags:</span>{' '}
          <span className="text-neutral-300">{pipeline.toolTags.join(', ')}</span>
        </p>
        <p>
          <span className="font-semibold">Confidence:</span>{' '}
          <span className={confidenceColor}>
            {(pipeline.confidence * 100).toFixed(0)}%
          </span>
        </p>
        {pipeline.notes && (
          <p className="text-neutral-400 mt-2 text-[10px] italic">
            {pipeline.notes}
          </p>
        )}
      </div>
    </section>
  );
}

