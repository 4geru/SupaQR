"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import QrCodeDisplay from '@/components/QrCodeDisplay';
import { useTranslations } from 'next-intl';
import LinkifyText from '@/components/LinkifyText';

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
  const listId = params?.id as string;
  const t = useTranslations('ListDetails');

  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);

  useEffect(() => {
    const fetchListDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error(t('errors.configMissing'));
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // リスト情報を取得
        const { data: listData, error: listError } = await supabase
          .from('lists')
          .select('*')
          .eq('id', listId)
          .single();
        
        if (listError) {
          throw listError;
        }
        
        setList(listData);
        
        // リストアイテムを取得
        const { data: itemsData, error: itemsError } = await supabase
          .from('list_items')
          .select('*')
          .eq('list_id', listId)
          .order('csv_column_number', { ascending: true });
        
        if (itemsError) {
          console.error('アイテム取得エラー:', itemsError);
          // アイテム取得エラーは表示するだけで、致命的とはしない
        }
        
        setItems(itemsData || []);
      } catch (err) {
        console.error('リスト詳細取得エラー:', err);
        setError(`リスト詳細の取得に失敗しました: ${err instanceof Error ? err.message : t('errors.unknown')}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListDetails();
  }, [listId, t]);

  const handleConfirmQrCode = async () => {
    if (!selectedItem) {
      setError(t('errors.missingInfo'));
      return;
    }
    
    if (!selectedItem.qr_code_uuid) {
      setError(t('errors.noQrUuid'));
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      setError(t('errors.configMissing'));
      return;
    }
    
    // ローカルで即座に状態を更新
    const updatedItems = items.map(item => 
      item.id === selectedItem.id 
        ? { ...item, confimed_qr_code: true }
        : item
    );
    setItems(updatedItems);
    
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
        throw new Error(result.error || t('errors.qrConfirmFailed'));
      }
      
      // 成功時の処理
      // 選択されたアイテムの状態も更新
      setSelectedItem({
        ...selectedItem,
        confimed_qr_code: true
      });
      
    } catch (err) {
      console.error('QRコード確認エラー:', err);
      setError(`${t('errors.qrConfirmFailed')}: ${err instanceof Error ? err.message : t('errors.unknown')}`);
      
      // エラー時は元の状態に戻す
      const revertedItems = items.map(item => 
        item.id === selectedItem.id 
          ? { ...item, confimed_qr_code: false }
          : item
      );
      setItems(revertedItems);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-8">
      <header className="mb-8">
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:underline">
            {t('backToHome')}
          </Link>
        </div>
        <h1 className="text-3xl font-bold">
          {loading ? t('loading') : list?.title || t('listDetails')}
        </h1>
        {list?.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {list.description}
          </p>
        )}
        <div className="mt-4">
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className={`h-2.5 rounded-full ${
                  items.length > 0 && items.filter(item => item.confimed_qr_code).length === items.length
                    ? 'bg-green-600'
                    : 'bg-blue-600'
                }`}
                style={{ 
                  width: `${items.length > 0 ? (items.filter(item => item.confimed_qr_code).length / items.length * 100) : 0}%` 
                }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {items.length > 0 ? Math.round(items.filter(item => item.confimed_qr_code).length / items.length * 100) : 0}%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('itemsConfirmed', {
              confirmed: items.filter(item => item.confimed_qr_code).length,
              total: items.length
            })}
          </p>
        </div>
      </header>

      <main className="flex-grow flex">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold mb-2">{t('errors.title')}</h3>
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
                <div className="w-1/2 p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {items.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className={`py-3 px-2 cursor-pointer transition-colors duration-150 ease-in-out ${
                            selectedItem?.id === item.id
                              ? 'bg-blue-100 dark:bg-blue-900 rounded'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center mb-2">
                              <span className="text-gray-900 dark:text-white font-medium">
                                {t('rowNumber')}: {item.csv_column_number}
                              </span>
                              {item.confimed_qr_code ? (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  {t('confirmed')}
                                </span>
                              ) : (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                  {t('unconfirmed')}
                                </span>
                              )}
                            </div>
                            {item.csv_column && (
                              <div className="ml-6 bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                                <h4 className="text-gray-700 dark:text-gray-300 mb-1 font-medium">{t('csvData')}</h4>
                                <div className="flex flex-col space-y-1">
                                  {Object.entries(item.csv_column).map(([key, value]) => (
                                    <div key={key} className="flex">
                                      <span className="font-medium text-gray-600 dark:text-gray-400 mr-2 w-24">{key}:</span>
                                      <span className="text-gray-800 dark:text-gray-200">
                                        <LinkifyText text={value} />
                                      </span>
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
                      {t('noItems')}
                    </div>
                  )}
                </div>

                {/* 右側: QRコード表示 */}
                <div className="w-1/2 p-4 sticky top-0 self-start">
                  {selectedItem && selectedItem.qr_code_uuid ? (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">{t('qrCode')}</h2>
                      <QrCodeDisplay
                        uuid={selectedItem.qr_code_uuid}
                        confirmStatus={selectedItem.confimed_qr_code ? t('confirmed') : t('unconfirmed')}
                        csvData={selectedItem.csv_column}
                        onConfirm={handleConfirmQrCode}
                      />
                    </div>
                  ) : (
                    <div className="text-gray-500">{t('selectItem')}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
                <h3 className="font-bold mb-2">{t('listNotFound')}</h3>
                <p>
                  {t('noAccess')}
                  <br />
                  <Link href="/" className="text-blue-600 hover:underline">
                    {t('backToHome')}
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </main>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>{t('copyright')}</p>
      </footer>
    </div>
  );
} 

