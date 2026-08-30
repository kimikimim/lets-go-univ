// Placeholder content for local development before a live Supabase project
// and curated admissions data feed are wired up. Shapes mirror src/types/database.ts.

import type { AdmissionScheduleEvent, AdmissionTrack, University } from '@/types/database';

export const mockUniversities: University[] = [
  { id: 'u1', name_kr: '가톨릭대학교', region: '경기', type: '일반대', created_at: '' },
  { id: 'u2', name_kr: '고려대학교', region: '서울', type: '일반대', created_at: '' },
  { id: 'u3', name_kr: '광주과학기술원(GIST)', region: '광주', type: '과학기술원', created_at: '' },
  { id: 'u4', name_kr: '대구경북과학기술원(DGIST)', region: '대구', type: '과학기술원', created_at: '' },
  { id: 'u5', name_kr: '서울대학교', region: '서울', type: '일반대', created_at: '' },
  { id: 'u6', name_kr: '연세대학교', region: '서울', type: '일반대', created_at: '' },
  { id: 'u7', name_kr: '울산과학기술원(UNIST)', region: '울산', type: '과학기술원', created_at: '' },
  { id: 'u8', name_kr: '한국과학기술원(KAIST)', region: '대전', type: '과학기술원', created_at: '' },
];

export const mockAdmissionTracks: AdmissionTrack[] = [
  {
    id: 't1',
    university_id: 'u8',
    track_name: '학교생활우수자전형',
    track_type: '학종',
    field: '자연',
    min_grade_requirement: null,
    requires_self_intro: true,
    requires_interview: true,
    application_period_start: '2026-09-08',
    application_period_end: '2026-09-11',
    created_at: '',
  },
  {
    id: 't2',
    university_id: 'u5',
    track_name: '지역균형전형',
    track_type: '학종',
    field: '인문',
    min_grade_requirement: '국,수,영,탐(2) 중 3합7 이내',
    requires_self_intro: false,
    requires_interview: true,
    application_period_start: '2026-09-10',
    application_period_end: '2026-09-13',
    created_at: '',
  },
  {
    id: 't3',
    university_id: 'u6',
    track_name: '활동우수형',
    track_type: '학종',
    field: '자연',
    min_grade_requirement: null,
    requires_self_intro: false,
    requires_interview: false,
    application_period_start: '2026-09-08',
    application_period_end: '2026-09-12',
    created_at: '',
  },
  {
    id: 't4',
    university_id: 'u1',
    track_name: '학생부교과전형',
    track_type: '교과',
    field: '인문',
    min_grade_requirement: '국,수,영,탐(1) 중 2합5 이내',
    requires_self_intro: false,
    requires_interview: false,
    application_period_start: '2026-09-09',
    application_period_end: '2026-09-12',
    created_at: '',
  },
  {
    id: 't5',
    university_id: 'u2',
    track_name: '논술전형',
    track_type: '논술',
    field: '자연',
    min_grade_requirement: '국,수,영,탐(2) 중 3합6 이내',
    requires_self_intro: false,
    requires_interview: false,
    application_period_start: '2026-09-09',
    application_period_end: '2026-09-13',
    created_at: '',
  },
  {
    id: 't6',
    university_id: 'u6',
    track_name: '정시 일반전형',
    track_type: '정시',
    field: '인문',
    min_grade_requirement: null,
    requires_self_intro: false,
    requires_interview: false,
    application_period_start: '2026-12-30',
    application_period_end: '2027-01-03',
    created_at: '',
  },
  {
    id: 't7',
    university_id: 'u3',
    track_name: '학교생활우수자전형',
    track_type: '학종',
    field: '자연',
    min_grade_requirement: null,
    requires_self_intro: true,
    requires_interview: true,
    application_period_start: '2026-09-08',
    application_period_end: '2026-09-11',
    created_at: '',
  },
  {
    id: 't8',
    university_id: 'u7',
    track_name: '일반전형',
    track_type: '학종',
    field: '자연',
    min_grade_requirement: null,
    requires_self_intro: true,
    requires_interview: false,
    application_period_start: '2026-09-08',
    application_period_end: '2026-09-11',
    created_at: '',
  },
];

export const mockScheduleEvents: AdmissionScheduleEvent[] = [
  { id: 's1', university_id: 'u5', admission_track_id: 't2', event_name: '서울대 지역균형 원서접수', event_type: '원서접수', event_date: '2026-09-10', created_at: '' },
  { id: 's2', university_id: 'u8', admission_track_id: 't1', event_name: 'KAIST 자기소개서 제출 마감', event_type: '서류제출', event_date: '2026-09-18', created_at: '' },
  { id: 's3', university_id: null, admission_track_id: null, event_name: '2027학년도 수능', event_type: '원서접수', event_date: '2026-11-19', created_at: '' },
];

export interface MockSaenggibuSuggestion {
  id: string;
  title: string;
  summary: string;
  sourceLabel: string;
  category: '인재상' | '연구방향' | '학과소개' | '모집요강';
}

export const mockSaenggibuSuggestions: MockSaenggibuSuggestion[] = [
  {
    id: 'sg1',
    title: '교내 학술제 소논문 활동과 연결하기',
    summary:
      '희망 학과가 강조하는 "자기주도적 탐구 역량"과 연결지어, 교내 학술제에서 진행한 소논문 활동을 구체적 탐구 과정 중심으로 기록해보는 것을 제안합니다.',
    sourceLabel: '2027 고려대학교 학생부종합전형 안내 - 인재상',
    category: '인재상',
  },
  {
    id: 'sg2',
    title: '동아리 활동을 학과 연구방향과 연결하기',
    summary:
      '해당 학과는 최근 데이터 기반 사회문제 해결 연구를 확대하고 있습니다. 교내 데이터 분석 동아리 활동 기록에 이와 관련된 구체적 사례를 보완하면 좋습니다.',
    sourceLabel: '고려대학교 통계학과 학과소개 자료',
    category: '연구방향',
  },
];

export interface MockNoticeItem {
  id: string;
  title: string;
  publishedAt: string;
  slug: string;
}

export const mockNews: MockNoticeItem[] = [
  { id: 'n1', title: '2027학년도 수시 모집요강 주요 변경사항 안내', publishedAt: '2026-08-20', slug: 'news/2027-susi-changes' },
  { id: 'n2', title: 'KAIST, 2027학년도에도 자기소개서 유지 발표', publishedAt: '2026-08-18', slug: 'news/kaist-self-intro-2027' },
];
