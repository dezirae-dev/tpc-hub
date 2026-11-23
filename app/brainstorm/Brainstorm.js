'use client';
import { useEffect, useRef, useState } from 'react';
export default function Brainstorm() {
  const [msgs, setMsgs] = useState([]), [text, setText] = useState(''), [busy, setBusy] = useState(false), [sent, setSent] = useState('');
  const end = useRef();
  useEffect(() => { fetch('/api/brainstorm').then(r => r.json()).then(setMsgs); }, []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);
  async function send() {
    if (!text.trim() || busy) return;
    const t = text; setText(''); setBusy(true); setMsgs([...msgs, { role: 'user', content: t }]);
    const r = await fetch('/api/brainstorm', { method: 'POST', body: JSON.stringify({ text: t }) });
    setMsgs(await r.json()); setBusy(false);
  }
  async function toTask(m) {
    const bs = await fetch('/api/tasks').then(r => r.json()); const b = bs[0];
    await fetch('/api/tasks', { method: 'POST', body: JSON.stringify({ boardId: b.id, idList: b.lists[0].id, name: m.content.split('\n')[0].slice(0, 90), desc: m.content }) });
    setSent('Added to Tasks'); setTimeout(() => setSent(''), 2500);
  }
  return (
    <div className="stack">
      <div className="head"><div><h1>Brainstorm</h1><div className="sub">Shared thread for you and Jordana. It sees your live ad and lead numbers and follows the TPC copy rules.</div></div>
        <div className="row"><span className="sub">{sent}</span><button className="sec" onClick={async () => { await fetch('/api/brainstorm', { method: 'DELETE' }); setMsgs([]); }}>New chat</button></div></div>
      <div className="chat">
        {!msgs.length && <div className="card sub">Try: "Give me 5 hooks for a Sage ad that mentions the Intracoastal views" or "Why is South Flagler costing $100 per lead?"</div>}
        {msgs.map((m, i) => <div key={i}><div className={'msg ' + (m.role === 'user' ? 'u' : 'a')}>{m.content}</div>{m.role === 'assistant' && <button className="sec mini" style={{ marginTop: 6 }} onClick={() => toTask(m)}>Send to Tasks</button>}</div>)}
        {busy && <div className="msg a sub">Thinking…</div>}<div ref={end} />
      </div>
      <div className="row"><textarea rows={3} style={{ flex: 1, minWidth: 240 }} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }} placeholder="Ask anything. Cmd/Ctrl+Enter to send." /><button onClick={send} disabled={busy}>Send</button></div>
    </div>
  );
}
