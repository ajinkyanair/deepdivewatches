// Minimal ambient types for the Cloudflare Pages Function, so `npm run check`
// works without pulling in @cloudflare/workers-types. Swap for that package if
// the functions grow.
interface KVNamespace {
  get(key: string, type: 'json'): Promise<unknown>;
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}
type PagesFunction<E = unknown> = (ctx: { request: Request; env: E }) => Response | Promise<Response>;
