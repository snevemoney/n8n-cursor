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

export function AIFoundationsDebugPanel({ memberIssues }: Props) {
  const member = memberIssues.find((m) => m.memberId === 'ai-foundations');
  if (!member || !member.issues.length) return null;

  return (
    <section className="rounded-md border border-neutral-800 p-3 text-xs bg-black/40 mt-2">
      <h3 className="font-semibold mb-2">AI Foundations Council</h3>
      <p className="text-neutral-400 mb-2">
        Checks that Scorpion is using the right AI subfields (ML, DL, GenAI,
        NLP, LLMs, CV) and not mixing them incorrectly.
      </p>
      <ul className="space-y-2">
        {member.issues.map((issue, idx) => (
          <li key={idx} className="border border-neutral-700 rounded p-2">
            <div className="flex justify-between">
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

