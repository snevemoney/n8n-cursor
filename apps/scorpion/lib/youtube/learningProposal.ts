/**
 * Learning Proposal Generator — Human-Gated Intelligence Pipeline
 *
 * GUARDRAILS (non-negotiable):
 *   - No auto-promotion to playbooks/SOPs
 *   - No automatic prompt overwrites
 *   - No self-modifying behavior
 *   - Every proposal starts as READY_FOR_REVIEW
 *   - Human owns all final decisions
 *
 * Takes a transcript → produces a structured learning proposal with:
 *   - Summary
 *   - Extracted claims/ideas
 *   - Category classification
 *   - System area mapping (Acquire / Deliver / Improve)
 *   - Contradiction detection (stub, to be enhanced)
 *   - Proposed actions
 *   - Build-to-revenue tagging (Patrick-style)
 */

import * as db from './db';
import type {
  YouTubeTranscript,
  LearningProposal,
  ExtractedPoint,
  ContradictionFlag,
  ProposedAction,
  ProposalCategoryType,
  SystemAreaType,
  ProducedAssetTypeValue,
  ProposedActionTypeValue,
} from './types';

// ---------------------------------------------------------------------------
// Keyword-based classification (runs without LLM, always available)
// For richer classification, this can be upgraded to use the LLM client.
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: Record<ProposalCategoryType, string[]> = {
  sales: ['sale', 'selling', 'close', 'deal', 'pipeline', 'prospect', 'cold call', 'outbound', 'inbound', 'discovery call', 'quota'],
  operations: ['operation', 'process', 'system', 'workflow', 'automat', 'sop', 'standard operating', 'efficiency'],
  client_delivery: ['client', 'deliver', 'onboard', 'project', 'scope', 'milestone', 'handoff', 'quality'],
  positioning: ['position', 'brand', 'niche', 'differentiat', 'market', 'narrative', 'authority', 'thought leader'],
  ai_tooling: ['ai ', 'artificial intelligence', 'llm', 'gpt', 'claude', 'machine learning', 'prompt', 'model'],
  automation: ['automat', 'n8n', 'zapier', 'make.com', 'script', 'bot', 'cron', 'trigger', 'webhook'],
  leadership: ['leader', 'manage', 'team', 'cultur', 'vision', 'mentor', 'coach', 'delegation'],
  hiring: ['hire', 'recruit', 'talent', 'interview', 'onboard', 'contractor', 'freelanc', 'team build'],
  offer_design: ['offer', 'pricing', 'package', 'tier', 'proposal', 'scope', 'deliverable', 'retainer', 'value prop'],
  follow_up_retention: ['follow up', 'follow-up', 'retention', 'referral', 'churn', 'renewal', 'upsell', 'cross-sell', 'nurtur'],
};

const SYSTEM_AREA_KEYWORDS: Record<SystemAreaType, string[]> = {
  Acquire: ['prospect', 'outreach', 'lead', 'pipeline', 'cold', 'referral', 'positioning', 'offer', 'sale', 'close', 'follow up', 'contact'],
  Deliver: ['client', 'deliver', 'project', 'onboard', 'quality', 'milestone', 'scope', 'workflow', 'result'],
  Improve: ['process', 'playbook', 'sop', 'template', 'automat', 'leverage', 'reusabl', 'system', 'refine', 'optimize'],
};

const ASSET_TYPE_KEYWORDS: Record<ProducedAssetTypeValue, string[]> = {
  proposal_template: ['proposal', 'template', 'scope document'],
  sales_script: ['script', 'pitch', 'cold call', 'discovery'],
  followup_script: ['follow up', 'follow-up', 'check in', 'nurtur'],
  objection_handling: ['objection', 'pushback', 'concern', 'hesitat'],
  delivery_checklist: ['checklist', 'onboard', 'deliver', 'handoff', 'kickoff'],
  reusable_component: ['component', 'module', 'reusabl', 'library', 'utility'],
  case_study_angle: ['case study', 'success story', 'testimonial', 'result', 'roi'],
  positioning_note: ['position', 'differentiat', 'niche', 'authority', 'brand'],
  knowledge_only: [],
};

