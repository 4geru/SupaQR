# SupaQR Backend

This directory contains the Supabase backend configuration for the QR Connector project. It includes database migrations, functions, and access control rules.

## Database Schema

The following diagram illustrates the database schema:

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

## Directory Structure

- `migrations/`: Contains SQL files for database schema changes.
