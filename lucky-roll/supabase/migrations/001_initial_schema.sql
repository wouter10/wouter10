-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null default '🎲',
  created_at timestamptz default now() not null
);

-- Items table
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories(id) on delete cascade not null,
  title text not null,
  favorite boolean default false not null,
  created_at timestamptz default now() not null
);

-- History table
create table public.history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  item_id uuid references public.items(id) on delete set null,
  rolled_at timestamptz default now() not null
);

-- Row Level Security
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.history enable row level security;

-- Categories policies
create policy "Users see own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Items policies (via category ownership)
create policy "Users see own items"
  on public.items for select
  using (
    exists (
      select 1 from public.categories
      where id = items.category_id and user_id = auth.uid()
    )
  );

create policy "Users insert own items"
  on public.items for insert
  with check (
    exists (
      select 1 from public.categories
      where id = category_id and user_id = auth.uid()
    )
  );

create policy "Users update own items"
  on public.items for update
  using (
    exists (
      select 1 from public.categories
      where id = items.category_id and user_id = auth.uid()
    )
  );

create policy "Users delete own items"
  on public.items for delete
  using (
    exists (
      select 1 from public.categories
      where id = items.category_id and user_id = auth.uid()
    )
  );

-- History policies
create policy "Users see own history"
  on public.history for select
  using (auth.uid() = user_id);

create policy "Users insert own history"
  on public.history for insert
  with check (auth.uid() = user_id);

-- Indexes for performance
create index on public.items (category_id);
create index on public.history (user_id, rolled_at desc);

-- Seed default categories for new users (function + trigger)
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.categories (user_id, name, icon) values
    (new.id, 'Films', '🎬'),
    (new.id, 'Restaurants', '🍕'),
    (new.id, 'Games', '🎮'),
    (new.id, 'Recepten', '🍝'),
    (new.id, 'Dagje weg', '🏖️'),
    (new.id, 'Bier', '🍺'),
    (new.id, 'Bordspellen', '🎲'),
    (new.id, 'Date ideeën', '❤️');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.seed_default_categories();
