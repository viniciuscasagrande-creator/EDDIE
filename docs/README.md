# Documentação Oficial EDDIE — Arquitetura e Histórico de Fases

Este diretório centraliza a documentação operacional, técnica, funcional e de homologação do projeto **DiskIngressos PDT (EDDIE)**.

---

## Estrutura de Diretórios

```text
docs/
├── fases/                         # Documentações de planejamento, especificações e releases por fase
│   ├── fase_09/                   # Fase 9 (Consolidação inicial, módulos e go-live)
│   ├── fase_10/                   # Fase 10 (Frente A, endpoints operacionais, marketing/remarketing)
│   └── fase_11/                   # Fase 11 (Event OS, Engenharia Financeira, ERP e Contabilidade)
│       ├── 11_00_a_11_09/         # 11.0 a 11.9: Núcleo transacional, portaria e contratos
│       ├── 11_10_a_11_16/         # 11.10 a 11.16: Command Center, automações, hardening e visual QA
│       ├── 11_17_a_11_23/         # 11.17 a 11.23: Command Center, Ledger, Contabilidade e Portal do Produtor
│       ├── 11_23_1/               # 11.23.1: Fechamento de telas e integrações do Portal do Produtor
│       ├── 11_24/                 # 11.24: Fechamento de eventos, settlement e dossiê imutável
│       ├── 11_25/                 # 11.25: Banking Engine, PIX Direto e CNAB
│       ├── 11_26/                 # 11.26: Cash Forecast, Liquidez e Capital de Giro
│       ├── 11_27/                 # 11.27: Financial Risk, Controls & Exposure OS
│       └── 11_28/                 # 11.28: FP&A, Budgeting e Centros de Custo
├── modulos/                       # Especificações técnicas e conceituais dos módulos do Modulith
├── matrizes/                      # Matrizes de rotas, paridade, financeiras e QA global
├── relatorios_qa/                 # Relatórios de testes visuais, scanners e divergências
├── auditoria_producao/            # Evidências e relatórios de auditoria em produção
├── manifests/                     # Manifestos de release e builds
├── mobile_tablet/                 # Especificações de responsividade mobile e tablet
├── screenshots/                   # Capturas de tela e evidências visuais automatizadas
├── scrollspy/                     # Especificações de navegação por scrollspy
└── usuarios_rbac/                 # Matriz de RBAC, perfis de acesso e segurança
```
