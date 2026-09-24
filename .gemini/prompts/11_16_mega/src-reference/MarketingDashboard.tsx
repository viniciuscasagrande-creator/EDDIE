type Metric={label:string;value:string;detail?:string};
export function MarketingDashboard({metrics=[]}:{metrics?:Metric[]}) {
 return <main className="space-y-4">
  <header><h1 className="text-2xl font-semibold">Marketing</h1><p>Desempenho, campanhas e conversões do evento.</p></header>
  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
   {metrics.map(m=><article key={m.label} className="rounded-xl border p-4">
    <span className="text-sm opacity-70">{m.label}</span><strong className="mt-2 block text-2xl">{m.value}</strong>
    {m.detail&&<small>{m.detail}</small>}
   </article>)}
  </section>
  <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
   <article className="min-h-80 rounded-xl border p-4"><h2>Desempenho por período</h2></article>
   <article className="rounded-xl border p-4"><h2>Canais e integrações</h2></article>
  </section>
  <section className="grid gap-4 lg:grid-cols-2">
   <article className="rounded-xl border p-4"><h2>Campanhas</h2></article>
   <article className="rounded-xl border p-4"><h2>Conversões e atribuição</h2></article>
  </section>
 </main>;
}
