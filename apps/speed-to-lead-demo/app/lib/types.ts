export type LeadStatus = 'new' | 'touched' | 'booked' | 'reminded' | 'no-show';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  goal: string;
  urgency: 'high' | 'medium' | 'low';
  source: string;
  status: LeadStatus;
  temperature: 'hot' | 'warm' | 'cold';
  createdAt: string;
  touchedAt?: string;
  bookedAt?: string;
  bookedSlot?: string;
  remindedAt?: string;
  aiSuggestedTag?: string;
}

export interface Slot {
  id: string;
  datetime: string;
  label: string;
  available: boolean;
}
