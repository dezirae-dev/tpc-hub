import { NextResponse } from 'next/server';
import { getBoards, createCard, updateCard } from '../../../lib/tasks';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json(await getBoards()); }
export async function POST(req) { const b = await req.json(); await createCard(b.boardId, b.idList, b.name, b.desc, b.due); return NextResponse.json({ ok: true }); }
export async function PATCH(req) { const b = await req.json(); await updateCard(b.boardId, b.id, b.patch); return NextResponse.json({ ok: true }); }
