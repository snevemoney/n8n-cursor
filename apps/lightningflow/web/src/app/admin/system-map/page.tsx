import { Metadata } from 'next';
import { SystemMapDashboard } from '@/components/admin/SystemMapDashboard';
import { requireAdminAuth } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'System Map - Lightning AI Platform',
  description: 'Comprehensive system architecture and health monitoring'
};

export default async function SystemMapPage() {
  // Ensure admin access
  await requireAdminAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Architecture Map
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Real-time system health, ownership tracking, and blind spot detection
          </p>
        </div>

        <SystemMapDashboard />
      </div>
    </div>
  );
} 