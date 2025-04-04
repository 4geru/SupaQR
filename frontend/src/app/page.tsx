"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';

// クライアントサイドのみで実行するようにダイナミックインポート
const SupabaseConnector = dynamic(() => import('@/components/SupabaseConnector'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Supabase Connector</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Supabase接続確認ツール
        </p>
        <nav className="mt-4">
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="text-blue-600 hover:underline font-medium">
                ホーム
              </Link>
            </li>
            <li>
              <Link href="/lists" className="text-blue-600 hover:underline">
                リスト一覧
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="flex-grow">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">接続設定</h2>
          <SupabaseConnector />
        </div>
        
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">使い方</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Supabase URLとAPI Keyを入力して接続します</li>
            <li>接続が成功すると確認メッセージが表示されます</li>
            <li>「リスト一覧を表示」ボタンをクリックすると、リスト一覧ページに移動します</li>
          </ol>
        </div>
      </main>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© 2024 Supabase Connector</p>
      </footer>
    </div>
  );
}
