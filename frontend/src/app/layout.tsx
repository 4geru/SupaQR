import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/auth-context'
import Header from '@/components/Header'
import { redirect } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SupaQR",
  description: "QR code column management for Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ルートパスへのアクセスを/にリダイレクト
  if (typeof window !== 'undefined' && window.location.pathname === '/lists') {
    redirect('/');
  }

  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}


