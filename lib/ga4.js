import { createSign } from 'node:crypto';
import { cached } from './store';
import { sampleTraffic } from './sample';

async function token(sa) {
  const now = Math.floor(Date.now() / 1000);
  const b = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = b({ alg: 'RS256', typ: 'JWT' }) + '.' + b({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
  const sig = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + unsigned + '.' + sig });
  return (await r.json()).access_token;
}
async function report(prop, t, body) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${prop}:runReport`, { method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('GA4 ' + r.status);
  return (await r.json()).rows || [];
}
export async function getTraffic() {
  const prop = process.env.GA4_PROPERTY_ID, raw = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (!prop || !raw) return { live: false, ...sampleTraffic };
  return cached('ga4', 900, async () => {
    const t = await token(JSON.parse(raw));
    const m = [{ name: 'sessions' }, { name: 'totalUsers' }];
    const [daily, ch, pg, prev] = await Promise.all([
      report(prop, t, { dateRanges: [{ startDate: '13daysAgo', endDate: 'today' }], dimensions: [{ name: 'date' }], metrics: m, orderBys: [{ dimension: { dimensionName: 'date' } }] }),
      report(prop, t, { dateRanges: [{ startDate: '6daysAgo', endDate: 'today' }], dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }] }),
      report(prop, t, { dateRanges: [{ startDate: '6daysAgo', endDate: 'today' }], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 8, orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }] }),
      report(prop, t, { dateRanges: [{ startDate: '13daysAgo', endDate: '7daysAgo' }], metrics: [{ name: 'sessions' }] }),
    ]);
    return {
      live: true,
      days: daily.map(r => ({ date: r.dimensionValues[0].value.replace(/(\d{4})(\d\d)(\d\d)/, '$1-$2-$3'), sessions: +r.metricValues[0].value, users: +r.metricValues[1].value })),
      channels: ch.map(r => ({ name: r.dimensionValues[0].value, sessions: +r.metricValues[0].value })),
      pages: pg.map(r => ({ path: r.dimensionValues[0].value, views: +r.metricValues[0].value })),
      prev: { sessions: +(prev[0]?.metricValues[0].value || 0) },
    };
  });
}
