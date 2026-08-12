'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lead } from '@/app/lib/types';
import { IntakeForm } from '@/app/components/IntakeForm';
import { OperatorBoard } from '@/app/components/OperatorBoard';
import { BookingModal } from '@/app/components/BookingModal';

export default function HomePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bookingLead, setBookingLead] = useState<Lead | null>(null);
  const [autoTouchEnabled, setAutoTouchEnabled] = useState(true);

  const fetchLeads = useCallback(async () => {
    const res = await fetch('/api/leads');
    if (res.ok) {
      const data = await res.json();
      setLeads(data);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 2000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  async function handleNewLead(lead: Lead) {
    setLeads((prev) => [...prev, lead]);

    if (autoTouchEnabled) {
      setTimeout(async () => {
        await fetch(`/api/leads/${lead.id}/touch`, { method: 'POST' });
        fetchLeads();
      }, 1500);
    }
  }

  async function handleRemind(leadId: string) {
    await fetch(`/api/leads/${leadId}/remind`, { method: 'POST' });
    fetchLeads();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface-raised/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-text-primary">
              Speed to Lead
            </h1>
            <p className="text-xs text-text-muted">
              Lead to booked — while you&apos;re on the floor.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={autoTouchEnabled}
                onChange={(e) => setAutoTouchEnabled(e.target.checked)}
                className="rounded"
              />
              Auto-touch (DEMO)
            </label>
            <span className="text-[10px] bg-accent/10 text-accent px-2 py-1 rounded-full border border-accent/20 font-medium">
              ACQUIRE PROOF
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Intake Form */}
          <section>
            <div className="bg-surface-overlay border border-border-subtle rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-1">
                Intake Form
              </h2>
              <p className="text-sm text-text-muted mb-4">
                Public-facing lead capture. Qualifies automatically.
              </p>
              <IntakeForm onSubmitted={handleNewLead} />
            </div>
          </section>

          {/* Right: Operator Board */}
          <section>
            <div className="bg-surface-overlay border border-border-subtle rounded-xl p-6">
              <OperatorBoard
                leads={leads}
                onRefresh={fetchLeads}
                onBook={(lead) => setBookingLead(lead)}
                onRemind={handleRemind}
              />
            </div>

            {/* Legend */}
            <div className="mt-4 bg-surface-raised border border-border-subtle rounded-lg p-3">
              <p className="text-[10px] text-text-muted uppercase font-medium mb-2">
                Status Pipeline
              </p>
              <div className="flex flex-wrap gap-2">
                {['new', 'touched', 'booked', 'reminded'].map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-2 py-0.5 rounded bg-surface-overlay border border-border-subtle text-text-secondary"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-text-muted mt-2">
                Labels marked <span className="text-status-warm font-medium">DEMO</span> or{' '}
                <span className="text-status-warm font-medium">SIMULATED SMS</span> indicate mock actions.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Booking Modal */}
      {bookingLead && (
        <BookingModal
          lead={bookingLead}
          onClose={() => setBookingLead(null)}
          onBooked={() => {
            setBookingLead(null);
            fetchLeads();
          }}
        />
      )}
    </div>
  );
}
