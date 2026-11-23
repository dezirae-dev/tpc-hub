import { getAds } from '../../lib/meta';
import { getLeads } from '../../lib/fub';
import { Sample, money } from '../../components/Bits';
export const dynamic = 'force-dynamic';

export default async function Sources() {
  const [a, l] = await Promise.all([getAds(7), getLeads(30)]);
  const target = Number(process.env.CPL_TARGET || 60), by = {};
  for (const x of l.leads) { by[x.source] = by[x.source] || { n: 0, contacted: 0 }; by[x.source].n++; if (x.lastActivity) by[x.source].contacted++; }
  const totS = a.ads.reduce((n, x) => n + x.spend, 0), totL = a.ads.reduce((n, x) => n + x.leads, 0);
  return (
    <div className="stack">
      <div className="head"><div><h1>Sources & costs</h1><div className="sub">Where leads come from and what each one costs. Target cost per lead: {money(target)}.</div></div><Sample live={a.live && l.live} /></div>
      <section className="card"><h2 style={{ marginBottom: 10 }}>Ads, last 7 days</h2><div className="scroll"><table><thead><tr><th>Ad</th><th>Campaign</th><th>Status</th><th>Spend</th><th>Leads</th><th>Cost / lead</th></tr></thead><tbody>
        {a.ads.sort((x, y) => y.spend - x.spend).map(x => {
          const lvl = (x.spend >= 40 && !x.leads) || x.cpl > target * 1.5 ? 'red' : x.cpl > target ? 'amber' : '';
          return <tr key={x.id} className={lvl}><td>{x.name}</td><td>{x.campaign} › {x.adset}</td><td>{x.status}</td><td>{money(x.spend)}</td><td>{x.leads}</td><td>{x.cpl ? money(x.cpl) : x.spend >= 40 ? 'no leads' : '–'}</td></tr>;
        })}
        <tr><td><b>Total</b></td><td></td><td></td><td><b>{money(totS)}</b></td><td><b>{totL}</b></td><td><b>{totL ? money(totS / totL) : '–'}</b></td></tr>
      </tbody></table></div></section>
      <section className="card"><h2 style={{ marginBottom: 10 }}>Lead sources, last 30 days (Follow Up Boss)</h2><div className="scroll"><table><thead><tr><th>Source</th><th>Leads</th><th>Contacted</th></tr></thead><tbody>
        {Object.entries(by).sort((x, y) => y[1].n - x[1].n).map(([s, v]) => <tr key={s}><td>{s}</td><td>{v.n}</td><td>{Math.round((v.contacted / v.n) * 100)}%</td></tr>)}
      </tbody></table></div><div className="sub" style={{ marginTop: 8 }}>floridaluxurycondos.com leads are tracked separately because Jordana pays per lead from that site.</div></section>
    </div>
  );
}
