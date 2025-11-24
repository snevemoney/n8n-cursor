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

interface Props {
  memberIssues: MemberIssues[];
}

export function GenModelsDebugPanel({ memberIssues }: Props) {
  const member = memberIssues.find((m) => m.memberId === 'generative-models');
  if (!member || !member.issues.length) return null;

  return (
    <section className="mt-2 rounded border border-neutral-800 p-3 bg-black/40 text-xs">
      <h3 className="font-semibold mb-2">Generative Model Architecture Council</h3>
      <p className="text-neutral-400 mb-2">
        Ensures Scorpion correctly uses GANs, VAEs, LLMs, and Diffusion models for creation tasks.
      </p>
      <ul className="space-y-2">
        {member.issues.map((issue, idx) => (
          <li key={idx} className="border border-neutral-700 rounded p-2">
            <div className="flex justify-between mb-1">
              <span className="font-semibold">
                [sev {issue.severity}] {issue.tag.toUpperCase()}
              </span>
            </div>
            <p className="mt-1">{issue.message}</p>
            <p className="mt-1 text-neutral-400">
              Recommendation: {issue.recommendation}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

