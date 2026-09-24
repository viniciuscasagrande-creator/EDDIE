# Relatório de QA Visual Automatizado — EDDIE 11.15.3

**Data de Execução:** 2026-09-24T18:19:32.760Z  
**Alvo Testado:** http://localhost:3001  
**Total de Testes:** 172  

---

### Resumo por Classificação

| Classificação | Quantidade | Percentual |
|---|:---:|:---:|
| **OK** | 172 | 100.0% |
| **TELA_BRANCA** | 0 | 0.0% |
| **404** | 0 | 0.0% |
| **ERRO_JS** | 0 | 0.0% |
| **API_FALHOU** | 0 | 0.0% |
| **SEM_DADOS** | 0 | 0.0% |
| **OVERFLOW** | 0 | 0.0% |

---

### Matriz Detalhada por Rota e Resolução

| Resolução | Rota | Nome | Classificação | Status HTTP | Duração | Detalhes |
|---|---|---|:---:|:---:|:---:|---|
| 1920x1080 | `/` | Visão Geral (Home) | **OK** | 200 | 627ms | — |
| 1920x1080 | `/operacao` | Central Operacional | **OK** | 200 | 601ms | — |
| 1920x1080 | `/operacao/alertas` | Alertas Operacionais | **OK** | 200 | 622ms | — |
| 1920x1080 | `/operacao/incidentes` | Gestão de Incidentes | **OK** | 200 | 684ms | — |
| 1920x1080 | `/operacao/hardening` | Hardening & Segurança | **OK** | 200 | 597ms | — |
| 1920x1080 | `/operacao/e2e` | Ciclo E2E & Go-Live | **OK** | 200 | 517ms | — |
| 1920x1080 | `/automacoes` | Central de Automações | **OK** | 200 | 559ms | — |
| 1920x1080 | `/automacoes/regras` | Regras Operacionais | **OK** | 200 | 562ms | — |
| 1920x1080 | `/automacoes/execucoes` | Execuções de Automações | **OK** | 200 | 513ms | — |
| 1920x1080 | `/automacoes/aprovacoes` | Aprovações Pendentes | **OK** | 200 | 537ms | — |
| 1920x1080 | `/eventos` | Todos os Eventos | **OK** | 200 | 526ms | — |
| 1920x1080 | `/eventos/novo` | Criar Evento | **OK** | 200 | 549ms | — |
| 1920x1080 | `/financeiro` | Financeiro & Ledger | **OK** | 200 | 532ms | — |
| 1920x1080 | `/financeiro/conciliacao` | Conciliação Financeira | **OK** | 200 | 528ms | — |
| 1920x1080 | `/contabilidade` | Contabilidade & DRE | **OK** | 200 | 514ms | — |
| 1920x1080 | `/estorno` | Estornos & CDC | **OK** | 200 | 524ms | — |
| 1920x1080 | `/comercial` | Comercial B2B | **OK** | 200 | 525ms | — |
| 1920x1080 | `/marketing` | Marketing | **OK** | 200 | 550ms | — |
| 1920x1080 | `/remarketing` | Remarketing | **OK** | 200 | 538ms | — |
| 1920x1080 | `/relatorios` | Central de Relatórios | **OK** | 200 | 548ms | — |
| 1920x1080 | `/sac` | Atendimento SAC | **OK** | 200 | 615ms | — |
| 1920x1080 | `/suporte` | Suporte de Campo | **OK** | 200 | 506ms | — |
| 1920x1080 | `/diagnostico` | Diagnóstico & Status | **OK** | 200 | 508ms | — |
| 1920x1080 | `/eventos/evento-operacao/operacao` | Evento: Operação Ao Vivo | **OK** | 200 | 673ms | — |
| 1920x1080 | `/eventos/evento-operacao/cockpit` | Evento: Cockpit Executivo | **OK** | 200 | 616ms | — |
| 1920x1080 | `/eventos/evento-operacao/cockpit/comparativos` | Evento: Comparativos | **OK** | 200 | 564ms | — |
| 1920x1080 | `/eventos/evento-operacao/inteligencia` | Evento: Inteligência | **OK** | 200 | 569ms | — |
| 1920x1080 | `/eventos/evento-operacao/inteligencia/anomalias` | Evento: Anomalias e Risco | **OK** | 200 | 635ms | — |
| 1920x1080 | `/eventos/evento-operacao/inteligencia/financeira` | Evento: Inteligência Fin. | **OK** | 200 | 569ms | — |
| 1920x1080 | `/eventos/evento-operacao/inteligencia/previsoes` | Evento: Previsões | **OK** | 200 | 592ms | — |
| 1920x1080 | `/eventos/evento-operacao/dashboard` | Evento: Dashboard | **OK** | 200 | 584ms | — |
| 1920x1080 | `/eventos/evento-operacao/ingressos` | Evento: Ingressos | **OK** | 200 | 563ms | — |
| 1920x1080 | `/eventos/evento-operacao/portaria` | Evento: Portaria | **OK** | 200 | 561ms | — |
| 1920x1080 | `/eventos/evento-operacao/antifraude` | Evento: Antifraude | **OK** | 200 | 579ms | — |
| 1920x1080 | `/eventos/evento-operacao/mapa` | Evento: Mapa de Assentos | **OK** | 200 | 564ms | — |
| 1920x1080 | `/eventos/evento-operacao/cortesias` | Evento: Cortesias | **OK** | 200 | 556ms | — |
| 1920x1080 | `/eventos/evento-operacao/financeiro` | Evento: Financeiro | **OK** | 200 | 564ms | — |
| 1920x1080 | `/eventos/evento-operacao/marketing` | Evento: Marketing | **OK** | 200 | 591ms | — |
| 1920x1080 | `/eventos/evento-operacao/remarketing` | Evento: Remarketing | **OK** | 200 | 574ms | — |
| 1920x1080 | `/eventos/evento-operacao/sala-situacao` | Evento: Sala de Situação | **OK** | 200 | 584ms | — |
| 1920x1080 | `/eventos/evento-operacao/hardening` | Evento: Hardening | **OK** | 200 | 545ms | — |
| 1920x1080 | `/eventos/evento-operacao/e2e` | Evento: Ciclo E2E | **OK** | 200 | 564ms | — |
| 1920x1080 | `/eventos/evento-operacao/relatorios` | Evento: Relatórios | **OK** | 200 | 556ms | — |
| 1440x900 | `/` | Visão Geral (Home) | **OK** | 200 | 516ms | — |
| 1440x900 | `/operacao` | Central Operacional | **OK** | 200 | 544ms | — |
| 1440x900 | `/operacao/alertas` | Alertas Operacionais | **OK** | 200 | 570ms | — |
| 1440x900 | `/operacao/incidentes` | Gestão de Incidentes | **OK** | 200 | 576ms | — |
| 1440x900 | `/operacao/hardening` | Hardening & Segurança | **OK** | 200 | 517ms | — |
| 1440x900 | `/operacao/e2e` | Ciclo E2E & Go-Live | **OK** | 200 | 506ms | — |
| 1440x900 | `/automacoes` | Central de Automações | **OK** | 200 | 496ms | — |
| 1440x900 | `/automacoes/regras` | Regras Operacionais | **OK** | 200 | 522ms | — |
| 1440x900 | `/automacoes/execucoes` | Execuções de Automações | **OK** | 200 | 512ms | — |
| 1440x900 | `/automacoes/aprovacoes` | Aprovações Pendentes | **OK** | 200 | 551ms | — |
| 1440x900 | `/eventos` | Todos os Eventos | **OK** | 200 | 548ms | — |
| 1440x900 | `/eventos/novo` | Criar Evento | **OK** | 200 | 529ms | — |
| 1440x900 | `/financeiro` | Financeiro & Ledger | **OK** | 200 | 532ms | — |
| 1440x900 | `/financeiro/conciliacao` | Conciliação Financeira | **OK** | 200 | 532ms | — |
| 1440x900 | `/contabilidade` | Contabilidade & DRE | **OK** | 200 | 575ms | — |
| 1440x900 | `/estorno` | Estornos & CDC | **OK** | 200 | 542ms | — |
| 1440x900 | `/comercial` | Comercial B2B | **OK** | 200 | 496ms | — |
| 1440x900 | `/marketing` | Marketing | **OK** | 200 | 568ms | — |
| 1440x900 | `/remarketing` | Remarketing | **OK** | 200 | 536ms | — |
| 1440x900 | `/relatorios` | Central de Relatórios | **OK** | 200 | 538ms | — |
| 1440x900 | `/sac` | Atendimento SAC | **OK** | 200 | 540ms | — |
| 1440x900 | `/suporte` | Suporte de Campo | **OK** | 200 | 517ms | — |
| 1440x900 | `/diagnostico` | Diagnóstico & Status | **OK** | 200 | 526ms | — |
| 1440x900 | `/eventos/evento-operacao/operacao` | Evento: Operação Ao Vivo | **OK** | 200 | 575ms | — |
| 1440x900 | `/eventos/evento-operacao/cockpit` | Evento: Cockpit Executivo | **OK** | 200 | 579ms | — |
| 1440x900 | `/eventos/evento-operacao/cockpit/comparativos` | Evento: Comparativos | **OK** | 200 | 578ms | — |
| 1440x900 | `/eventos/evento-operacao/inteligencia` | Evento: Inteligência | **OK** | 200 | 601ms | — |
| 1440x900 | `/eventos/evento-operacao/inteligencia/anomalias` | Evento: Anomalias e Risco | **OK** | 200 | 696ms | — |
| 1440x900 | `/eventos/evento-operacao/inteligencia/financeira` | Evento: Inteligência Fin. | **OK** | 200 | 590ms | — |
| 1440x900 | `/eventos/evento-operacao/inteligencia/previsoes` | Evento: Previsões | **OK** | 200 | 588ms | — |
| 1440x900 | `/eventos/evento-operacao/dashboard` | Evento: Dashboard | **OK** | 200 | 567ms | — |
| 1440x900 | `/eventos/evento-operacao/ingressos` | Evento: Ingressos | **OK** | 200 | 558ms | — |
| 1440x900 | `/eventos/evento-operacao/portaria` | Evento: Portaria | **OK** | 200 | 555ms | — |
| 1440x900 | `/eventos/evento-operacao/antifraude` | Evento: Antifraude | **OK** | 200 | 548ms | — |
| 1440x900 | `/eventos/evento-operacao/mapa` | Evento: Mapa de Assentos | **OK** | 200 | 564ms | — |
| 1440x900 | `/eventos/evento-operacao/cortesias` | Evento: Cortesias | **OK** | 200 | 550ms | — |
| 1440x900 | `/eventos/evento-operacao/financeiro` | Evento: Financeiro | **OK** | 200 | 548ms | — |
| 1440x900 | `/eventos/evento-operacao/marketing` | Evento: Marketing | **OK** | 200 | 593ms | — |
| 1440x900 | `/eventos/evento-operacao/remarketing` | Evento: Remarketing | **OK** | 200 | 594ms | — |
| 1440x900 | `/eventos/evento-operacao/sala-situacao` | Evento: Sala de Situação | **OK** | 200 | 576ms | — |
| 1440x900 | `/eventos/evento-operacao/hardening` | Evento: Hardening | **OK** | 200 | 555ms | — |
| 1440x900 | `/eventos/evento-operacao/e2e` | Evento: Ciclo E2E | **OK** | 200 | 537ms | — |
| 1440x900 | `/eventos/evento-operacao/relatorios` | Evento: Relatórios | **OK** | 200 | 538ms | — |
| 1366x768 | `/` | Visão Geral (Home) | **OK** | 200 | 571ms | — |
| 1366x768 | `/operacao` | Central Operacional | **OK** | 200 | 533ms | — |
| 1366x768 | `/operacao/alertas` | Alertas Operacionais | **OK** | 200 | 540ms | — |
| 1366x768 | `/operacao/incidentes` | Gestão de Incidentes | **OK** | 200 | 552ms | — |
| 1366x768 | `/operacao/hardening` | Hardening & Segurança | **OK** | 200 | 508ms | — |
| 1366x768 | `/operacao/e2e` | Ciclo E2E & Go-Live | **OK** | 200 | 502ms | — |
| 1366x768 | `/automacoes` | Central de Automações | **OK** | 200 | 496ms | — |
| 1366x768 | `/automacoes/regras` | Regras Operacionais | **OK** | 200 | 497ms | — |
| 1366x768 | `/automacoes/execucoes` | Execuções de Automações | **OK** | 200 | 513ms | — |
| 1366x768 | `/automacoes/aprovacoes` | Aprovações Pendentes | **OK** | 200 | 488ms | — |
| 1366x768 | `/eventos` | Todos os Eventos | **OK** | 200 | 497ms | — |
| 1366x768 | `/eventos/novo` | Criar Evento | **OK** | 200 | 496ms | — |
| 1366x768 | `/financeiro` | Financeiro & Ledger | **OK** | 200 | 492ms | — |
| 1366x768 | `/financeiro/conciliacao` | Conciliação Financeira | **OK** | 200 | 520ms | — |
| 1366x768 | `/contabilidade` | Contabilidade & DRE | **OK** | 200 | 493ms | — |
| 1366x768 | `/estorno` | Estornos & CDC | **OK** | 200 | 514ms | — |
| 1366x768 | `/comercial` | Comercial B2B | **OK** | 200 | 490ms | — |
| 1366x768 | `/marketing` | Marketing | **OK** | 200 | 532ms | — |
| 1366x768 | `/remarketing` | Remarketing | **OK** | 200 | 542ms | — |
| 1366x768 | `/relatorios` | Central de Relatórios | **OK** | 200 | 516ms | — |
| 1366x768 | `/sac` | Atendimento SAC | **OK** | 200 | 523ms | — |
| 1366x768 | `/suporte` | Suporte de Campo | **OK** | 200 | 490ms | — |
| 1366x768 | `/diagnostico` | Diagnóstico & Status | **OK** | 200 | 498ms | — |
| 1366x768 | `/eventos/evento-operacao/operacao` | Evento: Operação Ao Vivo | **OK** | 200 | 541ms | — |
| 1366x768 | `/eventos/evento-operacao/cockpit` | Evento: Cockpit Executivo | **OK** | 200 | 562ms | — |
| 1366x768 | `/eventos/evento-operacao/cockpit/comparativos` | Evento: Comparativos | **OK** | 200 | 556ms | — |
| 1366x768 | `/eventos/evento-operacao/inteligencia` | Evento: Inteligência | **OK** | 200 | 576ms | — |
| 1366x768 | `/eventos/evento-operacao/inteligencia/anomalias` | Evento: Anomalias e Risco | **OK** | 200 | 615ms | — |
| 1366x768 | `/eventos/evento-operacao/inteligencia/financeira` | Evento: Inteligência Fin. | **OK** | 200 | 543ms | — |
| 1366x768 | `/eventos/evento-operacao/inteligencia/previsoes` | Evento: Previsões | **OK** | 200 | 575ms | — |
| 1366x768 | `/eventos/evento-operacao/dashboard` | Evento: Dashboard | **OK** | 200 | 529ms | — |
| 1366x768 | `/eventos/evento-operacao/ingressos` | Evento: Ingressos | **OK** | 200 | 538ms | — |
| 1366x768 | `/eventos/evento-operacao/portaria` | Evento: Portaria | **OK** | 200 | 536ms | — |
| 1366x768 | `/eventos/evento-operacao/antifraude` | Evento: Antifraude | **OK** | 200 | 533ms | — |
| 1366x768 | `/eventos/evento-operacao/mapa` | Evento: Mapa de Assentos | **OK** | 200 | 557ms | — |
| 1366x768 | `/eventos/evento-operacao/cortesias` | Evento: Cortesias | **OK** | 200 | 537ms | — |
| 1366x768 | `/eventos/evento-operacao/financeiro` | Evento: Financeiro | **OK** | 200 | 519ms | — |
| 1366x768 | `/eventos/evento-operacao/marketing` | Evento: Marketing | **OK** | 200 | 557ms | — |
| 1366x768 | `/eventos/evento-operacao/remarketing` | Evento: Remarketing | **OK** | 200 | 555ms | — |
| 1366x768 | `/eventos/evento-operacao/sala-situacao` | Evento: Sala de Situação | **OK** | 200 | 567ms | — |
| 1366x768 | `/eventos/evento-operacao/hardening` | Evento: Hardening | **OK** | 200 | 518ms | — |
| 1366x768 | `/eventos/evento-operacao/e2e` | Evento: Ciclo E2E | **OK** | 200 | 535ms | — |
| 1366x768 | `/eventos/evento-operacao/relatorios` | Evento: Relatórios | **OK** | 200 | 538ms | — |
| 390x844 | `/` | Visão Geral (Home) | **OK** | 200 | 530ms | — |
| 390x844 | `/operacao` | Central Operacional | **OK** | 200 | 473ms | — |
| 390x844 | `/operacao/alertas` | Alertas Operacionais | **OK** | 200 | 483ms | — |
| 390x844 | `/operacao/incidentes` | Gestão de Incidentes | **OK** | 200 | 483ms | — |
| 390x844 | `/operacao/hardening` | Hardening & Segurança | **OK** | 200 | 466ms | — |
| 390x844 | `/operacao/e2e` | Ciclo E2E & Go-Live | **OK** | 200 | 456ms | — |
| 390x844 | `/automacoes` | Central de Automações | **OK** | 200 | 466ms | — |
| 390x844 | `/automacoes/regras` | Regras Operacionais | **OK** | 200 | 474ms | — |
| 390x844 | `/automacoes/execucoes` | Execuções de Automações | **OK** | 200 | 469ms | — |
| 390x844 | `/automacoes/aprovacoes` | Aprovações Pendentes | **OK** | 200 | 481ms | — |
| 390x844 | `/eventos` | Todos os Eventos | **OK** | 200 | 483ms | — |
| 390x844 | `/eventos/novo` | Criar Evento | **OK** | 200 | 465ms | — |
| 390x844 | `/financeiro` | Financeiro & Ledger | **OK** | 200 | 485ms | — |
| 390x844 | `/financeiro/conciliacao` | Conciliação Financeira | **OK** | 200 | 481ms | — |
| 390x844 | `/contabilidade` | Contabilidade & DRE | **OK** | 200 | 475ms | — |
| 390x844 | `/estorno` | Estornos & CDC | **OK** | 200 | 474ms | — |
| 390x844 | `/comercial` | Comercial B2B | **OK** | 200 | 466ms | — |
| 390x844 | `/marketing` | Marketing | **OK** | 200 | 491ms | — |
| 390x844 | `/remarketing` | Remarketing | **OK** | 200 | 479ms | — |
| 390x844 | `/relatorios` | Central de Relatórios | **OK** | 200 | 481ms | — |
| 390x844 | `/sac` | Atendimento SAC | **OK** | 200 | 468ms | — |
| 390x844 | `/suporte` | Suporte de Campo | **OK** | 200 | 454ms | — |
| 390x844 | `/diagnostico` | Diagnóstico & Status | **OK** | 200 | 469ms | — |
| 390x844 | `/eventos/evento-operacao/operacao` | Evento: Operação Ao Vivo | **OK** | 200 | 509ms | — |
| 390x844 | `/eventos/evento-operacao/cockpit` | Evento: Cockpit Executivo | **OK** | 200 | 501ms | — |
| 390x844 | `/eventos/evento-operacao/cockpit/comparativos` | Evento: Comparativos | **OK** | 200 | 513ms | — |
| 390x844 | `/eventos/evento-operacao/inteligencia` | Evento: Inteligência | **OK** | 200 | 499ms | — |
| 390x844 | `/eventos/evento-operacao/inteligencia/anomalias` | Evento: Anomalias e Risco | **OK** | 200 | 501ms | — |
| 390x844 | `/eventos/evento-operacao/inteligencia/financeira` | Evento: Inteligência Fin. | **OK** | 200 | 500ms | — |
| 390x844 | `/eventos/evento-operacao/inteligencia/previsoes` | Evento: Previsões | **OK** | 200 | 499ms | — |
| 390x844 | `/eventos/evento-operacao/dashboard` | Evento: Dashboard | **OK** | 200 | 502ms | — |
| 390x844 | `/eventos/evento-operacao/ingressos` | Evento: Ingressos | **OK** | 200 | 515ms | — |
| 390x844 | `/eventos/evento-operacao/portaria` | Evento: Portaria | **OK** | 200 | 516ms | — |
| 390x844 | `/eventos/evento-operacao/antifraude` | Evento: Antifraude | **OK** | 200 | 517ms | — |
| 390x844 | `/eventos/evento-operacao/mapa` | Evento: Mapa de Assentos | **OK** | 200 | 499ms | — |
| 390x844 | `/eventos/evento-operacao/cortesias` | Evento: Cortesias | **OK** | 200 | 500ms | — |
| 390x844 | `/eventos/evento-operacao/financeiro` | Evento: Financeiro | **OK** | 200 | 500ms | — |
| 390x844 | `/eventos/evento-operacao/marketing` | Evento: Marketing | **OK** | 200 | 515ms | — |
| 390x844 | `/eventos/evento-operacao/remarketing` | Evento: Remarketing | **OK** | 200 | 500ms | — |
| 390x844 | `/eventos/evento-operacao/sala-situacao` | Evento: Sala de Situação | **OK** | 200 | 504ms | — |
| 390x844 | `/eventos/evento-operacao/hardening` | Evento: Hardening | **OK** | 200 | 514ms | — |
| 390x844 | `/eventos/evento-operacao/e2e` | Evento: Ciclo E2E | **OK** | 200 | 497ms | — |
| 390x844 | `/eventos/evento-operacao/relatorios` | Evento: Relatórios | **OK** | 200 | 499ms | — |

---
*Gerado automaticamente pelo script `scripts/visual-qa-11-15-3.mjs`.*
