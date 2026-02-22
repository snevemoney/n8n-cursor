/**
 * YouTube Transcript Ingestion System - Core Types
 *
 * Human-gated intelligence pipeline: no auto-modify, no auto-promote.
 * Every transcript ties to Acquire / Deliver / Improve.
 */

// ---------------------------------------------------------------------------
// Status enums
// ---------------------------------------------------------------------------

export const TranscriptStatus = {
  PENDING: 'PENDING',
  FETCHING: 'FETCHING',
  TRANSCRIBED: 'TRANSCRIBED',
  FAILED_TRANSCRIPT: 'FAILED_TRANSCRIPT',
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
  PROMOTED_TO_PLAYBOOK: 'PROMOTED_TO_PLAYBOOK',
  REJECTED: 'REJECTED',
  KNOWLEDGE_ONLY: 'KNOWLEDGE_ONLY',
} as const;

export type TranscriptStatusType = typeof TranscriptStatus[keyof typeof TranscriptStatus];

export const IngestJobStatus = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  PARTIALLY_COMPLETED: 'PARTIALLY_COMPLETED',
  FAILED: 'FAILED',
} as const;

export type IngestJobStatusType = typeof IngestJobStatus[keyof typeof IngestJobStatus];

export const SourceType = {
  VIDEO: 'video',
  CHANNEL: 'channel',
} as const;

export type SourceTypeValue = typeof SourceType[keyof typeof SourceType];

// ---------------------------------------------------------------------------
// Provider types
// ---------------------------------------------------------------------------

export const TranscriptProvider = {
  TRANSCRIPT_API: 'transcript_api',
  YOUTUBE_CAPTIONS: 'youtube_captions',
  YT_DLP: 'yt_dlp',
  WHISPER: 'whisper',
} as const;

export type TranscriptProviderType = typeof TranscriptProvider[keyof typeof TranscriptProvider];

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface TranscriptResult {
  text: string;
  segments: TranscriptSegment[];
  language: string;
  provider: TranscriptProviderType;
  confidence: number | null;
  durationSeconds: number | null;
}

export interface ProviderAttempt {
  provider: TranscriptProviderType;
  success: boolean;
  error?: string;
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Data model interfaces
// ---------------------------------------------------------------------------

export interface YouTubeSource {
  id: string;
  type: SourceTypeValue;
  url: string;
  normalized_url: string;
  external_id: string;
  title: string | null;
  channel_name: string | null;
  channel_id: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface YouTubeIngestJob {
  id: string;
  source_type: SourceTypeValue;
  source_id: string;
  status: IngestJobStatusType;
  attempts: number;
  provider_used: TranscriptProviderType | null;
  last_error: string | null;
  run_summary_json: IngestRunSummary | null;
  queued_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface IngestRunSummary {
  total_found: number;
  already_ingested: number;
  transcribed: number;
  failed: number;
  queued_for_review: number;
  provider_attempts: ProviderAttempt[];
}

export interface YouTubeTranscript {
  id: string;
  video_id: string;
  channel_id: string | null;
  source_url: string;
  title: string | null;
  transcript_text: string;
  transcript_segments_json: TranscriptSegment[] | null;
  language: string | null;
  duration_seconds: number | null;
  published_at: string | null;
  provider_used: TranscriptProviderType;
  transcript_hash: string;
  transcript_status: TranscriptStatusType;
  failure_reason: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Learning proposal types (human-gated, anti-slop)
// ---------------------------------------------------------------------------

export const SystemArea = {
  ACQUIRE: 'Acquire',
  DELIVER: 'Deliver',
  IMPROVE: 'Improve',
} as const;

export type SystemAreaType = typeof SystemArea[keyof typeof SystemArea];

export const ProposalCategory = {
  SALES: 'sales',
  OPERATIONS: 'operations',
  CLIENT_DELIVERY: 'client_delivery',
  POSITIONING: 'positioning',
  AI_TOOLING: 'ai_tooling',
  AUTOMATION: 'automation',
  LEADERSHIP: 'leadership',
  HIRING: 'hiring',
  OFFER_DESIGN: 'offer_design',
  FOLLOW_UP_RETENTION: 'follow_up_retention',
} as const;

export type ProposalCategoryType = typeof ProposalCategory[keyof typeof ProposalCategory];

export const ProducedAssetType = {
  PROPOSAL_TEMPLATE: 'proposal_template',
  SALES_SCRIPT: 'sales_script',
  FOLLOWUP_SCRIPT: 'followup_script',
  OBJECTION_HANDLING: 'objection_handling',
  DELIVERY_CHECKLIST: 'delivery_checklist',
  REUSABLE_COMPONENT: 'reusable_component',
  CASE_STUDY_ANGLE: 'case_study_angle',
  POSITIONING_NOTE: 'positioning_note',
  KNOWLEDGE_ONLY: 'knowledge_only',
} as const;

export type ProducedAssetTypeValue = typeof ProducedAssetType[keyof typeof ProducedAssetType];

export const ProposedActionType = {
  PROMPT_UPDATE: 'prompt_update',
  SOP_DRAFT: 'sop_draft',
  CHECKLIST_ITEM: 'checklist_item',
  SCRIPT_IMPROVEMENT: 'script_improvement',
  TEMPLATE_IMPROVEMENT: 'template_improvement',
  NO_ACTION: 'no_action',
} as const;

export type ProposedActionTypeValue = typeof ProposedActionType[keyof typeof ProposedActionType];

export const LearningProposalStatus = {
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
  PROMOTED_TO_PLAYBOOK: 'PROMOTED_TO_PLAYBOOK',
  REJECTED: 'REJECTED',
  KNOWLEDGE_ONLY: 'KNOWLEDGE_ONLY',
} as const;

export type LearningProposalStatusType = typeof LearningProposalStatus[keyof typeof LearningProposalStatus];

export interface ExtractedPoint {
  claim: string;
  confidence: number;
  source_timestamp?: number;
}

export interface ContradictionFlag {
  existing_playbook: string;
  existing_claim: string;
  new_claim: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ProposedAction {
  type: ProposedActionTypeValue;
  description: string;
  target?: string;
}

export interface LearningProposal {
  id: string;
  transcript_id: string;
  video_id: string;
  summary: string;
  extracted_points_json: ExtractedPoint[];
  category: ProposalCategoryType;
  system_area: SystemAreaType;
  contradiction_flags_json: ContradictionFlag[];
  proposed_actions_json: ProposedAction[];
  produced_asset_type: ProducedAssetTypeValue;
  expected_impact: SystemAreaType;
  revenue_link: string | null;
  status: LearningProposalStatusType;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// URL parsing helpers
// ---------------------------------------------------------------------------

export interface ParsedYouTubeURL {
  type: SourceTypeValue;
  id: string;
  normalizedUrl: string;
  originalUrl: string;
}

// ---------------------------------------------------------------------------
// API request/response shapes
// ---------------------------------------------------------------------------

export interface VideoIngestRequest {
  url: string;
}

export interface ChannelIngestRequest {
  url: string;
  limit?: number;
}

export interface IngestSummaryStats {
  transcripts_this_week: number;
  failed_jobs: number;
  pending_review: number;
  promoted_count: number;
}
