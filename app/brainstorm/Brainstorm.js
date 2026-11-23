'use client';
import { useEffect, useRef, useState } from 'react';

const COLORS = { yellow: '#F6E7A8', sage: '#CFE0DC', blush: '#F2D4C9', lilac: '#DCD6EC', white: '#FFFFFF' };
const uid = () => Math.random().toString(36).slice(2, 10);
const BUILDERS = [
  { name: 'Hook builder', color: 'yellow', cells: ['Who is it for?', 'What do they care about?', 'What is different here?', 'Real figure ($ or sq ft)', 'Hook (first 3-6 words)'] },
  { name: 'Ad concept', color: 'sage', cells: ['Hook', 'Visual / b-roll', 'Primary text', 'Offer', 'End card'] },
  { name: 'Pain to angle', color: 'blush', cells: ['Pain point', 'Why it happens', 'Our angle', 'Proof'] },
  { name: 'Test plan', color: 'lilac', cells: ['Hypothesis', 'Version A', 'Version B', 'Win metric (CPL under $60)'] },
];
const RULES = 'TPC rules: hooks first (grab attention in the first 3-6 words), real dollar figures, never name the development in lead-ad visible text, never lead with architect/developer names, call the 10% a "thank you credit" (never "rebate"), no "Register with us", no hedging like "no pressure", no secret-list or gatekeeping language, every link needs UTMs, Leads objective.';
const MODES = {
  expand: 'Expand on this brainstorm board for The Premier Connection (TPC). For each idea give 3 stronger options, then tell me which you would pick and why.',
  debrief: 'Debrief this brainstorm board for The Premier Connection (TPC). Group the ideas into themes, point out gaps and weak spots, and tell me what to drop, what to test first, and why.',
  execute: 'Turn this brainstorm board into execution for The Premier Connection (TPC): ready-to-use ad copy and hooks for the best ideas, plus a short task list with owners. Then ask whether to add the ads to the approvals dash.',
};

