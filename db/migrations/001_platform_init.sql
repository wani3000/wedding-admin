-- MarieCard platform init schema (Supabase/PostgreSQL)

create extension if not exists "pgcrypto";

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  provider text not null default 'google',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, provider)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', ''),
    'google'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null default '',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  public_id varchar(8) unique,
  public_slug text unique,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invitations_user_id_idx on public.invitations(user_id);
create index if not exists invitations_public_id_idx on public.invitations(public_id);
create index if not exists invitations_public_slug_idx on public.invitations(public_slug);

create table if not exists public.invitation_contents (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  content_json jsonb not null,
  version integer not null default 1,
  is_published_snapshot boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invitation_contents_invitation_id_idx
  on public.invitation_contents(invitation_id);

create table if not exists public.preview_tokens (
  token uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists preview_tokens_invitation_id_idx
  on public.preview_tokens(invitation_id);
create index if not exists preview_tokens_expires_at_idx
  on public.preview_tokens(expires_at);

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists invitations_set_updated_at on public.invitations;
create trigger invitations_set_updated_at
  before update on public.invitations
  for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists invitation_contents_set_updated_at on public.invitation_contents;
create trigger invitation_contents_set_updated_at
  before update on public.invitation_contents
  for each row execute procedure public.set_current_timestamp_updated_at();

alter table public.users enable row level security;
alter table public.invitations enable row level security;
alter table public.invitation_contents enable row level security;
alter table public.preview_tokens enable row level security;

-- users policies
create policy if not exists "users_select_self"
  on public.users for select
  using (auth.uid() = id);

create policy if not exists "users_insert_self"
  on public.users for insert
  with check (auth.uid() = id);

create policy if not exists "users_update_self"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- invitations policies
create policy if not exists "invitations_owner_all"
  on public.invitations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- invitation contents policies
create policy if not exists "invitation_contents_owner_all"
  on public.invitation_contents for all
  using (
    exists (
      select 1
      from public.invitations i
      where i.id = invitation_id
        and i.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.invitations i
      where i.id = invitation_id
        and i.user_id = auth.uid()
    )
  );

-- preview tokens policies
create policy if not exists "preview_tokens_owner_all"
  on public.preview_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
