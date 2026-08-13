/**
 * Admin Revenue Forecast Dashboard
 * 
 * Displays:
 * - Monthly Recurring Revenue (MRR) projections
 * - User tier distribution
 * - Usage-based revenue forecasting
 * - Growth metrics and conversion funnel
 */

import { Metadata } from 'next';
import { requireAdminAuth } from '@/lib/auth/admin';
import AdminRevenueForecastClient from './AdminRevenueForecastClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Revenue Forecast - Lightning AI Platform',
  description: 'AI-powered revenue forecasting and analysis'
};

export default async function AdminRevenueForecast() {
  // Require admin authentication
  await requireAdminAuth();

  return <AdminRevenueForecastClient />;
} 