'use client';

import { useState, useEffect } from 'react';
import { Lead, Slot } from '@/app/lib/types';
import { clsx } from 'clsx';

interface BookingModalProps {
  lead: Lead;
  onClose: () => void;
  onBooked: () => void;
}

export function BookingModal({ lead, onClose, onBooked }: BookingModalProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch('/api/slots')
      .then((r) => r.json())
      .then(setSlots);
  }, []);

  async function handleBook() {
    if (!selectedSlot) return;
    setBooking(true);

    await fetch(`/api/leads/${lead.id}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slotId: selectedSlot.id,
        slotDatetime: selectedSlot.datetime,
        slotLabel: selectedSlot.label,
      }),
    });

    setConfirmed(true);
    setBooking(false);
    setTimeout(() => {
      onBooked();
    }, 2000);
  }

  if (confirmed) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-surface-raised border border-border-subtle rounded-xl p-6 max-w-sm w-full text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">Booked!</h3>
          <p className="text-sm text-text-secondary">
            {lead.name} is confirmed for{' '}
            <span className="text-status-booked font-medium">{selectedSlot?.label}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-raised border border-border-subtle rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Book Demo — {lead.name}
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        {lead.aiSuggestedTag && (
          <p className="text-xs text-accent mb-3 bg-accent/5 border border-accent/20 rounded px-2 py-1">
            AI suggestion: Tag as <strong>{lead.aiSuggestedTag}</strong> (optional — booking works without AI)
          </p>
        )}

        <p className="text-sm text-text-secondary mb-3">Select an available slot:</p>

        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
          {slots.map((slot) => (
            <button
              key={slot.id}
              disabled={!slot.available}
              onClick={() => setSelectedSlot(slot)}
              className={clsx(
                'w-full text-left px-3 py-2 rounded-lg border transition-colors text-sm',
                !slot.available && 'opacity-40 cursor-not-allowed border-border-subtle',
                slot.available && selectedSlot?.id !== slot.id &&
                  'border-border-subtle hover:border-accent/50 text-text-primary',
                selectedSlot?.id === slot.id &&
                  'border-accent bg-accent/10 text-accent'
              )}
            >
              {slot.label}
              {!slot.available && (
                <span className="text-text-muted text-xs ml-2">— Unavailable</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleBook}
          disabled={!selectedSlot || booking}
          className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {booking ? 'Booking…' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
