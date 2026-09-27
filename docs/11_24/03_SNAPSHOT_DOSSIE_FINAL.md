# Snapshot Imutável e Dossiê Final do Evento

## Dossiê Final de Fechamento
O Dossiê Final é a certidão de conclusão financeira do evento. Ele contém:
1. **Identificação:** ID do Evento, Tenant, Produtor, Razão Social, CNPJ e data/hora do fechamento.
2. **Resumo Operacional:**
   - Capacidade autorizada
   - Ingressos emitidos vs ingressos utilizados (check-ins)
   - Cortesia e gratuidades legais
3. **Resumo Financeiro (Valores em Centavos e BRL):**
   - GMV Bruto (Total de Vendas)
   - Taxas de Serviço da Plataforma (DiskIngressos)
   - Taxas de Processamento de Pagamento / Gateway
   - Estornos e Devoluções CDC (Art. 49)
   - Chargebacks ocorridos
   - Adiantamentos e Repasses Parciais anteriores já liquidados
   - Retenções de Segurança / Provisão pós-evento
   - **Saldo Líquido Final do Settlement a Repassar**
4. **Resumo Contábil:**
   - Número do Lote de Fechamento Contábil
   - Competência de apuração
   - Total de Débitos e Créditos equilibrados
5. **Autenticidade e Carimbo de Auditoria:**
   - Versão do Fechamento (`v1`, `v2`, etc.)
   - Operador Solicitante e Aprovador SoD
   - **Hash SHA-256 de Integridade:** Gerado a partir da canonização JSON do snapshot financeiro.
