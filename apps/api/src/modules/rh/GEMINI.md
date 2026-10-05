# RH — Recursos Humanos & Disk Ponto (EDDIE 11.39)

> Bounded context responsável pela gestão de colaboradores, cargos, departamentos,
> controle de ponto eletrônico REP-P (Portaria 671 MTE), cercas virtuais (geofences)
> de sedes e arenas de eventos, banco de horas, e apropriação dos custos de mão de obra
> por evento diretamente no DRE da DiskIngressos.

## Responsabilidades

- **Colaboradores & Estrutura:** Gestão cadastral de colaboradores CLT, PJ, temporários e freelancers, cargos e departamentos com centros de custo.
- **Ponto Eletrônico (REP-P):** Atendimento integral à Portaria 671 MTE, com Número Sequencial de Registro (NSR), hash SHA-256 de integridade e comprovante inviolável.
- **Geofencing & Cercas Virtuais:** Validação no exato instante da marcação (sem rastreamento indevido contínuo) do raio de tolerância (150m sede, 300m arenas).
- **Equipes por Evento & DRE:** Apropriação financeira de diárias, horas extras e auxílios de transporte/alimentação alocados a cada evento, alimentando a rentabilidade real do DRE.
- **Porta Pública:** `RHPublicService` exporta métodos seguros para consulta de custos por evento sem expor acesso direto a banco aos outros módulos.
- **Auditoria Imutável:** Todas as alterações cadastrais e registros de ponto geram trilha de auditoria para conformidade LGPD e fiscalização trabalhista.

## Schema Postgres

- `rh` (`multiSchema`)

## Porta Pública

- `RHPublicService.obterCustoMaoDeObraPorEvento(tenantId, eventoId)`
- `RHPublicService.obterResumoExecutivo(tenantId)`
