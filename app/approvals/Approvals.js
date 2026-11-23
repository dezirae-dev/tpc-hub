'use client';
import { useEffect, useState } from 'react';
const KEYS = ['primary', 'headline', 'description'], GL = { primary: 'Primary text', headline: 'Headlines', description: 'Descriptions' };
const uniq = a => [...new Set((a || []).map(x => (x == null ? '' : String(x)).trim()).filter(Boolean))];
function groups(p) {
  const t = p.texts;
  if (t && (t.primary || t.headline || t.description)) return { primary: uniq(t.primary), headline: uniq(t.headline), description: uniq(t.description) };
  const c = p.copy || [];
  return { primary: uniq(c.map(x => x.primary)), headline: uniq(c.map(x => x.headline)), description: uniq(c.map(x => x.description)) };
}
export default function Approvals() {
  const [pk, setPk] = useState([]), [edits, setEdits] = useState({}), [tab, setTab] = useState('pending'), [who, setWho] = useState('Jordana'), [msg, setMsg] = useState('');
  const load = () => fetch('/api/approvals').then(r => r.json()).then(d => { setPk(d.packages); setEdits(d.edits); });
  useEffect(() => { load(); setWho(localStorage.getItem('tpc_who') || 'Jordana'); }, []);
  const rows = pk.filter(p => (tab === 'pending' ? ['pending', 'changes'].includes(p.status) : tab === 'active' ? ['live', 'approved'].includes(p.status) : ['paused', 'rejected'].includes(p.status)))
    .sort((a, b) => (a.status === 'changes') - (b.status === 'changes'));
  return (
    <div className="stack">
      <div className="head"><div><h1>Ad approvals</h1><div className="sub">Who is reviewing?</div></div>
        <select style={{ width: 160 }} value={who} onChange={e => { setWho(e.target.value); localStorage.setItem('tpc_who', e.target.value); }}><option>Jordana</option><option>Dezirae</option></select></div>
      <div className="tabs">{[['pending', 'Needs review'], ['active', 'Active'], ['inactive', 'Inactive']].map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>)}</div>
      {msg && <div id="toast">{msg}</div>}
      {!rows.length && <div className="card sub">{tab === 'pending' ? 'Nothing waiting for review.' : 'Nothing here.'}</div>}
      {rows.map(p => <Card key={p.id} p={p} edits={edits[p.id]?.rev === (p.rev || 1) ? edits[p.id].items : []} who={who} reload={load} say={m => { setMsg(m); setTimeout(() => setMsg(''), 4000); }} />)}
    </div>
  );
}
function Card({ p, edits, who, reload, say }) {
  const g = groups(p), review = p.status === 'pending';
  const [sel, setSel] = useState(() => Object.fromEntries(KEYS.map(k => [k, new Set(g[k].map((_, i) => i))]))), [editing, setEditing] = useState(null), [draft, setDraft] = useState(''), [note, setNote] = useState(''), [busy, setBusy] = useState(false), [confirm, setConfirm] = useState(false);
  const shown = (k, x) => edits.find(e => e.g === k && e.orig === x)?.text || x;
  const aud = p.audience || p.adset || '', lp = p.destination?.url || '';
  if (p.status === 'changes') return (
    <section className="card" style={{ opacity: .55, background: 'var(--panel)' }}><div className="row" style={{ justifyContent: 'space-between' }}><h2>{p.title}</h2><span className="badge">Changes requested</span></div>
      <div className="sub">Dezirae is working on the changes. Nothing to review yet. It moves back to the top when it is ready.</div>{p.decision?.note && <div className="sub">Your note: {p.decision.note}</div>}</section>);
  async function saveEdit(k, x) {
    const t = draft.trim(); if (!t) return;
    const items = edits.filter(e => !(e.g === k && e.orig === x)); if (t !== x) items.push({ g: k, orig: x, text: t, by: who });
    await fetch('/api/approvals', { method: 'POST', body: JSON.stringify({ action: 'edit', id: p.id, rev: p.rev || 1, items }) }); setEditing(null); reload();
  }
  async function decide(decision) {
    if (decision === 'changes' && !note.trim()) return say('Add a note so the changes are clear.');
    if (decision === 'rejected' && !confirm) { setConfirm(true); return say('Press Reject again to confirm.'); }
    const picks = {}, notPicked = {};
    KEYS.forEach(k => { picks[k] = g[k].filter((_, i) => sel[k].has(i)).map(x => shown(k, x)); notPicked[k] = g[k].filter((_, i) => !sel[k].has(i)).map(x => shown(k, x)); });
    if (decision === 'approved' && KEYS.some(k => g[k].length && !picks[k].length)) return say('Keep at least one option ticked in each group.');
    setBusy(true);
    const r = await fetch('/api/approvals', { method: 'POST', body: JSON.stringify({ action: 'decide', id: p.id, decision, note, picks, notPicked, edits: edits.map(e => ({ g: e.g, orig: e.orig, text: e.text })), by: who }) });
    setBusy(false); say(r.ok ? 'Saved. Dezirae has been notified.' : 'Could not save. Try again.'); reload();
  }
  const copy = (
    <div className="stack">{KEYS.filter(k => g[k].length).map(k => (
      <div key={k}><div className="lbl">{GL[k]}</div><div className="stack" style={{ gap: 8 }}>{g[k].map((x, i) => {
        const key = k + i, ed = edits.find(e => e.g === k && e.orig === x);
        if (editing === key) return <div className="var" style={{ display: 'block' }} key={key}><textarea rows={5} value={draft} onChange={e => setDraft(e.target.value)} /><div className="row" style={{ marginTop: 8 }}><button className="mini" onClick={() => saveEdit(k, x)}>Save edit</button><button className="sec mini" onClick={() => setEditing(null)}>Cancel</button></div></div>;
        return <div className="var" key={key}>
          {review && <input type="checkbox" checked={sel[k].has(i)} onChange={e => { const s = new Set(sel[k]); e.target.checked ? s.add(i) : s.delete(i); setSel({ ...sel, [k]: s }); }} />}
          <div className="pre" style={{ flex: 1 }}>{ed?.text || x}{ed && <div className="sub"><span className="badge">Edited</span></div>}</div>
          {review && <button className="sec mini" title="Edit" onClick={() => { setEditing(key); setDraft(ed?.text || x); }}>✎</button>}</div>;
      })}</div></div>))}</div>);
  const body = (<>
    <div className="stack"><div><div className="lbl">Creatives</div><div className="gal">{(p.creatives || []).map((c, i) => c.type === 'video' ? <video key={i} controls preload="metadata" src={c.url} /> : c.type === 'link' ? <a key={i} href={c.url} target="_blank" rel="noopener">{c.label}</a> : <img key={i} alt={c.label || ''} src={c.url} />)}{!(p.creatives || []).length && <div className="sub">No creatives attached.</div>}</div></div>
      <div><div className="lbl">Ad copy</div>{copy}</div></div></>);
  return (
    <section className="card stack">
      <div className="row" style={{ justifyContent: 'space-between' }}><h2>{p.title}</h2><span className={'badge ' + (p.status === 'live' ? 'ok' : '')}>{{ pending: 'Needs review', live: 'Active', approved: 'Approved', paused: 'Inactive', rejected: 'Rejected' }[p.status]}</span></div>
      {aud && <div><div className="lbl">Target audience</div>{aud}</div>}
      {lp && <div><div className="lbl">Landing page</div><a href={lp} target="_blank" rel="noopener">{lp.replace(/^https?:\/\/(www\.)?/, '').split('?')[0]}</a></div>}
      {review ? (
        <div className="rv"><div>{body}</div><div className="rvr stack" style={{ gap: 10 }}>
          <div className="sub">All copy is ticked. Untick anything you do not want, or tap the pencil to edit it.</div>
          <textarea rows={8} value={note} onChange={e => setNote(e.target.value)} placeholder="Notes (needed if you request changes)" />
          <button disabled={busy} onClick={() => decide('approved')}>Approve</button>
          <button className="sec" disabled={busy} onClick={() => decide('changes')}>Request changes</button>
          <button className="bad" disabled={busy} onClick={() => decide('rejected')}>{confirm ? 'Confirm reject' : 'Reject'}</button>
        </div></div>) : body}
    </section>);
}
