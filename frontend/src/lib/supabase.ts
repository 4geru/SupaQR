import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabaseの環境変数が設定されていません。.envファイルを確認してください。')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (error) throw error

    return data?.map((table: { table_name: string }) => ({
      tablename: table.table_name
    })) || []
  } catch (error) {
    console.error('テーブル一覧取得エラー:', error)
    return []
  }
}

// テーブルのカラム一覧を取得する関数
export const fetchColumns = async (
  supabase: ReturnType<typeof createSupabaseClient>,
  tableName: string
) => {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('カラム一覧取得エラー:', error)
    return []
  }
} 

