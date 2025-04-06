create table
  list_items (
    id bigserial primary key,
    created_at timestamptz not null default now(),
    list_id bigint not null,
    csv_column jsonb not null,
    csv_column_number integer not null,
    qr_code_uuid uuid not null default gen_random_uuid(),
    confirmed_qr_code boolean not null default false,

    constraint list_items_list_id_fkey foreign key (list_id) references lists (id) on delete cascade
  );

-- Optional: Add indexes for frequently queried columns
create index ix_list_items_list_id on list_items (list_id);
create index ix_list_items_qr_code_uuid on list_items (qr_code_uuid);
