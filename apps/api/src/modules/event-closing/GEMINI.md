# GEMINI.md — Módulo event-closing (EDDIE 11.24)

> Contexto do bounded context de Fechamento de Eventos e Settlement Final do Produtor.

## Responsabilidade
- Motor definitivo de Fechamento de Eventos:
  `Evento Encerrado → Cutoff → Portaria → Revenue Assurance → Contabilidade → Zero CDC → Settlement Final → Repasse → Dossiê SHA-256 → Fechamento`.
- Auditoria em tempo real dos 10 Gates de Fechamento.
- Bloqueio rigoroso: Nenhum evento atinge status FECHADO se houver gate financeiro crítico aberto.
- Segregação de Funções (SoD): O solicitante do fechamento não pode ser o aprovador.
- Snapshot Imutável e Dossiê com Hash Criptográfico SHA-256.
- Protocolo de Reabertura Versionada (v1 → v2) preservando histórico.
