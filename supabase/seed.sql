-- Starter catalog: real universities and their well-known admission tracks.
-- This is a small, illustrative starting set, not a complete/current 모집요강 —
-- see supabase/README.md "Data currency" for the ongoing curation process.
-- `supabase db reset` runs this automatically after migrations; it's also
-- safe to run by hand against a project that already has the schema applied.

insert into universities (id, name_kr, region, type, address, admissions_url) values
  ('a0000000-0000-0000-0000-000000000001', '가톨릭대학교', '경기', '일반대', '경기도 부천시 원미구 지봉로 43', 'https://ipsi.catholic.ac.kr'),
  ('a0000000-0000-0000-0000-000000000002', '고려대학교', '서울', '일반대', '서울특별시 성북구 안암로 145', 'https://oku.korea.ac.kr'),
  ('a0000000-0000-0000-0000-000000000003', '광주과학기술원(GIST)', '광주', '과학기술원', '광주광역시 북구 첨단과기로 123', 'https://admission.gist.ac.kr'),
  ('a0000000-0000-0000-0000-000000000004', '대구경북과학기술원(DGIST)', '대구', '과학기술원', '대구광역시 달성군 현풍읍 테크노중앙대로 333', 'https://admission.dgist.ac.kr'),
  ('a0000000-0000-0000-0000-000000000005', '서울대학교', '서울', '일반대', '서울특별시 관악구 관악로 1', 'https://admission.snu.ac.kr'),
  ('a0000000-0000-0000-0000-000000000006', '연세대학교', '서울', '일반대', '서울특별시 서대문구 연세로 50', 'https://admission.yonsei.ac.kr'),
  ('a0000000-0000-0000-0000-000000000007', '울산과학기술원(UNIST)', '울산', '과학기술원', '울산광역시 울주군 언양읍 유니스트길 50', 'https://adm-u.unist.ac.kr'),
  ('a0000000-0000-0000-0000-000000000008', '한국과학기술원(KAIST)', '대전', '과학기술원', '대전광역시 유성구 대학로 291', 'https://admission.kaist.ac.kr')
on conflict (id) do nothing;

insert into admission_tracks (
  id, university_id, track_name, track_type, field, min_grade_requirement,
  requires_self_intro, requires_interview, application_period_start, application_period_end
) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000008',
   '학교생활우수자전형', '학종', '자연', null, true, true, '2026-09-08', '2026-09-11'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005',
   '지역균형전형', '학종', '인문', '국,수,영,탐(2) 중 3합7 이내', false, true, '2026-09-10', '2026-09-13'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006',
   '활동우수형', '학종', '자연', null, false, false, '2026-09-08', '2026-09-12'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   '학생부교과전형', '교과', '인문', '국,수,영,탐(1) 중 2합5 이내', false, false, '2026-09-09', '2026-09-12'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002',
   '논술전형', '논술', '자연', '국,수,영,탐(2) 중 3합6 이내', false, false, '2026-09-09', '2026-09-13'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006',
   '정시 일반전형', '정시', '인문', null, false, false, '2026-12-30', '2027-01-03'),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003',
   '학교생활우수자전형', '학종', '자연', null, true, true, '2026-09-08', '2026-09-11'),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000007',
   '일반전형', '학종', '자연', null, true, false, '2026-09-08', '2026-09-11')
on conflict (id) do nothing;

insert into admission_schedule (id, university_id, admission_track_id, event_name, event_type, event_date) values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000002', '서울대 지역균형 원서접수', '원서접수', '2026-09-10'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000008',
   'b0000000-0000-0000-0000-000000000001', 'KAIST 자기소개서 제출 마감', '서류제출', '2026-09-18'),
  ('c0000000-0000-0000-0000-000000000003', null, null, '2027학년도 수능', '원서접수', '2026-11-19')
on conflict (id) do nothing;
