type Step={id:string;label:string;kind:'GATILHO'|'CONDICAO'|'ESPERA'|'ACAO'};
export function JourneyBuilder({steps}:{steps:Step[]}){
 return <section className="rounded-xl border p-4">
  <header><h2>Construtor de Jornada</h2></header>
  <div className="mt-4 space-y-3">
   {steps.map((s,i)=><div key={s.id}>
    <div className="rounded-lg border p-3"><small>{s.kind}</small><strong className="block">{s.label}</strong></div>
    {i<steps.length-1&&<div className="py-1 text-center">↓</div>}
   </div>)}
  </div>
 </section>;
}
