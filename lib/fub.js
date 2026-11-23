import { cached } from './store';
import { sampleLeads } from './sample';

export async function getLeads(days = 30) {
  const key = process.env.FUB_API_KEY;
  if (!key) return { live: false, leads: sampleLeads };
  return cached('fub2-leads-' + days, 300, async () => {
    const headers = { Authorization: 'Basic ' + Buffer.from(key + ':').toString('base64'), 'X-System': process.env.FUB_SYSTEM || 'TPCHub' };
    if (process.env.FUB_SYSTEM_KEY) headers['X-System-Key'] = process.env.FUB_SYSTEM_KEY;
    const since = Date.now() - days * 864e5, leads = [], tag = (process.env.FUB_TAG || 'TPC Lead').toLowerCase();
    const fields = 'id,name,created,source,stage,assignedTo,lastActivity,tags,sourceUrl';
    outer: for (let offset = 0; offset < 5000; offset += 100) {
      const r = await fetch(`https://api.followupboss.com/v1/people?limit=100&offset=${offset}&sort=-created&tags=${encodeURIComponent(process.env.FUB_TAG || 'TPC Lead')}&fields=${fields}`, { headers });
      if (!r.ok) throw new Error('FUB ' + r.status);
      const rows = (await r.json()).people || [];
      for (const p of rows) {
        if (new Date(p.created).getTime() < since) break outer;
        if (!(p.tags || []).some(t => String(t).toLowerCase() === tag)) continue;
        leads.push({ id: p.id, name: p.name, created: p.created, source: p.source || 'Unknown', ad: '', stage: p.stage, assignedTo: p.assignedTo || '', lastActivity: p.lastActivity || null, tags: p.tags || [] });
      }
      if (rows.length < 100) break;
    }
    return { live: true, leads: leads.sort((a, b) => new Date(b.created) - new Date(a.created)) };
  });
}
