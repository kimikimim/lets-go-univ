// universities/admission_tracks/admission_schedule now live in the real
// Supabase catalog (see supabase/seed.sql) — fetched via use-universities,
// use-admission-tracks, use-admission-schedule. What's left here is content
// that still needs real infra before it can leave mock data:
//   - saenggibu suggestions: needs the RAG pipeline (embeddings + LLM) wired up
//   - news: needs the RSS/headline aggregation feed, not a DB table at all

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
