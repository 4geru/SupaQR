# Supabase QR Connector

## 概要
このプロジェクトは、SupabaseとQRコードを連携させるためのコネクターアプリケーションです。

## 機能
- QRコードの生成
- QRコードの読み取り
- Supabaseとのデータ連携

## セットアップ
1. リポジトリをクローン
```bash
git clone [repository-url]
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
`.env`ファイルを作成し、必要な環境変数を設定してください。

4. アプリケーションの起動
```bash
npm run dev
```

## 環境変数
- `SUPABASE_URL`: SupabaseのプロジェクトURL
- `SUPABASE_ANON_KEY`: Supabaseの匿名キー

## ライセンス
MIT
