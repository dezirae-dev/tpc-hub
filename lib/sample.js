// Shown (with a "sample data" badge) until the real API keys are added.
const d = n => new Date(Date.now() - n * 864e5).toISOString();
const h = n => new Date(Date.now() - n * 36e5).toISOString();
export const sampleAds = [
  { id: '1', name: 'Olara', campaign: 'Palm Beach County', adset: 'West Palm Beach', status: 'ACTIVE', spend: 142.5, leads: 4, cpl: 35.6 },
  { id: '2', name: 'Olara Vs. Shorecrest', campaign: 'Palm Beach County', adset: 'West Palm Beach', status: 'ACTIVE', spend: 96, leads: 0, cpl: null },
  { id: '3', name: 'South Flagler', campaign: 'Palm Beach County', adset: 'West Palm Beach', status: 'ACTIVE', spend: 203.81, leads: 2, cpl: 101.9 },
  { id: '4', name: 'Viceroy', campaign: 'Broward County', adset: 'Fort Lauderdale', status: 'ACTIVE', spend: 88, leads: 3, cpl: 29.3 },
];
export const sampleLeads = [
  { id: 'a', name: 'Sample Lead One', created: h(1), source: 'Facebook Lead Ad', ad: 'Olara', stage: 'Lead', assignedTo: 'Nina', lastActivity: null, tags: ['TPC Lead'] },
  { id: 'b', name: 'Sample Lead Two', created: h(9), source: 'Facebook Lead Ad', ad: 'Viceroy', stage: 'Lead', assignedTo: 'Jordana', lastActivity: h(8), tags: ['TPC Lead'] },
  { id: 'c', name: 'Sample Lead Three', created: d(2), source: 'floridaluxurycondos.com', ad: '', stage: 'Nurture', assignedTo: 'Nina', lastActivity: d(1), tags: [] },
  { id: 'e', name: 'Sample Lead Four', created: d(4), source: 'Instagram Guide', ad: '', stage: 'Lead', assignedTo: '', lastActivity: null, tags: ['TPC - West Palm Beach Guide'] },
];
export const sampleTraffic = {
  days: Array.from({ length: 14 }, (_, i) => ({ date: d(13 - i).slice(0, 10), sessions: 60 + ((i * 17) % 40), users: 45 + ((i * 11) % 30) })),
  channels: [{ name: 'Paid Social', sessions: 410 }, { name: 'Organic Search', sessions: 260 }, { name: 'Direct', sessions: 140 }, { name: 'Organic Social', sessions: 95 }],
  pages: [{ path: '/developments/olara', views: 220 }, { path: '/reports/south-flagler-drive', views: 150 }, { path: '/tools/building-match', views: 90 }],
  prev: { sessions: 980 },
};
export const sampleBoard = {
  id: 'local', name: 'TPC Tasks', source: 'local',
  lists: [{ id: 'todo', name: 'To do' }, { id: 'doing', name: 'In progress' }, { id: 'review', name: 'Waiting on Jordana' }, { id: 'done', name: 'Done' }],
  cards: [
    { id: 't1', name: 'Rewrite Sage copy for Jordana feedback', idList: 'doing', due: null, desc: '' },
    { id: 't2', name: 'Confirm Sage starting price is current', idList: 'todo', due: d(1), desc: '' },
  ],
};
