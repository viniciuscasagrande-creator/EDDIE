# EDDIE 11.17 — Especificação Técnica: Comercial + Produtores + Negociações Enterprise

**Data:** 24/09/2026  
**Status:** Em Implementação  
**Escopo:** CRM B2B, Carteira de Produtores, Negociações de Taxas por Evento, Spread, Advanced, Contratos, Agências de Turismo e Relatórios.

---

## 1. Princípios e Regras Invioláveis

1. **Cliente Comercial = Exclusivamente Produtor B2B:**
   Comprador final, participante e portador de ingresso pertencem exclusivamente ao SAC/Atendimento e nunca ao CRM Comercial.
2. **Condições por Evento:**
   O produtor pode ter uma condição geral negociada, mas cada evento pode possuir suas regras específicas:
   - Taxa de Serviço/Conveniência: Percentual (%) OU Fixa por Ingresso (R$) OU Mista com Mínimo Garantido.
   - Taxa de Processamento Adquirente (Cartão/PIX).
   - Prazo de Liquidação/Repasse (D+X).
3. **Spread, Advanced e Retenção Técnica:**
   - Comercial pactua o limite de antecipação (ex.: 40%), a taxa de spread/antecipação (ex.: 1.8% a.m.) e o percentual de retenção para contingência (ex.: 15%).
   - Financeiro executa o repasse/antecipação e o Ledger registra os lançamentos contábeis.
4. **Parceiros B2B & Agências de Turismo:**
   - Distribuição de ingressos/pacotes para agências de turismo e operadoras.
   - Modelos de comissão direta ou preço líquido (net) com margem comercial.
   - Emissão e liquidação de vouchers B2B.

---

## 2. Estrutura dos Módulos (11.17.1 a 11.17.10)

| Módulo | Nome | Componente / Funcionalidade |
|---|---|---|
| **11.17.1** | Dashboard Comercial | KPIs agregados, GMV no pipeline, contratos vigentes, ranking de executivos e simulador de taxas. |
| **11.17.2** | Central de Produtores | Cadastro empresarial completo, CNPJ, responsáveis legais e financeiros, validação documental e status de homologação. |
| **11.17.3** | Pipeline + CRM B2B | Funil Kanban em 7 etapas oficiais (`Lead` → `Qualificação` → `Proposta` → `Negociação` → `Contrato` → `Implantação` → `Ativo`), cálculo ponderado e histórico de etapas. |
| **11.17.4** | Negociação por Evento | Regras individuais de remuneração da DiskIngressos por evento: % vs R$ fixo por ingresso, adquirente e prazos. |
| **11.17.5** | Spread & Advanced | Cadastro, análise de risco e aprovação de limites de adiantamento, taxa de antecipação e reserva de contingência. |
| **11.17.6** | Propostas & Contratos | Versionamento de propostas (v1, v2), minutas contratuais, aprovação interna (Diretoria Comercial/Jurídica) e aceite digital. |
| **11.17.7** | Produtor → Eventos | Visão consolidada de organizadores: lista de eventos, status operacional, receita agregada (LTV) e condições ativas. |
| **11.17.8** | Agências & Turismo B2B | Gestão de operadoras de turismo, cotas de ingressos por agência, comissões, vouchers e liquidação. |
| **11.17.9** | Relatórios Comerciais | Relatórios analíticos de desempenho comercial, conversão do funil, ranking de organizadores e rentabilidade de taxas. |
| **11.17.10** | Endpoints BFF & QA | Suporte no BFF Next.js (`/api/comercial/*`), testes unitários Vitest e validação visual Playwright em todas as resoluções. |
