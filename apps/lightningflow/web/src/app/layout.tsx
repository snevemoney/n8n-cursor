import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";
import { getNodeLabel } from "../lib/mode";
import { ClientLayout } from "../components/layout/client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${getNodeLabel()} | Lightning AI Platform`,
  description: "Sovereign financial operating system built on Bitcoin Lightning Network",
  keywords: ["bitcoin", "lightning", "ai", "payments", "workspace", "sovereign"],
  authors: [{ name: "Lightning AI Platform" }],
  robots: "index, follow",
  openGraph: {
    title: `${getNodeLabel()} | Lightning AI Platform`,
    description: "Sovereign financial operating system built on Bitcoin Lightning Network",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${getNodeLabel()} | Lightning AI Platform`,
    description: "Sovereign financial operating system built on Bitcoin Lightning Network",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
} 