import { getTraffic } from '../../lib/ga4';
import { Sample, Tile, Bars } from '../../components/Bits';
export const dynamic = 'force-dynamic';

export default async function Traffic() {
  const t = await getTraffic();
  const wk = t.days.slice(-7).reduce((n, d) => n + d.sessions, 0), prev = t.prev?.sessions || 0;
  const delta = prev ? Math.round((wk / prev - 1) * 100) : null;
  return (
    <div className="stack">
      <div className="head"><div><h1>Marketing traffic</h1><div className="sub">floridaluxurycondos.com and thepremierconnection.com (GA4)</div></div><Sample live={t.live} /></div>
      <div className="grid"><Tile n={wk.toLocaleString()} l="sessions, last 7 days" /><Tile n={delta == null ? '–' : (delta > 0 ? '+' : '') + delta + '%'} l="vs the 7 days before" level={delta != null && delta < -25 ? 'amber' : ''} /></div>
      <section className="card"><h3 style={{ marginBottom: 8 }}>Sessions, last 14 days</h3><Bars data={t.days} /></section>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
        <section className="card"><h3 style={{ marginBottom: 8 }}>Channels</h3><table><tbody>{t.channels.map(c => <tr key={c.name}><td>{c.name}</td><td>{c.sessions.toLocaleString()}</td></tr>)}</tbody></table></section>
        <section className="card"><h3 style={{ marginBottom: 8 }}>Top pages</h3><table><tbody>{t.pages.map(p => <tr key={p.path}><td>{p.path}</td><td>{p.views.toLocaleString()}</td></tr>)}</tbody></table></section>
      </div>
    </div>
  );
}
