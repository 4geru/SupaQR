"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import QrCodeDisplay from '@/components/QrCodeDisplay';

interface List {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
}

interface ListItem {
  id: number;
  list_id: number;
  completed: boolean;
  created_at: string;
  csv_column: Record<string, string>;
  csv_column_number: number;
  qr_code_uuid: string | null;
  confimed_qr_code: boolean;
}

export default function ListDetailPage() {
  const params = useParams();
  const listId = params.id as string;

  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null);
  const [supabaseKey, setSupabaseKey] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);

  useEffect(() => {
    // ローカルストレージから接続情報を取得
    const storedUrl = localStorage.getItem('supabaseUrl');
    const storedKey = localStorage.getItem('supabaseKey');
    
    if (storedUrl && storedKey) {
      setSupabaseUrl(storedUrl);
      setSupabaseKey(storedKey);
      fetchListDetails(storedUrl, storedKey, listId);
    } else {
      setLoading(false);
      setError('Supabase接続情報が設定されていません。接続設定ページで接続してください。');
    }
  }, [listId]);

  const fetchListDetails = async (url: string, key: string, id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient(url, key);
      
      // リスト情報を取得
      const { data: listData, error: listError } = await supabase
        .from('lists')
        .select('*')
        .eq('id', id)
        .single();
      
      if (listError) {
        throw listError;
      }
      
      setList(listData);
      
      // リストアイテムを取得
      const { data: itemsData, error: itemsError } = await supabase
        .from('list_items')
        .select('*')
        .eq('list_id', id)
        .order('created_at', { ascending: true });
      
      if (itemsError) {
        console.error('アイテム取得エラー:', itemsError);
        // アイテム取得エラーは表示するだけで、致命的とはしない
      }
      
      setItems(itemsData || []);
    } catch (err) {
      console.error('リスト詳細取得エラー:', err);
      setError(`リスト詳細の取得に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmQrCode = async () => {
    if (!supabaseUrl || !supabaseKey || !selectedItem) return;
    
    setSelectedItem({
      ...selectedItem,
      confimed_qr_code: true
    });
    
    try {
      const response = await fetch('/api/confirm-qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supabaseUrl,
          supabaseKey,
          itemId: selectedItem.id,
          qrCodeUuid: selectedItem.qr_code_uuid,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'QRコード確認中にエラーが発生しました');
      }
      
    } catch (err) {
      console.error('QRコード確認エラー:', err);
      setError(`QRコードの確認に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
      setSelectedItem({
        ...selectedItem,
        confimed_qr_code: false
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-8">
      <header className="mb-8">
        <div className="mb-4">
          <Link href="/lists" className="text-blue-600 hover:underline">
            ← リスト一覧に戻る
          </Link>
        </div>
        <h1 className="text-3xl font-bold">
          {loading ? 'リスト読み込み中...' : list?.title || 'リスト詳細'}
        </h1>
        {list?.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {list.description}
          </p>
        )}
      </header>

      <main className="flex-grow flex">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold mb-2">エラーが発生しました</h3>
            <p className="whitespace-pre-line">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {list ? (
              <div className="flex w-full">
                {/* 左側: アイテム一覧 */}
                <div className="w-1/2 p-4">
                  <h2 className="text-xl font-semibold mb-4">アイテム一覧</h2>
                  {items.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {items.map((item) => (
                        <li key={item.id} className="py-3 cursor-pointer" onClick={() => setSelectedItem(item)}>
                          <div className="flex flex-col">
                            <div className="flex items-center mb-2">
                              <span className="text-gray-900 dark:text-white font-medium">
                                行番号: {item.csv_column_number}
                              </span>
                            </div>
                            {item.csv_column && (
                              <div className="ml-6 bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                                <h4 className="text-gray-700 dark:text-gray-300 mb-1 font-medium">CSV データ:</h4>
                                <div className="flex flex-col space-y-1">
                                  {Object.entries(item.csv_column).map(([key, value]) => (
                                    <div key={key} className="flex">
                                      <span className="font-medium text-gray-600 dark:text-gray-400 mr-2 w-24">{key}:</span>
                                      <span className="text-gray-800 dark:text-gray-200">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                      このリストにはアイテムがありません。
                    </div>
                  )}
                </div>

                {/* 右側: QRコード表示 */}
                <div className="w-1/2 p-4">
                  {selectedItem && selectedItem.qr_code_uuid ? (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">QRコード</h2>
                      <QrCodeDisplay
                        uuid={selectedItem.qr_code_uuid}
                        confirmStatus={selectedItem.confimed_qr_code ? '確認済み' : '未確認'}
                        csvData={selectedItem.csv_column}
                        onConfirm={handleConfirmQrCode}
                      />
                    </div>
                  ) : (
                    <div className="text-gray-500">QRコードを表示するアイテムを選択してください。</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
                <h3 className="font-bold mb-2">リストが見つかりません</h3>
                <p>
                  指定されたIDのリストは存在しないか、アクセス権限がありません。
                  <br />
                  <Link href="/lists" className="text-blue-600 hover:underline">
                    リスト一覧に戻る
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </main>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© 2024 Supabase Connector</p>
      </footer>
    </div>
  );
} 

