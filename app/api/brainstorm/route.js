import { NextResponse } from 'next/server';
import { who } from '../../../lib/user';
import { logActivity } from '../../../lib/activity';
import { get, set } from '../../../lib/store';
export const dynamic = 'force-dynamic';
const K = 'brainstorm:board';
export async function GET() { return NextResponse.json(await get(K, [])); }
export async function POST(req) {
  const b = await req.json();
  let notes = await get(K, []); const me = await who();
  if (b.op === 'upsert') {
    const n = { ...b.note, at: Date.now() }; if (!notes.some(x => x.id === n.id)) { n.by = me; await logActivity(me, 'added a note to the brainstorm board'); }
    const i = notes.findIndex(x => x.id === n.id);
    if (i >= 0) notes[i] = { ...notes[i], ...n }; else notes.push(n);
  } else if (b.op === 'upsertMany') {
    await logActivity(me, 'added an idea builder to the brainstorm board'); for (const raw of b.notes) { const n = { ...raw, by: me, at: Date.now() }; const i = notes.findIndex(x => x.id === n.id); if (i >= 0) notes[i] = { ...notes[i], ...n }; else notes.push(n); }
  } else if (b.op === 'delete') notes = notes.filter(x => x.id !== b.id);
  else if (b.op === 'clear') { notes = []; await logActivity(me, 'cleared the brainstorm board'); }
  await set(K, notes);
  return NextResponse.json(notes);
}
