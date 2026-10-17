import type { Metadata } from "next";
import "./globals.css";

const title = "Evens Louis — AI Systems, Products & Automation";
const description =
  "Selected work by Evens Louis: intelligent products, AI orchestration systems, financial intelligence, and automation infrastructure.";

export const metadata: Metadata = {
  metadataBase: new URL("https://evenslouis.ca"),
  title,
  description,
  keywords: [
    "Evens Louis",
    "AI systems",
    "AI orchestration",
    "automation",
    "digital products",
    "Montreal",
  ],
  authors: [{ name: "Evens Louis", url: "https://evenslouis.ca" }],
  creator: "Evens Louis",
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    url: "https://evenslouis.ca/work",
    title,
    description,
    siteName: "Evens Louis",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
