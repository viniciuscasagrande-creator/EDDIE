export function AgencyDistribution(){
 return <main className="space-y-4">
  <header><h1 className="text-2xl font-semibold">Agências e Parceiros</h1><p>Distribuição B2B de ingressos e pacotes.</p></header>
  <section className="grid gap-4 lg:grid-cols-3">
   {['Agências credenciadas','Cotas/Disponibilidade','Vendas por parceiro'].map(x=><article key={x} className="rounded-xl border p-4"><h2>{x}</h2></article>)}
  </section>
 </main>;
}
