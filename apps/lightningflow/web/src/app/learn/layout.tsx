import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lightning Network Learning Center',
  description: 'Interactive tutorials and guides for mastering Lightning Network operations'
};

interface LearnLayoutProps {
  children: React.ReactNode;
}

export default function LearnLayout({ children }: LearnLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lightning Network Learning Center
          </h1>
          <p className="text-gray-600">
            Master Lightning Network operations with interactive tutorials and real-time guidance
          </p>
        </div>
        {children}
      </div>
    </div>
  );
} 