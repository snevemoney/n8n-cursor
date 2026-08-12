import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Speed to Lead — ACQUIRE Demo',
  description: 'Lead to booked — while you\'re on the floor.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-text-primary min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
