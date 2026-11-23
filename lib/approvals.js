import { get, set } from './store';
export const listPackages = () => get('approvals:packages', []);
export const savePackages = v => set('approvals:packages', v);
export const listDecisions = () => get('approvals:decisions', {});
export const saveDecisions = v => set('approvals:decisions', v);
// status: pending (no decision for this rev), approved, changes, rejected, hold, live, paused
export function withStatus(pkgs, decisions) {
  return pkgs.map(p => {
    if (p.state === 'live' || p.state === 'paused') return { ...p, status: p.state };
    const d = decisions[p.id];
    if (p.hold && d?.decision === 'changes') return { ...p, status: 'changes', decision: d };
    if (!d || (d.rev || 0) < (p.rev || 1)) return { ...p, status: 'pending' };
    return { ...p, status: d.decision === 'approved' ? 'approved' : d.decision, decision: d };
  });
}
export const getEdits = () => get('approvals:edits', {});
export const saveEdits = v => set('approvals:edits', v);
export async function slack(text, { channel, tagUser } = {}) {
  const tok = process.env.SLACK_BOT_TOKEN;
  if (!tok) return false;
  const u = tagUser === undefined ? process.env.SLACK_NOTIFY_USER : tagUser;
  const user = u ? `<@${u}> ` : '';
  const r = await fetch('https://slack.com/api/chat.postMessage', { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify({ channel: channel || process.env.SLACK_CHANNEL_ID, text: user + text }) });
  return (await r.json()).ok;
}
