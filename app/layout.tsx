import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "KaamSaathi · Your work. Your wellbeing.",
  description:
    "A Hindi and English AI companion for gig and informal workers. Understand earnings, find support, and take your next step.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}
