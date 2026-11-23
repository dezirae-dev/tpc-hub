import { NextResponse } from 'next/server';
import { get, set } from '../../../lib/store';
import { getAds } from '../../../lib/meta';
import { getLeads } from '../../../lib/fub';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RULES = `You are the brainstorming partner for The Premier Connection (TPC), a division of Premier Listings selling new-construction condos in Broward and Palm Beach County. Users: Dezirae (marketing) and Jordana (broker/founder).
House rules for any ad or copy idea: hooks first, grab attention in the first 3-6 words, use real dollar figures, never name the development in lead-ad visible text, never lead with architect/developer names, call the 10% a "thank you credit" (never "rebate"), never write "Register with us", no hedging boilerplate like "no pressure", no secret-list or gatekeeping language, every link needs UTM tags, Leads objective. Be concise and concrete. Offer 3 options, then say which you'd pick and why.`;

export async function GET() { return NextResponse.json(await get('brainstorm:thread', [])); }
export async function DELETE() { await set('brainstorm:thread', []); return NextResponse.json({ ok: true }); }
export async function POST(req) {
  const { text } = await req.json();
  const key = process.env.ANTHROPIC_API_KEY;
  const thread = await get('brainstorm:thread', []);
  thread.push({ role: 'user', content: text, at: Date.now() });
  if (!key) { thread.push({ role: 'assistant', content: 'Add ANTHROPIC_API_KEY in the Vercel project settings to turn the brainstorm chat on.', at: Date.now() }); await set('brainstorm:thread', thread); return NextResponse.json(thread); }
  const [a, l] = await Promise.all([getAds(7), getLeads(7)]);
  const ctx = `Live snapshot. Ads (7d): ${a.ads.map(x => `${x.name} $${Math.round(x.spend)} spend, ${x.leads} leads`).join('; ')}. New leads (7d): ${l.leads.length}.${a.live ? '' : ' (sample numbers, keys not connected yet)'}`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 1800, system: RULES + '\n' + ctx, messages: thread.slice(-24).map(m => ({ role: m.role, content: m.content })) }),
  });
  const j = await r.json();
  thread.push({ role: 'assistant', content: j.content?.[0]?.text || 'Error: ' + (j.error?.message || r.status), at: Date.now() });
  await set('brainstorm:thread', thread);
  return NextResponse.json(thread);
}
