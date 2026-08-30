# 생기부뭐쓰지?

Mobile app helping Korean high school students and 편입 applicants explore
생기부 content, match it against university admissions requirements, and
draft self-introduction essays where still required.

## Layout

```
app/         Expo (React Native) app — native screens + embedded WebViews
supabase/    Postgres schema, RLS policies, RAG match RPC, edge functions
cloudflare/
  worker/    API gateway in front of Supabase (rate limiting, proxy)
  pages/     Static site for WebView screens (notices, terms, news)
```

## Getting started

```bash
cd app
cp .env.example .env   # fill in EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run ios             # or npm run android / npm run web
```

The Supabase project needs the Kakao, phone (SMS), and email OTP providers
enabled in Auth settings — this app has no password field anywhere. See
[supabase/README.md](supabase/README.md) for migrations, RAG corpus curation,
and edge function deployment.

For local WebView content:

```bash
cd cloudflare/pages
npx wrangler pages dev . --port 8788
```

## Architecture notes

- **Structured vs. RAG search**: `universities` / `admission_tracks` /
  `admission_schedule` are normalized relational tables — the 모집요강 tab's
  search (university name, 수능최저학력기준, 전형 이름) is exact-match SQL,
  never embedding search. `saenggibu_sources` is the only pgvector-embedded
  table, used solely for qualitative 인재상/연구방향 matching in the 생기부 tab.
- **No fine-tuning**: the 생기부 matcher and 자소서 첨삭 both call an LLM
  (Claude) with retrieved context at request time. Admissions requirements
  change yearly; a fine-tuned model would go stale silently.
- **자소서 framing**: the AI 첨삭 feature is feedback/correction on what the
  student already wrote, never generation. Standard 4-year universities
  dropped 자소서 for the 2026 cycle over 대필 concerns — KAIST/GIST/DGIST/UNIST
  and 편입 tracks are this tab's real remaining audience, and the essay screen
  shows a contextual note when the student hasn't selected a track that
  requires one.

## Compliance (designed in, not bolted on)

- Age gate at 만 14세 (`profiles.birth_date` check constraint,
  [onboarding/age-gate.tsx](app/src/app/onboarding/age-gate.tsx)).
- Guardian consent for payment is a distinct flow from student login —
  separate table (`guardian_consents`), separate phone number, logs
  timestamp + IP. See [guardian/consent.tsx](app/src/app/guardian/consent.tsx)
  and `supabase/functions/send-guardian-consent`.
- RLS on every student-owned table — verified query-as-another-user should
  return zero rows; re-check this after any schema change.
- PG integration should use a provider (Toss Payments / PortOne) with
  documented minor-consent API support rather than custom compliance logic —
  not yet wired up.

## Non-goals for this MVP

No password auth. No fine-tuned LLM. No live ad serving in the reserved home
slot. No AI essay generation framed as ghostwriting.
