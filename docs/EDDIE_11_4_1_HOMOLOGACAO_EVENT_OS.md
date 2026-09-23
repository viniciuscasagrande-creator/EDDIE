# EDDIE 11.4.1 — Homologação Visual e Funcional do Event OS

Baseline: EDDIE 11.4 enviado pelo usuário.

## Correções
- Menu global renomeado para **Todos os Eventos**.
- Modo Evento preservado com sidebar individual.
- A rota `/eventos/:eventoId/*` sincroniza o evento da URL com o contexto global.
- Bootstrap deixa de recriar callback por mudança de evento e possui timeout explícito de 6,5 s.
- Tela Eventos deixa de permanecer silenciosamente carregando quando o contexto do produtor não foi resolvido.
- Header diferencia contexto operacional de contexto indisponível.
- Novo `/api/event-os/status` para verificar configuração e rotas do Event OS.

## Homologação obrigatória
1. `/api/event-os/status`
2. `/api/bootstrap`
3. `/eventos`
4. abrir um evento e confirmar `/eventos/<id>/dashboard`
5. navegar por Ingressos, Mapa, Financeiro, Marketing, Remarketing, Relatórios e Detalhes.

Nenhum mock de evento foi criado. Se `PRODUTOR_ID` ou `API_INTERNAL_URL` não estiverem configurados, o sistema deve mostrar erro explícito em vez de loading infinito.
