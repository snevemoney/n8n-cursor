import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { MetaPixel } from "@/components/MetaPixel";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://evenslouis.ca"),
  title: "evenslouis.ca",
  description: "Software development & automation",
};

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const META_PIXEL_ID = IS_PRODUCTION
  ? (process.env.META_PIXEL_ID ?? process.env.NEXT_PUBLIC_META_PIXEL_ID)
  : undefined;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-neutral-100 antialiased`}>
        {META_PIXEL_ID ? <MetaPixel pixelId={META_PIXEL_ID} /> : null}
        <PostHogProvider>{children}</PostHogProvider>
        <Toaster richColors position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
