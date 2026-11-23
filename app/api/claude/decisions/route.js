import { NextResponse } from 'next/server';
import { listDecisions } from '../../../../lib/approvals';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json(await listDecisions()); }
