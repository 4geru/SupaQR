"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface ListItem {
  id: number;
  list_id: number;
  created_at: string;
  csv_column: Record<string, string>;
  csv_column_number: number;
  qr_code_uuid: string;
  confimed_qr_code: boolean;
}

export default function QrCodePage() {
  const params = useParams();
  const uuid = params.uuid as string;
  
  const [listItem, setListItem] = useState<ListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<'未確認' | '確認中' | '確認済み'>('未確認');

  useEffect(() => {
    const fetchQrCodeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabaseの接続情報が設定されていません。環境変数を確認してください。');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // QRコードUUIDからリストアイテムを取得
        const { data, error: fetchError } = await supabase
          .from('list_items')
          .select('*')
          .eq('qr_code_uuid', uuid)
          .single();
        
        if (fetchError) {
          throw fetchError;
        }
        
        setListItem(data);
        
        // 確認ステータスを設定
        setConfirmStatus(data.confimed_qr_code ? '確認済み' : '未確認');
        
      } catch (err) {
        console.error('QRコードデータ取得エラー:', err);
        setError(`QRコードデータの取得に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQrCodeData();
  }, [uuid]);

  const handleConfirmQrCode = async () => {
    if (!listItem) return;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      setError('Supabaseの接続情報が設定されていません。環境変数を確認してください。');
      return;
    }
    
    setConfirmStatus('確認中');
    
    try {
      const response = await fetch('/api/confirm-qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supabaseUrl,
          supabaseKey,
          itemId: listItem.id,
          qrCodeUuid: uuid,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'QRコード確認中にエラーが発生しました');
      }
      
      // 成功したら状態を更新
      setConfirmStatus('確認済み');
      setListItem({
        ...listItem,
        confimed_qr_code: true
      });
      
    } catch (err) {
      console.error('QRコード確認エラー:', err);
      setError(`QRコードの確認に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
      setConfirmStatus('未確認');
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">QRコード</h1>
      </header>

      <main className="flex-grow">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold mb-2">エラーが発生しました</h3>
            <p className="whitespace-pre-line">{error}</p>
            <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline">
              ホームに戻る
            </Link>
          </div>
        ) : listItem ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="p-4 bg-white rounded-lg mb-4">
                <QRCode
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/qr/${uuid}`}
                  size={256}
                />
              </div>
              <p className="text-lg text-center mb-2">QRコードID: {uuid}</p>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                confirmStatus === '確認済み' 
                  ? 'bg-green-100 text-green-800' 
                  : confirmStatus === '確認中'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {confirmStatus}
              </div>
            </div>
            
            {/* CSVデータ表示 */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-4">
              <h3 className="font-semibold mb-3">データ:</h3>
              <div className="space-y-2">
                {Object.entries(listItem.csv_column).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium text-gray-600 dark:text-gray-400 mr-2 w-24">{key}:</span>
                    <span className="text-gray-800 dark:text-gray-200">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 確認ボタン */}
            {!listItem.confimed_qr_code && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleConfirmQrCode}
                  disabled={confirmStatus === '確認中' || confirmStatus === '確認済み'}
                  className={`px-6 py-2 rounded-md font-medium ${
                    confirmStatus === '確認中' || confirmStatus === '確認済み'
                      ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {confirmStatus === '確認中' ? '確認中...' : '確認する'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>指定されたQRコードが見つかりません。</p>
            <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline">
              ホームに戻る
            </Link>
          </div>
        )}
      </main>
    </div>
  );
} 

