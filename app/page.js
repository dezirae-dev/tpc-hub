import { getAds } from '../lib/meta';
import { getActivity } from '../lib/activity';
import { getLeads } from '../lib/fub';
import { getTraffic } from '../lib/ga4';
import { getBoards } from '../lib/tasks';
import { listPackages, listDecisions, withStatus } from '../lib/approvals';
import { buildFlags } from '../lib/flags';
import { Tile, Flag, Sample, money, ago } from '../components/Bits';
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [a, l, t, boards, pk, dc] = await Promise.all([getAds(7), getLeads(30), getTraffic(), getBoards(), listPackages(), listDecisions()]);
  const act = await getActivity(10);
  const approvals = withStatus(pk, dc);
  const flags = buildFlags({ ads: a.ads, leads: l.leads, traffic: t, boards, approvals });
  const wk = l.leads.filter(x => Date.now() - new Date(x.created) < 7 * 864e5);
  const spend = a.ads.reduce((n, x) => n + x.spend, 0), metaLeads = a.ads.reduce((n, x) => n + x.leads, 0);
  const sessions = t.days.slice(-7).reduce((n, d) => n + d.sessions, 0);
  const pending = approvals.filter(p => p.status === 'pending').length;
  const unc = l.leads.filter(x => !x.lastActivity && Date.now() - new Date(x.created) > 36e5 && Date.now() - new Date(x.created) < 3 * 864e5).length;
  const cpl = metaLeads ? spend / metaLeads : null, target = Number(process.env.CPL_TARGET || 60);
  return (
    <div className="stack">
      <div className="head"><div><h1>Today at TPC</h1><div className="sub">Last 7 days. Red and amber items are what needs you.</div></div>
        <div className="row"><Sample live={a.live && l.live && t.live} /></div></div>
      <div className="grid">
        <Tile n={wk.length} l="new leads (7d)" />
        <Tile n={money(spend)} l="ad spend (7d)" />
        <Tile n={cpl ? money(cpl) : '–'} l={`cost per lead · target ${money(target)}`} level={cpl > target * 1.5 ? 'red' : cpl > target ? 'amber' : ''} />
        <Tile n={sessions.toLocaleString()} l="site sessions (7d)" />
        <Tile n={pending} l="ads waiting on Jordana" level={pending ? 'amber' : ''} />
        <Tile n={unc} l="leads not contacted" level={unc ? 'red' : ''} />
      </div>
      <section className="stack"><h2>Needs attention</h2>
        {flags.length ? flags.map((f, i) => <Flag key={i} f={f} />) : <div className="card sub">Nothing flagged. Everything is inside its targets.</div>}
      </section>
      <section className="card"><h2 style={{ marginBottom: 10 }}>Newest leads</h2>
        <div className="scroll"><table><thead><tr><th>Name</th><th>Source</th><th>Assigned</th><th>In</th><th>Status</th></tr></thead><tbody>
          {l.leads.slice(0, 8).map(x => <tr key={x.id}><td>{x.name}</td><td>{x.source}</td><td>{x.assignedTo || <span className="badge red">unassigned</span>}</td><td>{ago(x.created)}</td><td>{x.lastActivity ? 'Contacted' : <span className="badge red">no contact yet</span>}</td></tr>)}
        </tbody></table></div></section>
      <section className="card"><h2 style={{ marginBottom: 10 }}>Recent activity</h2>
        {act.length ? act.map((x, i) => <div key={i} className="sub" style={{ padding: '4px 0' }}><b style={{ color: 'var(--fg)' }}>{x.who}</b> {x.text} · {ago(new Date(x.at).toISOString())}</div>) : <div className="sub">Nothing logged yet.</div>}</section>
    </div>
  );
}
