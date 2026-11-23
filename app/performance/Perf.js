'use client';
import { useState } from 'react';
const base = { tiles: [
  { id: 'g1', label: 'TPC leads this month', value: 0, goal: 100 },
  { id: 'g2', label: 'Posts published', value: 0, goal: 20 },
  { id: 'g3', label: 'Ads approved & live', value: 0, goal: 6 },
], notes: '' };
export default function Perf({ initial, auto, live }) {
  const [d, setD] = useState(initial || base), [saved, setSaved] = useState('');
  const upd = (i, k, v) => setD({ ...d, tiles: d.tiles.map((t, j) => (j === i ? { ...t, [k]: v } : t)) });
  async function save() { const r = await fetch('/api/performance', { method: 'PUT', body: JSON.stringify(d) }); setSaved(r.ok ? 'Saved' : 'Could not save'); setTimeout(() => setSaved(''), 2500); }
  return (
    <div className="stack">
      <div className="head"><div><h1>My performance</h1><div className="sub">Auto numbers come from Follow Up Boss. Goal tiles are yours to edit.</div></div></div>
      <div className="grid">{auto.map(a => <div className="tile" key={a.label}><div className="n">{a.value}{a.of != null ? <span className="sub"> / {a.of}</span> : null}</div><div className="l">{a.label}{live ? '' : ' (sample)'}</div></div>)}</div>
      <section className="card stack"><h2>Goals</h2>
        {d.tiles.map((t, i) => { const pct = Math.min(100, Math.round((t.value / (t.goal || 1)) * 100)); return (
          <div key={t.id} className="stack" style={{ gap: 6 }}>
            <div className="row"><input style={{ flex: 3, minWidth: 180 }} value={t.label} onChange={e => upd(i, 'label', e.target.value)} />
              <input style={{ flex: 1, minWidth: 70 }} type="number" value={t.value} onChange={e => upd(i, 'value', +e.target.value)} /><span className="sub">of</span>
              <input style={{ flex: 1, minWidth: 70 }} type="number" value={t.goal} onChange={e => upd(i, 'goal', +e.target.value)} />
              <button className="sec mini" onClick={() => setD({ ...d, tiles: d.tiles.filter((_, j) => j !== i) })}>Remove</button></div>
            <div style={{ height: 8, background: 'var(--panel)', borderRadius: 4 }}><div style={{ width: pct + '%', height: 8, background: 'var(--accent)', borderRadius: 4 }} /></div>
          </div>); })}
        <div className="row"><button className="sec" onClick={() => setD({ ...d, tiles: [...d.tiles, { id: 'g' + Date.now(), label: 'New goal', value: 0, goal: 10 }] })}>Add goal</button></div>
      </section>
      <section className="card stack"><h2>Weekly notes</h2><textarea rows={6} value={d.notes} onChange={e => setD({ ...d, notes: e.target.value })} placeholder="Wins, blockers, what to change next week" />
        <div className="row"><button onClick={save}>Save</button><span className="sub">{saved}</span></div></section>
    </div>
  );
}
