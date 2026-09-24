export function ProducerWorkspace(){
 return <main className="space-y-4">
  <header><h1 className="text-2xl font-semibold">Produtor</h1><p>Cadastro, contatos, eventos, negociações, contratos e condições.</p></header>
  <nav className="flex flex-wrap gap-2">{['Visão Geral','Eventos','Negociações','Contratos','Documentos','Financeiro'].map(x=><button key={x}>{x}</button>)}</nav>
  <section className="grid gap-4 lg:grid-cols-2"><article className="rounded-xl border p-4">Eventos do produtor</article><article className="rounded-xl border p-4">Situação comercial</article></section>
 </main>;
}
