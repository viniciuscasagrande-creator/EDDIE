# Relatório de QA Visual Automatizado — EDDIE 11.15.3

**Data de Execução:** 2026-09-24T19:07:04.170Z  
**Alvo Testado:** http://localhost:3001  
**Total de Testes:** 176  

---

### Resumo por Classificação

| Classificação | Quantidade | Percentual |
|---|:---:|:---:|
| **OK** | 176 | 100.0% |
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
| 1920x1080 | `/` | Visão Geral (Home) | **OK** | 200 | 595ms | — |
| 1920x1080 | `/operacao` | Central Operacional | **OK** | 200 | 559ms | — |
| 1920x1080 | `/operacao/alertas` | Alertas Operacionais | **OK** | 200 | 600ms | — |
| 1920x1080 | `/operacao/incidentes` | Gestão de Incidentes | **OK** | 200 | 622ms | — |
| 1920x1080 | `/operacao/hardening` | Hardening & Segurança | **OK** | 200 | 529ms | — |
| 1920x1080 | `/operacao/e2e` | Ciclo E2E & Go-Live | **OK** | 200 | 505ms | — |
| 1920x1080 | `/automacoes` | Central de Automações | **OK** | 200 | 520ms | — |
| 1920x1080 | `/automacoes/regras` | Regras Operacionais | **OK** | 200 | 520ms | — |
| 1920x1080 | `/automacoes/execucoes` | Execuções de Automações | **OK** | 200 | 504ms | — |
| 1920x1080 | `/automacoes/aprovacoes` | Aprovações Pendentes | **OK** | 200 | 525ms | — |
| 1920x1080 | `/eventos` | Todos os Eventos | **OK** | 200 | 531ms | — |
| 1920x1080 | `/eventos/novo` | Criar Evento | **OK** | 200 | 502ms | — |
| 1920x1080 | `/financeiro` | Financeiro & Ledger | **OK** | 200 | 528ms | — |
| 1920x1080 | `/financeiro/conciliacao` | Conciliação Financeira | **OK** | 200 | 554ms | — |
| 1920x1080 | `/contabilidade` | Contabilidade & DRE | **OK** | 200 | 524ms | — |
| 1920x1080 | `/estorno` | Estornos & CDC | **OK** | 200 | 514ms | — |
| 1920x1080 | `/comercial` | Comercial B2B | **OK** | 200 | 564ms | — |
| 1920x1080 | `/marketing` | Marketing | **OK** | 200 | 565ms | — |
| 1920x1080 | `/remarketing` | Remarketing | **OK** | 200 | 553ms | — |
| 1920x1080 | `/relatorios` | Central de Relatórios | **OK** | 200 | 554ms | — |
| 1920x1080 | `/sac` | Atendimento SAC | **OK** | 200 | 551ms | — |
| 1920x1080 | `/suporte` | Suporte de Campo | **OK** | 200 | 516ms | — |
| 1920x1080 | `/diagnostico` | Diagnóstico & Status | **OK** | 200 | 520ms | — |
| 1920x1080 | `/eventos/evento-operacao/operacao` | Evento: Operação Ao Vivo | **OK** | 200 | 608ms | — |
| 1920x1080 | `/eventos/evento-operacao/cockpit` | Evento: Cockpit Executivo | **OK** | 200 | 571ms | — |
| 1920x1080 | `/eventos/evento-operacao/cockpit/comparativos` | Evento: Comparativos | **OK** | 200 | 576ms | — |
| 1920x1080 | `/eventos/evento-operacao/inteligencia` | Evento: Inteligência | **OK** | 200 | 574ms | — |
| 1920x1080 | `/eventos/evento-operacao/inteligencia/anomalias` | Evento: Anomalias e Risco | **OK** | 200 | 641ms | — |
| 1920x1080 | `/eventos/evento-operacao/inteligencia/financeira` | Evento: Inteligência Fin. | **OK** | 200 | 564ms | — |
| 1920x1080 | `/eventos/evento-operacao/inteligencia/previsoes` | Evento: Previsões | **OK** | 200 | 590ms | — |
| 1920x1080 | `/eventos/evento-operacao/dashboard` | Evento: Dashboard | **OK** | 200 | 552ms | — |
| 1920x1080 | `/eventos/evento-operacao/ingressos` | Evento: Ingressos | **OK** | 200 | 554ms | — |
| 1920x1080 | `/eventos/evento-operacao/portaria` | Evento: Portaria | **OK** | 200 | 565ms | — |
| 1920x1080 | `/eventos/evento-operacao/antifraude` | Evento: Antifraude | **OK** | 200 | 547ms | — |
| 1920x1080 | `/eventos/evento-operacao/mapa` | Evento: Mapa de Assentos | **OK** | 200 | 571ms | — |
| 1920x1080 | `/eventos/evento-operacao/cortesias` | Evento: Cortesias | **OK** | 200 | 544ms | — |
| 1920x1080 | `/eventos/evento-operacao/financeiro` | Evento: Financeiro | **OK** | 200 | 544ms | — |
| 1920x1080 | `/eventos/evento-operacao/marketing` | Evento: Marketing | **OK** | 200 | 600ms | — |
| 1920x1080 | `/eventos/evento-operacao/remarketing` | Evento: Remarketing | **OK** | 200 | 585ms | — |
| 1920x1080 | `/eventos/evento-operacao/comercial` | Evento: Comercial B2B | **OK** | 200 | 548ms | — |
| 1920x1080 | `/eventos/evento-operacao/sala-situacao` | Evento: Sala de Situação | **OK** | 200 | 589ms | — |
| 1920x1080 | `/eventos/evento-operacao/hardening` | Evento: Hardening | **OK** | 200 | 540ms | — |
| 1920x1080 | `/eventos/evento-operacao/e2e` | Evento: Ciclo E2E | **OK** | 200 | 536ms | — |
| 1920x1080 | `/eventos/evento-operacao/relatorios` | Evento: Relatórios | **OK** | 200 | 533ms | — |
| 1440x900 | `/` | Visão Geral (Home) | **OK** | 200 | 568ms | — |
| 1440x900 | `/operacao` | Central Operacional | **OK** | 200 | 548ms | — |
| 1440x900 | `/operacao/alertas` | Alertas Operacionais | **OK** | 200 | 579ms | — |
| 1440x900 | `/operacao/incidentes` | Gestão de Incidentes | **OK** | 200 | 558ms | — |
| 1440x900 | `/operacao/hardening` | Hardening & Segurança | **OK** | 200 | 507ms | — |
| 1440x900 | `/operacao/e2e` | Ciclo E2E & Go-Live | **OK** | 200 | 475ms | — |
| 1440x900 | `/automacoes` | Central de Automações | **OK** | 200 | 485ms | — |
| 1440x900 | `/automacoes/regras` | Regras Operacionais | **OK** | 200 | 491ms | — |
| 1440x900 | `/automacoes/execucoes` | Execuções de Automações | **OK** | 200 | 500ms | — |
| 1440x900 | `/automacoes/aprovacoes` | Aprovações Pendentes | **OK** | 200 | 499ms | — |
| 1440x900 | `/eventos` | Todos os Eventos | **OK** | 200 | 502ms | — |
| 1440x900 | `/eventos/novo` | Criar Evento | **OK** | 200 | 500ms | — |
| 1440x900 | `/financeiro` | Financeiro & Ledger | **OK** | 200 | 503ms | — |
| 1440x900 | `/financeiro/conciliacao` | Conciliação Financeira | **OK** | 200 | 513ms | — |
| 1440x900 | `/contabilidade` | Contabilidade & DRE | **OK** | 200 | 477ms | — |
| 1440x900 | `/estorno` | Estornos & CDC | **OK** | 200 | 503ms | — |
| 1440x900 | `/comercial` | Comercial B2B | **OK** | 200 | 502ms | — |
| 1440x900 | `/marketing` | Marketing | **OK** | 200 | 532ms | — |
| 1440x900 | `/remarketing` | Remarketing | **OK** | 200 | 520ms | — |
| 1440x900 | `/relatorios` | Central de Relatórios | **OK** | 200 | 514ms | — |
| 1440x900 | `/sac` | Atendimento SAC | **OK** | 200 | 496ms | — |
| 1440x900 | `/suporte` | Suporte de Campo | **OK** | 200 | 484ms | — |
| 1440x900 | `/diagnostico` | Diagnóstico & Status | **OK** | 200 | 481ms | — |
| 1440x900 | `/eventos/evento-operacao/operacao` | Evento: Operação Ao Vivo | **OK** | 200 | 654ms | — |
| 1440x900 | `/eventos/evento-operacao/cockpit` | Evento: Cockpit Executivo | **OK** | 200 | 552ms | — |
| 1440x900 | `/eventos/evento-operacao/cockpit/comparativos` | Evento: Comparativos | **OK** | 200 | 545ms | — |
| 1440x900 | `/eventos/evento-operacao/inteligencia` | Evento: Inteligência | **OK** | 200 | 570ms | — |
| 1440x900 | `/eventos/evento-operacao/inteligencia/anomalias` | Evento: Anomalias e Risco | **OK** | 200 | 618ms | — |
| 1440x900 | `/eventos/evento-operacao/inteligencia/financeira` | Evento: Inteligência Fin. | **OK** | 200 | 551ms | — |
| 1440x900 | `/eventos/evento-operacao/inteligencia/previsoes` | Evento: Previsões | **OK** | 200 | 563ms | — |
| 1440x900 | `/eventos/evento-operacao/dashboard` | Evento: Dashboard | **OK** | 200 | 544ms | — |
| 1440x900 | `/eventos/evento-operacao/ingressos` | Evento: Ingressos | **OK** | 200 | 544ms | — |
| 1440x900 | `/eventos/evento-operacao/portaria` | Evento: Portaria | **OK** | 200 | 550ms | — |
| 1440x900 | `/eventos/evento-operacao/antifraude` | Evento: Antifraude | **OK** | 200 | 519ms | — |
| 1440x900 | `/eventos/evento-operacao/mapa` | Evento: Mapa de Assentos | **OK** | 200 | 525ms | — |
| 1440x900 | `/eventos/evento-operacao/cortesias` | Evento: Cortesias | **OK** | 200 | 552ms | — |
| 1440x900 | `/eventos/evento-operacao/financeiro` | Evento: Financeiro | **OK** | 200 | 542ms | — |
| 1440x900 | `/eventos/evento-operacao/marketing` | Evento: Marketing | **OK** | 200 | 580ms | — |
| 1440x900 | `/eventos/evento-operacao/remarketing` | Evento: Remarketing | **OK** | 200 | 559ms | — |
| 1440x900 | `/eventos/evento-operacao/comercial` | Evento: Comercial B2B | **OK** | 200 | 534ms | — |
| 1440x900 | `/eventos/evento-operacao/sala-situacao` | Evento: Sala de Situação | **OK** | 200 | 557ms | — |
| 1440x900 | `/eventos/evento-operacao/hardening` | Evento: Hardening | **OK** | 200 | 524ms | — |
| 1440x900 | `/eventos/evento-operacao/e2e` | Evento: Ciclo E2E | **OK** | 200 | 562ms | — |
| 1440x900 | `/eventos/evento-operacao/relatorios` | Evento: Relatórios | **OK** | 200 | 556ms | — |
| 1366x768 | `/` | Visão Geral (Home) | **OK** | 200 | 568ms | — |
| 1366x768 | `/operacao` | Central Operacional | **OK** | 200 | 518ms | — |
| 1366x768 | `/operacao/alertas` | Alertas Operacionais | **OK** | 200 | 551ms | — |
| 1366x768 | `/operacao/incidentes` | Gestão de Incidentes | **OK** | 200 | 531ms | — |
| 1366x768 | `/operacao/hardening` | Hardening & Segurança | **OK** | 200 | 499ms | — |
| 1366x768 | `/operacao/e2e` | Ciclo E2E & Go-Live | **OK** | 200 | 491ms | — |
| 1366x768 | `/automacoes` | Central de Automações | **OK** | 200 | 504ms | — |
| 1366x768 | `/automacoes/regras` | Regras Operacionais | **OK** | 200 | 490ms | — |
| 1366x768 | `/automacoes/execucoes` | Execuções de Automações | **OK** | 200 | 494ms | — |
| 1366x768 | `/automacoes/aprovacoes` | Aprovações Pendentes | **OK** | 200 | 503ms | — |
| 1366x768 | `/eventos` | Todos os Eventos | **OK** | 200 | 499ms | — |
| 1366x768 | `/eventos/novo` | Criar Evento | **OK** | 200 | 496ms | — |
| 1366x768 | `/financeiro` | Financeiro & Ledger | **OK** | 200 | 498ms | — |
| 1366x768 | `/financeiro/conciliacao` | Conciliação Financeira | **OK** | 200 | 515ms | — |
| 1366x768 | `/contabilidade` | Contabilidade & DRE | **OK** | 200 | 477ms | — |
| 1366x768 | `/estorno` | Estornos & CDC | **OK** | 200 | 492ms | — |
| 1366x768 | `/comercial` | Comercial B2B | **OK** | 200 | 486ms | — |
| 1366x768 | `/marketing` | Marketing | **OK** | 200 | 519ms | — |
| 1366x768 | `/remarketing` | Remarketing | **OK** | 200 | 501ms | — |
| 1366x768 | `/relatorios` | Central de Relatórios | **OK** | 200 | 494ms | — |
| 1366x768 | `/sac` | Atendimento SAC | **OK** | 200 | 497ms | — |
| 1366x768 | `/suporte` | Suporte de Campo | **OK** | 200 | 483ms | — |
| 1366x768 | `/diagnostico` | Diagnóstico & Status | **OK** | 200 | 492ms | — |
| 1366x768 | `/eventos/evento-operacao/operacao` | Evento: Operação Ao Vivo | **OK** | 200 | 538ms | — |
| 1366x768 | `/eventos/evento-operacao/cockpit` | Evento: Cockpit Executivo | **OK** | 200 | 529ms | — |
| 1366x768 | `/eventos/evento-operacao/cockpit/comparativos` | Evento: Comparativos | **OK** | 200 | 544ms | — |
| 1366x768 | `/eventos/evento-operacao/inteligencia` | Evento: Inteligência | **OK** | 200 | 548ms | — |
| 1366x768 | `/eventos/evento-operacao/inteligencia/anomalias` | Evento: Anomalias e Risco | **OK** | 200 | 593ms | — |
| 1366x768 | `/eventos/evento-operacao/inteligencia/financeira` | Evento: Inteligência Fin. | **OK** | 200 | 537ms | — |
| 1366x768 | `/eventos/evento-operacao/inteligencia/previsoes` | Evento: Previsões | **OK** | 200 | 546ms | — |
| 1366x768 | `/eventos/evento-operacao/dashboard` | Evento: Dashboard | **OK** | 200 | 516ms | — |
| 1366x768 | `/eventos/evento-operacao/ingressos` | Evento: Ingressos | **OK** | 200 | 513ms | — |
| 1366x768 | `/eventos/evento-operacao/portaria` | Evento: Portaria | **OK** | 200 | 502ms | — |
| 1366x768 | `/eventos/evento-operacao/antifraude` | Evento: Antifraude | **OK** | 200 | 513ms | — |
| 1366x768 | `/eventos/evento-operacao/mapa` | Evento: Mapa de Assentos | **OK** | 200 | 516ms | — |
| 1366x768 | `/eventos/evento-operacao/cortesias` | Evento: Cortesias | **OK** | 200 | 515ms | — |
| 1366x768 | `/eventos/evento-operacao/financeiro` | Evento: Financeiro | **OK** | 200 | 548ms | — |
| 1366x768 | `/eventos/evento-operacao/marketing` | Evento: Marketing | **OK** | 200 | 537ms | — |
| 1366x768 | `/eventos/evento-operacao/remarketing` | Evento: Remarketing | **OK** | 200 | 556ms | — |
| 1366x768 | `/eventos/evento-operacao/comercial` | Evento: Comercial B2B | **OK** | 200 | 525ms | — |
| 1366x768 | `/eventos/evento-operacao/sala-situacao` | Evento: Sala de Situação | **OK** | 200 | 538ms | — |
| 1366x768 | `/eventos/evento-operacao/hardening` | Evento: Hardening | **OK** | 200 | 508ms | — |
| 1366x768 | `/eventos/evento-operacao/e2e` | Evento: Ciclo E2E | **OK** | 200 | 521ms | — |
| 1366x768 | `/eventos/evento-operacao/relatorios` | Evento: Relatórios | **OK** | 200 | 517ms | — |
| 390x844 | `/` | Visão Geral (Home) | **OK** | 200 | 459ms | — |
| 390x844 | `/operacao` | Central Operacional | **OK** | 200 | 479ms | — |
| 390x844 | `/operacao/alertas` | Alertas Operacionais | **OK** | 200 | 451ms | — |
| 390x844 | `/operacao/incidentes` | Gestão de Incidentes | **OK** | 200 | 464ms | — |
| 390x844 | `/operacao/hardening` | Hardening & Segurança | **OK** | 200 | 469ms | — |
| 390x844 | `/operacao/e2e` | Ciclo E2E & Go-Live | **OK** | 200 | 448ms | — |
| 390x844 | `/automacoes` | Central de Automações | **OK** | 200 | 462ms | — |
| 390x844 | `/automacoes/regras` | Regras Operacionais | **OK** | 200 | 470ms | — |
| 390x844 | `/automacoes/execucoes` | Execuções de Automações | **OK** | 200 | 466ms | — |
| 390x844 | `/automacoes/aprovacoes` | Aprovações Pendentes | **OK** | 200 | 469ms | — |
| 390x844 | `/eventos` | Todos os Eventos | **OK** | 200 | 466ms | — |
| 390x844 | `/eventos/novo` | Criar Evento | **OK** | 200 | 461ms | — |
| 390x844 | `/financeiro` | Financeiro & Ledger | **OK** | 200 | 474ms | — |
| 390x844 | `/financeiro/conciliacao` | Conciliação Financeira | **OK** | 200 | 480ms | — |
| 390x844 | `/contabilidade` | Contabilidade & DRE | **OK** | 200 | 485ms | — |
| 390x844 | `/estorno` | Estornos & CDC | **OK** | 200 | 460ms | — |
| 390x844 | `/comercial` | Comercial B2B | **OK** | 200 | 470ms | — |
| 390x844 | `/marketing` | Marketing | **OK** | 200 | 466ms | — |
| 390x844 | `/remarketing` | Remarketing | **OK** | 200 | 483ms | — |
| 390x844 | `/relatorios` | Central de Relatórios | **OK** | 200 | 462ms | — |
| 390x844 | `/sac` | Atendimento SAC | **OK** | 200 | 453ms | — |
| 390x844 | `/suporte` | Suporte de Campo | **OK** | 200 | 450ms | — |
| 390x844 | `/diagnostico` | Diagnóstico & Status | **OK** | 200 | 457ms | — |
| 390x844 | `/eventos/evento-operacao/operacao` | Evento: Operação Ao Vivo | **OK** | 200 | 509ms | — |
| 390x844 | `/eventos/evento-operacao/cockpit` | Evento: Cockpit Executivo | **OK** | 200 | 499ms | — |
| 390x844 | `/eventos/evento-operacao/cockpit/comparativos` | Evento: Comparativos | **OK** | 200 | 517ms | — |
| 390x844 | `/eventos/evento-operacao/inteligencia` | Evento: Inteligência | **OK** | 200 | 501ms | — |
| 390x844 | `/eventos/evento-operacao/inteligencia/anomalias` | Evento: Anomalias e Risco | **OK** | 200 | 484ms | — |
| 390x844 | `/eventos/evento-operacao/inteligencia/financeira` | Evento: Inteligência Fin. | **OK** | 200 | 481ms | — |
| 390x844 | `/eventos/evento-operacao/inteligencia/previsoes` | Evento: Previsões | **OK** | 200 | 499ms | — |
| 390x844 | `/eventos/evento-operacao/dashboard` | Evento: Dashboard | **OK** | 200 | 482ms | — |
| 390x844 | `/eventos/evento-operacao/ingressos` | Evento: Ingressos | **OK** | 200 | 487ms | — |
| 390x844 | `/eventos/evento-operacao/portaria` | Evento: Portaria | **OK** | 200 | 484ms | — |
| 390x844 | `/eventos/evento-operacao/antifraude` | Evento: Antifraude | **OK** | 200 | 498ms | — |
| 390x844 | `/eventos/evento-operacao/mapa` | Evento: Mapa de Assentos | **OK** | 200 | 483ms | — |
| 390x844 | `/eventos/evento-operacao/cortesias` | Evento: Cortesias | **OK** | 200 | 487ms | — |
| 390x844 | `/eventos/evento-operacao/financeiro` | Evento: Financeiro | **OK** | 200 | 495ms | — |
| 390x844 | `/eventos/evento-operacao/marketing` | Evento: Marketing | **OK** | 200 | 485ms | — |
| 390x844 | `/eventos/evento-operacao/remarketing` | Evento: Remarketing | **OK** | 200 | 482ms | — |
| 390x844 | `/eventos/evento-operacao/comercial` | Evento: Comercial B2B | **OK** | 200 | 484ms | — |
| 390x844 | `/eventos/evento-operacao/sala-situacao` | Evento: Sala de Situação | **OK** | 200 | 503ms | — |
| 390x844 | `/eventos/evento-operacao/hardening` | Evento: Hardening | **OK** | 200 | 477ms | — |
| 390x844 | `/eventos/evento-operacao/e2e` | Evento: Ciclo E2E | **OK** | 200 | 484ms | — |
| 390x844 | `/eventos/evento-operacao/relatorios` | Evento: Relatórios | **OK** | 200 | 483ms | — |

---
*Gerado automaticamente pelo script `scripts/visual-qa-11-15-3.mjs`.*
