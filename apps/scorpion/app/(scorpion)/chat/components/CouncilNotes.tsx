'use client';

import { CouncilResult } from '@/server/types/council';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface CouncilNotesProps {
  councilResult: CouncilResult;
}

export function CouncilNotes({ councilResult }: CouncilNotesProps) {
  if (!councilResult || councilResult.allIssues.length === 0) {
    return (
      <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span className="font-semibold">Council Review: Approved</span>
        </div>
        <p className="text-neutral-300 mt-1">No issues detected. Plan is ready to execute.</p>
      </div>
    );
  }

  const issuesByTag = councilResult.allIssues.reduce(
    (acc, issue) => {
      const tag = issue.tag || 'other'; // Power of 10 Rule 7: Handle undefined
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(issue);
      return acc;
    },
    {} as Record<string, typeof councilResult.allIssues>,
  );

  const severityColors = {
    1: 'text-blue-400',
    2: 'text-yellow-400',
    3: 'text-orange-400',
    4: 'text-red-400',
    5: 'text-red-500',
  };

  const severityIcons = {
    1: Info,
    2: Info,
    3: AlertTriangle,
    4: AlertTriangle,
    5: XCircle,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Council Review</h3>
        <span
          className={`text-xs px-2 py-1 rounded ${
            councilResult.approved
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {councilResult.approved ? 'Approved' : 'Needs Review'}
        </span>
      </div>

      {councilResult.warnings.length > 0 && (
        <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-semibold">Warnings</span>
          </div>
          <ul className="list-disc list-inside text-neutral-300 space-y-1">
            {councilResult.warnings.map((warning, i) => (
              <li key={i} className="text-xs">{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {Object.entries(issuesByTag).map(([tag, issues]) => (
        <div key={tag} className="rounded-md border border-neutral-700 p-3 bg-black/40">
          <h4 className="text-xs font-semibold text-neutral-300 mb-2 uppercase tracking-wider">
            {tag}
          </h4>
          <div className="space-y-2">
            {issues.map((issue) => {
              const Icon = severityIcons[issue.severity] || Info;
              return (
                <div
                  key={issue.councillorId + issue.message}
                  className="border-l-2 border-neutral-600 pl-3"
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`h-4 w-4 mt-0.5 ${severityColors[issue.severity]}`} />
                    <div className="flex-1">
                      <p className={`text-xs ${severityColors[issue.severity]}`}>
                        {issue.message}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        <span className="font-semibold">Recommendation:</span> {issue.recommendation}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        From: {issue.councillorId}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="text-xs text-neutral-400">
        <p>
          <span className="font-semibold">Councillors:</span>{' '}
          {councilResult.councillorOutputs.map((c) => c.councillorName).join(', ')}
        </p>
      </div>
    </div>
  );
}

