// Tiny key-value store. Uses Upstash Redis (Vercel Storage) when configured, otherwise memory (resets on restart).
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOK = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const mem = globalThis.__tpcmem || (globalThis.__tpcmem = new Map());
export const persistent = !!(URL_ && TOK);

async function cmd(args) {
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json' }, body: JSON.stringify(args), cache: 'no-store' });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
export async function get(key, fallback = null) {
  try {
    const v = persistent ? await cmd(['GET', key]) : mem.get(key);
    return v == null ? fallback : (typeof v === 'string' ? JSON.parse(v) : v);
  } catch { return fallback; }
}
export async function set(key, val) {
  const s = JSON.stringify(val);
  if (persistent) await cmd(['SET', key, s]); else mem.set(key, s);
  return val;
}
export async function cached(key, ttlSec, fn) {
  const hit = await get('cache:' + key);
  if (hit && Date.now() - hit.at < ttlSec * 1000) return hit.v;
  const v = await fn();
  await set('cache:' + key, { at: Date.now(), v });
  return v;
}
