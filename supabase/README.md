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
`admission_tracks`, `admission_schedule`, `saenggibu_sources`) are
authenticated-read, service-role-write only. `0003_match_saenggibu_sources.sql`
— the pgvector similarity RPC the RAG edge function calls. `0004_security_advisor_fixes.sql`
and `0005_perf_and_rls_optimizations.sql` — fixes from Supabase's own
security/performance advisors (pinned function `search_path`, `vector`
extension moved out of `public`, RLS policies using `(select auth.uid())` to
avoid per-row re-evaluation, covering indexes on foreign keys).

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

## Still to build

- `verify-guardian-consent` — the endpoint the SMS link opens, which is the
  only place allowed to flip `guardian_consents.status` to `verified`.
- A PG (Toss Payments / PortOne) webhook handler that writes `payments` rows
  and checks for a `verified` guardian consent before allowing a charge from
  a student under 19.
- The admission_schedule / universities / admission_tracks sync process —
  MVP stage is manual curation from adiga.kr, but define an update cadence so
  it doesn't silently go stale.
