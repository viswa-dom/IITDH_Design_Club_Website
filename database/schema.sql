create extension if not exists "uuid-ossp";

drop table if exists password_reset_codes;

create table password_reset_codes (
    id uuid default uuid_generate_v4() primary key,
    email text not null,
    code text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    expires_at timestamp with time zone not null,
    used boolean default false
);

-- Create index for faster lookups
create index if not exists idx_password_reset_codes_email on password_reset_codes(email);

-- Enable Row Level Security
alter table password_reset_codes enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow inserting reset codes" on password_reset_codes;
drop policy if exists "Allow selecting reset codes" on password_reset_codes;
drop policy if exists "Allow updating reset codes" on password_reset_codes;
drop policy if exists "Allow deleting reset codes" on password_reset_codes;

-- Create policies
create policy "Allow inserting reset codes"
    on password_reset_codes for insert
    with check (true);

create policy "Allow selecting reset codes"
    on password_reset_codes for select
    using (true);

create policy "Allow updating reset codes"
    on password_reset_codes for update
    using (true);

create policy "Allow deleting reset codes"
    on password_reset_codes for delete
    using (true);