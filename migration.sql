-- Nur nötig, wenn du die vorherige Datenbank bereits eingerichtet hast.
alter table public.locations add column if not exists map_key text not null default 'overview';
alter table public.locations drop constraint if exists locations_x_check;
alter table public.locations drop constraint if exists locations_y_check;
alter table public.locations add constraint locations_x_check check (x between 0 and 1920);
alter table public.locations add constraint locations_y_check check (y between 0 and 1080);
