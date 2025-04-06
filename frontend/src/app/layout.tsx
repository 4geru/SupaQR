import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupaQR",
  description: "QR code column management for Supabase",
};

// デフォルトのルートレイアウト - [locale]レイアウトに処理を委任
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children;
}
