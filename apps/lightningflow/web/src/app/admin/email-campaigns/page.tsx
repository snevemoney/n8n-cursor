import { Metadata } from 'next';
import { requireAdminAuth } from '@/lib/auth/admin';
import AdminEmailCampaignsClient from './AdminEmailCampaignsClient';

export const metadata: Metadata = {
  title: 'Email Campaigns - Lightning AI Platform',
  description: 'Manage email marketing campaigns and automation'
};

export default async function AdminEmailCampaigns() {
  // Require admin authentication
  await requireAdminAuth();

  return <AdminEmailCampaignsClient />;
} 