export async function generateLearningProposal(
  transcript: YouTubeTranscript
): Promise<LearningProposal> {
  const text = transcript.transcript_text;

  const summary = generateSummary(text);
  const points = extractPoints(text);
  const category = classifyCategory(text);
  const systemArea = classifySystemArea(text);
  const contradictions = detectContradictions(text);
  const producedAssetType = classifyAssetType(text, category);
  const expectedImpact = systemArea;
  const revenueLink = generateRevenueLink(category, systemArea, producedAssetType);
  const actions = proposeActions(category, producedAssetType, points);

  const proposal = await db.createLearningProposal({
    transcript_id: transcript.id,
    video_id: transcript.video_id,
    summary,
    extracted_points_json: points,
    category,
    system_area: systemArea,
    contradiction_flags_json: contradictions,
    proposed_actions_json: actions,
    produced_asset_type: producedAssetType,
    expected_impact: expectedImpact,
    revenue_link: revenueLink,
  });

  console.log(
    `[LearningProposal] Created for ${transcript.video_id}: ` +
    `category=${category}, area=${systemArea}, asset=${producedAssetType}, ` +
    `points=${points.length}, status=READY_FOR_REVIEW`
  );

  return proposal;
}

// ---------------------------------------------------------------------------
// Summarization (extractive, first pass — no LLM required)
// ---------------------------------------------------------------------------

function generateSummary(text: string): string {
  const sentences = text
    .replace(/([.!?])\s+/g, '$1\n')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (sentences.length === 0) return text.slice(0, 500);

  const topSentences = sentences
    .map((s, i) => ({
      text: s,
      score: scoreSentence(s, i, sentences.length),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .sort((a, b) => {
      const idxA = sentences.indexOf(a.text);
      const idxB = sentences.indexOf(b.text);
      return idxA - idxB;
    });

  return topSentences.map((s) => s.text).join(' ');
}

function scoreSentence(sentence: string, index: number, total: number): number {
  let score = 0;
  const lower = sentence.toLowerCase();

  const highValueTerms = [
    'key', 'important', 'critical', 'must', 'should', 'strategy',
    'revenue', 'client', 'deliver', 'result', 'system', 'process',
    'framework', 'principle', 'rule', 'lesson', 'mistake', 'advice',
  ];
  for (const term of highValueTerms) {
    if (lower.includes(term)) score += 2;
  }

  if (index < total * 0.15) score += 3;
  if (index > total * 0.85) score += 2;

  if (sentence.length > 40 && sentence.length < 200) score += 1;

  return score;
}

// ---------------------------------------------------------------------------
// Claim/idea extraction
// ---------------------------------------------------------------------------

function extractPoints(text: string): ExtractedPoint[] {
  const sentences = text
    .replace(/([.!?])\s+/g, '$1\n')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 30);

  const actionablePatterns = [
    /you (should|need to|must|have to|want to)/i,
    /the (key|secret|trick|way) (is|to)/i,
    /always|never|don't|do not/i,
    /number one|first thing|most important/i,
    /mistake|error|pitfall|avoid/i,
    /framework|system|process|method/i,
    /revenue|profit|money|income/i,
    /client|customer|prospect/i,
  ];

  const points: ExtractedPoint[] = [];
  for (const sentence of sentences) {
    const matchCount = actionablePatterns.filter((p) => p.test(sentence)).length;
    if (matchCount >= 1) {
      points.push({
        claim: sentence.slice(0, 300),
        confidence: Math.min(matchCount / actionablePatterns.length + 0.3, 1.0),
      });
    }
  }

  return points
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 20);
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

function classifyCategory(text: string): ProposalCategoryType {
  const lower = text.toLowerCase();
  let best: ProposalCategoryType = 'operations';
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      const re = new RegExp(kw, 'gi');
      const matches = lower.match(re);
      if (matches) score += matches.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = cat as ProposalCategoryType;
    }
  }

  return best;
}

