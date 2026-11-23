import { NextResponse } from 'next/server';
import { who } from '../../../lib/user';
import { logActivity } from '../../../lib/activity';
import { getBoards, createCard, updateCard } from '../../../lib/tasks';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json(await getBoards()); }
export async function POST(req) { const b = await req.json(); await createCard(b.boardId, b.idList, b.name, b.desc, b.due); await logActivity(await who(), 'added task: ' + String(b.name).slice(0, 60)); return NextResponse.json({ ok: true }); }
export async function PATCH(req) { const b = await req.json(); await updateCard(b.boardId, b.id, b.patch); await logActivity(await who(), 'updated task: ' + String(b.patch?.name || b.title || b.id).slice(0, 60)); return NextResponse.json({ ok: true }); }
