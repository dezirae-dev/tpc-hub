// Turns raw numbers into "what needs attention" flags, worst first.
export function buildFlags({ ads = [], leads = [], traffic = null, boards = [], approvals = [] }) {
  const target = Number(process.env.CPL_TARGET || 60), f = [];
  const now = Date.now();
  for (const a of ads) {
    if (a.status && a.status !== 'ACTIVE') continue;
    if (a.spend >= 40 && !a.leads) f.push({ level: 'red', title: `${a.name}: $${a.spend.toFixed(0)} spent, no leads`, detail: 'Check the form, the creative and the audience.', href: '/sources' });
    else if (a.cpl && a.cpl > target * 1.5) f.push({ level: 'red', title: `${a.name}: $${a.cpl.toFixed(0)} per lead`, detail: `Target is $${target}.`, href: '/sources' });
    else if (a.cpl && a.cpl > target) f.push({ level: 'amber', title: `${a.name}: $${a.cpl.toFixed(0)} per lead`, detail: `Above the $${target} target.`, href: '/sources' });
  }
  const stale = leads.filter(l => !l.lastActivity && now - new Date(l.created) > 36e5 && now - new Date(l.created) < 864e5 * 3);
  if (stale.length) f.push({ level: 'red', title: `${stale.length} new lead${stale.length > 1 ? 's' : ''} not contacted after 1+ hour`, detail: stale.slice(0, 3).map(l => l.name).join(', '), href: '/leads?filter=uncontacted' });
  const unassigned = leads.filter(l => !l.assignedTo && now - new Date(l.created) < 864e5 * 3);
  if (unassigned.length) f.push({ level: 'amber', title: `${unassigned.length} recent lead${unassigned.length > 1 ? 's' : ''} unassigned`, detail: '', href: '/leads?filter=unassigned' });
  const wk = (a, b) => leads.filter(l => { const t = now - new Date(l.created); return t >= a * 864e5 && t < b * 864e5; }).length;
  const thisW = wk(0, 7), lastW = wk(7, 14);
  if (lastW >= 4 && thisW < lastW * 0.7) f.push({ level: 'amber', title: `Leads down ${Math.round((1 - thisW / lastW) * 100)}% week over week`, detail: `${thisW} vs ${lastW}`, href: '/leads' });
  if (traffic) {
    const s = traffic.days.slice(-7).reduce((n, d) => n + d.sessions, 0);
    if (traffic.prev?.sessions && s < traffic.prev.sessions * 0.75) f.push({ level: 'amber', title: `Site traffic down ${Math.round((1 - s / traffic.prev.sessions) * 100)}% week over week`, detail: '', href: '/traffic' });
  }
  const overdue = boards.flatMap(b => b.cards.filter(c => c.due && !c.dueComplete && new Date(c.due) < now && !/done/i.test(b.lists.find(l => l.id === c.idList)?.name || '')));
  if (overdue.length) f.push({ level: 'amber', title: `${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`, detail: overdue.slice(0, 3).map(c => c.name).join(' · '), href: '/tasks' });
  const waiting = approvals.filter(p => p.status === 'pending');
  if (waiting.length) f.push({ level: waiting.some(p => now - (p.submittedAt || now) > 864e5) ? 'amber' : 'info', title: `${waiting.length} ad${waiting.length > 1 ? 's' : ''} waiting for Jordana`, detail: waiting.map(p => p.title).join(', '), href: '/approvals' });
  const rank = { red: 0, amber: 1, info: 2 };
  return f.sort((a, b) => rank[a.level] - rank[b.level]);
}
