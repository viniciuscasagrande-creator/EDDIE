Execute EDDIE 11.7.1 sobre a baseline atual.

Leia `EDDIE_11_7_1_NAVEGACAO_FIXA_RESPONSIVA.md`.

1. Localize todas as barras horizontais de módulos/submódulos no PDT.
2. Substitua scroll horizontal pelo `ModuleNavigation`.
3. Preserve rotas, labels, permissões, badges e estado ativo existentes.
4. Priorize Contabilidade, Financeiro, Marketing, Remarketing, Relatórios e Event OS.
5. Desktop: todos os itens visíveis em grid, normalmente 1–2 linhas.
6. Tablet: 3 colunas.
7. Mobile: 2 colunas e, apenas quando necessário, `Mais opções` em drawer/popover.
8. Não remova nenhuma função.
9. Converta alerta persistente de API para `CompactOperationalAlert` quando o erro não for bloqueante.
10. Execute build/typecheck/lint disponíveis e corrija erros sem apagar funcionalidades.
11. Não faça push/deploy sem autorização explícita.
