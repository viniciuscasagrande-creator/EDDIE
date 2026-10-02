# Protocolo de Reabertura Versionada do Fechamento

## Princípio Fundamental
**Um evento fechado NUNCA tem seu histórico ou snapshot anterior apagado.**

Se houver uma decisão jurídica, chargeback extemporâneo ou ajuste contábil retroativo:
1. Um usuário com perfil `DIRETOR_FINANCEIRO` ou `AUDITOR_MASTER` submete a solicitação formal de reabertura.
2. É obrigatório registrar:
   - Motivo detalhado da reabertura
   - Número do protocolo ou processo associado
   - Identificação do solicitante
3. O status do evento transita para `REABERTO_VERSIONADO`.
4. O snapshot da versão `v1` é arquivado como imutável e preservado.
5. Os ajustes necessários são efetuados no Ledger e na Contabilidade.
6. Ao concluir os novos ajustes, todos os 10 gates são novamente auditados e validados.
7. O novo fechamento gera a versão `v2` com novo snapshot, novo dossiê e novo hash SHA-256.
8. Uma trilha de auditoria completa expõe a comparação (`diff`) entre `v1` e `v2`.
