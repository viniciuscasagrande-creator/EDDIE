# EDDIE 10.8 HOMOLOGÁVEL — INSTRUÇÃO DE IMPLANTAÇÃO

Aplique e homologue este pacote como evolução direta do EDDIE 10.7 HOMOLOGADO.

REGRAS:
1. Não redesenhar nem remover funcionalidades existentes do EDDIE.
2. Marketing e Remarketing são menus independentes na Sidebar.
3. Validar todas as rotas de `marketingVideoCatalog.ts`; nenhuma pode abrir tela branca.
4. Cada tela deve respeitar `produtorId` e `eventoId` do contexto global.
5. Usar dados reais do Prisma. Proibido criar KPIs, campanhas, vendas, ROAS, carrinhos ou receita fictícios.
6. Onde a origem transacional ainda não existe, mostrar estado vazio/integração pendente, nunca mock.
7. Validar `GET /marketing/video/:grupo/:screen` para todos os slugs.
8. Corrigir erros reais de TypeScript/build sem remover módulos.
9. Não criar segundo cadastro de eventos, segundo Ledger ou tabela paralela de saldos.
10. Toda UI visível em pt-BR e não usar o termo “360”.
11. Gerar relatório final com build PDT, build API, rotas verificadas, endpoints verificados e pendências reais.

ROTAS MARKETING: painel, campanhas-multicanal, whatsapp, email, status-real, ga4, tiktok, spotify, utm-conversoes, atribuicao, ranking.
ROTAS REMARKETING: painel, carrinhos, pix-pagamentos, regua-fluxos, whatsapp, email, clientes-inativos, relatorios.
