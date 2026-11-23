'use client';
import { useState } from 'react';
export default function Login() {
  const [pw, setPw] = useState(''), [err, setErr] = useState('');
  async function go(e) {
    e.preventDefault();
    const r = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ password: pw }) });
    if (r.ok) location.href = '/'; else setErr('That password did not work.');
  }
  return (
    <form onSubmit={go} style={{ maxWidth: 360, margin: '18vh auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="sub" style={{ letterSpacing: '.3em', textTransform: 'uppercase' }}>The Premier Connection</div>
      <h1>TPC Hub</h1>
      <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} autoFocus />
      <button>Sign in</button>{err && <div className="sub" style={{ color: 'var(--warn)' }}>{err}</div>}
    </form>
  );
}
