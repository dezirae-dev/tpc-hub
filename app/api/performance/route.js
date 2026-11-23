import { NextResponse } from 'next/server';
import { get, set } from '../../../lib/store';
export async function GET() { return NextResponse.json(await get('performance', null)); }
export async function PUT(req) { await set('performance', await req.json()); return NextResponse.json({ ok: true }); }
