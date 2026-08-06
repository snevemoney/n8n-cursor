import { Metadata } from 'next';
import { requireAdminAuth } from '@/lib/auth/admin';
import AdminUsersClient from './AdminUsersClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'User Management - Lightning AI Platform',
  description: 'Manage platform users and access controls'
};

export default async function AdminUsers() {
  // Require admin authentication
  await requireAdminAuth();

  return <AdminUsersClient />;
} 