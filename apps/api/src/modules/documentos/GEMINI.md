# Módulo `documentos` — EDDIE 11.35: Documentos, Contratos, Assinatura Digital e Dossiê Operacional

## O que é este módulo

O módulo **Documentos** transforma arquivos de simples anexos soltos em **objetos operacionais do EDDIE**.
Nenhum documento existe no vácuo: todo documento operacional tem origem rastreável no Core (`Produtor -> Evento -> Operação -> Documento -> Validação -> Aprovação -> Assinaturas -> Documento Final -> Arquivamento -> Dossiê -> Auditoria`).

## Princípio Fundamental

> **Documento não cria a verdade operacional. Documento formaliza e comprova a verdade operacional.**
> Dados computacionais (CNPJ, razão social, taxas, valores de repasse, saldo) são derivados do Core. Se estiverem incorretos, corrige-se a origem no Core e regenera-se o documento.

## Responsabilidades

1. **Gestão de Documentos:**
   - Identificação padronizada com código único (`CTR-YYYY-XXXXXX`, `ADT-YYYY-XXXXXX`, `BRD-YYYY-XXXXXX`, `REP-YYYY-XXXXXX`, `ANT-YYYY-XXXXXX`, `DOS-YYYY-XXXXXX`).
   - Situações estritas e unificadas: `Rascunho`, `Em elaboração`, `Aguardando aprovação`, `Aprovado`, `Aguardando assinatura`, `Parcialmente assinado`, `Assinado`, `Vigente`, `Substituído`, `Cancelado`, `Expirado`, `Arquivado`.
   - Classificação de sensibilidade e controle de acesso (`INTERNO`, `CONFIDENCIAL`, `FINANCEIRO`, `CONTRATUAL`, `DADO_PESSOAL`, `RESTRITO`).
   - Marca d'água dinâmica para visualizações sensíveis.

2. **Contratos e Condições Comerciais Estruturadas:**
   - O PDF assinado é a evidência documental. As condições estruturadas no Core são o que a operação consome.
   - Detecção de divergências entre condição contratual e regra operacional do Core (integrado à governança 11.31).
   - Gestão de Aditivos sequenciais com histórico comparativo e vigência controlada.

3. **Assinatura Digital & Regra de Ouro Financeira:**
   - Provedor de assinatura abstrato (`DocumentSignatureProvider`) com adaptador nativo baseado em hash SHA-256 e evidências de auditoria.
   - **Regra inviolável dos fluxos financeiros:** Para repasse, antecipação e borderô:
     1. Produtor solicita / Core valida
     2. Financeiro analisa e aprova
     3. Produtor assina
     4. **Financeiro Disk assina por último**
     5. Documento concluído e autorizado para execução na Tesouraria.

4. **Modelos de Documentos e Interpolação Segura:**
   - Modelos padronizados com variáveis dinâmicas (`{{produtor.razao_social}}`, `{{evento.nome}}`, etc.).
   - Prevenção de adulteração de campos do Core.

5. **Dossiê Operacional:**
   - Dossiê do Evento organizado nas **17 seções padronizadas**.
   - Dossiê vivo durante a operação, concluído no fechamento.
   - Snapshot imutável no fechamento e manifesto com verificação de integridade dos hashes SHA-256.
   - Procedimento de reabertura auditada com histórico de fechamentos V1, V2...

6. **Checklist Documental e Bloqueios:**
   - Checklist por entidade (Produtor, Parceiro, Evento) com bloqueio preventivo de operações em caso de documentação vencida ou pendente.

## Schema Postgres

- `documentos`
