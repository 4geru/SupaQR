"use client";

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link';

export default function SupabaseConnector() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabaseの接続情報が設定されていません。環境変数を確認してください。');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // REST APIを使ってテーブル一覧を取得（接続確認のため）
        const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          mode: 'cors'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(`接続に失敗しました: ${response.status} ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
        }
        
        setIsConnected(true);
      } catch (err) {
        console.error('接続エラー:', err);
        setError(`接続に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
  }, []);
  
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div>接続確認中...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded whitespace-pre-line">
          {error}
        </div>
      ) : isConnected ? (
        <div className="space-y-6">
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-medium">接続成功！</p>
            <p className="text-sm mt-1">Supabaseへの接続が正常に確立されました。</p>
          </div>
          
          <div className="mt-4">
            <Link href="/lists" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md inline-block">
              リスト一覧を表示
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
} 

