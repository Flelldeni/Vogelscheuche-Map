-- Im Supabase SQL Editor ausführen. Vorher Admin-Benutzer in Authentication > Users anlegen.
create table if not exists public.admins (
 user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.locations (
 id uuid primary key default gen_random_uuid(),
 title text not null check (length(title) between 1 and 120),
 description text not null default '' check (length(description) <= 2000),
 x double precision not null check (x between 0 and 1920),
 y double precision not null check (y between 0 and 1080),
 map_key text not null default 'overview' check (map_key in ('overview','region-1','region-2','region-3','region-4','region-5','region-6','region-7')) ,
 created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
alter table public.locations enable row level security;
create policy "Admin can see own membership" on public.admins for select to authenticated using (user_id = (select auth.uid()));
create policy "Everyone can view locations" on public.locations for select to anon,authenticated using (true);
create policy "Admins can add locations" on public.locations for insert to authenticated with check (exists(select 1 from public.admins where user_id=(select auth.uid())));
create policy "Admins can edit locations" on public.locations for update to authenticated using (exists(select 1 from public.admins where user_id=(select auth.uid()))) with check (exists(select 1 from public.admins where user_id=(select auth.uid())));
create policy "Admins can delete locations" on public.locations for delete to authenticated using (exists(select 1 from public.admins where user_id=(select auth.uid())));
-- NACH dem Erstellen deines Auth-Benutzers die UUID aus Authentication > Users einsetzen
-- und diesen Befehl einmal ausführen (ohne die beiden Bindestriche):
-- insert into public.admins (user_id) values ('DEINE-BENUTZER-UUID');
