import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

export async function POST(request: Request) {
  try {
    const requestBody = await request.json(); 
    
    const { listName, listDescription, listData, user } = requestBody;
    
    const userId = user.id;
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json(
          { error: 'Supabase接続情報が不足しています' },
          { status: 400 }
        );
      }
      
      if (!listName || !listData) {
        return NextResponse.json(
          { error: '必須パラメータが不足しています' },
          { status: 400 }
        );
      }
      
      let records: Record<string, string>[];
      try {
        records = parse(listData, { columns: true, skip_empty_lines: true });
      } catch (parseError) {
        console.error('CSVパースエラー:', parseError);
        return NextResponse.json(
          { error: 'CSVデータの解析に失敗しました' },
          { status: 400 }
        );
      }
      
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
      
      // Check if user exists in public.users table and create if not
      const { data: existingUser, error: userCheckError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (userCheckError) {
        console.error('ユーザー確認エラー:', userCheckError);
        throw userCheckError;
      }

      if (!existingUser) {
        const { error: userInsertError } = await supabaseAdmin
          .from('users')
          .insert({ id: userId, email: user.email });

        if (userInsertError) {
          console.error('ユーザー作成エラー:', userInsertError);
          // Handle potential unique constraint violation if user was created concurrently
          if (userInsertError.code !== '23505') { 
            throw userInsertError;
          }
        }
      }
      
      const { data: newList, error: listInsertError } = await supabaseAdmin
        .from('lists')
        .insert([
          {
            title: listName,
            description: listDescription,
            user_id: userId,
          },
        ])
        .select()
        .single();
      
      if (listInsertError) {
        console.error('リスト作成エラー:', listInsertError);
        throw listInsertError;
      }
      
      const listItems = records.map((record: Record<string, string>, index: number) => ({
        list_id: newList.id,
        csv_column: record,
        csv_column_number: index + 1,
      }));
      
      const { error: itemsError } = await supabaseAdmin
        .from('list_items')
        .insert(listItems);
      
      if (itemsError) {
        console.error('リストアイテム作成エラー:', itemsError);
        throw itemsError;
      }
      
      return NextResponse.json({
        message: `${newList.title}リストを作成しました`,
        title: newList.title,
        id: newList.id,
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

