import { Metadata } from 'next';
import { requireAdminAuth } from '@/lib/auth/admin';
import AdminAIAssistantClient from './AdminAIAssistantClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI Assistant - Lightning AI Platform',
  description: 'AI-powered assistant management for administrators'
};

export default async function AdminAIAssistant() {
  // Require admin authentication
  await requireAdminAuth();

  return <AdminAIAssistantClient />;
} 