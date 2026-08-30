-- pgvector similarity search for the RAG matcher, scoped to a target university
-- when the student has one saved. Only saenggibu_sources is embedding-searched —
-- universities/admission_tracks/admission_schedule stay exact-match relational
-- lookups (see the 모집요강 tab's own search bar).
create or replace function match_saenggibu_sources(
  query_embedding vector(1536),
  match_university_id uuid default null,
  match_count int default 5
)
returns table (
  id uuid,
  title text,
  category text,
  source_label text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    id,
    title,
    category,
    source_label,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from saenggibu_sources
  where match_university_id is null or university_id = match_university_id
  order by embedding <=> query_embedding
  limit match_count;
$$;
