# API Storefront — Backend For Frontend (BFF) do Site Público

## 1. Responsabilidade
Este é o BFF dedicado exclusivamente ao site público de vendas (`apps/storefront` / `newdawn.diskingressos.com.br`).

Seu papel é **proteger a integridade do domínio interno** e servir dados higienizados para os compradores finais:
- Navegação no catálogo de eventos, sessões, setores e mapas de assento.
- Reserva temporária com TTL no carrinho.
- Submissão de pedido e checkout (Pix / Cartão de Crédito).
- Consulta pública de status de pagamento (polling do Pix).
- Visualização de ingressos emitidos do próprio comprador.

## 2. Regras Invioláveis
1. **PROIBIDO QUALQUER ACESSO DIRETO AO PRISMA / BANCO DE DADOS**:
   - Este BFF não possui `schema.prisma` e não instancia `PrismaClient`.
   - Toda leitura e escrita é intermediada pelas portas públicas dos módulos (`EventosPublicService`, `InventarioPublicService`, `PagamentosPublicService`, `AcessoPublicService`).
2. **HIGIENIZAÇÃO E PRIVACIDADE**:
   - Nunca expor taxas da plataforma, spreads, dados bancários do produtor, DREs, ou relatórios internos de venda.
   - Mapas de assento retornam apenas o estado booleano de disponibilidade (`DISPONIVEL`, `RESERVADO`, `OCUPADO`), sem metadados de outros compradores.
3. **SEGURANÇA & RATE LIMIT**:
   - Todas as rotas de carrinho e checkout possuem proteção rigorosa contra abuse e bots via Throttler / Rate Limit.
