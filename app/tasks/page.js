import Tasks from './Tasks';
import { trelloOn } from '../../lib/tasks';
export const dynamic = 'force-dynamic';
export default function Page() { return <Tasks trello={trelloOn()} />; }
