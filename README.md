# Supabase QR Connector

QRコードカラムをSupabaseのテーブルに追加するためのツールです。

## セットアップ

1. 依存関係のインストール
```bash
npm install
```

2. 環境変数の設定
`.env.sample`を`.env`としてコピーし、以下の値を設定します：

```bash
cp .env.sample .env
```

## コマンド

### QRコードカラムの追加

指定したテーブルにQRコード用のUUIDカラムを追加します。

```bash
make add-qr-column-cli table_name=テーブル名
```

#### 実行例
```bash
make add-qr-column-cli table_name=apples
```

#### 実行される処理
- 指定したテーブルに`qr_code_number`という名前のUUID型のカラムが追加されます
- 既存のレコードには自動的にランダムなUUIDが生成されて設定されます
- 新しいマイグレーションファイルが`supabase/migrations/`ディレクトリに作成されます

#### 注意点
- テーブル名は必須パラメータです
- テーブルが存在しない場合はエラーが発生します
- マイグレーションを適用するには、別途`supabase db push`コマンドを実行する必要があります


