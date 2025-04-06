# SupaQR バックエンド

このディレクトリには、QR Connector プロジェクトの Supabase バックエンド設定が含まれています。データベースのマイグレーション、関数、アクセス制御ルールなどが含まれます。

## データベーススキーマ

以下の図はデータベーススキーマを示しています:

```mermaid
erDiagram
    users {
        UUID id PK
        TEXT email
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    lists {
        BIGSERIAL id PK
        TIMESTAMPTZ created_at
        TEXT title
        TEXT description
        UUID user_id FK
    }

    list_items {
        BIGSERIAL id PK
        TIMESTAMPTZ created_at
        BIGINT list_id FK
        JSONB csv_column
        INTEGER csv_column_number
        UUID qr_code_uuid
        BOOLEAN confirmed_qr_code
    }

    users ||--o{ lists : "has"
    lists ||--o{ list_items : "contains"
```

## ディレクトリ構成

- `migrations/`: データベーススキーマの変更を管理する SQL ファイルが含まれています。
