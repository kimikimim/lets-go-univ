export interface Env {
  SUPABASE_URL: string;
  RATE_LIMIT: KVNamespace;
}

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 60;

async function isRateLimited(env: Env, clientId: string): Promise<boolean> {
  const key = `rl:${clientId}`;
  const current = Number((await env.RATE_LIMIT.get(key)) ?? '0');
  if (current >= RATE_LIMIT_MAX_REQUESTS) return true;
  await env.RATE_LIMIT.put(key, String(current + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  return false;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const clientId = request.headers.get('cf-connecting-ip') ?? 'unknown';

    if (await isRateLimited(env, clientId)) {
      return new Response(JSON.stringify({ error: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.' }), {
        status: 429,
        headers: { 'content-type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const upstream = new URL(url.pathname + url.search, env.SUPABASE_URL);

    const upstreamRequest = new Request(upstream.toString(), request);
    return fetch(upstreamRequest);
  },
};
