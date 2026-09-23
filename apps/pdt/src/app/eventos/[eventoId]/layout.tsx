import { EventOsShell } from '../../../components/eventos/EventOsShell';
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{eventoId:string}>}){const {eventoId}=await params;return <EventOsShell eventoId={eventoId}>{children}</EventOsShell>}
