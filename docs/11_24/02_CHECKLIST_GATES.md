# Checklist dos 10 Gates Críticos de Fechamento do Evento

Para que um evento atinja o status `FECHADO`, todos os 10 gates devem ser estritamente auditados e aprovados pelo sistema:

| Gate | Domínio | Condição de Aprovação | Criticidade |
|---|---|---|---|
| **Gate 1: Cutoff de Vendas** | Vendas / Ingressos | Todas as sessões e lotes encerrados; zero carrinhos ativos ou pagamentos em processamento. | Bloqueante |
| **Gate 2: Portaria & Check-in** | Portaria / Acesso | Todas as catracas sincronizadas; lotação final apurada; zero ingressos em status pendente. | Bloqueante |
| **Gate 3: Conciliação de Pagamentos** | Pagamentos / Gateway | Transações Pix, Cartão e Boleto 100% liquidadas junto aos adquirentes sem divergências. | Bloqueante |
| **Gate 4: Estornos & CDC Zerados** | Estorno / CDC | Todas as solicitações de arrependimento Art. 49 e chargebacks resolvidas e quitadas no Ledger. | Bloqueante |
| **Gate 5: Auditoria Revenue Assurance** | Revenue Assurance | Matriz de integridade ponta a ponta sem anomalias críticas (Divergência = R$ 0,00). | Bloqueante |
| **Gate 6: Balancete Contábil & DRE** | Contabilidade | Lançamentos em partidas dobradas fechados; DRE do evento gerado e conciliado. | Bloqueante |
| **Gate 7: Retenções de Segurança** | Financeiro / Risco | Provisão para disputas residuais e retenção contratual calculada e segregada em bucket próprio. | Informativo / Alerta |
| **Gate 8: Settlement Final** | Financeiro / Ledger | Apuração de GMV, taxas DiskIngressos, adiantamentos deduzidos e saldo líquido final a repassar. | Bloqueante |
| **Gate 9: Segregação de Funções (SoD)** | Governança / RBAC | Fechamento aprovado por diretor ou gerente financeiro distinto do operador que solicitou. | Bloqueante |
| **Gate 10: Dossiê Final Imutável** | Compliance / Auditoria | Documento final emitido com carimbo de tempo UTC e Hash Criptográfico SHA-256 gerado. | Bloqueante |
