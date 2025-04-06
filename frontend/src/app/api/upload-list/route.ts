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

      // public.users テーブルにユーザーが存在するか確認
      // Note: 'users' is assumed table name, adjust if needed.
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users') 
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (userCheckError) {
        console.error('ユーザー存在確認エラー:', userCheckError);
        return NextResponse.json({ error: 'ユーザー情報の確認中にエラーが発生しました' }, { status: 500 });
      }

      // ユーザーが存在しない場合は挿入する
      if (!existingUser) {
        const userEmail = authUser.email;
        if (!userEmail) {
          console.error('ユーザー登録に必要なメールアドレスが取得できませんでした。Auth User:', authUser);
          return NextResponse.json({ error: 'ユーザー登録に必要なメールアドレスが取得できませんでした' }, { status: 400 });
        }

        // Note: Assumes 'users' table has 'id' (uuid) and 'email' columns. Adjust if needed.
        const { error: userInsertError } = await supabase
          .from('users') 
          .insert({ id: userId, email: userEmail }); 

        if (userInsertError) {
          // Handle potential race condition where user was inserted between check and insert
          if (userInsertError.code === '23505') { // unique_violation
             console.warn(`User ${userId} likely already exists despite check (unique violation):`, userInsertError.message);
             // Proceed as the user exists now
          } else {
             console.error('public.users テーブルへのユーザー挿入失敗:', userInsertError);
             return NextResponse.json({ error: 'ユーザー情報の作成に失敗しました' }, { status: 500 });
          }
        } else {
          console.log(`User ${userId} (${userEmail}) が public.users テーブルに挿入されました。`);
        }
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

