"use client"

import { useEffect } from 'react';
import { redirect, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const { user, loading } = useAuth();
  const params = useParams();
  const locale = params?.locale as string;

  useEffect(() => {
    if (!loading && locale) { // ローディングが完了し、localeが取得できたら処理
      if (user) {
        redirect(`/${locale}/lists`);
      } else {
        redirect(`/${locale}/landing`);
      }
    }
  }, [user, loading, locale]); // 依存配列に locale を追加

  // ローディング中はスピナーなどを表示
  if (loading || !locale) {
    return <LoadingSpinner />; // または適切なローディング表示
  }

  // リダイレクトが実行されるまでの間、何も表示しないか、あるいは最小限の表示
  return null;
}
