'use client';
import { useState } from 'react';
export default function WhoBar({ user }) {
  const [open, setOpen] = useState(false);
  async function pick(name) { await fetch('/api/whoami', { method: 'POST', body: JSON.stringify({ name }) }); location.reload(); }
  const modal = (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 50, display: 'grid', placeItems: 'center' }}>
      <div className="card" style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2>Who is this?</h2><div className="sub">Changes in the hub are logged under this name.</div>
        {['Dezirae', 'Jordana'].map(n => <button key={n} onClick={() => pick(n)}>{n}</button>)}
        {user && <button className="sec" onClick={() => setOpen(false)}>Cancel</button>}
      </div>
    </div>);
  return (<>
    {user && <div className="sub" style={{ padding: '0 10px 8px' }}>Signed in as <b style={{ color: 'var(--fg)' }}>{user}</b> · <a href="#" onClick={e => { e.preventDefault(); setOpen(true); }}>switch</a></div>}
    {(!user || open) && modal}
  </>);
}
