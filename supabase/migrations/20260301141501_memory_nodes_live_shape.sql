-- =============================================================================
-- ISKRA SPACE - public.memory_nodes live shape bootstrap
-- =============================================================================
-- Migration name: memory_nodes_live_shape
--
-- Purpose:
--   Create public.memory_nodes in the live application shape so that later
--   RLS/grant migrations can be applied idempotently on a fresh database.
--   The legacy vector(384) migration was archived, but the table remains part
--   of the current app-state domain and is referenced by RLS hardening
--   migrations and legacy-data claim functions.
-- =============================================================================

create extension if not exists pgcrypto;

create table if not exists public.memory_nodes (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references public.users(id) on delete cascade,
  content jsonb default '{}'::jsonb,
  layer text,
  type text,
  title text,
  doc_type text,
  trust_level real,
  tags text[],
  section text,
  facet text,
  evidence jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.memory_nodes enable row level security;
