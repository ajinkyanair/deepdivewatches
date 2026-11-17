/**
 * Cloudflare Pages Function: anonymous "how deep do readers get" histogram.
 * Bind a KV namespace called DIVES in the Pages project settings to enable it.
 * Stores only depth buckets. No IPs, no IDs.
 */
interface Env { DIVES?: KVNamespace }
type Hist = { buckets: Record<string, number>; total: number };

const ALLOWED = new Set<number>([
  ...Array.from({ length: 20 }, (_, i) => i * 50),
  ...Array.from({ length: 21 }, (_, i) => 1000 + i * 500),
  10935,
]);

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DIVES) return new Response('not configured', { status: 404 });
  const h = ((await env.DIVES.get('hist', 'json')) as Hist | null) || { buckets: {}, total: 0 };
  return Response.json(h, { headers: { 'cache-control': 'public, max-age=300' } });
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  if (!env.DIVES) return new Response(null, { status: 204 });
  try {
    const { bucket } = (await request.json()) as { bucket: number };
    if (!ALLOWED.has(bucket)) return new Response(null, { status: 204 });
    const h = ((await env.DIVES.get('hist', 'json')) as Hist | null) || { buckets: {}, total: 0 };
    h.buckets[bucket] = (h.buckets[bucket] || 0) + 1;
    h.total += 1;
    await env.DIVES.put('hist', JSON.stringify(h));
  } catch {
    /* ignore bad input */
  }
  return new Response(null, { status: 204 });
};
