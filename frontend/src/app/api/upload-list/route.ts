import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

export async function POST(request: NextRequest) {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorizationヘッダーがありません' },
        { status: 401 }
      );
    }
    const accessToken = authHeader.split(' ')[1];

    const requestBody = await request.json(); 
    const { listName, listDescription, listData, user } = requestBody;
    
    // Remove file extension from listName if it exists
    const titleWithoutExtension = listName.includes('.') ? listName.substring(0, listName.lastIndexOf('.')) : listName;

    const userId = user.id;
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
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
      
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      const { data: { user: authUser }, error: getUserError } = await supabase.auth.getUser();
      if (getUserError || !authUser || authUser.id !== userId) {
        console.error('Token/User mismatch or getUser error:', getUserError);
        return NextResponse.json(
          { error: '認証トークンが無効か、ユーザーが一致しません' }, 
          { status: 403 } 
        );
      }

      // Check if user exists in the users table and insert if not
      const { data: existingUser, error: selectUserError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (selectUserError && selectUserError.code !== 'PGRST116') { // PGRST116: No rows found
        console.error('Error checking user in users table:', selectUserError);
        throw selectUserError;
      }

      if (!existingUser) {
        console.log(`User data not found for id ${userId} in users table. Creating new user entry.`);
        const { error: insertUserError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: authUser.email, // Assuming authUser has email, adjust if necessary
          });

        if (insertUserError) {
          console.error('Error creating user entry in users table:', insertUserError);
          throw insertUserError;
        }
        console.log(`User entry created in users table for id ${userId}.`);
      } else {
        console.log(`User entry found in users table for id ${userId}.`);
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
      
      const { data: newList, error: listInsertError } = await supabase
        .from('lists')
        .insert([
          {
            title: titleWithoutExtension,
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
      
      const { error: itemsError } = await supabase
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

