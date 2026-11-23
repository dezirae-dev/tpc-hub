import { NextResponse } from 'next/server';
import { sessionToken } from '../../../lib/auth';
export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  if (!process.env.DASH_PASSWORD || password !== process.env.DASH_PASSWORD) return new NextResponse('no', { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('tpc_session', await sessionToken(), { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 60, path: '/' });
  return res;
}
