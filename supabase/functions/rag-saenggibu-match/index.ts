// RAG pipeline for 생기부 소재 매칭: embeds the student's query, retrieves the
// closest saenggibu_sources rows (scoped to their saved target university/track)
// via pgvector, then asks an LLM to draft grounded suggestions that cite those
// sources. No fine-tuning — retrieval + prompting only, so yearly admissions
// changes never go stale inside a model.
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const MATCH_COUNT = 5;

async function embed(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  });
  const json = await response.json();
  return json.data[0].embedding;
}

async function draftSuggestions(query: string, sources: { source_label: string; content: string }[]) {
  const context = sources.map((s, i) => `[${i + 1}] (${s.source_label})\n${s.content}`).join('\n\n');
  const prompt = `학생의 관심 활동/키워드: "${query}"\n\n아래는 학생이 지원하려는 대학/학과의 인재상·연구방향 자료입니다. 이 자료에 근거해서만 생기부에 기록할 만한 소재를 2~3개 제안하고, 각 제안이 어느 자료([번호])에 근거하는지 반드시 표시해주세요. 자료에 없는 내용은 추측하지 마세요.\n\n${context}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const json = await response.json();
  return json.content?.[0]?.text ?? '';
}

Deno.serve(async (req) => {
  const { student_id, query } = await req.json();
  if (!student_id || !query) {
    return new Response(JSON.stringify({ error: 'student_id, query가 필요해요.' }), { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: preference } = await supabase
    .from('target_preferences')
    .select('*')
    .eq('student_id', student_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const queryEmbedding = await embed(query);

  const { data: sources, error } = await supabase.rpc('match_saenggibu_sources', {
    query_embedding: queryEmbedding,
    match_university_id: preference?.university_id ?? null,
    match_count: MATCH_COUNT,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const suggestions = await draftSuggestions(query, sources ?? []);

  return new Response(JSON.stringify({ suggestions, sources }), {
    headers: { 'content-type': 'application/json' },
  });
});
