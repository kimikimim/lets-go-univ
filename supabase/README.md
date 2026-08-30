# Supabase backend

## Live project

- Project ref: `kjskbulfngzxqcouuyev` (org `kimikimim's Org`, region `ap-northeast-2`)
- URL / publishable key: `app/.env` (not committed — see `app/.env.example`)
- Auth providers (Kakao OAuth, phone/email OTP) are **not yet configured** in
  the dashboard — the app's login screen won't complete real sign-in until
  those are turned on under Authentication → Providers.

## Migrations

Apply in order against a project with the `vector` extension available:

```bash
supabase link --project-ref kjskbulfngzxqcouuyev
supabase db push
```

`0001_init_schema.sql` — core tables. `0002_rls_policies.sql` — locks every
student-owned table to `auth.uid()`; catalog tables (`universities`,
`admission_tracks`, `admission_schedule`, `saenggibu_sources`) started
authenticated-read, service-role-write only. `0003_match_saenggibu_sources.sql`
— the pgvector similarity RPC the RAG edge function calls. `0004_security_advisor_fixes.sql`
and `0005_perf_and_rls_optimizations.sql` — fixes from Supabase's own
security/performance advisors (pinned function `search_path`, `vector`
extension moved out of `public`, RLS policies using `(select auth.uid())` to
avoid per-row re-evaluation, covering indexes on foreign keys).
`0006_public_catalog_read.sql` — opened `universities`/`admission_tracks`/
`admission_schedule` to anonymous reads: this is published admissions info,
and students browse 모집요강 before they ever sign up. `saenggibu_sources`
stays authenticated-only.

Then load the starter catalog (safe to re-run, `on conflict do nothing`):

```bash
supabase db execute -f seed.sql
```

`seed.sql` has 8 real universities, 8 of their actual admission tracks, and
3 schedule events — see "Data currency" below for what this isn't (a
complete or current 모집요강).

## Curating `saenggibu_sources`

This table is the RAG corpus (인재상 / 연구방향 / 학과소개 / 모집요강 text per
university). It is populated out-of-band — do not scrape; use officially
published 모집요강/학과 안내 text — and each row needs an embedding:

```ts
const { data } = await openai.embeddings.create({ model: 'text-embedding-3-small', input: content });
await supabase.from('saenggibu_sources').insert({ ...row, embedding: data[0].embedding });
```

## Edge functions

- `send-guardian-consent` — creates a `guardian_consents` row and sends the
  SMS consent link. Needs `SMS_GATEWAY_URL`, `SMS_GATEWAY_API_KEY`,
  `SMS_SENDER_NUMBER` (a sender number pre-registered with the SMS gateway per
  Korean anti-spam law) set as function secrets. Without those set it still
  logs the consent request but skips sending SMS — fine for local dev, not for
  production.
- `rag-saenggibu-match` — embeds the student's query, calls
  `match_saenggibu_sources`, and asks an LLM (Claude via `ANTHROPIC_API_KEY`)
  to draft suggestions grounded only in the retrieved rows.

Deploy with:

```bash
supabase functions deploy send-guardian-consent
supabase functions deploy rag-saenggibu-match
supabase secrets set SMS_GATEWAY_URL=... SMS_GATEWAY_API_KEY=... SMS_SENDER_NUMBER=... ANTHROPIC_API_KEY=... OPENAI_API_KEY=...
```

## Data currency

`seed.sql`'s 8 universities and 8 tracks are real but small and static —
enough to make the 모집요강 tab's filters and search meaningful, not a
complete or current catalog. There's no sync job yet: adding/updating
universities means editing `seed.sql` (or inserting directly) by hand from
adiga.kr, and there's no staleness alarm if that lapses. Do not scrape.

## Still to build

- `verify-guardian-consent` — the endpoint the SMS link opens, which is the
  only place allowed to flip `guardian_consents.status` to `verified`.
- A PG (Toss Payments / PortOne) webhook handler that writes `payments` rows
  and checks for a `verified` guardian consent before allowing a charge from
  a student under 19.
- An actual sync/update cadence for the admissions catalog (see "Data
  currency" above) — manual edits work for now but won't scale past a
  handful of schools.
