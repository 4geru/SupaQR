import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { supabaseUrl, supabaseKey, listId, csvData, fileName } = await req.json()
    
    // パラメータのバリデーション
    if (!supabaseUrl || !supabaseKey || !listId || !csvData) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      )
    }
    
    // CSVデータの解析
    const items = parseCSV(csvData, listId)
    
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'CSVファイルが空か、不正なフォーマットです' },
        { status: 400 }
      )
    }
    
    // Supabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // リストが存在するかチェック
    const { data: listData, error: listError } = await supabase
      .from('lists')
      .select('id')
      .eq('id', listId)
      .single()
    
    if (listError) {
      return NextResponse.json(
        { error: `指定されたリストが見つかりません: ${listError.message}` },
        { status: 404 }
      )
    }
    
    // ファイル名がある場合、リストのタイトルを更新
    if (fileName) {
      const { error: updateError } = await supabase
        .from('lists')
        .update({ title: fileName })
        .eq('id', listId)
      
      if (updateError) {
        console.error('リストタイトル更新エラー:', updateError)
        // タイトル更新エラーは致命的ではないので処理を続行
      }
    }
    
    // list_itemsテーブルにデータを挿入
    const { data, error } = await supabase
      .from('list_items')
      .insert(items)
      .select()
    
    if (error) {
      return NextResponse.json(
        { error: `アイテムの挿入に失敗しました: ${error.message}` },
        { status: 500 }
      )
    }
    
    // 成功レスポンス
    return NextResponse.json({
      message: 'アイテムを正常に追加しました',
      insertedCount: data.length,
      items: data
    })
    
  } catch (error) {
    console.error('CSVアップロードエラー:', error)
    return NextResponse.json(
      { error: `予期せぬエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}` },
      { status: 500 }
    )
  }
}

/**
 * CSVデータをパースしてリストアイテムの配列に変換する
 */
function parseCSV(csvData: string, listId: string): Array<{
  list_id: string;
  csv_column: object;
  csv_column_number: number;
}> {
  const lines = csvData.split('\n')
  const items: Array<{
    list_id: string;
    csv_column: object;
    csv_column_number: number;
  }> = []
  
  // ヘッダー行がない場合は処理しない
  if (lines.length < 2) {
    return items;
  }
  
  // ヘッダー行を解析
  const headerLine = lines[0].trim()
  if (!headerLine) {
    return items;
  }
  
  // ヘッダーをカンマで分割
  const headers = headerLine.split(',').map(header => header.trim())
  
  // 2行目からデータとして処理（ヘッダー行は除外）
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // CSV行をカンマで分割
    const values = line.split(',')
    
    // CSVの列情報を記録
    const csvColumn: Record<string, string> = {}
    for (let j = 0; j < values.length; j++) {
      // ヘッダーがある場合はそれをキーとして使用、なければcolumn1, column2...を使用
      const key = j < headers.length ? headers[j] : `column${j+1}`
      csvColumn[key] = values[j].trim()
    }
    
    items.push({
      list_id: listId,
      csv_column: csvColumn,
      csv_column_number: i // ヘッダー行を除いた実際の行番号
    })
  }
  
  return items
} 