import { NextResponse } from 'next/server';
import { listPackages, savePackages, slack } from '../../../../lib/approvals';
export const dynamic = 'force-dynamic';
// Token API for Claude and scheduled tasks. GET lists packages. POST upserts one or many; add ?notify=1 to ping Jordana in #marketing-updates.
export async function GET() { return NextResponse.json(await listPackages()); }
export async function POST(req) {
  const body = await req.json(), items = Array.isArray(body) ? body : [body];
  const all = await listPackages();
  for (const it of items) {
    if (!it.id) continue;
    const i = all.findIndex(x => x.id === it.id);
    if (i >= 0) all[i] = { ...all[i], ...it }; else all.push(it);
  }
  await savePackages(all);
  if (new URL(req.url).searchParams.get('notify') === '1') {
    const j = process.env.SLACK_JORDANA_ID || 'U6LSS08KZ', it = items[0], link = process.env.HUB_URL || '';
    await slack(`The ${it.title || it.id} ad is updated on the approvals page (revision ${it.rev || 1}) and needs your review. ${link}/approvals`, { channel: process.env.SLACK_MARKETING_CHANNEL, tagUser: j });
  }
  return NextResponse.json({ ok: true, count: all.length });
}
