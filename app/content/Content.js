'use client';
import { useEffect, useState } from 'react';
const TABS = [['pending', 'Needs review', ['pending']], ['changes', 'Changes requested', ['changes']], ['approved', 'Approved', ['approved', 'scheduled', 'published']], ['rejected', 'Rejected', ['rejected']]];
const LBL = { pending: 'Needs review', changes: 'Changes requested', approved: 'Approved, scheduling soon', scheduled: 'Scheduled', published: 'Published', rejected: 'Rejected' };
const when = s => s ? new Date(s).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET' : '';
const toLocalInput = s => { try { const d = new Date(s); const p = new Date(d.toLocaleString('en-US', { timeZone: 'America/New_York' })); const z = n => String(n).padStart(2, '0'); return `${p.getFullYear()}-${z(p.getMonth() + 1)}-${z(p.getDate())}T${z(p.getHours())}:${z(p.getMinutes())}`; } catch { return ''; } };

export default function Content() {
  const [posts, setPosts] = useState([]), [tab, setTab] = useState('pending'), [msg, setMsg] = useState('');
  const load = () => fetch('/api/content').then(r => r.json()).then(d => setPosts(d.posts || []));
  useEffect(() => { load(); }, []);
  const rows = posts.filter(p => TABS.find(t => t[0] === tab)[2].includes(p.status)).sort((a, b) => new Date(a.slot || 0) - new Date(b.slot || 0));
  const count = k => posts.filter(p => TABS.find(t => t[0] === k)[2].includes(p.status)).length;
  return (
    <div className="stack">
      <div className="head"><div><h1>Content approvals</h1><div className="sub">Posts drafted from the weekly review. Approve, edit the caption, or request changes. Approved posts are scheduled automatically.</div></div></div>
      <div className="tabs">{TABS.map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t} ({count(k)})</button>)}</div>
      {msg && <div id="toast">{msg}</div>}
      {!rows.length && <div className="card sub">{tab === 'pending' ? 'Nothing waiting for review.' : 'Nothing here.'}</div>}
      {rows.map(p => <Post key={p.id} p={p} reload={load} say={m => { setMsg(m); setTimeout(() => setMsg(''), 4000); }} />)}
    </div>
  );
}
function Post({ p, reload, say }) {
  const review = p.status === 'pending';
  const [cap, setCap] = useState(p.caption || ''), [slot, setSlot] = useState(toLocalInput(p.slot)), [note, setNote] = useState(''), [busy, setBusy] = useState(false), [confirm, setConfirm] = useState(false);
  async function decide(decision) {
    if (decision === 'changes' && !note.trim()) return say('Add a note so the changes are clear.');
    if (decision === 'rejected' && !confirm) { setConfirm(true); return say('Press Reject again to confirm.'); }
    setBusy(true);
    const body = { action: 'decide', id: p.id, decision, note, caption: cap };
    if (slot && slot !== toLocalInput(p.slot)) body.slot = new Date(slot).toISOString();
    const r = await fetch('/api/content', { method: 'POST', body: JSON.stringify(body) });
    setBusy(false); say(r.ok ? 'Saved.' : 'Could not save. Try again.'); reload();
  }
  const media = (
    <div className="gal">{(p.media || []).map((m, i) => m.type === 'video' ? <video key={i} controls preload="metadata" src={m.url} /> : <img key={i} alt={m.label || ''} src={m.url} />)}{!(p.media || []).length && <div className="sub">No media attached.</div>}</div>);
  const meta = (
    <div className="row" style={{ gap: 6 }}>
      <span className="badge">{p.type === 'reel' ? 'Reel' : p.type === 'image' ? 'Single image' : 'Carousel'}</span>
      {p.pillar && <span className="badge">{p.pillar}</span>}
      {p.repurposedFrom && <span className="badge">Repurposed from {p.repurposedFrom}</span>}
      {p.edited && <span className="badge">Caption edited</span>}
    </div>);
  return (
    <section className="card stack">
      <div className="row" style={{ justifyContent: 'space-between' }}><div><h2>{p.title}</h2><div className="sub">{when(p.slot)}{p.development ? ' · ' + p.development : ''}{p.city ? ' · ' + p.city : ''}</div></div><span className={'badge ' + (['scheduled', 'published'].includes(p.status) ? 'ok' : '')}>{LBL[p.status]}</span></div>
      {meta}
      {p.why && <div><div className="lbl">Why this post</div><div className="sub">{p.why}</div></div>}
      {p.decision?.note && !review && <div><div className="lbl">Your note</div><div className="sub">{p.decision.note}</div></div>}
      {review ? (
        <div className="rv"><div className="stack"><div><div className="lbl">Media</div>{media}</div>
          <div><div className="lbl">Caption</div><textarea rows={16} value={cap} onChange={e => setCap(e.target.value)} /></div>
          {p.keywords?.length > 0 && <div className="sub">Comment keyword{p.keywords.length > 1 ? 's' : ''} to add to the automation: <b style={{ color: 'var(--fg)' }}>{p.keywords.join(', ')}</b></div>}
          {p.networks?.length > 0 && <div className="sub">Posts to: {p.networks.join(', ')}</div>}
        </div>
          <div className="rvr stack" style={{ gap: 10 }}>
            <div><div className="lbl">Publish time (ET)</div><input type="datetime-local" value={slot} onChange={e => setSlot(e.target.value)} /></div>
            <textarea rows={6} value={note} onChange={e => setNote(e.target.value)} placeholder="Notes (needed if you request changes)" />
            <button disabled={busy} onClick={() => decide('approved')}>Approve</button>
            <button className="sec" disabled={busy} onClick={() => decide('changes')}>Request changes</button>
            <button className="bad" disabled={busy} onClick={() => decide('rejected')}>{confirm ? 'Confirm reject' : 'Reject'}</button>
          </div></div>
      ) : (<><div>{media}</div><div className="pre">{p.caption}</div></>)}
    </section>);
}
