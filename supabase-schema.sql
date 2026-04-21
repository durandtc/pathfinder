-- ============================================================
-- PickMyPath — Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor once.
-- Supabase Dashboard → SQL Editor → New Query → paste → Run
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── USERS ──────────────────────────────────────────────────
create table if not exists users (
  id              uuid primary key default uuid_generate_v4(),
  full_name       text not null,
  email           text not null unique,
  password_hash   text,                    -- null for Google/OAuth users
  auth_provider   text default 'email',    -- 'email' | 'google'
  google_uid      text unique,
  grade           text,
  school          text,
  created_at      timestamptz default now(),
  last_login      timestamptz
);

-- ── PAYMENTS ───────────────────────────────────────────────
create table if not exists payments (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid references users(id) on delete cascade,
  payfast_payment_id   text unique,
  amount_zar           numeric(10,2) not null,
  status               text default 'pending',  -- pending | completed | failed
  paid_at              timestamptz,
  created_at           timestamptz default now()
);

-- ── ASSESSMENTS ────────────────────────────────────────────
create table if not exists assessments (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references users(id) on delete cascade,
  payment_id      uuid references payments(id),
  status          text default 'not_started',  -- not_started | in_progress | completed
  started_at      timestamptz,
  completed_at    timestamptz,
  duration_secs   int
);

-- ── ANSWERS ────────────────────────────────────────────────
create table if not exists answers (
  id              uuid primary key default uuid_generate_v4(),
  assessment_id   uuid references assessments(id) on delete cascade,
  question_index  int not null,
  section         text not null,   -- 'interests' | 'values' | 'aptitude'
  answer_value    int not null,    -- 1-5 for scale, 0-3 for choice
  answered_at     timestamptz default now()
);

-- ── REPORTS ────────────────────────────────────────────────
create table if not exists reports (
  id               uuid primary key default uuid_generate_v4(),
  assessment_id    uuid references assessments(id) on delete cascade,
  user_id          uuid references users(id) on delete cascade,
  top_careers      jsonb,          -- array of career objects from AI
  riasec_scores    jsonb,          -- R/I/A/S/E/C scores
  ai_raw_response  text,           -- full Claude response for debugging
  pdf_storage_path text,           -- path in Supabase Storage
  email_sent       boolean default false,
  email_sent_at    timestamptz,
  generated_at     timestamptz default now()
);

-- ── SYSTEM CONFIG ──────────────────────────────────────────
-- Stores all API keys and settings (editable from admin panel)
create table if not exists system_config (
  id               uuid primary key default uuid_generate_v4(),
  key_name         text not null unique,
  encrypted_value  text,           -- AES-encrypted
  plain_value      text,           -- for non-sensitive settings
  description      text,
  last_updated_by  text,
  updated_at       timestamptz default now()
);

-- ── AUDIT LOG ──────────────────────────────────────────────
create table if not exists audit_log (
  id          uuid primary key default uuid_generate_v4(),
  action      text not null,
  details     text,
  performed_by text,
  created_at  timestamptz default now()
);

-- ── SEED DEFAULT CONFIG ROWS ───────────────────────────────
-- These are placeholders — update via admin panel or .env.local
insert into system_config (key_name, plain_value, description) values
  ('assessment_price_zar',  '399',   'Assessment price excl. VAT'),
  ('vat_rate_pct',          '15',    'VAT rate percentage'),
  ('school_discount_pct',   '20',    'Bulk school discount %'),
  ('payfast_sandbox',       'true',  'PayFast sandbox mode'),
  ('registrations_open',    'true',  'Allow new registrations'),
  ('ai_model',              'claude-opus-4-5-20251001', 'Anthropic model to use')
on conflict (key_name) do nothing;

-- ── ROW LEVEL SECURITY (basic) ─────────────────────────────
alter table users          enable row level security;
alter table payments       enable row level security;
alter table assessments    enable row level security;
alter table answers        enable row level security;
alter table reports        enable row level security;
alter table system_config  enable row level security;
alter table audit_log      enable row level security;

-- Allow service role full access (used by API routes)
create policy "Service role full access - users"         on users         for all using (true);
create policy "Service role full access - payments"      on payments      for all using (true);
create policy "Service role full access - assessments"   on assessments   for all using (true);
create policy "Service role full access - answers"       on answers       for all using (true);
create policy "Service role full access - reports"       on reports       for all using (true);
create policy "Service role full access - system_config" on system_config for all using (true);
create policy "Service role full access - audit_log"     on audit_log     for all using (true);
