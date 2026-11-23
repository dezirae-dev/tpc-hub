// Trello two-way when keys exist; otherwise a built-in board stored in the hub.
import { get, set } from './store';
import { sampleBoard } from './sample';
const T = 'https://api.trello.com/1';
const auth = () => `key=${process.env.TRELLO_KEY}&token=${process.env.TRELLO_TOKEN}`;
export const trelloOn = () => !!(process.env.TRELLO_KEY && process.env.TRELLO_TOKEN);

async function boardIds() {
  if (process.env.TRELLO_BOARD_IDS) return process.env.TRELLO_BOARD_IDS.split(',').map(s => s.trim());
  const bs = await fetch(`${T}/members/me/boards?filter=open&fields=name&${auth()}`).then(r => r.json());
  return bs.filter(b => /tpc|premier connection/i.test(b.name)).map(b => b.id);
}
export async function getBoards() {
  if (!trelloOn()) return [await get('tasks:local', sampleBoard)];
  const out = [];
  for (const id of await boardIds()) {
    const b = await fetch(`${T}/boards/${id}?fields=name,url&lists=open&list_fields=name&cards=open&card_fields=name,desc,idList,due,dueComplete,url,labels&${auth()}`, { cache: 'no-store' }).then(r => r.json());
    out.push({ id, name: b.name, url: b.url, source: 'trello', lists: b.lists, cards: b.cards });
  }
  return out;
}
export async function createCard(boardId, idList, name, desc = '', due = null) {
  if (!trelloOn()) {
    const b = await get('tasks:local', sampleBoard);
    b.cards.unshift({ id: 'c' + Date.now(), name, desc, idList, due });
    return set('tasks:local', b);
  }
  const p = new URLSearchParams({ idList, name, desc, ...(due ? { due } : {}) });
  return fetch(`${T}/cards?${p}&${auth()}`, { method: 'POST' }).then(r => r.json());
}
export async function updateCard(boardId, id, patch) {
  if (!trelloOn()) {
    const b = await get('tasks:local', sampleBoard);
    b.cards = b.cards.map(c => (c.id === id ? { ...c, ...patch } : c));
    return set('tasks:local', b);
  }
  const p = new URLSearchParams(Object.entries(patch).map(([k, v]) => [k, String(v)]));
  return fetch(`${T}/cards/${id}?${p}&${auth()}`, { method: 'PUT' }).then(r => r.json());
}
