-- Fix: _tag_links - PK própria + unique composto
alter table "_tag_links" drop constraint "_tag_links_pkey";
alter table "_tag_links" add column "id" uuid not null default gen_random_uuid();
alter table "_tag_links" add constraint "_tag_links_pkey" primary key ("id");
alter table "_tag_links" add constraint "_tag_links_unique_target" unique ("tag_id", "session_id", "hand_id", "table_id");
