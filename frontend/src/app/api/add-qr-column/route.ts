import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { supabaseUrl, supabaseKey, tableName, columnName } = await req.json()
    
    // パラメータのバリデーション
    if (!supabaseUrl || !supabaseKey || !tableName || !columnName) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      )
    }
    
    // Supabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 接続テスト
    const { data: testData, error: testError } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1)
    
    if (testError) {
      return NextResponse.json(
        { error: `テーブルまたはカラムへのアクセスに失敗しました: ${testError.message}` },
        { status: 400 }
      )
    }
    
    // QRコード列名
    const qrColumnName = `${columnName}_qr`
    
    // QRコードカラムが既に存在するか確認
    const { data: columnData, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', tableName)
      .eq('column_name', qrColumnName)
      .eq('table_schema', 'public')
    
    if (columnError) {
      return NextResponse.json(
        { error: `カラム情報の取得に失敗しました: ${columnError.message}` },
        { status: 500 }
      )
    }
    
    // 既に存在する場合はエラーを返す
    if (columnData && columnData.length > 0) {
      return NextResponse.json(
        { error: `${qrColumnName}カラムは既に存在します` },
        { status: 400 }
      )
    }
    
    // QRコード列を追加するSQL
    const addQRColumnSQL = `
      ALTER TABLE "${tableName}" 
      ADD COLUMN "${qrColumnName}" TEXT GENERATED ALWAYS AS (
        'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' || "${columnName}"
      ) STORED;
    `
    
    // SQLを実行
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: addQRColumnSQL
    })
    
    if (alterError) {
      return NextResponse.json(
        { error: `QRコード列の追加に失敗しました: ${alterError.message}` },
        { status: 500 }
      )
    }
    
    // 成功レスポンス
    return NextResponse.json({
      message: `${tableName}テーブルに${qrColumnName}列を追加しました`,
      table: tableName,
      column: columnName,
      qrColumn: qrColumnName
    })
    
  } catch (error) {
    console.error('QRコード列追加エラー:', error)
    return NextResponse.json(
      { error: `予期せぬエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}` },
      { status: 500 }
    )
  }
}

