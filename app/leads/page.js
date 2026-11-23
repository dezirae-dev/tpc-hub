import Link from 'next/link';
import { getLeads } from '../../lib/fub';
import { Sample, ago } from '../../components/Bits';
export const dynamic = 'force-dynamic';

export default async function Leads({ searchParams }) {
  const sp = await searchParams, days = Number(sp.days || 30), filter = sp.filter || '', src = sp.source || '';
  const { live, leads } = await getLeads(days);
  const now = Date.now();
  let rows = leads.filter(l => now - new Date(l.created) < days * 864e5);
  if (filter === 'uncontacted') rows = rows.filter(l => !l.lastActivity);
  if (filter === 'unassigned') rows = rows.filter(l => !l.assignedTo);
  if (src) rows = rows.filter(l => l.source === src);
  const sources = [...new Set(leads.map(l => l.source))];
  const q = (o) => '/leads?' + new URLSearchParams({ days, filter, source: src, ...o }).toString().replace(/&?\w+=(&|$)/g, '$1');
  return (
    <div className="stack">
      <div className="head"><div><h1>Leads</h1><div className="sub">{rows.length} in the last {days} days</div></div><Sample live={live} /></div>
      <div className="row">
        {[7, 30, 90].map(d => <Link key={d} className={'btn ' + (days === d ? '' : 'sec')} href={q({ days: d })}>{d}d</Link>)}
        {['', 'uncontacted', 'unassigned'].map(f => <Link key={f} className={'btn ' + (filter === f ? '' : 'sec')} href={q({ filter: f })}>{f || 'all'}</Link>)}
        {sources.map(s => <Link key={s} className={'btn ' + (src === s ? '' : 'sec')} href={q({ source: src === s ? '' : s })}>{s}</Link>)}
      </div>
      <div className="card scroll"><table><thead><tr><th>Name</th><th>Source</th><th>Stage</th><th>Assigned</th><th>In</th><th>Last touch</th><th>Tags</th></tr></thead><tbody>
        {rows.map(l => {
          const hrs = (now - new Date(l.created)) / 36e5, bad = !l.lastActivity && hrs > 1;
          return <tr key={l.id} className={bad ? 'red' : !l.assignedTo ? 'amber' : ''}>
            <td><a href={`https://app.followupboss.com/2/people/view/${l.id}`} target="_blank" rel="noopener">{l.name}</a></td>
            <td>{l.source}</td><td>{l.stage}</td><td>{l.assignedTo || '–'}</td><td>{ago(l.created)}</td><td>{l.lastActivity ? ago(l.lastActivity) : 'never'}</td>
            <td className="sub">{(l.tags || []).join(', ')}</td></tr>;
        })}
      </tbody></table>{!rows.length && <div className="sub" style={{ padding: 12 }}>No leads match.</div>}</div>
    </div>
  );
}
