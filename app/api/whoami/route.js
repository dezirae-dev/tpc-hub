import { NextResponse } from 'next/server';
import { USERS, who } from '../../../lib/user';
export async function GET() { return NextResponse.json({ name: await who() }); }
export async function POST(req) {
  const { name } = await req.json().catch(() => ({}));
  if (!USERS.includes(name)) return new NextResponse('bad', { status: 400 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('tpc_user', name, { secure: true, sameSite: 'lax', maxAge: 60 * 60 * 12, path: '/' });
  return res;
}
