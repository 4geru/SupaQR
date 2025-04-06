import type { Metadata } from "next";
import "../globals.css";
import { AuthProvider } from '@/lib/auth-context'
import Header from '@/components/Header'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'

// Google Fontsを使用
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "SupaQR",
  description: "QR code column management for Supabase",
};

// サポートする言語のリスト
const locales = ['en', 'ja'];

type Props = {
  children: React.ReactNode;
  params: {
    locale: string;
  };
};

export default async function LocaleLayout(props: Props) {
  const { children } = props;
  const params = await props.params;
  const locale = params.locale;

  // サポートされていない言語の場合は404を返す
  if (!locales.includes(locale)) {
    notFound();
  }

  const defaultLocale = 'en'
  const currentLocale = locale || defaultLocale

  let messages
  try {
    messages = (await import(`@/i18n/messages/${currentLocale}.json`)).default
  } catch (error) {
    console.error(`Failed to load messages for locale ${currentLocale}, falling back to ${defaultLocale}`)
    messages = (await import(`@/i18n/messages/${defaultLocale}.json`)).default
  }

  return (
    <html lang={currentLocale} className={inter.variable}>
      <body>
        <AuthProvider>
          <NextIntlClientProvider locale={currentLocale} messages={messages}>
            <Header />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 