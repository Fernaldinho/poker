-- ============================================================
-- Poker Analyzer - Migration 001: Initial Schema
-- PostgreSQL (Supabase)
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- ENUMs ----------
do $$ begin
  create type "game_type" as enum ('CASH_GAME', 'TOURNAMENT', 'SIT_AND_GO');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "session_status" as enum ('LIVE', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "upload_type" as enum ('VIDEO', 'IMAGE', 'THUMBNAIL', 'REPORT', 'IMPORT_FILE', 'SESSION_DATA');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "upload_status" as enum ('PENDING', 'UPLOADING', 'PROCESSING', 'READY', 'FAILED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "hand_analysis_status" as enum ('PENDING', 'PROCESSING', 'ANALYZED', 'FAILED');
exception when duplicate_object then null; end $$;

-- ---------- TAGS ----------
create table if not exists "tags" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "color" text not null default '#6366F1',
  "type" text not null default 'GENERAL',
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  unique ("name")
);

-- ---------- TABLES ----------
create table if not exists "tables" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "description" text,
  "game_type" game_type not null default 'CASH_GAME',
  "stakes" text,
  "max_players" integer not null default 6 check ("max_players" > 0),
  "site" text,
  "is_active" boolean not null default true,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

-- ---------- SESSIONS ----------
create table if not exists "sessions" (
  "id" uuid primary key default gen_random_uuid(),
  "table_id" uuid references "tables"("id") on delete set null,
  "title" text not null,
  "description" text,
  "status" session_status not null default 'LIVE',
  "is_live" boolean not null default false,
  "started_at" timestamptz not null default now(),
  "ended_at" timestamptz,
  "buy_in" numeric(12, 2) default 0,
  "cash_out" numeric(12, 2) default 0,
  "profit_loss" numeric(12, 2) default 0,
  "hands_played" integer not null default 0,
  "duration_minutes" integer not null default 0,
  "stakes" text,
  "location" text,
  "notes_summary" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create index if not exists "sessions_started_at_idx" on "sessions" ("started_at" desc);
create index if not exists "sessions_status_idx" on "sessions" ("status");
create index if not exists "sessions_table_id_idx" on "sessions" ("table_id");
create index if not exists "sessions_is_live_idx" on "sessions" ("is_live");

-- ---------- HANDS ----------
create table if not exists "hands" (
  "id" uuid primary key default gen_random_uuid(),
  "session_id" uuid not null references "sessions"("id") on delete cascade,
  "hand_number" integer not null,
  "hand_id_original" text,
  "timestamp" timestamptz not null default now(),
  "players" integer not null default 0,
  "positions" jsonb not null default '[]'::jsonb,
  "cards" jsonb not null default '[]'::jsonb,
  "board" jsonb not null default '[]'::jsonb,
  "pot" numeric(12, 2) not null default 0,
  "winner" text,
  "actions" jsonb not null default '[]'::jsonb,
  "betting_sequence" jsonb not null default '[]'::jsonb,
  "analysis_status" hand_analysis_status not null default 'PENDING',
  "analysis_data" jsonb,
  "hand_history_raw" text,
  "notes" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  unique ("session_id", "hand_number")
);

create index if not exists "hands_session_id_idx" on "hands" ("session_id");
create index if not exists "hands_timestamp_idx" on "hands" ("timestamp");
create index if not exists "hands_analysis_status_idx" on "hands" ("analysis_status");

-- ---------- STATISTICS ----------
create table if not exists "statistics" (
  "id" uuid primary key default gen_random_uuid(),
  "session_id" uuid references "sessions"("id") on delete cascade,
  "hand_id" uuid references "hands"("id") on delete cascade,
  "table_id" uuid references "tables"("id") on delete cascade,
  "type" text not null default 'GENERAL',
  "data" jsonb not null default '{}'::jsonb,
  "period_start" timestamptz,
  "period_end" timestamptz,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  check (num_nonnulls("session_id", "hand_id", "table_id") >= 1)
);

create index if not exists "statistics_session_id_idx" on "statistics" ("session_id");
create index if not exists "statistics_hand_id_idx" on "statistics" ("hand_id");
create index if not exists "statistics_table_id_idx" on "statistics" ("table_id");
create index if not exists "statistics_type_idx" on "statistics" ("type");

-- ---------- UPLOADS ----------
create table if not exists "uploads" (
  "id" uuid primary key default gen_random_uuid(),
  "session_id" uuid references "sessions"("id") on delete set null,
  "hand_id" uuid references "hands"("id") on delete set null,
  "bucket" text not null,
  "path" text not null,
  "filename" text not null,
  "mime_type" text,
  "size_bytes" bigint not null default 0,
  "type" upload_type not null default 'VIDEO',
  "status" upload_status not null default 'PENDING',
  "metadata" jsonb not null default '{}'::jsonb,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  unique ("bucket", "path")
);

create index if not exists "uploads_session_id_idx" on "uploads" ("session_id");
create index if not exists "uploads_status_idx" on "uploads" ("status");
create index if not exists "uploads_bucket_idx" on "uploads" ("bucket");

-- ---------- NOTES ----------
create table if not exists "notes" (
  "id" uuid primary key default gen_random_uuid(),
  "session_id" uuid references "sessions"("id") on delete cascade,
  "hand_id" uuid references "hands"("id") on delete cascade,
  "content" text not null,
  "is_pinned" boolean not null default false,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  check (num_nonnulls("session_id", "hand_id") >= 1)
);

create index if not exists "notes_session_id_idx" on "notes" ("session_id");
create index if not exists "notes_hand_id_idx" on "notes" ("hand_id");

-- ---------- TAGS relation (m2m) ----------
create table if not exists "_tag_links" (
  "tag_id" uuid not null references "tags"("id") on delete cascade,
  "session_id" uuid references "sessions"("id") on delete cascade,
  "hand_id" uuid references "hands"("id") on delete cascade,
  "table_id" uuid references "tables"("id") on delete cascade,
  "created_at" timestamptz not null default now(),
  primary key ("tag_id", "session_id", "hand_id", "table_id"),
  check (num_nonnulls("session_id", "hand_id", "table_id") >= 1)
);

create index if not exists "_tag_links_session_idx" on "_tag_links" ("session_id");
create index if not exists "_tag_links_hand_idx" on "_tag_links" ("hand_id");
create index if not exists "_tag_links_table_idx" on "_tag_links" ("table_id");

-- ---------- SETTINGS ----------
create table if not exists "settings" (
  "id" uuid primary key default gen_random_uuid(),
  "key" text not null unique,
  "value" jsonb not null default '{}'::jsonb,
  "description" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

-- ---------- updated_at trigger ----------
create or replace function "set_updated_at"()
returns trigger as $$
begin
  new."updated_at" = now();
  return new;
end;
$$ language plpgsql;

do $$ declare t text;
begin
  foreach t in array array['tags','tables','sessions','hands','statistics','uploads','notes','settings'] loop
    execute format('drop trigger if exists "trg_%s_updated_at" on "%s"', t, t);
    execute format('create trigger "trg_%s_updated_at" before update on "%s" for each row execute function "set_updated_at"()', t, t);
  end loop;
end $$;

-- ---------- Row Level Security ----------
alter table "tags" enable row level security;
alter table "tables" enable row level security;
alter table "sessions" enable row level security;
alter table "hands" enable row level security;
alter table "statistics" enable row level security;
alter table "uploads" enable row level security;
alter table "notes" enable row level security;
alter table "_tag_links" enable row level security;
alter table "settings" enable row level security;

-- Single-user app: permissive policies for anon (no auth layer)
do $$ declare t text;
begin
  foreach t in array array['tags','tables','sessions','hands','statistics','uploads','notes','_tag_links','settings'] loop
    execute format('create policy "p_%s_all" on "%s" for all to anon, authenticated using (true) with check (true)', t, t);
  end loop;
end $$;

-- ---------- Realtime ----------
alter publication supabase_realtime add table "sessions";
alter publication supabase_realtime add table "hands";
alter publication supabase_realtime add table "statistics";
alter publication supabase_realtime add table "uploads";
alter publication supabase_realtime add table "tables";
alter publication supabase_realtime add table "notes";
alter publication supabase_realtime add table "tags";
alter publication supabase_realtime add table "settings";

-- ---------- Seed ----------
insert into "settings" ("key", "value", "description") values
  ('app.name', '{"value":"Poker Analyzer"}'::jsonb, 'Nome do aplicativo'),
  ('app.theme', '{"value":"dark"}'::jsonb, 'Tema padrão'),
  ('replayer.speed', '{"value":1.0}'::jsonb, 'Velocidade padrão do replayer'),
  ('replayer.auto_advance', '{"value":true}'::jsonb, 'Avanço automático entre mãos'),
  ('upload.max_size_mb', '{"value":2048}'::jsonb, 'Tamanho máximo de upload em MB'),
  ('import.auto_analyze', '{"value":true}'::jsonb, 'Analisar automaticamente após importação'),
  ('dashboard.default_period', '{"value":"30d"}'::jsonb, 'Período padrão do dashboard')
on conflict ("key") do nothing;

insert into "tags" ("name", "color", "type") values
  ('Estudo', '#6366F1', 'GENERAL'),
  ('Revisar', '#F59E0B', 'GENERAL'),
  ('Tilt', '#EF4444', 'GENERAL'),
  ('Bluff', '#10B981', 'HAND'),
  ('Value', '#3B82F6', 'HAND'),
  ('Mistake', '#EF4444', 'HAND')
on conflict ("name") do nothing;
