'use client';

interface CouncilIssue {
  severity: number;
  tag: string;
  message: string;
  recommendation: string;
}

interface MemberIssues {
  memberId: string;
  issues: CouncilIssue[];
}

interface DataWorkflowDecision {
  id: string;
  toolTags: string[];
  confidence: number;
  notes?: string;
}

interface Props {
  memberIssues: MemberIssues[];
  dataWorkflow?: DataWorkflowDecision | null;
}

export function DataOpsDebugPanel({
  memberIssues,
  dataWorkflow,
}: Props) {
  const member = memberIssues.find((m) => m.memberId === 'data-ops');

  if (!member && (!dataWorkflow || dataWorkflow.id === 'NONE')) return null;

  return (
    <section className="mt-2 rounded border border-neutral-800 bg-black/40 p-3 text-xs space-y-3">
      {member && member.issues.length > 0 && (
        <div>
          <h3 className="font-semibold mb-1">DataOps Council</h3>
          <p className="text-neutral-400 mb-2">
            Guidance for data comparison/cleaning/enrichment workflows.
          </p>
          <ul className="space-y-2">
            {member.issues.map((issue, i) => (
              <li key={i} className="border border-neutral-700 rounded p-2">
                <p>
                  <strong>[sev {issue.severity}]</strong> {issue.message}
                </p>
                <p className="text-neutral-400 mt-1">
                  Recommendation: {issue.recommendation}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {dataWorkflow && dataWorkflow.id !== 'NONE' && (
        <div>
          <h3 className="font-semibold mb-1">Data Workflow Selector</h3>
          <p className="text-neutral-400 mb-1">
            Inferred workflow: how Scorpion plans to handle the data task.
          </p>
          <p>
            <strong>Workflow:</strong>{' '}
            <span className="text-emerald-400">{dataWorkflow.id}</span>
          </p>
          <p>
            <strong>Tool tags:</strong>{' '}
            <span className="text-neutral-300">{dataWorkflow.toolTags.join(', ')}</span>
          </p>
          <p>
            <strong>Confidence:</strong>{' '}
            <span className="text-yellow-400">
              {(dataWorkflow.confidence * 100).toFixed(0)}%
            </span>
          </p>
          {dataWorkflow.notes && (
            <p className="text-neutral-400 mt-1 text-[10px] italic">
              {dataWorkflow.notes}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

