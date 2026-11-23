import { cached } from './store';
import { sampleLeads } from './sample';

export async function getLeads(days = 30) {
  const key = process.env.FUB_API_KEY;
  if (!key) return { live: false, leads: sampleLeads };
  return cached('fub-leads-' + days, 300, async () => {
    const headers = { Authorization: 'Basic ' + Buffer.from(key + ':').toString('base64'), 'X-System': process.env.FUB_SYSTEM || 'TPCHub' };
    if (process.env.FUB_SYSTEM_KEY) headers['X-System-Key'] = process.env.FUB_SYSTEM_KEY;
    const since = Date.now() - days * 864e5, leads = [];
    for (let offset = 0; offset < 1000; offset += 100) {
      const r = await fetch(`https://api.followupboss.com/v1/people?limit=100&offset=${offset}&sort=created&fields=id,name,created,source,stage,assignedTo,lastActivity,tags,sourceUrl`, { headers });
      if (!r.ok) throw new Error('FUB ' + r.status);
      const j = await r.json();
      const rows = j.people || [];
      for (const p of rows) if (new Date(p.created).getTime() >= since) leads.push({ id: p.id, name: p.name, created: p.created, source: p.source || 'Unknown', ad: '', stage: p.stage, assignedTo: p.assignedTo || '', lastActivity: p.lastActivity || null, tags: p.tags || [] });
      if (rows.length < 100) break;
    }
    return { live: true, leads: leads.sort((a, b) => new Date(b.created) - new Date(a.created)) };
  });
}
