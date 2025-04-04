"use client";

import dynamic from 'next/dynamic';

// クライアントサイドのみで実行するようにダイナミックインポート
const QRConnector = dynamic(() => import('@/components/QRConnector'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Supabase QR Connector</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          QRコード列管理ツール for Supabase
        </p>
      </header>

      <main className="flex-grow">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">接続設定</h2>
          <QRConnector />
        </div>
        
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">使い方</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Supabase URLとAPI Keyを入力して接続します</li>
            <li>対象のテーブルとカラムを選択します</li>
            <li>QRコード列を追加したいテーブルを設定します</li>
            <li>設定を保存すると自動的にQRコード列が追加されます</li>
          </ol>
        </div>
      </main>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© 2024 Supabase QR Connector</p>
      </footer>
    </div>
  );
}
