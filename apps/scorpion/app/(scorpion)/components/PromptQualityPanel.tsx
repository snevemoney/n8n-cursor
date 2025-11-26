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

export function PromptQualityPanel({ memberIssues }: Props) {
  const member = memberIssues.find((m) => m.memberId === 'prompt-quality');
  if (!member || !member.issues.length) return null;

  return (
    <section className="rounded border border-neutral-800 bg-black/40 p-3 text-xs mt-3">
      <h3 className="font-semibold mb-1">Prompt Quality Council</h3>
      <p className="text-neutral-400 mb-2">
        Detects missing prompt elements and suggests how to improve them.
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
    </section>
  );
}

