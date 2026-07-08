create table public.reservation_enquiries (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 30),
  guests text not null check (char_length(guests) between 2 and 50),
  plan text not null check (char_length(plan) between 2 and 80),
  notes text check (notes is null or char_length(notes) <= 1000),
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'cancelled')),
  source text not null default 'website'
);

create index reservation_enquiries_created_at_idx
  on public.reservation_enquiries (created_at desc);

create index reservation_enquiries_phone_created_at_idx
  on public.reservation_enquiries (phone, created_at desc);

alter table public.reservation_enquiries enable row level security;

revoke all on table public.reservation_enquiries from anon, authenticated;

comment on table public.reservation_enquiries is
  'Reservation enquiries submitted through the Timba XO website before WhatsApp handoff.';
