import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function parseCSV(csvData: string): Record<string, string>[] {
  const lines = csvData.split('\n');
  if (lines.length < 2) return [];

  // ヘッダー行を処理
  const headers = lines[0].split(',').map(header => header.trim());

  // データ行を処理
  const records: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map(value => value.trim());
    const record: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });

    records.push(record);
  }

  return records;
}

export async function POST(request: Request) {
  try {
    const requestBody = await request.json(); 
    
    console.log('リクエスト全体:', JSON.stringify(requestBody).substring(0, 200));

    const { csvData, fileName, session } = requestBody;
    
    // sessionオブジェクトからuserIdを取得
    const userId = session?.user?.id;
    
    console.log('リクエスト受信:', { 
      fileNameReceived: !!fileName, 
      csvDataReceived: !!csvData, 
      sessionReceived: !!session,
      sessionUserIdExists: !!userId,
      userId: userId,
      requestBodyKeys: Object.keys(requestBody)
    });
    
    // 環境変数からSupabase接続情報を取得
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('環境変数:', {
      supabaseUrlExists: !!supabaseUrl,
      supabaseKeyExists: !!supabaseKey
    });
    
    // パラメータのバリデーション
    if (!supabaseUrl || !supabaseKey || !csvData || !fileName || !userId) {
      console.error('不足しているパラメータ:', {
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey,
        csvData: !!csvData,
        fileName: !!fileName,
        sessionExists: !!session,
        userId: !!userId,
        userIdValue: userId
      });
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    // CSVデータをパース
    const records = parseCSV(csvData);

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'CSVファイルにデータが含まれていません' },
        { status: 400 }
      );
    }

    console.log('CSVパース完了:', { recordsCount: records.length });

    // Supabaseクライアントを作成（認証情報を正しく設定）
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      },
      auth: {
        persistSession: false
      }
    });

    try {
      // リストを作成する前にユーザーを確認
      console.log('挿入するユーザーID:', userId);
      
      // リストを作成
      const { data: list, error: listError } = await supabase
        .from('lists')
        .insert([
          {
            title: fileName.replace('.csv', ''),
            description: `${records.length}件のアイテムを含むリスト`,
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (listError) {
        console.error('リスト作成エラー:', listError);
        throw listError;
      }

      // リストアイテムを作成
      const listItems = records.map((record, index) => ({
        list_id: list.id,
        csv_column: record,
        csv_column_number: index + 1,
      }));

      const { error: itemsError } = await supabase
        .from('list_items')
        .insert(listItems);

      if (itemsError) {
        console.error('リストアイテム作成エラー:', itemsError);
        throw itemsError;
      }

      // 成功レスポンス
      return NextResponse.json({
        message: `${list.title}リストを作成しました`,
        title: list.title,
        id: list.id,
        itemCount: records.length,
      });
    } catch (error) {
      console.error('リスト作成エラー:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : '不明なエラーが発生しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('リクエスト処理エラー:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '不明なエラーが発生しました' },
      { status: 500 }
    );
  }
} 

