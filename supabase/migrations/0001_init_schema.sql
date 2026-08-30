-- 생기부뭐쓰지? core schema
-- Structured relational data for exact-match lookups (universities, admission tracks,
-- schedule). Qualitative RAG matching lives separately in saenggibu_sources (pgvector).

create extension if not exists vector;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth.users, created after age-gate onboarding)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  birth_date date not null,
  is_transfer_applicant boolean not null default false,
  created_at timestamptz not null default now(),
  constraint profiles_min_age check (birth_date <= (current_date - interval '14 years'))
);

-- ---------------------------------------------------------------------------
-- Universities & admission tracks — normalized, not embedding-searched.
-- ---------------------------------------------------------------------------
create table universities (
  id uuid primary key default gen_random_uuid(),
  name_kr text not null,
  region text,
  type text, -- e.g. 일반대, 과학기술원, 교육대
  created_at timestamptz not null default now()
);
create index universities_name_kr_idx on universities using btree (name_kr);

create table admission_tracks (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities (id) on delete cascade,
  track_name text not null,
  track_type text not null check (track_type in ('학종', '교과', '논술', '정시')),
  field text, -- 계열 (인문/자연/예체능 등)
  min_grade_requirement text, -- e.g. "국,수,영,탐 중 3합4"
  requires_self_intro boolean not null default false,
  application_period_start date,
  application_period_end date,
  created_at timestamptz not null default now()
);
create index admission_tracks_university_id_idx on admission_tracks (university_id);
create index admission_tracks_requires_self_intro_idx on admission_tracks (requires_self_intro);

create table admission_schedule (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references universities (id) on delete cascade,
  admission_track_id uuid references admission_tracks (id) on delete cascade,
  event_name text not null,
  event_type text not null check (event_type in ('원서접수', '서류제출', '면접', '합격발표', '등록')),
  event_date date not null,
  created_at timestamptz not null default now()
);
create index admission_schedule_event_date_idx on admission_schedule (event_date);

-- ---------------------------------------------------------------------------
-- Target university/department preference (feeds the 생기부 RAG matcher)
-- ---------------------------------------------------------------------------
create table target_preferences (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  university_id uuid references universities (id) on delete set null,
  admission_track_id uuid references admission_tracks (id) on delete set null,
  department_name text,
  created_at timestamptz not null default now()
);
create index target_preferences_student_id_idx on target_preferences (student_id);

-- ---------------------------------------------------------------------------
-- Recently viewed 생기부 sources (홈 탭 reminder list)
-- ---------------------------------------------------------------------------
create table search_history (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  query text not null,
  viewed_at timestamptz not null default now()
);
create index search_history_student_id_viewed_at_idx on search_history (student_id, viewed_at desc);

-- ---------------------------------------------------------------------------
-- 생기부 RAG corpus — university/department 인재상 & 연구방향 documents.
-- Retrieved by embedding similarity, then passed to the LLM as grounded context.
-- ---------------------------------------------------------------------------
create table saenggibu_sources (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references universities (id) on delete cascade,
  admission_track_id uuid references admission_tracks (id) on delete set null,
  title text not null,
  category text not null check (category in ('인재상', '연구방향', '학과소개', '모집요강')),
  source_label text not null, -- shown to the student as the citation, e.g. "2027 서울대 학생부종합전형 안내"
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);
create index saenggibu_sources_embedding_idx on saenggibu_sources
  using hnsw (embedding vector_cosine_ops);

-- ---------------------------------------------------------------------------
-- 자소서 drafts
-- ---------------------------------------------------------------------------
create table essay_drafts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  admission_track_id uuid references admission_tracks (id) on delete set null,
  title text not null default '새 자소서',
  content text not null default '',
  updated_at timestamptz not null default now()
);
create index essay_drafts_student_id_idx on essay_drafts (student_id);

-- ---------------------------------------------------------------------------
-- Guardian consent — required before any payment for a minor student.
-- Kept separate from the student's own login/OTP identity.
-- ---------------------------------------------------------------------------
create table guardian_consents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  guardian_phone text not null,
  status text not null default 'pending' check (status in ('pending', 'verified', 'expired')),
  consent_token text not null,
  requested_at timestamptz not null default now(),
  verified_at timestamptz,
  request_ip text
);
create index guardian_consents_student_id_idx on guardian_consents (student_id);

-- ---------------------------------------------------------------------------
-- Payments — every charge for a minor must reference a verified guardian consent.
-- ---------------------------------------------------------------------------
create table payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  guardian_consent_id uuid references guardian_consents (id),
  amount_krw integer not null check (amount_krw > 0),
  pg_provider text not null,
  pg_transaction_id text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);
create index payments_student_id_idx on payments (student_id);
