import { NextResponse } from 'next/server';
import { get } from '../../../../lib/store';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json(await get('brainstorm:board', [])); }
