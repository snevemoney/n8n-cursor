'use client';

export default function UserDashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // Just pass through children - let the main ClientLayout handle the layout
  return <>{children}</>;
} 