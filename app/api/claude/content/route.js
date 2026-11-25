import { NextResponse } from 'next/server';
import { listPosts, upsertPosts } from '../../../../lib/content';
import { slack } from '../../../../lib/approvals';
export const dynamic = 'force-dynamic';
// Token API for Claude and scheduled tasks.
// GET [?status=approved] lists posts. POST upserts one or many by id (the drafter creates; the scheduler marks status "scheduled" or "published" with metricoolId).
// POST ?notify=1 sends one Slack line to Dezirae that drafts are waiting.
export async function GET(req) {
  const s = new URL(req.url).searchParams.get('status'), all = await listPosts();
  return NextResponse.json(s ? all.filter(p => p.status === s) : all);
}
export async function POST(req) {
  const body = await req.json(), items = Array.isArray(body) ? body : [body];
  const all = await upsertPosts(items);
  if (new URL(req.url).searchParams.get('notify') === '1') {
    const n = all.filter(p => p.status === 'pending').length;
    await slack(`${n} social post draft${n === 1 ? '' : 's'} waiting for review. ${process.env.HUB_URL || ''}/content`);
  }
  return NextResponse.json({ ok: true, count: all.length });
}
