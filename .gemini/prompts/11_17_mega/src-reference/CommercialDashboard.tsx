export function CommercialDashboard(){
 const cards=['Produtores ativos','Eventos contratados','Negociações abertas','Contratos pendentes','Volume vendido','Receita de taxas'];
 return <main className="space-y-4">
  <header><h1 className="text-2xl font-semibold">Comercial</h1><p>Produtores, negociações, contratos e desempenho comercial.</p></header>
  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
   {cards.map(x=><article key={x} className="rounded-xl border p-4"><span>{x}</span><strong className="mt-2 block text-2xl">—</strong></article>)}
  </section>
  <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
   <article className="min-h-80 rounded-xl border p-4"><h2>Pipeline comercial</h2></article>
   <article className="rounded-xl border p-4"><h2>Atalhos</h2></article>
  </section>
 </main>;
}
