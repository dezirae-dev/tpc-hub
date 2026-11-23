import { cookies } from 'next/headers';
export const USERS = ['Dezirae', 'Jordana'];
export async function who() { const v = (await cookies()).get('tpc_user')?.value; return USERS.includes(v) ? v : null; }
