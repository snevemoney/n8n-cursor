// apps/scorpion/server/council/dataOpsCouncil.ts

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

function includesAny(text: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some((p) =>
    typeof p === 'string' ? text.includes(p.toLowerCase()) : p.test(text),
  );
}

export const DataOpsCouncilMember: CouncilMember = {
  id: 'data-ops',
  name: 'DataOps Councillor',
  description:
    'Understands data comparison/cleaning/enrichment tasks (Excel, CSV, PDFs) and enforces privacy, verification, and step-by-step workflows.',

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n' +
      (input.planSummary || '') +
      '\n' +
      (input.draftAnswer || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];

    const mentionsExcel = includesAny(text, [
      'excel',
      '.xlsx',
      '.xls',
      'spreadsheet',
      'copilot for excel',
      'table',
      'csv',
      'tabular',
    ]);

    const mentionsCompare = includesAny(text, [
      'compare two files',
      'compare two reports',
      'compare reports',
      'differences and similarities',
      'compare 2023 and 2024',
      'detect trends',
      'compare pdfs',
      'compare documents',
      'year over year',
    ]);

    const mentionsClean = includesAny(text, [
      'clean',
      'duplicates',
      'deduplicate',
      'missing area codes',
      'missing data',
      'fill in missing',
      'enrich data',
      'null values',
      'empty cells',
    ]);

    const mentionsAttach = includesAny(text, [
      'attach both pdfs',
      'attached pdfs',
      'attach file',
      'upload file',
      'uploaded',
    ]);

    const mentionsSensitive = includesAny(text, [
      'personal information',
      'pii',
      'sensitive data',
      'names',
      'social security',
      'sin',
      'address',
      'phone number',
      'email address',
      'private data',
    ]);

    const isDataWorkflow =
      mentionsExcel || mentionsCompare || mentionsClean || mentionsAttach;

    if (!isDataWorkflow) {
      return { approved: true, issues: [] };
    }

    // 1) Privacy & sensitive data
    if (!mentionsSensitive && (mentionsExcel || mentionsAttach)) {
      issues.push({
        severity: 3,
        tag: 'data-privacy',
        message:
          'Data workflow detected (Excel/CSV/PDF), but no mention of removing sensitive or personal information.',
        recommendation:
          'Remind the user to remove or anonymize personal/sensitive data (names, IDs, addresses, phone numbers) before processing.',
        councillorId: 'data-ops',
      });

      logImprovementSignal({
        type: 'BROKEN_FLOW',
        message: 'Data workflow detected without privacy considerations.',
        tag: 'data-ops',
        severity: 3,
      });
    }

    // 2) Verification of results
    if (mentionsCompare || mentionsClean) {
      issues.push({
        severity: 2,
        tag: 'data-verification',
        message:
          'AI-generated summaries or cleaned data should be reviewed before use.',
        recommendation:
          'Encourage the user to spot-check key rows/sections to validate that comparisons, trends, and cleaned values are correct.',
        councillorId: 'data-ops',
      });
    }

    // 3) Break down complex flows
    if (mentionsCompare && mentionsClean) {
      issues.push({
        severity: 2,
        tag: 'workflow-design',
        message:
          'User is trying to compare reports and clean data in one go.',
        recommendation:
          'Suggest splitting the work: (1) compare and summarize trends, (2) clean/standardize data, (3) enrich or simulate scenarios.',
        councillorId: 'data-ops',
      });
    }

    // 4) Column-level clarity for Excel tasks
    if (mentionsExcel && mentionsClean) {
      const hasColumnSpec = text.includes('column') || text.includes('col ');
      if (!hasColumnSpec) {
        issues.push({
          severity: 1,
          tag: 'prompt',
          message:
            'Excel cleaning/enrichment detected; column-level instructions may be missing.',
          recommendation:
            'Ask the user to specify exact columns and rules, e.g., "remove duplicates based on columns A + B" or "fill missing area codes in column C based on city in column D."',
          councillorId: 'data-ops',
        });
      }
    }

    // 5) Ecological footprint / unnecessary back-and-forth
    if (mentionsAttach) {
      issues.push({
        severity: 1,
        tag: 'efficiency',
        message:
          'Attached multi-page reports: prompting inefficiencies may produce extra compute.',
        recommendation:
          'Encourage the user to state their questions and needed outputs clearly up front, to reduce unnecessary iterations and computing usage.',
        councillorId: 'data-ops',
      });
    }

    return {
      approved: true,
      issues,
    };
  },
};

