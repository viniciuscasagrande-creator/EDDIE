# Plano de migração funcional

## Etapa A — Descoberta
1. Localizar implementações atuais/legadas de Marketing e Remarketing.
2. Ler router, menus, componentes, services, hooks, stores, schemas e endpoints.
3. Usar o vídeo como baseline visual/funcional.
4. Criar matriz LEGADO → EDDIE por função.

## Etapa B — Portabilidade
Classificar cada função:
- REUTILIZAR: já existe e funciona.
- MIGRAR: existe no legado e falta no EDDIE.
- CORRIGIR: existe no EDDIE mas perdeu função.
- UNIFICAR: duplicada.
- BLOQUEADA: depende de provider/API/credencial.
Nunca classificar BLOQUEADA como concluída.

## Etapa C — Contexto
Toda operação deve conhecer producerId e, quando aplicável, eventId.
Visão global agrega somente eventos autorizados do produtor.
Event OS mostra somente o evento selecionado.

## Etapa D — Dados
Preservar integrações existentes. Não criar dados demonstrativos em produção.
Provider desconectado = estado de conexão, não KPI fictício.

## Etapa E — Paridade
Uma tela só passa quando as funções úteis do legado/vídeo possuem destino equivalente no EDDIE.
