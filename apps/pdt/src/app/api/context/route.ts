// EDDIE 11.2: unifica context e bootstrap (eventsReachable gerenciado pelo bootstrap)
import { GET as bootstrap } from '../bootstrap/route';
export const dynamic = 'force-dynamic';
export async function GET(){ return bootstrap(); }
