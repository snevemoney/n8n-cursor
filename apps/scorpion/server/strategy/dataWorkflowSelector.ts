// apps/scorpion/server/strategy/dataWorkflowSelector.ts

export type DataWorkflowId =
  | 'NONE'
  | 'COMPARE_REPORTS'
  | 'SUMMARIZE_REPORT'
  | 'CLEAN_TABULAR'
  | 'ENRICH_TABULAR'
  | 'SIMULATE_SCENARIOS';

export interface DataWorkflowDecision {
  id: DataWorkflowId;
  toolTags: string[]; // tags you map to real tools/workflows
  confidence: number; // 0–1
  notes?: string;
}

export function selectDataWorkflow(input: {
  text: string;
  domainTags?: string[];
}): DataWorkflowDecision {
  const t = input.text.toLowerCase();
  const tags = new Set(input.domainTags ?? []);

  const mentionsExcel =
    t.includes('excel') ||
    t.includes('.xlsx') ||
    t.includes('.xls') ||
    t.includes('csv') ||
    t.includes('spreadsheet') ||
    t.includes('tabular');

  const mentionsCompare =
    t.includes('compare') &&
    (t.includes('report') || t.includes('file') || t.includes('pdf') || t.includes('document'));

  const mentionsTrends =
    t.includes('trend') ||
    t.includes('evolution') ||
    t.includes('year over year') ||
    t.includes('yoy') ||
    t.includes('differences') ||
    t.includes('similarities');

  const mentionsClean =
    t.includes('clean') ||
    t.includes('duplicates') ||
    t.includes('deduplicate') ||
    t.includes('missing') ||
    t.includes('area code') ||
    t.includes('null values') ||
    t.includes('empty cells') ||
    t.includes('fill in');

  const mentionsEnrich =
    t.includes('enrich') ||
    t.includes('add column') ||
    t.includes('add data') ||
    t.includes('augment') ||
    t.includes('derive') ||
    t.includes('calculate new');

  const mentionsSimulate =
    t.includes('simulate') ||
    t.includes('simulation') ||
    t.includes('what if') ||
    t.includes('scenario') ||
    t.includes('what-if');

  // Compare reports (Elise pattern)
  if (mentionsCompare && (t.includes('pdf') || t.includes('report'))) {
    return {
      id: 'COMPARE_REPORTS',
      toolTags: ['files.compare.pdf', 'files.summarize.differences'],
      confidence: 0.9,
      notes:
        'Use PDF comparison and summarization to extract differences, similarities, and trends (e.g., 2023 vs 2024 financials).',
    };
  }

  // Clean Excel / CSV (Min pattern)
  if (mentionsExcel && mentionsClean) {
    return {
      id: 'CLEAN_TABULAR',
      toolTags: ['tabular.clean', 'tabular.deduplicate'],
      confidence: 0.9,
      notes:
        'Use tabular cleaning tools to remove duplicates and handle missing values in specific columns.',
    };
  }

  // Enrichment
  if (mentionsExcel && mentionsEnrich) {
    return {
      id: 'ENRICH_TABULAR',
      toolTags: ['tabular.enrich'],
      confidence: 0.85,
      notes:
        'Use tabular enrichment to add or compute new columns (e.g., area codes, segments, derived metrics).',
    };
  }

  // Simulations / what-if
  if (mentionsSimulate || tags.has('scenario-analysis')) {
    return {
      id: 'SIMULATE_SCENARIOS',
      toolTags: ['analysis.simulate', 'tabular.simulate'],
      confidence: 0.8,
      notes:
        'Run scenario analysis or what-if simulations by changing selected variables over the cleaned/enriched dataset.',
    };
  }

  // Single report summary
  if (t.includes('summarize') && (t.includes('report') || t.includes('pdf') || t.includes('document'))) {
    return {
      id: 'SUMMARIZE_REPORT',
      toolTags: ['files.summarize'],
      confidence: 0.75,
      notes:
        'Summarize a single report and extract key indicators for further analysis.',
    };
  }

  return {
    id: 'NONE',
    toolTags: [],
    confidence: 0.2,
    notes: 'No clear data workflow detected; treat as a general reasoning task.',
  };
}

