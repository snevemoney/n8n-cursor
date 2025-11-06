import { Metadata } from 'next';
import { requireAdminAuth } from '@/lib/auth/admin';
import AdminBotsClient from './AdminBotsClient';

export const metadata: Metadata = {
  title: 'Bot Control Panel - Lightning AI Platform',
  description: 'Manage and monitor automated bot testing'
};

export default async function AdminBots() {
  // Require admin authentication
  await requireAdminAuth();

  return <AdminBotsClient />;
} 