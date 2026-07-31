-- ============================================================
-- Poker Analyzer - Migration 005: Session Tables (multi-mesa)
-- Infraestrutura para organizar múltiplas mesas por sessão
-- ============================================================

-- ---------- Enum: status da mesa ----------
do $$ begin
  create type "TableStatus" as enum ('EMPTY', 'PENDING', 'PROCESSING', 'READY', 'FAILED');
exception when duplicate_object then null; end $$;

-- ---------- SESSION_TABLES ----------
create table if not exists "session_tables" (
  "id" uuid primary key default gen_random_uuid(),
  "session_id" uuid not null references "sessions"("id") on delete cascade,
  "name" text not null default 'Mesa 1',
  "position" integer not null default 0,
  "status" "TableStatus" not null default 'EMPTY',
  "video_count" integer not null default 0,
  "metadata" jsonb not null default '{}'::jsonb,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  unique ("session_id", "position")
);

create index if not exists "session_tables_session_id_idx" on "session_tables" ("session_id");

-- ---------- UPLOADS: vínculo com a mesa ----------
alter table "uploads" add column if not exists "session_table_id" uuid references "session_tables"("id") on delete set null;

create index if not exists "uploads_session_table_id_idx" on "uploads" ("session_table_id");

-- ---------- Trigger updated_at ----------
do $$ begin
  execute format('drop trigger if exists "trg_%s_updated_at" on "session_tables"', 'session_tables');
  execute format('create trigger "trg_%s_updated_at" before update on "session_tables" for each row execute function "set_updated_at"()', 'session_tables');
end $$;

-- ---------- RLS ----------
alter table "session_tables" enable row level security;
create policy "p_session_tables_all" on "session_tables" for all to anon, authenticated using (true) with check (true);

-- ---------- Realtime ----------
alter publication supabase_realtime add table "session_tables";
