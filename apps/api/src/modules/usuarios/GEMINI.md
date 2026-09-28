# Módulo: Usuários, Perfis e Permissões (`usuarios`)

> Contexto local do módulo de Gestão de Usuários, Controle de Acesso Baseado em Papéis (RBAC),
> Isolamento Multitenant (DiskIngressos vs Produtores) e Permissões Granulares.

## Responsabilidade

1. **Segregação de Visões (DiskIngressos vs Produtor):**
   - **Visão DiskIngressos:** Administradores e operadores internos com escopo global sobre todos os eventos, financeiro, contabilidade, riscos, fechamentos e FP&A.
   - **Visão Produtor:** Usuários de produtoras parceiras (ex: Live Nation, Opus, T4F) com escopo estritamente restrito aos seus próprios eventos, vendas, extrato de repasses e portaria.
2. **Controle de Acesso Baseado em Papéis (RBAC):**
   - Papéis suportados: `ADMIN_DISKINGRESSOS`, `OPERADOR_DISKINGRESSOS`, `FINANCEIRO_DISKINGRESSOS`, `PRODUTOR_ADMIN`, `PRODUTOR_OPERADOR`, `PORTARIA_CHECKIN`.
3. **Regra Inviolável de Isolamento Tenant:**
   > **Usuários com perfil de Produtor NUNCA podem visualizar eventos, saldos, extratos ou relatórios pertencentes a outros produtores ou módulos internos exclusivos da DiskIngressos (FP&A, Contabilidade Geral, Riscos Globais).**
4. **Matriz de Permissões Granulares:**
   - Permissões auditadas para leitura, escrita, aprovação de repasses, gestão de equipe e configurações.

## Esquemas do Banco

- `platform` / `financeiro`
- Gestão centralizada de credenciais, sessões e permissões com trilha de auditoria.
