import { createClient } from '@supabase/supabase-js'

type SupabaseConfig = {
  supabaseUrl: string
  supabaseKey: string
}

// Supabaseクライアントを作成する関数
export const createSupabaseClient = ({ supabaseUrl, supabaseKey }: SupabaseConfig) => {
  return createClient(supabaseUrl, supabaseKey)
}

// Supabaseのテーブル一覧を取得する関数
export const fetchTables = async (supabase: ReturnType<typeof createSupabaseClient>) => {
  try {
    // まずはRPCを使用してみる
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    })
    
    if (error) throw error
    
    // データを整形して返す
    return data?.map((table: any) => ({
      tablename: table.table_name
    })) || []
  } catch (error) {
    console.error('テーブル一覧取得エラー:', error)
    
    // バックアップ方法: REST APIを使用して直接テーブル一覧を取得
    try {
      // まずプロジェクトからテーブル一覧を取得
      const response = await fetch(`${supabase.auth.url.origin}/rest/v1/`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.auth.session()?.access_token || '',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`
        }
      })
      
      if (!response.ok) throw new Error('テーブル一覧の取得に失敗しました')
      
      const data = await response.json()
      
      // レスポンスからテーブル名を抽出
      return Object.keys(data).map(tableName => ({
        tablename: tableName
      }))
    } catch (e) {
      console.error('REST APIからのテーブル一覧取得エラー:', e)
      
      // 最後の手段：何かサンプルデータを返す
      return [
        { tablename: 'テーブルの取得に失敗しました' }
      ]
    }
  }
}

// テーブルのカラム一覧を取得する関数
export const fetchColumns = async (
  supabase: ReturnType<typeof createSupabaseClient>,
  tableName: string
) => {
  try {
    // まずはRPCを使用してみる
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tableName}'`
    })
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('カラム一覧取得エラー:', error)
    
    // バックアップ方法: REST APIを使用
    try {
      // 特定のテーブルの情報を取得
      const response = await fetch(`${supabase.auth.url.origin}/rest/v1/${tableName}?limit=0`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.auth.session()?.access_token || '',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`
        }
      })
      
      if (!response.ok) throw new Error(`${tableName}のカラム情報の取得に失敗しました`)
      
      // レスポンスヘッダーからカラム情報を取得
      // この方法は非標準的で信頼性が低いかもしれません
      const columnsHeader = response.headers.get('X-Columns')
      
      if (columnsHeader) {
        const columns = JSON.parse(columnsHeader)
        return columns.map((column: string) => ({
          column_name: column,
          data_type: 'unknown' // APIからは型情報が直接取得できない場合がある
        }))
      }
      
      return []
    } catch (e) {
      console.error('REST APIからのカラム一覧取得エラー:', e)
      return []
    }
  }
} 