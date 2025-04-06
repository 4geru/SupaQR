import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// サポートする言語のリスト
const locales = ['en', 'ja'] as const;
type Locale = typeof locales[number]; // Derive locale type

export default getRequestConfig(async ({locale}) => {
  // サポートされていない言語の場合は404を返す
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Asia/Tokyo',
    locale: locale as string
  };
}); 