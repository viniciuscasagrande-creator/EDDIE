# EDDIE 11.7.1 — Navegação Fixa e Responsiva

Correção visual transversal.

## Regra
Nenhuma navegação principal/secundária de módulos deve depender de scrollbar horizontal para descobrir funções.

## Componente
`apps/pdt/src/components/navigation/ModuleNavigation.tsx`

Desktop: grid responsivo com todos os itens visíveis, aceitando quebra de linha.
Tablet: 3 colunas.
Mobile: 2 colunas; se um módulo possuir quantidade excepcional de itens, implementar botão `Mais opções`/drawer sem scroll horizontal.

## Aplicar prioritariamente
- Contabilidade
- Financeiro
- Marketing
- Remarketing
- Relatórios
- Event OS / menus secundários

## Alertas
Faixas permanentes de indisponibilidade devem ser substituídas por `CompactOperationalAlert` quando não bloquearem a operação. Erros bloqueantes continuam com painel completo.

## Não fazer
- Não usar `overflow-x: auto` para navegação.
- Não esconder funções importantes.
- Não reduzir fonte até ficar ilegível.
- Não modificar regras de negócio.
