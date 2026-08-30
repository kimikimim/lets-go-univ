-- Row Level Security: every table that holds a single student's data is locked
-- to that student's own auth.uid(). Reference/catalog tables are public-read.

alter table profiles enable row level security;
alter table target_preferences enable row level security;
alter table search_history enable row level security;
alter table essay_drafts enable row level security;
alter table guardian_consents enable row level security;
alter table payments enable row level security;

alter table universities enable row level security;
alter table admission_tracks enable row level security;
alter table admission_schedule enable row level security;
alter table saenggibu_sources enable row level security;

-- profiles: a student can only read/update their own profile row.
create policy "profiles_select_own" on profiles for select
  using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert
  with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- target_preferences: student-owned.
create policy "target_preferences_all_own" on target_preferences for all
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- search_history: student-owned, append + read only (no update/delete needed).
create policy "search_history_select_own" on search_history for select
  using (auth.uid() = student_id);
create policy "search_history_insert_own" on search_history for insert
  with check (auth.uid() = student_id);

-- essay_drafts: student-owned.
create policy "essay_drafts_all_own" on essay_drafts for all
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- guardian_consents: student can create/read their own consent requests.
-- Only server-side (service role, via the send-guardian-consent edge function)
-- may transition status to 'verified' — no client update policy is granted.
create policy "guardian_consents_select_own" on guardian_consents for select
  using (auth.uid() = student_id);
create policy "guardian_consents_insert_own" on guardian_consents for insert
  with check (auth.uid() = student_id);

-- payments: student can read their own payment history; writes happen only
-- through the server-side PG webhook (service role), never directly from the app.
create policy "payments_select_own" on payments for select
  using (auth.uid() = student_id);

-- Reference/catalog data: readable by any authenticated user, writable only
-- by the service role (curation happens out-of-band, see supabase/README.md).
create policy "universities_select_all" on universities for select
  using (auth.role() = 'authenticated');
create policy "admission_tracks_select_all" on admission_tracks for select
  using (auth.role() = 'authenticated');
create policy "admission_schedule_select_all" on admission_schedule for select
  using (auth.role() = 'authenticated');
create policy "saenggibu_sources_select_all" on saenggibu_sources for select
  using (auth.role() = 'authenticated');
