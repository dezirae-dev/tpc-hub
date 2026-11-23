import './globals.css';
import Link from 'next/link';
import { cookies } from 'next/headers';
import WhoBar from '../components/WhoBar';
import { who } from '../lib/user';

export const metadata = { title: 'TPC Hub', description: 'The Premier Connection internal hub' };
const links = [['/', 'Home'], ['/approvals', 'Ad approvals'], ['/leads', 'Leads'], ['/sources', 'Sources & costs'], ['/traffic', 'Traffic'], ['/tasks', 'Tasks'], ['/brainstorm', 'Brainstorm'], ['/performance', 'My performance']];

export default async function Root({ children }) {
  const authed = !!(await cookies()).get('tpc_session'), user = await who();
  return (
    <html lang="en"><head>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gilda+Display&family=Montserrat:wght@400;500;600&display=swap" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
    </head><body>
      {authed ? (
        <div className="shell">
          <nav className="nav">
            <div className="brand">The Premier Connection</div>
            {links.map(([h, t]) => <Link key={h} href={h}>{t}</Link>)}
            <div className="sp" />
            <WhoBar user={user} />
            <form action="/api/logout" method="post"><button className="sec mini" style={{ width: '100%' }}>Sign out</button></form>
          </nav>
          <main className="main">{children}</main>
        </div>
      ) : children}
    </body></html>
  );
}
