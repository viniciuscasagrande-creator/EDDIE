# EDDIE 9.14 — Dados Reais + API + Limpeza de Produção

## Objetivo
Eliminar definitivamente mocks, seeds de demonstração, store em memória e loaders infinitos. Toda tela deve consumir a API NestJS/Prisma real.

## Entrega aplicada neste pacote
- Rota `/api/[...path]` convertida em proxy transparente para `API_INTERNAL_URL`; removido o banco fake em memória.
- Resposta 503 explícita quando a API não estiver configurada/indisponível.
- Removidos fallbacks demonstrativos de Conciliação Financeira, Comercial e Centro de Controle Contábil.
- Taxa Média Comercial deixa de ser 9,5% fixa e passa a ser calculada das condições reais.
- Removida nomenclatura “360°” do SAC.
- `.env.example` atualizado para separar URL pública do proxy e backend real.

## Critério de aceite
0 mocks de produção; 0 números inventados; 0 loading infinito; erros de API visíveis; listas vazias são listas vazias; dados persistem no PostgreSQL/Prisma.
