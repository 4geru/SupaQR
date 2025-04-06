"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styles from './QrCodePage.module.css';

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
  const params = useParams() || {};
  const uuid = params.uuid as string;
  const t = useTranslations('ListDetails');
  
  const [listItem, setListItem] = useState<ListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<'unconfirmed' | 'checking' | 'confirmed'>('unconfirmed');

  useEffect(() => {
    const fetchQrCodeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error(t('errors.configMissing'));
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
        setConfirmStatus(data.confimed_qr_code ? 'confirmed' : 'unconfirmed');
        
      } catch (err) {
        console.error('QRコードデータ取得エラー:', err);
        setError(`${t('errors.qrConfirmFailed')}: ${err instanceof Error ? err.message : t('errors.unknown')}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQrCodeData();
  }, [uuid, t]);

  const handleConfirmQrCode = async () => {
    if (!listItem) return;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      setError(t('errors.configMissing'));
      return;
    }
    
    setConfirmStatus('checking');
    
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
        throw new Error(result.error || t('errors.qrConfirmFailed'));
      }
      
      // 成功したら状態を更新
      setConfirmStatus('confirmed');
      setListItem({
        ...listItem,
        confimed_qr_code: true
      });
      
    } catch (err) {
      console.error('QRコード確認エラー:', err);
      setError(`${t('errors.qrConfirmFailed')}: ${err instanceof Error ? err.message : t('errors.unknown')}`);
      setConfirmStatus('unconfirmed');
    }
  };

  // ステータスバッジのクラスを動的に決定する関数
  const getStatusBadgeClass = () => {
    switch (confirmStatus) {
      case 'confirmed':
        return `${styles.statusBadge} ${styles.statusConfirmed}`;
      case 'checking':
        return `${styles.statusBadge} ${styles.statusChecking}`;
      default:
        return `${styles.statusBadge} ${styles.statusUnconfirmed}`;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('qrCode')}</h1>
      </header>

      <main className={styles.main}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
          </div>
        ) : error ? (
          <div className={styles.errorBox}>
            <h3 className={styles.errorTitle}>{t('errors.title')}</h3>
            <p className={styles.errorMessage}>{error}</p>
            <Link href="/" className={styles.backLink}>
              {t('backToHome')}
            </Link>
          </div>
        ) : listItem ? (
          <div className={styles.itemContainer}>
            <div className={styles.qrCodeContainer}>
              <div className={styles.qrCodeWrapper}>
                <QRCode
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/qr/${uuid}`}
                  size={200} // 少し小さく調整 (必要に応じて変更)
                />
              </div>
              <p className={styles.qrCodeId}>{t('qrCodeId')}: {uuid}</p>
              <div className={getStatusBadgeClass()}>
                {confirmStatus === 'confirmed'
                  ? t('confirmed')
                  : confirmStatus === 'checking'
                    ? t('checking')
                    : t('unconfirmed')}
              </div>
            </div>
            
            {/* CSVデータ表示 */}
            <div className={styles.dataBox}>
              <h3 className={styles.dataTitle}>{t('data')}</h3>
              <div className={styles.dataGrid}>
                {Object.entries(listItem.csv_column).map(([key, value]) => (
                  <div key={key} className={styles.dataRow}>
                    <span className={styles.dataKey}>{key}:</span>
                    <span className={styles.dataValue}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 確認ボタン */}
            {!listItem.confimed_qr_code && (
              <div className={styles.confirmButtonContainer}>
                <button
                  onClick={handleConfirmQrCode}
                  disabled={confirmStatus === 'checking' || confirmStatus === 'confirmed'}
                  className={styles.confirmButton}
                >
                  {confirmStatus === 'checking' ? `${t('checking')}...` : t('confirm')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.notFoundBox}>
            <p>{t('listNotFound')}</p>
            <Link href="/" className={styles.backLink}>
              {t('backToHome')}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
} 

