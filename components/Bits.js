export const money = n => (n == null ? '–' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 }));
export const ago = iso => {
  if (!iso) return '–';
  const m = Math.round((Date.now() - new Date(iso)) / 6e4);
  return m < 60 ? m + 'm ago' : m < 1440 ? Math.round(m / 60) + 'h ago' : Math.round(m / 1440) + 'd ago';
};
export const Sample = ({ live }) => (live ? null : <span className="badge sample" title="Add the API key in Vercel to see real numbers">sample data</span>);
export const Tile = ({ n, l, level }) => (<div className={'tile ' + (level || '')}><div className="n">{n}</div><div className="l">{l}</div></div>);
export const Flag = ({ f }) => (
  <a className={'flag ' + f.level} href={f.href || '#'}>
    <div><b>{f.title}</b>{f.detail && <span>{f.detail}</span>}</div>
  </a>
);
export const Bars = ({ data, k = 'sessions' }) => {
  const max = Math.max(1, ...data.map(d => d[k]));
  return <div className="bars">{data.map(d => <i key={d.date} title={`${d.date}: ${d[k]}`} style={{ height: (d[k] / max) * 100 + '%' }} />)}</div>;
};
