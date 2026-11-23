'use client';
import { useState } from 'react';
export default function Login() {
  const [pw, setPw] = useState(''), [name, setName] = useState(''), [err, setErr] = useState('');
  async function go(e) {
    e.preventDefault(); if (!name) return setErr('Pick who is signing in.');
    const r = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ password: pw, name }) });
    if (r.ok) location.href = '/'; else setErr('That password did not work.');
  }
  return (
    <form onSubmit={go} style={{ maxWidth: 360, margin: '18vh auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="sub" style={{ letterSpacing: '.3em', textTransform: 'uppercase' }}>The Premier Connection</div>
      <h1>TPC Hub</h1>
      <div className="lbl" style={{ margin: 0 }}>Who is signing in?</div>
      <div className="row">{['Dezirae', 'Jordana'].map(n => <button type="button" key={n} className={name === n ? '' : 'sec'} style={{ flex: 1 }} onClick={() => setName(n)}>{n}</button>)}</div>
      <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} autoFocus />
      <button>Sign in</button>{err && <div className="sub" style={{ color: 'var(--warn)' }}>{err}</div>}
    </form>
  );
}
