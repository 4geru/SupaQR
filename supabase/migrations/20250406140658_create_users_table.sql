create table
  users (
    id uuid not null default gen_random_uuid () primary key,
    email text null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
