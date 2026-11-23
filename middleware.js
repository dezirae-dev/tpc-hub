import { NextResponse } from 'next/server';
import { sessionToken } from './lib/auth';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/login') || pathname.startsWith('/api/login')) return NextResponse.next();
  // Token API for Claude and scheduled tasks
  if (pathname.startsWith('/api/claude/')) {
    const ok = process.env.HUB_API_TOKEN && req.headers.get('authorization') === 'Bearer ' + process.env.HUB_API_TOKEN;
    return ok ? NextResponse.next() : new NextResponse('Unauthorized', { status: 401 });
  }
  if (!process.env.DASH_PASSWORD) return new NextResponse('Set DASH_PASSWORD in the Vercel project settings.', { status: 503 });
  if (req.cookies.get('tpc_session')?.value === await sessionToken()) return NextResponse.next();
  const url = req.nextUrl.clone(); url.pathname = '/login';
  return NextResponse.redirect(url);
}
export const config = { matcher: ['/((?!_next|favicon.ico|logo.svg).*)'] };
