import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scorpion - Operations Console',
  description: 'Scorpion OS - Central command for AI stack, workflows, and agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0d10] text-[#e4e8ee]">{children}</body>
    </html>
  );
}

