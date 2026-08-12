'use client';

import { useEffect, useState } from 'react';
import { Lead } from '@/app/lib/types';
import { clsx } from 'clsx';

interface OperatorBoardProps {
  leads: Lead[];
  onRefresh: () => void;
  onBook: (lead: Lead) => void;
  onRemind: (leadId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-status-hot/20 text-status-hot border-status-hot/30',
  touched: 'bg-status-warm/20 text-status-warm border-status-warm/30',
  booked: 'bg-status-booked/20 text-status-booked border-status-booked/30',
  reminded: 'bg-status-reminded/20 text-status-reminded border-status-reminded/30',
  'no-show': 'bg-red-900/20 text-red-400 border-red-400/30',
};

export function OperatorBoard({ leads, onRefresh, onBook, onRemind }: OperatorBoardProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Operator Board</h2>
        <button
          onClick={onRefresh}
          className="text-xs text-text-muted hover:text-accent transition-colors"
        >
          Refresh
        </button>
      </div>

      {leads.length === 0 && (
        <p className="text-text-muted text-sm">No leads yet. Submit the intake form to start.</p>
      )}

      {leads.map((lead) => (
        <LeadRow
          key={lead.id}
          lead={lead}
          onBook={() => onBook(lead)}
          onRemind={() => onRemind(lead.id)}
        />
      ))}
    </div>
  );
}

function LeadRow({
  lead,
  onBook,
  onRemind,
}: {
  lead: Lead;
  onBook: () => void;
  onRemind: () => void;
}) {
  return (
    <div className="bg-surface-raised border border-border-subtle rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-text-primary truncate">{lead.name}</span>
            <span
              className={clsx(
                'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border',
                STATUS_COLORS[lead.status]
              )}
            >
              {lead.status}
            </span>
            {lead.temperature === 'hot' && (
              <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                🔥 HOT
              </span>
            )}
            {lead.aiSuggestedTag && (
              <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded border border-accent/20">
                {lead.aiSuggestedTag}
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary truncate">
            {lead.email} {lead.phone && `· ${lead.phone}`}
          </p>
          {lead.goal && (
            <p className="text-xs text-text-muted mt-0.5 truncate">Goal: {lead.goal}</p>
          )}
          {lead.bookedSlot && (
            <p className="text-xs text-status-booked mt-0.5">📅 {lead.bookedSlot}</p>
          )}
          <SpeedTimer lead={lead} />
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          {lead.status === 'new' && (
            <SimulateTouchButton leadId={lead.id} />
          )}
          {(lead.status === 'touched') && (
            <button
              onClick={onBook}
              className="text-[11px] bg-status-booked/20 text-status-booked hover:bg-status-booked/30 px-2 py-1 rounded transition-colors"
            >
              Book
            </button>
          )}
          {lead.status === 'booked' && (
            <button
              onClick={onRemind}
              className="text-[11px] bg-status-reminded/20 text-status-reminded hover:bg-status-reminded/30 px-2 py-1 rounded transition-colors"
            >
              Simulate Reminder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SimulateTouchButton({ leadId }: { leadId: string }) {
  const [touching, setTouching] = useState(false);
  const [touched, setTouched] = useState(false);

  async function handleTouch() {
    setTouching(true);
    await fetch(`/api/leads/${leadId}/touch`, { method: 'POST' });
    setTouched(true);
    setTouching(false);
  }

  if (touched) {
    return (
      <span className="text-[10px] text-status-warm font-medium px-2 py-1">
        SIMULATED SMS ✓
      </span>
    );
  }

  return (
    <button
      onClick={handleTouch}
      disabled={touching}
      className="text-[11px] bg-status-warm/20 text-status-warm hover:bg-status-warm/30 px-2 py-1 rounded transition-colors disabled:opacity-50"
    >
      {touching ? '…' : 'Touch (DEMO)'}
    </button>
  );
}

function SpeedTimer({ lead }: { lead: Lead }) {
  const [elapsed, setElapsed] = useState<string>('');

  useEffect(() => {
    if (lead.status !== 'new') {
      if (lead.touchedAt) {
        const diff = new Date(lead.touchedAt).getTime() - new Date(lead.createdAt).getTime();
        setElapsed(formatMs(diff));
      }
      return;
    }

    const start = new Date(lead.createdAt).getTime();
    const interval = setInterval(() => {
      setElapsed(formatMs(Date.now() - start));
    }, 100);

    return () => clearInterval(interval);
  }, [lead.status, lead.createdAt, lead.touchedAt]);

  if (!elapsed) return null;

  const isRunning = lead.status === 'new';

  return (
    <p className={clsx('text-[11px] mt-1 font-mono', isRunning ? 'text-status-hot' : 'text-text-muted')}>
      ⏱ {isRunning ? 'Time to touch: ' : 'Touched in: '}
      {elapsed}
    </p>
  );
}

function formatMs(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  if (minutes > 0) return `${minutes}m ${secs}.${tenths}s`;
  return `${secs}.${tenths}s`;
}
