import { get } from '../../lib/store';
import { getLeads } from '../../lib/fub';
import Perf from './Perf';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const [saved, l] = await Promise.all([get('performance', null), getLeads(30)]);
  const now = Date.now(), wk = l.leads.filter(x => now - new Date(x.created) < 7 * 864e5);
  const auto = [
    { label: 'Leads assigned this week', value: wk.filter(x => x.assignedTo).length, of: wk.length },
    { label: 'Unassigned leads right now', value: l.leads.filter(x => !x.assignedTo).length },
    { label: 'Leads with no contact after 1h', value: l.leads.filter(x => !x.lastActivity && now - new Date(x.created) > 36e5).length },
  ];
  return <Perf initial={saved} auto={auto} live={l.live} />;
}
