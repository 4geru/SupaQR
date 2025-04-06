alter policy "Allow authenticated users to insert their own lists"
on "public"."lists"
to authenticated
with check (
  (auth.uid() = user_id)
);

alter policy "Allow authenticated users to select their own lists"
on "public"."lists"
to authenticated
using (
  (auth.uid() = user_id)
);

alter policy "Allow authenticated users to insert their own user record"
on "public"."users"
to authenticated
with check (
  (auth.uid() = id)
);

alter table public.users enable row level security;
alter table public.lists enable row level security;
alter table public.list_items disable row level security; -- QR code can access every one.
