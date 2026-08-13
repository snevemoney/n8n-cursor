import { Metadata } from 'next';
import { requireAdminAuth } from '@/lib/auth/admin';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Lightning AI Platform',
  description: 'Administrative dashboard for Lightning AI Platform management'
};

export default async function AdminDashboard() {
  // Require admin authentication
  await requireAdminAuth();

  return <AdminDashboardClient />;
} 