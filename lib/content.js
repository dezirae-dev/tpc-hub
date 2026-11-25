import { get, set } from './store';
// Social content drafts. status: pending, changes, approved, rejected, scheduled, published
export const listPosts = () => get('content:posts', []);
export const savePosts = v => set('content:posts', v);
export async function upsertPosts(items) {
  const all = await listPosts();
  for (const it of items) {
    if (!it.id) continue;
    const i = all.findIndex(x => x.id === it.id);
    if (i >= 0) all[i] = { ...all[i], ...it }; else all.push({ status: 'pending', createdAt: Date.now(), rev: 1, ...it });
  }
  await savePosts(all);
  return all;
}