export default function Brainstorm() {
  const [notes, setNotes] = useState([]);
  const [msg, setMsg] = useState('');
  const [menu, setMenu] = useState(false);
  const drag = useRef(null), busy = useRef(false), edit = useRef(null), wrap = useRef(), notesRef = useRef([]);
  notesRef.current = notes;

  const flash = t => { setMsg(t); setTimeout(() => setMsg(''), 3500); };
  const api = body => fetch('/api/brainstorm', { method: 'POST', body: JSON.stringify(body) }).then(r => r.json());
  useEffect(() => {
    const load = () => { if (busy.current || edit.current) return; fetch('/api/brainstorm').then(r => r.json()).then(setNotes).catch(() => {}); };
    load(); const t = setInterval(load, 7000); return () => clearInterval(t);
  }, []);

  const upsert = n => { setNotes(ns => ns.some(x => x.id === n.id) ? ns.map(x => x.id === n.id ? { ...x, ...n } : x) : [...ns, n]); api({ op: 'upsert', note: n }); };
  const origin = () => { const w = wrap.current; return { x: (w?.scrollLeft || 0) + 40, y: (w?.scrollTop || 0) + 40 }; };
  const addSticky = (color = 'yellow') => { const o = origin(); const n = { id: uid(), kind: 'note', x: o.x + Math.random() * 80, y: o.y + Math.random() * 80, text: '', color }; upsert(n); edit.current = n.id; };
  const addLabel = () => { const o = origin(); upsert({ id: uid(), kind: 'label', x: o.x, y: o.y, text: 'New section', color: 'white' }); };
  function addBuilder(b) {
    const o = origin(), g = uid(), list = [{ id: uid(), kind: 'label', x: o.x, y: o.y, text: b.name, color: 'white', group: g }];
    b.cells.forEach((c, i) => list.push({ id: uid(), kind: 'note', x: o.x + i * 210, y: o.y + 50, text: '', label: c, color: b.color, group: g }));
    setNotes(ns => [...ns, ...list]); api({ op: 'upsertMany', notes: list });
  }
  function down(e, n) {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: n.id, dx: e.clientX - n.x, dy: e.clientY - n.y }; busy.current = true;
  }
  function move(e) {
    const d = drag.current; if (!d) return;
    const x = Math.max(0, e.clientX - d.dx), y = Math.max(0, e.clientY - d.dy);
    setNotes(ns => ns.map(n => n.id === d.id ? { ...n, x, y } : n));
  }
  function up() {
    const d = drag.current; if (!d) return;
    drag.current = null; busy.current = false;
    const n = notesRef.current.find(x => x.id === d.id); if (n) api({ op: 'upsert', note: n });
  }
  const del = id => { setNotes(ns => ns.filter(n => n.id !== id)); api({ op: 'delete', id }); };
  async function toTask(n) {
    const bs = await fetch('/api/tasks').then(r => r.json()); const b = bs[0];
    await fetch('/api/tasks', { method: 'POST', body: JSON.stringify({ boardId: b.id, idList: b.lists[0].id, name: (n.text || n.label).split('\n')[0].slice(0, 90), desc: n.text }) });
    flash('Added to Tasks');
  }

  function boardText() {
    const sorted = [...notes].sort((a, b) => a.y - b.y || a.x - b.x);
    const groups = new Map(); const loose = [];
    for (const n of sorted) { if (n.group) { if (!groups.has(n.group)) groups.set(n.group, []); groups.get(n.group).push(n); } else loose.push(n); }
    const out = [];
    for (const g of groups.values()) {
      const t = g.find(n => n.kind === 'label'); out.push('## ' + (t?.text || 'Idea builder'));
      for (const n of g.filter(n => n.kind !== 'label')) out.push(`- ${n.label ? n.label + ': ' : ''}${n.text || '(blank)'}`);
      out.push('');
    }
    for (const n of loose) out.push(n.kind === 'label' ? '\n## ' + n.text : '- ' + (n.text || '(blank)'));
    return out.join('\n').trim();
  }
  async function sendToClaude(mode) {
    setMenu(false);
    const text = `${MODES[mode]}\n\n${RULES}\n\nBOARD:\n${boardText() || '(empty board)'}`;
    try { await navigator.clipboard.writeText(text); } catch {}
    const url = 'https://claude.ai/new?q=' + encodeURIComponent(text);
    window.open(url.length < 7500 ? url : 'https://claude.ai/new', '_blank');
    flash(url.length < 7500 ? 'Opened in Claude. Also copied.' : 'Board copied. Paste it into the new Claude chat.');
  }
  const openClaude = () => window.open('https://claude.ai/new?q=' + encodeURIComponent('Brainstorm with me for The Premier Connection (TPC), new-construction condos in South Florida. ' + RULES + ' Ask me what we are working on.'), '_blank');

  return (
    <div className="stack">
      <div className="head"><div><h1>Brainstorm</h1><div className="sub">Shared idea board. Drag stickies, use a builder to structure an idea, then take it to Claude.</div></div>
        <div className="row"><span className="sub">{msg}</span><button className="sec" onClick={() => { if (confirm('Clear the whole board?')) { setNotes([]); api({ op: 'clear' }); } }}>Clear board</button></div></div>

      <div className="card bsbar">
        <div className="row">
          {Object.keys(COLORS).filter(c => c !== 'white').map(c => <button key={c} className="sec" style={{ background: COLORS[c], color: '#1C1B19', borderColor: 'transparent' }} onClick={() => addSticky(c)}>+ Sticky</button>)}
          <button className="sec" onClick={addLabel}>+ Section label</button>
        </div>
        <div className="row"><span className="lbl" style={{ margin: 0 }}>Idea builders</span>{BUILDERS.map(b => <button key={b.name} className="sec" onClick={() => addBuilder(b)}>{b.name}</button>)}</div>
      </div>

      <div className="row bsclaude">
        <button className="bigbtn" onClick={openClaude}>Brainstorm in Claude</button>
        <div style={{ position: 'relative' }}>
          <button className="bigbtn alt" onClick={() => setMenu(!menu)}>Send this board to Claude</button>
          {menu && <div className="menu">
            <button onClick={() => sendToClaude('expand')}><b>Expand</b><span>3 stronger options per idea</span></button>
            <button onClick={() => sendToClaude('debrief')}><b>Debrief</b><span>Themes, gaps, what to test first</span></button>
            <button onClick={() => sendToClaude('execute')}><b>Execute</b><span>Copy, hooks and a task list</span></button>
          </div>}
        </div>
      </div>

      <div className="wb" ref={wrap}>
        <div className="wbin">
          {!notes.length && <div className="sub" style={{ position: 'absolute', left: 40, top: 40 }}>Empty board. Add a sticky or start with an idea builder.</div>}
          {notes.map(n => n.kind === 'label'
            ? <div key={n.id} className="lab" style={{ left: n.x, top: n.y }} onPointerDown={e => down(e, n)} onPointerMove={move} onPointerUp={up}>
                <input value={n.text} onFocus={() => (edit.current = n.id)} onBlur={() => { edit.current = null; upsert(n); }} onChange={e => setNotes(ns => ns.map(x => x.id === n.id ? { ...x, text: e.target.value } : x))} />
                <button className="x" onClick={() => del(n.id)}>×</button>
              </div>
            : <div key={n.id} className="st" style={{ left: n.x, top: n.y, background: COLORS[n.color] || COLORS.yellow }} onPointerDown={e => down(e, n)} onPointerMove={move} onPointerUp={up}>
                <div className="sth"><span>{n.label || 'Idea'}</span><span><button className="x" title="Send to Tasks" onClick={() => toTask(n)}>→</button><button className="x" onClick={() => del(n.id)}>×</button></span></div>
                <textarea rows={4} value={n.text} placeholder="Type…" autoFocus={edit.current === n.id} onFocus={() => (edit.current = n.id)} onBlur={() => { edit.current = null; upsert(notesRef.current.find(x => x.id === n.id) || n); }} onChange={e => setNotes(ns => ns.map(x => x.id === n.id ? { ...x, text: e.target.value } : x))} />
              </div>)}
        </div>
      </div>
    </div>
  );
}
