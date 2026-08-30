// Hand-written mirror of supabase/migrations/0001_init_schema.sql.
// Once a live Supabase project exists, regenerate with:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts
//
// NOTE: these must be `type` aliases, not `interface` declarations — Supabase's
// generic client checks each Row/Insert/Update against Record<string, unknown>,
// and TypeScript only lets that succeed for type aliases, not interfaces.

export type TrackType = '학종' | '교과' | '논술' | '정시';
export type ScheduleEventType = '원서접수' | '서류제출' | '면접' | '합격발표' | '등록';
export type SourceCategory = '인재상' | '연구방향' | '학과소개' | '모집요강';
export type ConsentStatus = 'pending' | 'verified' | 'expired';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type Profile = {
  id: string;
  display_name: string | null;
  birth_date: string;
  is_transfer_applicant: boolean;
  created_at: string;
};

export type University = {
  id: string;
  name_kr: string;
  region: string | null;
  type: string | null;
  created_at: string;
};

export type AdmissionTrack = {
  id: string;
  university_id: string;
  track_name: string;
  track_type: TrackType;
  field: string | null;
  min_grade_requirement: string | null;
  requires_self_intro: boolean;
  requires_interview: boolean;
  application_period_start: string | null;
  application_period_end: string | null;
  created_at: string;
};

export type AdmissionScheduleEvent = {
  id: string;
  university_id: string | null;
  admission_track_id: string | null;
  event_name: string;
  event_type: ScheduleEventType;
  event_date: string;
  created_at: string;
};

export type TargetPreference = {
  id: string;
  student_id: string;
  university_id: string | null;
  admission_track_id: string | null;
  department_name: string | null;
  created_at: string;
};

export type SearchHistoryEntry = {
  id: string;
  student_id: string;
  query: string;
  viewed_at: string;
};

export type SaenggibuSource = {
  id: string;
  university_id: string | null;
  admission_track_id: string | null;
  title: string;
  category: SourceCategory;
  source_label: string;
  content: string;
  created_at: string;
};

export type EssayDraft = {
  id: string;
  student_id: string;
  admission_track_id: string | null;
  title: string;
  content: string;
  updated_at: string;
};

export type GuardianConsent = {
  id: string;
  student_id: string;
  guardian_phone: string;
  status: ConsentStatus;
  consent_token: string;
  requested_at: string;
  verified_at: string | null;
  request_ip: string | null;
};

export type Payment = {
  id: string;
  student_id: string;
  guardian_consent_id: string | null;
  amount_krw: number;
  pg_provider: string;
  pg_transaction_id: string | null;
  status: PaymentStatus;
  created_at: string;
};

type Table<Row, RequiredInsertKeys extends keyof Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, RequiredInsertKeys>;
  Update: Partial<Row>;
  Relationships: never[];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, 'id' | 'birth_date'>;
      universities: Table<University, 'name_kr'>;
      admission_tracks: Table<AdmissionTrack, 'university_id' | 'track_name' | 'track_type'>;
      admission_schedule: Table<AdmissionScheduleEvent, 'event_name' | 'event_type' | 'event_date'>;
      target_preferences: Table<TargetPreference, 'student_id'>;
      search_history: Table<SearchHistoryEntry, 'student_id' | 'query'>;
      saenggibu_sources: Table<SaenggibuSource, 'title' | 'category' | 'source_label' | 'content'>;
      essay_drafts: Table<EssayDraft, 'student_id'>;
      guardian_consents: Table<GuardianConsent, 'student_id' | 'guardian_phone' | 'consent_token'>;
      payments: Table<Payment, 'student_id' | 'amount_krw' | 'pg_provider'>;
    };
    Views: Record<string, never>;
    Functions: {
      match_saenggibu_sources: {
        Args: { query_embedding: number[]; match_university_id?: string | null; match_count?: number };
        Returns: (Pick<SaenggibuSource, 'id' | 'title' | 'category' | 'source_label' | 'content'> & {
          similarity: number;
        })[];
      };
    };
  };
};
