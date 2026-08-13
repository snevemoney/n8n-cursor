import { Metadata } from 'next';
import { requireAdminAuth } from '@/lib/auth/admin';
import AdminAnalyticsClient from './AdminAnalyticsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Analytics - Lightning AI Platform',
  description: 'Platform analytics and performance monitoring'
};

export default async function AdminAnalytics() {
  // Require admin authentication
  await requireAdminAuth();

  return <AdminAnalyticsClient />;
} 