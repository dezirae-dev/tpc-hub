import { get, set } from './store';
export async function logActivity(who, text) {
  try { const a = await get('activity', []); a.unshift({ at: Date.now(), who: who || 'Someone', text }); await set('activity', a.slice(0, 100)); } catch {}
}
export const getActivity = (n = 12) => get('activity', []).then(a => a.slice(0, n));
