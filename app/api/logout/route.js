import { NextResponse } from 'next/server';
export async function POST(req) {
  const res = NextResponse.redirect(new URL('/login', req.url), 303);
  res.cookies.delete('tpc_session'); res.cookies.delete('tpc_user');
  return res;
}
