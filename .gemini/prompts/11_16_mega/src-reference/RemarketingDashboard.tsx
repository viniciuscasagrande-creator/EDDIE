export function RemarketingDashboard(){
 return <main className="space-y-4">
  <header><h1 className="text-2xl font-semibold">Remarketing</h1><p>Recuperação, públicos, jornadas e conversões.</p></header>
  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
   {['Públicos ativos','Carrinhos abandonados','Recuperados','Receita recuperada'].map(x=>
    <article key={x} className="rounded-xl border p-4"><span>{x}</span><strong className="block text-2xl">—</strong></article>)}
  </section>
  <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
   <article className="min-h-80 rounded-xl border p-4"><h2>Funil de recuperação</h2></article>
   <article className="rounded-xl border p-4"><h2>Jornadas ativas</h2></article>
  </section>
 </main>;
}
