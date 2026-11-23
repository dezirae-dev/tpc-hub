import { cached } from './store';
import { sampleAds } from './sample';
const G = 'https://graph.facebook.com/v21.0';

export async function getAds(days = 7) {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) return { live: false, ads: sampleAds };
  const accts = (process.env.META_AD_ACCOUNT_IDS || '3084700401866377').split(',').map(s => s.trim()).filter(Boolean);
  return cached('meta-ads-' + days, 600, async () => {
    const out = [];
    for (const a of accts) {
      const ins = await fetch(`${G}/act_${a}/insights?level=ad&date_preset=${days <= 7 ? 'last_7d' : 'last_30d'}&fields=ad_id,ad_name,adset_name,campaign_name,spend,actions&limit=200&access_token=${token}`).then(r => r.json());
      const ads = await fetch(`${G}/act_${a}/ads?fields=id,effective_status&limit=500&access_token=${token}`).then(r => r.json());
      const st = Object.fromEntries((ads.data || []).map(x => [x.id, x.effective_status]));
      for (const r of ins.data || []) {
        const leads = Number((r.actions || []).find(x => x.action_type === 'lead')?.value || 0);
        const spend = Number(r.spend || 0);
        out.push({ id: r.ad_id, name: r.ad_name, campaign: r.campaign_name, adset: r.adset_name, status: st[r.ad_id] || '', spend, leads, cpl: leads ? spend / leads : null });
      }
    }
    return { live: true, ads: out };
  });
}
