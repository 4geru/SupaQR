"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface List {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
}

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null);
  const [supabaseKey, setSupabaseKey] = useState<string | null>(null);
  const [creatingTestData, setCreatingTestData] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // ローカルストレージから接続情報を取得
    const storedUrl = localStorage.getItem('supabaseUrl');
    const storedKey = localStorage.getItem('supabaseKey');
    
    if (storedUrl && storedKey) {
      setSupabaseUrl(storedUrl);
      setSupabaseKey(storedKey);
      fetchLists(storedUrl, storedKey);
    } else {
      setLoading(false);
      setError('Supabase接続情報が設定されていません。接続設定ページで接続してください。');
    }
  }, []);

  const fetchLists = async (url: string, key: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient(url, key);
      
      // テーブル一覧を取得して、listsテーブルが存在するか確認
      const { data: tables, error: tablesError } = await supabase
        .from('_tables')
        .select('name');
      
      if (tablesError) {
        console.log('テーブル一覧取得エラー:', tablesError);
      } else {
        console.log('利用可能なテーブル:', tables);
      }
      
      // listsテーブルからデータ取得
      const { data, error } = await supabase.from('lists').select('*');
      
      if (error) {
        console.error('詳細エラー情報:', error);
        throw error;
      }
      
      if (data && data.length === 0) {
        setError('リストが見つかりません。テーブルは存在しますが、データがありません。Supabaseダッシュボードでデータを追加してください。');
      }
      
      setLists(data || []);
    } catch (err) {
      console.error('リスト取得エラー:', err);
      setError(`リストの取得に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}\n\nSupabaseダッシュボードで以下を確認してください：\n1. listsテーブルが存在すること\n2. 適切な権限が設定されていること\n3. APIキーに適切な権限があること`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">リスト一覧</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Supabaseのliststテーブルから取得したリスト
        </p>
      </header>

      <main className="flex-grow">
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:underline">
            ← 接続設定に戻る
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <h3 className="font-bold mb-2">エラーが発生しました</h3>
              <p className="whitespace-pre-line">{error}</p>
              <div className="mt-4 bg-white p-3 rounded border border-red-200">
                <h4 className="font-medium mb-2">対処方法:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Supabaseダッシュボードで<strong>listsテーブル</strong>が存在することを確認</li>
                  <li>テーブルが存在しない場合は作成してください（id, title, description, created_atカラムが必要）</li>
                  <li>テストデータを追加</li>
                  <li>Table Editor → listsテーブル → Policies で適切な権限が設定されていることを確認</li>
                  <li><code>anon</code>キーに読み取り権限を付与（最低限select権限が必要）</li>
                </ol>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {lists.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          タイトル
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          説明
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          作成日
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {lists.map((list) => (
                        <tr key={list.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {list.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {list.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {list.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(list.created_at).toLocaleString('ja-JP')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  リストが見つかりません。データが存在しないか、アクセス権限がない可能性があります。
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© 2024 Supabase Connector</p>
      </footer>
    </div>
  );
} 