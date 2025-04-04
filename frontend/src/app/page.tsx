"use client";

import dynamic from 'next/dynamic';

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
          </ol>
        </div>
      </main>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© 2024 Supabase Connector</p>
      </footer>
    </div>
  );
}
