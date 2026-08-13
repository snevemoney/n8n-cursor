import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Connector Demo — Live GitHub",
  description: "Live connector-backed UI reading GitHub data in real-time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0A0A0C" }}>
        {children}
      </body>
    </html>
  );
}
