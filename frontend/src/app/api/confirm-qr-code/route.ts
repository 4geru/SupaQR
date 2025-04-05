import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { supabaseUrl, supabaseKey, itemId, qrCodeUuid } = await req.json()
    
    // パラメータのバリデーション
    if (!supabaseUrl || !supabaseKey || !itemId || !qrCodeUuid) {
      console.error('不足しているパラメータ:', {
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey,
        itemId: !!itemId,
        qrCodeUuid: !!qrCodeUuid,
      });
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      )
    }
    
    // Supabaseクライアントを作成（サービスロールキーを使用）
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('検索条件:', { itemId, qrCodeUuid });
    
    // リストアイテムが存在するかチェック（RLSを考慮）
    const { data: itemData, error: itemError } = await supabase
      .from('list_items')
      .select(`
        id,
        qr_code_uuid,
        confimed_qr_code,
        list_id
      `)
      .eq('id', itemId)
      .single()
    
    console.log('検索結果:', { itemData, itemError });
    
    if (itemError) {
      return NextResponse.json(
        { error: `指定されたアイテムが見つかりません: ${itemError.message}` },
        { status: 404 }
      )
    }
    
    // QRコードUUIDが一致するか確認
    if (itemData.qr_code_uuid !== qrCodeUuid) {
      return NextResponse.json(
        { error: 'QRコードUUIDが一致しません' },
        { status: 400 }
      )
    }
    
    // 既に確認済みかどうかチェック
    if (itemData.confimed_qr_code === true) {
      return NextResponse.json({
        message: 'このQRコードは既に確認済みです',
        item: itemData
      })
    }
    
    // confimed_qr_code フィールドを true に更新
    const { data, error } = await supabase
      .from('list_items')
      .update({ confimed_qr_code: true })
      .eq('id', itemId)
      .select(`
        id,
        qr_code_uuid,
        confimed_qr_code,
        list_id
      `)
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: `QRコードの確認に失敗しました: ${error.message}` },
        { status: 500 }
      )
    }
    
    // 成功レスポンス
    return NextResponse.json({
      message: 'QRコードを確認しました',
      item: data
    })
    
  } catch (error) {
    console.error('QRコード確認エラー:', error)
    return NextResponse.json(
      { error: `予期せぬエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}` },
      { status: 500 }
    )
  }
} 

