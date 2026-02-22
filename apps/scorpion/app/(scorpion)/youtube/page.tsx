'use client';

import { useState, useEffect, useCallback } from 'react';
import { Panel } from '@/components/scorpion/Panel';
import { PageLoadingBar } from '@/components/scorpion';
import {
  Youtube,
  Play,
  Tv,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types matching API responses
// ---------------------------------------------------------------------------

interface IngestJob {
  id: string;
  source_type: string;
  status: string;
  provider_used: string | null;
  last_error: string | null;
  queued_at: string;
  completed_at: string | null;
  run_summary_json: {
    total_found?: number;
    transcribed?: number;
    failed?: number;
    already_ingested?: number;
    queued_for_review?: number;
  } | null;
  source_title?: string;
  source_external_id?: string;
  source_url?: string;
}

interface Transcript {
  id: string;
  video_id: string;
  title: string | null;
  source_url: string;
  transcript_status: string;
  provider_used: string;
  language: string | null;
  duration_seconds: number | null;
  failure_reason: string | null;
  created_at: string;
}

interface LearningProposal {
  id: string;
  video_id: string;
  summary: string;
  category: string;
  system_area: string;
  produced_asset_type: string;
  expected_impact: string;
  revenue_link: string | null;
  status: string;
  proposed_actions_json: Array<{ type: string; description: string }>;
  contradiction_flags_json: Array<{ existing_claim: string; new_claim: string; severity: string }>;
  reviewer_notes: string | null;
  created_at: string;
  transcript_title?: string;
  source_url?: string;
}

interface IngestStats {
  transcripts_this_week: number;
  failed_jobs: number;
  pending_review: number;
  promoted_count: number;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function YouTubeIngestPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [channelLimit, setChannelLimit] = useState(15);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState<'video' | 'channel' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [jobs, setJobs] = useState<IngestJob[]>([]);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [proposals, setProposals] = useState<LearningProposal[]>([]);
  const [stats, setStats] = useState<IngestStats | null>(null);
  const [failedJobs, setFailedJobs] = useState<IngestJob[]>([]);

  const [activeTab, setActiveTab] = useState<'ingest' | 'jobs' | 'failures' | 'review'>('ingest');
  const [expandedProposal, setExpandedProposal] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, transcriptsRes, proposalsRes, statsRes, failedRes] = await Promise.allSettled([
        fetch('/api/youtube/jobs?limit=30').then((r) => r.json()),
        fetch('/api/youtube/transcripts?limit=30').then((r) => r.json()),
        fetch('/api/youtube/learning?status=READY_FOR_REVIEW&limit=30').then((r) => r.json()),
        fetch('/api/youtube/stats').then((r) => r.json()),
        fetch('/api/youtube/jobs?failed=true').then((r) => r.json()),
      ]);

      if (jobsRes.status === 'fulfilled' && jobsRes.value.success) setJobs(jobsRes.value.data.jobs);
      if (transcriptsRes.status === 'fulfilled' && transcriptsRes.value.success) setTranscripts(transcriptsRes.value.data.transcripts);
      if (proposalsRes.status === 'fulfilled' && proposalsRes.value.success) setProposals(proposalsRes.value.data.proposals);
      if (statsRes.status === 'fulfilled' && statsRes.value.success) setStats(statsRes.value.data);
      if (failedRes.status === 'fulfilled' && failedRes.value.success) setFailedJobs(failedRes.value.data.jobs);
    } catch (err) {
      console.error('[YouTubeIngest] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ---------------------------------------------------------------------------
  // Ingest actions
  // ---------------------------------------------------------------------------

  const handleVideoIngest = async () => {
    if (!videoUrl.trim()) return;
    setIngesting('video');
    setMessage(null);
    try {
      const res = await fetch('/api/youtube/ingest/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const info = data.data;
        if (info.alreadyIngested) {
          setMessage({ type: 'success', text: `Video already ingested (de-duped). Video ID: ${info.videoId}` });
        } else if (info.error) {
          setMessage({ type: 'error', text: `Ingest completed with error: ${info.error}` });
        } else {
          setMessage({ type: 'success', text: `Transcribed ${info.transcriptLength} chars via ${info.provider}. Proposal created.` });
        }
        setVideoUrl('');
        fetchAll();
      } else {
        setMessage({ type: 'error', text: data.error?.message ?? 'Ingest failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Request failed' });
    } finally {
      setIngesting(null);
    }
  };

  const handleChannelIngest = async () => {
    if (!channelUrl.trim()) return;
    setIngesting('channel');
    setMessage(null);
    try {
      const res = await fetch('/api/youtube/ingest/channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: channelUrl.trim(), limit: channelLimit }),
      });
      const data = await res.json();
      if (data.success) {
        const s = data.data.summary;
        setMessage({
          type: 'success',
          text: `Channel ingested: ${s.transcribed} transcribed, ${s.already_ingested} dupes, ${s.failed} failed of ${s.total_found} found`,
        });
        setChannelUrl('');
        fetchAll();
      } else {
        setMessage({ type: 'error', text: data.error?.message ?? 'Channel ingest failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Request failed' });
    } finally {
      setIngesting(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Learning actions (human-gated)
  // ---------------------------------------------------------------------------

  const handlePromote = async (proposalId: string) => {
    const notes = window.prompt('Reviewer notes (optional):');
    try {
      const res = await fetch('/api/youtube/learning/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, confirmPromotion: true, reviewerNotes: notes || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Promoted to playbook.' });
        fetchAll();
      } else {
        setMessage({ type: 'error', text: data.error?.message ?? 'Promote failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Promote request failed' });
    }
  };

  const handleReject = async (proposalId: string, knowledgeOnly: boolean) => {
    const notes = window.prompt('Reviewer notes (optional):');
    try {
      const res = await fetch('/api/youtube/learning/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, markAsKnowledgeOnly: knowledgeOnly, reviewerNotes: notes || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: knowledgeOnly ? 'Marked as knowledge only.' : 'Rejected.' });
        fetchAll();
      } else {
        setMessage({ type: 'error', text: data.error?.message ?? 'Reject failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Reject request failed' });
    }
  };

  const handleRetryFailed = async (job: IngestJob) => {
    if (!job.source_url) return;
    setMessage(null);
    setIngesting('video');
    try {
      const res = await fetch('/api/youtube/ingest/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: job.source_url }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Retry submitted.' });
        fetchAll();
      } else {
        setMessage({ type: 'error', text: data.error?.message ?? 'Retry failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Retry request failed' });
    } finally {
      setIngesting(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      TRANSCRIBED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      READY_FOR_REVIEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      RUNNING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      QUEUED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      PENDING: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      FETCHING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
      FAILED_TRANSCRIPT: 'bg-red-500/20 text-red-400 border-red-500/30',
      PROMOTED_TO_PLAYBOOK: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      REJECTED: 'bg-red-500/20 text-red-300 border-red-500/30',
      KNOWLEDGE_ONLY: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      PARTIALLY_COMPLETED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    const cls = colors[status] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] sc-mono border ${cls}`}>
        {status}
      </span>
    );
  };

  const systemAreaBadge = (area: string) => {
    const colors: Record<string, string> = {
      Acquire: 'bg-green-500/20 text-green-400',
      Deliver: 'bg-blue-500/20 text-blue-400',
      Improve: 'bg-purple-500/20 text-purple-400',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[10px] sc-mono ${colors[area] ?? 'bg-gray-500/20 text-gray-400'}`}>
        {area}
      </span>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-[#0a0d10] via-[#0c1014] to-[#0a0d10]">
      <PageLoadingBar loading={loading} />
      <div className="p-3 md:p-6 space-y-4 md:space-y-6 min-w-0">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Youtube className="h-6 w-6 text-red-500" />
              <h1 className="sc-title text-xl md:text-2xl font-bold">YouTube Ingest</h1>
            </div>
            <p className="sc-mono text-xs text-gray-400">
              Private operator intelligence pipeline — Acquire / Deliver / Improve
            </p>
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg sc-mono text-xs hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Transcribed (7d)" value={stats.transcripts_this_week} icon={<FileText className="h-4 w-4 text-emerald-400" />} />
            <StatCard label="Failed Jobs" value={stats.failed_jobs} icon={<XCircle className="h-4 w-4 text-red-400" />} alert={stats.failed_jobs > 0} />
            <StatCard label="Pending Review" value={stats.pending_review} icon={<Clock className="h-4 w-4 text-blue-400" />} alert={stats.pending_review > 0} />
            <StatCard label="Promoted" value={stats.promoted_count} icon={<CheckCircle className="h-4 w-4 text-purple-400" />} />
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg border sc-mono text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-white/10 pb-0">
          {(['ingest', 'jobs', 'failures', 'review'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 sc-mono text-xs rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-white/10 text-white border-b-2 border-emerald-400'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {tab === 'ingest' && 'Ingest'}
              {tab === 'jobs' && `Jobs (${jobs.length})`}
              {tab === 'failures' && `Failures (${failedJobs.length})`}
              {tab === 'review' && `Review (${proposals.length})`}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'ingest' && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Video Ingest */}
            <Panel title="Single Video" className="border-white/10">
              <div className="space-y-3">
                <div>
                  <label className="sc-mono text-xs text-white/50 mb-1 block">YouTube Video URL</label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 sc-mono text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                    onKeyDown={(e) => e.key === 'Enter' && handleVideoIngest()}
                  />
                </div>
                <button
                  onClick={handleVideoIngest}
                  disabled={!videoUrl.trim() || ingesting !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/80 hover:bg-red-600 disabled:bg-white/5 disabled:text-white/30 rounded-lg sc-mono text-sm text-white transition-colors"
                >
                  {ingesting === 'video' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Ingesting...</>
                  ) : (
                    <><Play className="h-4 w-4" /> Ingest Video</>
                  )}
                </button>
              </div>
            </Panel>

            {/* Channel Ingest */}
            <Panel title="Channel Ingest" className="border-white/10">
              <div className="space-y-3">
                <div>
                  <label className="sc-mono text-xs text-white/50 mb-1 block">YouTube Channel URL</label>
                  <input
                    type="text"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    placeholder="https://youtube.com/@channel..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 sc-mono text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="sc-mono text-xs text-white/50 mb-1 block">Latest videos to ingest</label>
                  <input
                    type="number"
                    value={channelLimit}
                    onChange={(e) => setChannelLimit(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={50}
                    className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 sc-mono text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <button
                  onClick={handleChannelIngest}
                  disabled={!channelUrl.trim() || ingesting !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/80 hover:bg-red-600 disabled:bg-white/5 disabled:text-white/30 rounded-lg sc-mono text-sm text-white transition-colors"
                >
                  {ingesting === 'channel' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Ingesting Channel...</>
                  ) : (
                    <><Tv className="h-4 w-4" /> Ingest Latest {channelLimit} Videos</>
                  )}
                </button>
              </div>
            </Panel>
          </div>
        )}

        {activeTab === 'jobs' && (
          <Panel title="Recent Ingest Jobs" className="border-white/10">
            {jobs.length === 0 ? (
              <p className="text-white/40 sc-mono text-sm text-center py-8">No ingest jobs yet. Paste a URL above to start.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full sc-mono text-xs">
                  <thead>
                    <tr className="text-white/40 border-b border-white/10">
                      <th className="text-left py-2 px-2">Type</th>
                      <th className="text-left py-2 px-2">Source</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-left py-2 px-2">Provider</th>
                      <th className="text-left py-2 px-2">Summary</th>
                      <th className="text-left py-2 px-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-2">
                          {job.source_type === 'video' ? <Play className="h-3.5 w-3.5 text-red-400" /> : <Tv className="h-3.5 w-3.5 text-blue-400" />}
                        </td>
                        <td className="py-2 px-2 text-white/70 max-w-[200px] truncate">
                          {job.source_title ?? job.source_external_id ?? job.id.slice(0, 8)}
                        </td>
                        <td className="py-2 px-2">{statusBadge(job.status)}</td>
                        <td className="py-2 px-2 text-white/50">{job.provider_used ?? '—'}</td>
                        <td className="py-2 px-2 text-white/50">
                          {job.run_summary_json ? (
                            <span>{job.run_summary_json.transcribed ?? 0}ok / {job.run_summary_json.failed ?? 0}fail</span>
                          ) : '—'}
                        </td>
                        <td className="py-2 px-2 text-white/40">
                          {new Date(job.queued_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        )}

        {activeTab === 'failures' && (
          <Panel title="Failures & Interventions" className="border-red-500/20">
            {failedJobs.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-white/40 sc-mono text-sm">No failed jobs. Clean pipeline.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {failedJobs.map((job) => (
                  <div key={job.id} className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                          <span className="sc-mono text-sm text-white truncate">
                            {job.source_title ?? job.source_external_id ?? job.id.slice(0, 8)}
                          </span>
                          {statusBadge(job.status)}
                        </div>
                        {job.last_error && (
                          <p className="sc-mono text-xs text-red-300/70 mt-1 break-words">{job.last_error}</p>
                        )}
                        <p className="sc-mono text-[10px] text-white/30 mt-1">
                          Queued: {new Date(job.queued_at).toLocaleString()}
                        </p>
                      </div>
                      {job.source_url && (
                        <button
                          onClick={() => handleRetryFailed(job)}
                          disabled={ingesting !== null}
                          className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-lg sc-mono text-xs text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                        >
                          <RefreshCw className="h-3 w-3" /> Retry
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        )}

        {activeTab === 'review' && (
          <Panel title="Learning Review Queue" className="border-blue-500/20">
            {proposals.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white/40 sc-mono text-sm">No proposals pending review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {proposals.map((p) => {
                  const isExpanded = expandedProposal === p.id;
                  return (
                    <div key={p.id} className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="sc-mono text-sm text-white font-medium truncate">
                              {p.transcript_title ?? p.video_id}
                            </span>
                            {systemAreaBadge(p.system_area)}
                            <span className="text-[10px] sc-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                              {p.category.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] sc-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                              {p.produced_asset_type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="sc-mono text-xs text-white/60 line-clamp-2">{p.summary}</p>
                          {p.revenue_link && (
                            <p className="sc-mono text-[10px] text-emerald-400/70 mt-1">
                              Revenue link: {p.revenue_link}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => setExpandedProposal(isExpanded ? null : p.id)}
                          className="shrink-0 p-1 hover:bg-white/10 rounded"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-white/50" /> : <ChevronDown className="h-4 w-4 text-white/50" />}
                        </button>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                          {p.proposed_actions_json?.length > 0 && (
                            <div>
                              <span className="sc-mono text-[10px] text-white/40">Proposed Actions:</span>
                              <ul className="mt-1 space-y-1">
                                {p.proposed_actions_json.map((a, i) => (
                                  <li key={i} className="flex items-start gap-2 sc-mono text-xs text-white/60">
                                    <ArrowRight className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
                                    <span><strong className="text-white/80">{a.type.replace(/_/g, ' ')}:</strong> {a.description}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {p.contradiction_flags_json?.length > 0 && (
                            <div>
                              <span className="sc-mono text-[10px] text-yellow-400">Contradiction Flags:</span>
                              <ul className="mt-1 space-y-1">
                                {p.contradiction_flags_json.map((c, i) => (
                                  <li key={i} className="sc-mono text-xs text-yellow-300/70">
                                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                                    {c.existing_claim} vs. {c.new_claim} ({c.severity})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {p.source_url && (
                            <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="sc-mono text-xs text-blue-400 hover:underline block">
                              View source video
                            </a>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                        <button
                          onClick={() => handlePromote(p.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg sc-mono text-xs text-purple-400 hover:bg-purple-500/30 transition-colors"
                        >
                          <ThumbsUp className="h-3 w-3" /> Promote
                        </button>
                        <button
                          onClick={() => handleReject(p.id, false)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg sc-mono text-xs text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          <ThumbsDown className="h-3 w-3" /> Reject
                        </button>
                        <button
                          onClick={() => handleReject(p.id, true)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg sc-mono text-xs text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                        >
                          <BookOpen className="h-3 w-3" /> Knowledge Only
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        )}

      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Card Component
// ---------------------------------------------------------------------------

function StatCard({ label, value, icon, alert }: { label: string; value: number; icon: React.ReactNode; alert?: boolean }) {
  return (
    <div className={`sc-panel p-3 ${alert ? 'border-yellow-500/30' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        {icon}
        <span className={`text-xl font-bold sc-mono ${alert ? 'text-yellow-400' : 'text-white'}`}>{value}</span>
      </div>
      <div className="sc-mono text-[10px] text-white/40">{label}</div>
    </div>
  );
}
