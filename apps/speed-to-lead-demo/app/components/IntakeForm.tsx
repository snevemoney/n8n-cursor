'use client';

import { useState } from 'react';
import { Lead } from '@/app/lib/types';

interface IntakeFormProps {
  onSubmitted: (lead: Lead) => void;
}

export function IntakeForm({ onSubmitted }: IntakeFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: data.get('name') as string,
      email: data.get('email') as string,
      phone: data.get('phone') as string,
      goal: data.get('goal') as string,
      urgency: data.get('urgency') as string,
      source: data.get('source') as string,
      honeypot: data.get('website') as string,
    };

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const lead = await res.json();
      setSuccess(true);
      onSubmitted(lead);
      form.reset();
      setTimeout(() => setSuccess(false), 3000);
    }

    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm text-text-secondary mb-1">Name *</label>
        <input
          name="name"
          required
          className="w-full bg-surface-raised border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">Email *</label>
        <input
          name="email"
          type="email"
          required
          className="w-full bg-surface-raised border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">Phone</label>
        <input
          name="phone"
          type="tel"
          className="w-full bg-surface-raised border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">Goal</label>
        <input
          name="goal"
          placeholder="e.g. Scale lead generation"
          className="w-full bg-surface-raised border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">Urgency</label>
        <select
          name="urgency"
          defaultValue="medium"
          className="w-full bg-surface-raised border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
        >
          <option value="high">High — Need this week</option>
          <option value="medium">Medium — This month</option>
          <option value="low">Low — Exploring</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">How did you hear about us?</label>
        <input
          name="source"
          placeholder="Google, referral, etc."
          className="w-full bg-surface-raised border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
        />
      </div>

      {/* Honeypot field — hidden from real users */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Request Demo'}
      </button>

      {success && (
        <p className="text-status-booked text-sm font-medium">
          ✓ Submitted — you'll be contacted shortly.
        </p>
      )}
    </form>
  );
}
