import { NextResponse } from 'next/server';
import { who } from '../../../lib/user';
import { logActivity } from '../../../lib/activity';
import { listPackages, listDecisions, saveDecisions, getEdits, saveEdits, withStatus, slack } from '../../../lib/approvals';
export const dynamic = 'force-dynamic';

export async function GET() {
  const [p, d, e] = await Promise.all([listPackages(), listDecisions(), getEdits()]);
  return NextResponse.json({ packages: withStatus(p, d), edits: e });
}
export async function POST(req) {
  const b = await req.json(); const me = (await who()) || b.by || 'Someone'; b.by = me;
  if (b.action === 'edit') { const e = await getEdits(); e[b.id] = { rev: b.rev, items: b.items }; await saveEdits(e); return NextResponse.json({ ok: true }); }
  if (b.action === 'decide') {
    const [pk, d] = await Promise.all([listPackages(), listDecisions()]);
    const p = pk.find(x => x.id === b.id);
    if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 });
    d[b.id] = { pkgId: b.id, rev: p.rev || 1, decision: b.decision, note: b.note || '', picks: b.picks, notPicked: b.notPicked, edits: b.edits || [], byName: b.by || 'Someone', at: Date.now() };
    await saveDecisions(d);
    await logActivity(me, `${{ approved: 'approved', changes: 'requested changes on', rejected: 'rejected' }[b.decision]} the ${p.title} ad`);
    const verb = { approved: 'approved', changes: 'requested changes on', rejected: 'rejected' }[b.decision];
    const sent = await slack(`${b.by || 'Someone'} ${verb} "${p.title}".${b.note ? ' ' + b.note : ''}${b.edits?.length ? ` The copy was edited (${b.edits.length}).` : ''}`);
    return NextResponse.json({ ok: true, slack: sent });
  }
  return NextResponse.json({ error: 'bad action' }, { status: 400 });
}
