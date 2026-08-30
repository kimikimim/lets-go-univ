-- universities/admission_tracks/admission_schedule are published, public
-- information (the same data a university's own 모집요강 page shows) — they
-- don't need a login to browse, unlike saenggibu_sources (the AI-suggestion
-- corpus) which stays authenticated-only. Without this, anonymous browsing
-- (the common case before a student signs up) sees an empty catalog.
drop policy "universities_select_all" on universities;
create policy "universities_select_all" on universities for select
  using (true);

drop policy "admission_tracks_select_all" on admission_tracks;
create policy "admission_tracks_select_all" on admission_tracks for select
  using (true);

drop policy "admission_schedule_select_all" on admission_schedule;
create policy "admission_schedule_select_all" on admission_schedule for select
  using (true);
