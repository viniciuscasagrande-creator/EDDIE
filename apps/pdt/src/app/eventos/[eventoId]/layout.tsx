import { EventOsShell } from '../../../components/eventos/EventOsShell';
import { EventRouteContextSync } from '../../../components/eventos/EventRouteContextSync';
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{eventoId:string}>}){
 const {eventoId}=await params;
 return <><EventRouteContextSync eventoId={eventoId}/><EventOsShell eventoId={eventoId}>{children}</EventOsShell></>;
}
