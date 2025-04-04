"use client";

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function QRConnector() {
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState('')
  const [columns, setColumns] = useState<{name: string, type: string}[]>([])
  const [selectedColumn, setSelectedColumn] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [sqlText, setSqlText] = useState('')
  
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
      
      // REST APIを使ってテーブル一覧を取得
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
      
      const endpoints = await response.json()
      
      // REST APIのエンドポイントからテーブル名を抽出
      const tableList = Object.keys(endpoints).filter(key => 
        !key.startsWith('rpc/') && 
        key !== 'graphql' && 
        key !== '_rpc' &&
        !key.includes('/')
      )
      
      // テーブルが見つからなかった場合はエラー
      if (tableList.length === 0) {
        throw new Error('テーブルが見つかりませんでした。データベースが空か、APIキーの権限が不足している可能性があります。')
      }
      
      setTables(tableList)
      setIsConnected(true)
    } catch (err) {
      console.error('接続エラー:', err)
      setError(`接続に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}\n\nURLとAPIキーを確認してください。`)
    } finally {
      setIsLoading(false)
    }
  }
  
  // テーブル選択時の処理
  const handleTableSelect = async (tableName: string) => {
    setSelectedTable(tableName)
    setIsLoading(true)
    setError('')
    
    if (!tableName) {
      setColumns([])
      setIsLoading(false)
      return
    }
    
    try {
      // Supabaseクライアントを直接作成
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // テーブル情報を取得 (先頭の行だけ)
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        throw new Error(`テーブル情報の取得に失敗しました: ${error.message}`)
      }
      
      // データからカラム情報を抽出
      const columnList: {name: string, type: string}[] = []
      
      if (data && data.length > 0) {
        const row = data[0]
        
        // 各カラムの型を推測
        Object.entries(row).forEach(([key, value]) => {
          let type: string = typeof value
          
          if (value === null) type = 'unknown'
          else if (Array.isArray(value)) type = 'array'
          else if (typeof value === 'object') type = 'json'
          
          columnList.push({ name: key, type })
        })
      } else {
        // データがなくても定義だけを取得しようとする
        const { data: definition, error: defError } = await supabase
          .from(tableName)
          .select()
          .limit(0)
        
        if (defError) {
          throw new Error(`テーブル構造の取得に失敗しました: ${defError.message}`)
        }
        
        // レスポンスヘッダーからカラム情報を取得できるか試みる
        const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?limit=0`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
          }
        })
        
        if (response.ok) {
          // ヘッダーにカラム情報があるか確認
          const columnsHeader = response.headers.get('X-Columns')
          
          if (columnsHeader) {
            const columnNames = JSON.parse(columnsHeader)
            columnList.push(...columnNames.map((name: string) => ({ name, type: 'unknown' })))
          }
        }
      }
      
      // カラムが見つからなかった場合は手動入力を促す
      if (columnList.length === 0) {
        columnList.push({ name: 'カラムを取得できませんでした。手動で入力してください。', type: '' })
      }
      
      setColumns(columnList)
    } catch (err) {
      console.error('カラム情報取得エラー:', err)
      setError(`カラム情報の取得に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`)
      
      // エラーが発生しても手動入力できるように空の配列を設定
      setColumns([])
    } finally {
      setIsLoading(false)
    }
  }
  
  // QRコード列のSQL文を生成
  const generateQRColumnSQL = () => {
    if (!selectedTable || !selectedColumn) return ''
    
    const qrColumnName = `${selectedColumn}_qr`
    
    const sql = `
-- 以下のSQLをコピーしてSupabase SQL Editorで実行してください
ALTER TABLE "${selectedTable}" 
ADD COLUMN IF NOT EXISTS "${qrColumnName}" TEXT GENERATED ALWAYS AS (
  'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' || "${selectedColumn}"
) STORED;

-- 確認用SQL
SELECT "${selectedColumn}", "${qrColumnName}" 
FROM "${selectedTable}" 
LIMIT 5;
`
    return sql
  }
  
  // QRコード列を追加ボタンがクリックされたときの処理
  const handleAddQRColumn = () => {
    if (!selectedTable || !selectedColumn) return
    
    // SQLをコピーするためのテキストを設定
    const sql = generateQRColumnSQL()
    setSqlText(sql)
    
    // コピーダイアログを表示
    const textarea = document.createElement('textarea')
    textarea.value = sql
    document.body.appendChild(textarea)
    textarea.select()
    
    try {
      document.execCommand('copy')
      alert('SQLをクリップボードにコピーしました。Supabase SQL Editorに貼り付けて実行してください。')
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err)
      alert('SQLのコピーに失敗しました。表示されたSQLを手動でコピーしてください。')
    } finally {
      document.body.removeChild(textarea)
    }
  }
  
  // マニュアル入力用のハンドラー
  const handleManualTableInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTable(e.target.value)
  }
  
  const handleManualColumnInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColumn(e.target.value)
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
                
                <h4 className="font-medium mt-4 mb-2">生成されるQRコードURL例:</h4>
                <div className="space-y-2">
                  <p className="text-xs">テーブル: <code>products</code>、カラム: <code>id</code> の場合</p>
                  <code className="block p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                    https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ABC123
                  </code>
                  <div className="mt-2">
                    <p className="text-xs mb-1">結果のQRコード:</p>
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ABC123" 
                      alt="Example QR Code" 
                      className="h-24 w-24 bg-white p-1 border"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">テーブル選択</h3>
            {tables.length > 0 ? (
              <>
                <select
                  value={selectedTable}
                  onChange={(e) => handleTableSelect(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 mb-2"
                >
                  <option value="">テーブルを選択</option>
                  {tables.map((table, index) => (
                    <option key={index} value={table}>
                      {table}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 dark:text-gray-400">または直接テーブル名を入力：</p>
                <input
                  type="text"
                  value={selectedTable}
                  onChange={handleManualTableInput}
                  onBlur={() => selectedTable && handleTableSelect(selectedTable)}
                  placeholder="テーブル名を入力"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 mt-1"
                />
              </>
            ) : (
              <input
                type="text"
                value={selectedTable}
                onChange={handleManualTableInput}
                onBlur={() => selectedTable && handleTableSelect(selectedTable)}
                placeholder="テーブル名を入力"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            )}
          </div>
          
          {selectedTable && (
            <div>
              <h3 className="text-lg font-medium mb-2">カラム選択</h3>
              {columns.length > 0 ? (
                <>
                  <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 mb-2"
                  >
                    <option value="">カラムを選択</option>
                    {columns.map((column, index) => (
                      <option key={index} value={column.name}>
                        {column.name} {column.type ? `(${column.type})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-600 dark:text-gray-400">または直接カラム名を入力：</p>
                  <input
                    type="text"
                    value={selectedColumn}
                    onChange={handleManualColumnInput}
                    placeholder="カラム名を入力"
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 mt-1"
                  />
                </>
              ) : (
                <input
                  type="text"
                  value={selectedColumn}
                  onChange={handleManualColumnInput}
                  placeholder="カラム名を入力"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              )}
            </div>
          )}
          
          {selectedTable && selectedColumn && (
            <>
              <div className="pt-4">
                <button
                  onClick={handleAddQRColumn}
                  disabled={isLoading}
                  className={`${
                    isLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                  } text-white font-medium py-2 px-4 rounded-md`}
                >
                  SQLをコピー
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  ※ このボタンをクリックするとSQLがコピーされます。Supabase SQL Editorに貼り付けて実行してください。
                </p>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 className="font-medium mb-2">実行用SQL:</h4>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto whitespace-pre-wrap">
                  {generateQRColumnSQL()}
                </pre>
              </div>
            </>
          )}
          
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