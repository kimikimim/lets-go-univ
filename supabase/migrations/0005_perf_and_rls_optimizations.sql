-- Wrap auth.<fn>() calls in a scalar subselect so Postgres evaluates them
-- once per query instead of once per row (Supabase RLS perf advisory).
drop policy "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles for select
  using ((select auth.uid()) = id);
drop policy "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles for insert
  with check ((select auth.uid()) = id);
drop policy "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy "target_preferences_all_own" on target_preferences;
create policy "target_preferences_all_own" on target_preferences for all
  using ((select auth.uid()) = student_id) with check ((select auth.uid()) = student_id);

drop policy "search_history_select_own" on search_history;
create policy "search_history_select_own" on search_history for select
  using ((select auth.uid()) = student_id);
drop policy "search_history_insert_own" on search_history;
create policy "search_history_insert_own" on search_history for insert
  with check ((select auth.uid()) = student_id);

drop policy "essay_drafts_all_own" on essay_drafts;
create policy "essay_drafts_all_own" on essay_drafts for all
  using ((select auth.uid()) = student_id) with check ((select auth.uid()) = student_id);

drop policy "guardian_consents_select_own" on guardian_consents;
create policy "guardian_consents_select_own" on guardian_consents for select
  using ((select auth.uid()) = student_id);
drop policy "guardian_consents_insert_own" on guardian_consents;
create policy "guardian_consents_insert_own" on guardian_consents for insert
  with check ((select auth.uid()) = student_id);

drop policy "payments_select_own" on payments;
create policy "payments_select_own" on payments for select
  using ((select auth.uid()) = student_id);

drop policy "universities_select_all" on universities;
create policy "universities_select_all" on universities for select
  using ((select auth.role()) = 'authenticated');
drop policy "admission_tracks_select_all" on admission_tracks;
create policy "admission_tracks_select_all" on admission_tracks for select
  using ((select auth.role()) = 'authenticated');
drop policy "admission_schedule_select_all" on admission_schedule;
create policy "admission_schedule_select_all" on admission_schedule for select
  using ((select auth.role()) = 'authenticated');
drop policy "saenggibu_sources_select_all" on saenggibu_sources;
create policy "saenggibu_sources_select_all" on saenggibu_sources for select
  using ((select auth.role()) = 'authenticated');

-- Covering indexes for foreign keys used in joins (advisor: unindexed_foreign_keys).
create index admission_schedule_university_id_idx on admission_schedule (university_id);
create index admission_schedule_admission_track_id_idx on admission_schedule (admission_track_id);
create index essay_drafts_admission_track_id_idx on essay_drafts (admission_track_id);
create index payments_guardian_consent_id_idx on payments (guardian_consent_id);
create index saenggibu_sources_university_id_idx on saenggibu_sources (university_id);
create index saenggibu_sources_admission_track_id_idx on saenggibu_sources (admission_track_id);
create index target_preferences_university_id_idx on target_preferences (university_id);
create index target_preferences_admission_track_id_idx on target_preferences (admission_track_id);
