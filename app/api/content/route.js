import { NextResponse } from 'next/server';
import { who } from '../../../lib/user';
import { logActivity } from '../../../lib/activity';
import { listPosts, savePosts } from '../../../lib/content';
export const dynamic = 'force-dynamic';

export async function GET() { return NextResponse.json({ posts: await listPosts() }); }
export async function POST(req) {
  const b = await req.json(), me = (await who()) || b.by || 'Someone';
  const all = await listPosts(), p = all.find(x => x.id === b.id);
  if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (b.action === 'decide') {
    if (!['approved', 'changes', 'rejected'].includes(b.decision)) return NextResponse.json({ error: 'bad decision' }, { status: 400 });
    if (b.caption && b.caption.trim() !== p.caption) { p.originalCaption = p.originalCaption || p.caption; p.caption = b.caption.trim(); p.edited = true; }
    if (b.slot) p.slot = b.slot;
    p.status = b.decision; p.decision = { note: b.note || '', by: me, at: Date.now(), rev: p.rev || 1 };
    await savePosts(all);
    await logActivity(me, `${{ approved: 'approved', changes: 'requested changes on', rejected: 'rejected' }[b.decision]} the post "${p.title}"`);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'bad action' }, { status: 400 });
}
