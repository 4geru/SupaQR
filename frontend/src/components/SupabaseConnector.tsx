"use client";

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link';

export default function SupabaseConnector() {
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  
  // 初期化時にローカルストレージから設定を読み込み
  useEffect(() => {
    const storedUrl = localStorage.getItem('supabaseUrl');
    const storedKey = localStorage.getItem('supabaseKey');
    
    if (storedUrl) setSupabaseUrl(storedUrl);
    if (storedKey) setSupabaseKey(storedKey);
  }, []);
  
  // Supabaseに接続
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    if (!supabaseUrl || !supabaseKey) {
      setError('SupabaseのURLとAPIキーを入力してください。')
      setIsLoading(false)
      return
    }
    
    try {
      // Supabaseクライアントを直接作成
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // REST APIを使ってテーブル一覧を取得（接続確認のため）
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`接続に失敗しました: ${response.status} ${response.statusText}`)
      }
      
      // 接続情報をローカルストレージに保存
      localStorage.setItem('supabaseUrl', supabaseUrl);
      localStorage.setItem('supabaseKey', supabaseKey);
      
      setIsConnected(true)
    } catch (err) {
      console.error('接続エラー:', err)
      setError(`接続に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}\n\nURLとAPIキーを確認してください。`)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      {!isConnected ? (
        <>
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label htmlFor="apiUrl" className="block text-sm font-medium mb-1">
                Supabase URL
              </label>
              <input
                type="text"
                id="apiUrl"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
                Supabase API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="your-api-key"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`${
                  isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium py-2 px-4 rounded-md`}
              >
                {isLoading ? '接続中...' : '接続'}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="text-blue-600 hover:underline flex items-center"
            >
              <span>{showExamples ? '例を非表示' : 'API/URLの例を表示'}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`ml-1 h-4 w-4 transition-transform ${showExamples ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showExamples && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 className="font-medium mb-2">接続情報の例:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium">Supabase URL:</p>
                    <code className="block p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                      https://xyzabcdef.supabase.co
                    </code>
                  </div>
                  <div>
                    <p className="font-medium">Supabase API Key:</p>
                    <code className="block p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                    </code>
                    <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                      ※ APIキーはSupabaseのプロジェクト設定 → API → Project API keysから取得できます
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
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
          
          <div className="pt-4">
            <button
              onClick={() => setIsConnected(false)}
              className="text-blue-600 hover:underline"
            >
              別の接続先を設定
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded whitespace-pre-line">
          {error}
        </div>
      )}
    </div>
  )
} 