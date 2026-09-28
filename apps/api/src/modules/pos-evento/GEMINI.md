# Pós-Evento e Histórico do Público — GEMINI.md

> Contexto do módulo `pos-evento` (EDDIE 11.29.5).

## O que é este módulo

O módulo **Pós-Evento e Histórico do Público** fecha o ciclo operacional do EDDIE conectando:
**Venda ≠ ingresso emitido ≠ pessoa que realmente compareceu.**

Trabalha prioritariamente com **presença efetivamente validada na portaria** (e não meramente compradores de pedidos).
Constrói a visão longitudinal de **Perfil do Público + Histórico de Relacionamento** (Customer Relationship Graph) e governa a comunicação com **LGPD antes do botão Enviar**, segmentações dinâmicas, pesquisas estruturadas com notas/feedbacks e métricas de campanhas com controle de custos.

## Schema Postgres

- `posevento`

## Principais Modelos

- `PerfilPublico`: Perfil unificado desduplicado deterministicamente.
- `IdentidadePublico`: Vínculos de identificação (CPF, passaporte, telefone, e-mail) mantendo origem.
- `ContatoPublico`: Canais de contato (WhatsApp, E-mail, SMS) e flags de opt-out.
- `ParticipacaoEvento`: Presença real por ingresso e validação na portaria.
- `HistoricoRelacionamento`: Grafo temporal de relacionamento com eventos.
- `ConsentimentoComunicacao` / `BloqueioComunicacao`: Governança LGPD e Lista Central de Bloqueio.
- `SegmentoPublico`: Filtros e segmentações salvas para campanhas e remarketing.
- `PesquisaPosEvento` / `PerguntaPesquisa` / `RespostaPesquisa`: Pesquisas com modelos prontos e notas 1-5 / NPS.
- `TabelaPrecoComunicacao` / `CampanhaPosEvento` / `EnvioCampanha`: Precificação dinâmica e campanhas pós-evento com trava de aprovação.

## Invariantes Invioláveis

1. **Apenas Presença Efetiva no Pós-Evento Principal:** A base do público é derivada de `Ingresso` + `Check-in válido` na portaria do evento.
2. **Comprador ≠ Participante:** Ingressos sem titular identificado individualmente não geram identidades inventadas.
3. **LGPD Obrigatória:** Comunicação só ocorre com consentimento comprovado e ausência de bloqueio no canal.
4. **Isolamento de Produtor:** Produtores só têm acesso aos dados e histórico dos seus próprios eventos.
5. **Aprovação Financeira:** Campanhas com custo total superior ao limite (R$ 5.000,00) exigem aprovação explícita antes do envio.
