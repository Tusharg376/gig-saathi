import type { Metadata, Viewport } from "next";
import { InstallApp } from "@/components/kaam/install-app";
import "./globals.css";
export const metadata: Metadata = {
  title: "KaamSaathi · Your work. Your wellbeing.",
  description:
    "A Hindi and English AI companion for gig and informal workers. Understand earnings, find support, and take your next step.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "KaamSaathi", statusBarStyle: "default" },
  icons: { icon: "/favicon.svg", apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#226758",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi">
      <body>
        {children}
        <InstallApp />
      </body>
    </html>
  );
}
