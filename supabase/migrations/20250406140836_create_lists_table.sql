create table
  lists (
    id bigserial primary key,
    created_at timestamptz not null default now(),
    title text not null,
    description text null,
    user_id uuid,
    foreign key (user_id) references users (id) on delete cascade
  );

-- Optional: Add indexes for frequently queried columns
create index ix_lists_user_id on lists (user_id);