function classifySystemArea(text: string): SystemAreaType {
  const lower = text.toLowerCase();
  let best: SystemAreaType = 'Improve';
  let bestScore = 0;

  for (const [area, keywords] of Object.entries(SYSTEM_AREA_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      const re = new RegExp(kw, 'gi');
      const matches = lower.match(re);
      if (matches) score += matches.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = area as SystemAreaType;
    }
  }

  return best;
}

function classifyAssetType(
  text: string,
  _category: ProposalCategoryType
): ProducedAssetTypeValue {
  const lower = text.toLowerCase();
  let best: ProducedAssetTypeValue = 'knowledge_only';
  let bestScore = 0;

  for (const [asset, keywords] of Object.entries(ASSET_TYPE_KEYWORDS)) {
    if (keywords.length === 0) continue;
    let score = 0;
    for (const kw of keywords) {
      const re = new RegExp(kw, 'gi');
      const matches = lower.match(re);
      if (matches) score += matches.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = asset as ProducedAssetTypeValue;
    }
  }

  return best;
}

// ---------------------------------------------------------------------------
// Contradiction detection (stub — returns empty for now)
// To be enhanced: compare new claims against existing playbook entries.
// ---------------------------------------------------------------------------

function detectContradictions(_text: string): ContradictionFlag[] {
  return [];
}

// ---------------------------------------------------------------------------
// Revenue link generation (Patrick-style)
// ---------------------------------------------------------------------------

function generateRevenueLink(
  category: ProposalCategoryType,
  systemArea: SystemAreaType,
  assetType: ProducedAssetTypeValue
): string | null {
  const links: Record<string, string> = {
    sales: 'improves close rate and pipeline velocity',
    operations: 'reduces delivery friction, faster turnaround',
    client_delivery: 'better client outcomes, retention, referrals',
    positioning: 'stronger inbound, premium pricing ability',
    ai_tooling: 'faster delivery through automation leverage',
    automation: 'reduces manual work, scales operations',
    leadership: 'better team output, less bottleneck on operator',
    hiring: 'scales capacity beyond solo operator',
    offer_design: 'higher deal value, clearer scope',
    follow_up_retention: 'improves follow-up discipline, client retention',
  };

  const areaBonus: Record<string, string> = {
    Acquire: 'directly supports revenue acquisition',
    Deliver: 'improves delivery quality and speed',
    Improve: 'builds reusable leverage for future work',
  };

  const parts: string[] = [];
  const catLink = links[category];
  if (catLink) parts.push(catLink);
  const areaLink = areaBonus[systemArea];
  if (areaLink) parts.push(areaLink);

  if (assetType === 'knowledge_only') {
    return parts.length > 0 ? `Indirect: ${parts.join('; ')}` : null;
  }

  return parts.join('; ') || null;
}

// ---------------------------------------------------------------------------
// Action proposals
// ---------------------------------------------------------------------------

function proposeActions(
  category: ProposalCategoryType,
  assetType: ProducedAssetTypeValue,
  points: ExtractedPoint[]
): ProposedAction[] {
  if (assetType === 'knowledge_only' || points.length === 0) {
    return [{ type: 'no_action' as ProposedActionTypeValue, description: 'Store as knowledge reference' }];
  }

  const actions: ProposedAction[] = [];

  const assetActionMap: Partial<Record<ProducedAssetTypeValue, ProposedActionTypeValue>> = {
    proposal_template: 'template_improvement',
    sales_script: 'script_improvement',
    followup_script: 'script_improvement',
    objection_handling: 'script_improvement',
    delivery_checklist: 'checklist_item',
    reusable_component: 'sop_draft',
    case_study_angle: 'template_improvement',
    positioning_note: 'prompt_update',
  };

  const actionType = assetActionMap[assetType] ?? ('sop_draft' as ProposedActionTypeValue);
  actions.push({
    type: actionType,
    description: `Review and potentially create/update ${assetType.replace(/_/g, ' ')} based on ${points.length} extracted points`,
    target: category,
  });

  if (points.length >= 5) {
    actions.push({
      type: 'checklist_item' as ProposedActionTypeValue,
      description: `High-value transcript with ${points.length} actionable points — consider dedicated review session`,
    });
  }

  return actions;
}
