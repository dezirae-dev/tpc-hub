export async function sessionToken() {
  const pw = process.env.DASH_PASSWORD || '';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + '|tpc-hub-v1'));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
