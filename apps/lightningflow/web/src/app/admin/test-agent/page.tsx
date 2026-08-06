import { Metadata } from 'next';
import { requireAdminAuth } from '@/lib/auth/admin';
import AdminTestAgentClient from './AdminTestAgentClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Test Agent - Lightning AI Platform',
  description: 'AI agent testing and validation interface'
};

export default async function AdminTestAgent() {
  // Require admin authentication
  await requireAdminAuth();

  return <AdminTestAgentClient />;
} 