'use client';
import { useEffect, useState } from 'react';
export default function Tasks({ trello }) {
  const [boards, setBoards] = useState([]), [bi, setBi] = useState(0), [name, setName] = useState(''), [due, setDue] = useState(''), [list, setList] = useState('');
  const load = () => fetch('/api/tasks').then(r => r.json()).then(setBoards);
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);
  const b = boards[bi];
  if (!b) return <div className="sub">Loading…</div>;
  const doneId = b.lists.find(l => /done|complete/i.test(l.name))?.id;
  async function add() {
    if (!name.trim()) return;
    await fetch('/api/tasks', { method: 'POST', body: JSON.stringify({ boardId: b.id, idList: list || b.lists[0].id, name, due: due || null }) });
    setName(''); setDue(''); load();
  }
  async function move(c, idList) {
    setBoards(boards.map((x, i) => (i === bi ? { ...x, cards: x.cards.map(k => (k.id === c.id ? { ...k, idList } : k)) } : x)));
    await fetch('/api/tasks', { method: 'PATCH', body: JSON.stringify({ boardId: b.id, id: c.id, patch: b.source === 'trello' ? { idList } : { idList } }) });
  }
  return (
    <div className="stack">
      <div className="head"><div><h1>Tasks</h1><div className="sub">{trello ? 'Synced with Trello. Changes here show up there.' : 'Built-in board. Add the Trello keys in Vercel to sync with your TPC boards.'}</div></div>
        <div className="row">{boards.map((x, i) => <button key={x.id} className={i === bi ? '' : 'sec'} onClick={() => setBi(i)}>{x.name}</button>)}</div></div>
      <div className="card row">
        <input style={{ flex: 3, minWidth: 220 }} placeholder="Add a task" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <select style={{ flex: 1, minWidth: 140 }} value={list} onChange={e => setList(e.target.value)}>{b.lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
        <input style={{ flex: 1, minWidth: 140 }} type="date" value={due} onChange={e => setDue(e.target.value)} />
        <button onClick={add}>Add</button>
      </div>
      <div className="board">
        {b.lists.map(l => (
          <div className="col" key={l.id}><div className="lbl">{l.name} · {b.cards.filter(c => c.idList === l.id).length}</div>
            {b.cards.filter(c => c.idList === l.id).map(c => {
              const over = c.due && l.id !== doneId && !c.dueComplete && new Date(c.due) < new Date();
              return (<div key={c.id} className={'kc ' + (over ? 'over' : '')}>
                <div>{c.url ? <a href={c.url} target="_blank" rel="noopener">{c.name}</a> : c.name}</div>
                {c.due && <div className="sub" style={over ? { color: 'var(--warn)' } : {}}>{over ? 'Overdue · ' : 'Due '}{new Date(c.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>}
                <select className="mini" style={{ marginTop: 6 }} value={c.idList} onChange={e => move(c, e.target.value)}>{b.lists.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
              </div>);
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
