# Módulos Marketing e Remarketing --- DiskIngressos

> Documento consolidado exclusivamente dos módulos **Marketing e
> Remarketing**, com base no projeto SafeSaff/Event OS fornecido em
> 21/09/2026.
>
> **Regra de contexto:** produtor visualiza somente seus próprios
> eventos. Ferramentas que operam fora do contexto interno de um evento
> devem exigir seleção do evento/ID antes da execução.

## 1. Objetivo

Marketing e Remarketing formam a camada de aquisição, comunicação,
conversão, recuperação e mensuração da plataforma. O objetivo é permitir
que o produtor planeje campanhas, distribua comunicação em múltiplos
canais, configure tracking por evento, acompanhe conversões e recupere
oportunidades não concluídas.

Os módulos devem trabalhar integrados, porém com responsabilidades
distintas:

-   **Marketing:** aquisição, campanhas, mídia, comunicação, UTMs,
    cupons, pixels, atribuição, relatórios e otimização.
-   **Remarketing:** recuperação de carrinhos e oportunidades,
    reengajamento, jornadas automatizadas e mensuração da receita
    recuperada.

------------------------------------------------------------------------

# 2. Princípios obrigatórios

1.  **Contexto Produtor × Evento:** nenhum produtor pode visualizar ou
    operar eventos de terceiros.
2.  **Multi-evento:** fora do contexto de um evento, o produtor
    seleciona o evento/ID que deseja trabalhar.
3.  **Multi-canal:** campanhas podem utilizar mais de um canal
    simultaneamente.
4.  **Tracking individual:** cada evento pode possuir múltiplos pixels e
    integrações de conversão.
5.  **Rastreabilidade:** campanha, canal, anúncio, UTM, cupom, automação
    e conversão devem manter vínculo com sua origem.
6.  **Dados reais:** dashboards devem distinguir dados reais, simulados,
    indisponíveis e projetados.
7.  **pt-BR:** toda interface visível ao usuário deve permanecer em
    Português do Brasil.
8.  **LGPD e consentimento:** comunicações e tracking devem respeitar
    consentimento, finalidade, opt-out e governança de dados.

------------------------------------------------------------------------

# 3. Arquitetura funcional

``` text
MARKETING
├── Dashboard / Hub de Marketing
├── Campanhas
│   ├── Campanhas Prontas
│   ├── Campanhas Multicanais
│   ├── Status Real
│   └── Monitoramento de Entrega
├── Comunicação
│   ├── WhatsApp Marketing
│   └── E-mail Marketing
├── Automações
├── Cupons e Promoções
├── Links, UTMs e QR
│   ├── Central UTM
│   └── Conversões / Atribuição
├── Pixels e Tracking por Evento
│   ├── Meta
│   ├── Google
│   ├── TikTok
│   └── Spotify
├── Mídia Paga
│   ├── Meta Ads
│   ├── TikTok Ads
│   ├── Google / integrações habilitadas
│   └── Spotify Ads
├── Atribuição
├── Analytics / Relatórios
└── Alertas e Saúde das Campanhas

REMARKETING
├── Dashboard de Remarketing
├── Carrinho Abandonado
├── Central de Recuperação
├── Jornadas de Reengajamento
├── Automações de Recuperação
├── Segmentação
├── Comunicação Multicanal
└── Receita Recuperada / Relatórios
```

------------------------------------------------------------------------

# 4. Dashboard / Hub de Marketing

Deve consolidar a situação das ações de marketing do produtor e do
evento selecionado.

## KPIs principais

-   Impressões
-   Cliques
-   CTR
-   Pedidos / Conversões
-   Vendas atribuídas
-   Investimento
-   ROAS
-   CPA
-   Link Clicks
-   Taxa de conversão
-   Receita por canal
-   Receita por campanha

## Visões

-   todos os eventos do produtor;
-   evento selecionado;
-   período;
-   campanha;
-   canal;
-   origem/mídia;
-   status;
-   conversões;
-   investimento x retorno.

------------------------------------------------------------------------

# 5. Campanhas

Central de criação e gestão de campanhas.

## Dados essenciais

-   nome;
-   evento;
-   objetivo;
-   período;
-   público;
-   canais;
-   orçamento;
-   criativos;
-   CTA;
-   URL de destino;
-   UTM;
-   cupom relacionado;
-   pixels/tracking;
-   status;
-   métricas.

## Ciclo

`Rascunho → Configuração → Validação → Agendamento/Publicação → Monitoramento → Otimização → Encerramento → Relatório`

------------------------------------------------------------------------

# 6. Campanhas Prontas

Biblioteca de campanhas opcionais para ajudar o produtor a alavancar
vendas.

A tela deve apresentar aproximadamente **4 a 8 opções prontas** de
campanhas, adaptáveis ao evento.

Exemplos de objetivos:

-   lançamento;
-   abertura de vendas;
-   virada de lote;
-   últimas unidades;
-   contagem regressiva;
-   recuperação de interessados;
-   campanha promocional;
-   reengajamento.

Cada modelo deve poder ser personalizado antes da ativação.

------------------------------------------------------------------------

# 7. Campanhas Multicanais

Uma campanha pode distribuir ações em vários canais sem perder sua
identidade principal.

Canais possíveis:

-   Meta;
-   TikTok;
-   Spotify;
-   Google, quando integrado;
-   WhatsApp;
-   E-mail;
-   links próprios;
-   afiliados/parceiros.

O sistema deve comparar desempenho por canal e também consolidar o
resultado da campanha.

------------------------------------------------------------------------

# 8. Status Real de Campanhas

Central operacional para mostrar o estado real das campanhas.

## Estados

-   configurando;
-   aguardando integração;
-   agendada;
-   ativa;
-   pausada;
-   com alerta;
-   erro;
-   encerrada.

## Monitoramento

-   entrega;
-   gasto;
-   conversões;
-   falhas de integração;
-   tracking;
-   orçamento;
-   criativos;
-   autenticação;
-   sincronização.

------------------------------------------------------------------------

# 9. Central de Alertas

Deve alertar sobre problemas que prejudiquem aquisição ou mensuração.

Exemplos:

-   campanha sem entrega;
-   pixel sem eventos;
-   token expirado;
-   conta desconectada;
-   orçamento esgotado;
-   aumento de CPA;
-   queda de conversão;
-   UTM ausente;
-   erro de sincronização;
-   integração degradada.

------------------------------------------------------------------------

# 10. WhatsApp Marketing

Canal de comunicação associado aos eventos do produtor.

## Funções

-   selecionar evento;
-   selecionar público/segmento;
-   criar mensagem;
-   usar modelos;
-   inserir variáveis;
-   adicionar link rastreado;
-   relacionar campanha;
-   agendar;
-   enviar;
-   acompanhar entrega;
-   acompanhar cliques e conversões quando tecnicamente disponíveis.

Deve possuir dados operacionais dentro da tela, evitando páginas vazias.

------------------------------------------------------------------------

# 11. E-mail Marketing

Central de campanhas de e-mail.

## Funções

-   assunto;
-   remetente autorizado;
-   conteúdo;
-   template;
-   público;
-   evento;
-   campanha;
-   links rastreados;
-   UTM;
-   agendamento;
-   envio;
-   entrega;
-   abertura;
-   clique;
-   conversão;
-   descadastro.

------------------------------------------------------------------------

# 12. Automações de Marketing

Permitem executar ações baseadas em gatilhos.

## Exemplos de gatilho

-   nova campanha;
-   proximidade do evento;
-   virada de lote;
-   baixa conversão;
-   carrinho abandonado;
-   cliente elegível para reengajamento;
-   cupom;
-   data programada;
-   comportamento de navegação/conversão disponível.

## Estrutura

`Gatilho → Condições → Público → Ação → Canal → Espera → Nova condição → Conversão/Encerramento`

------------------------------------------------------------------------

# 13. Cupons e Promoções

Central para criação e mensuração de incentivos promocionais.

## Dados

-   código;
-   evento;
-   campanha;
-   tipo de benefício;
-   valor/percentual;
-   vigência;
-   quantidade;
-   regras;
-   público;
-   canal;
-   utilização;
-   vendas atribuídas.

------------------------------------------------------------------------

# 14. Links, UTMs e QR

Central unificada para rastrear tráfego e conversão.

## UTM

Campos principais:

-   URL de destino;
-   `utm_source`;
-   `utm_medium`;
-   `utm_campaign`;
-   `utm_content`;
-   `utm_term`;
-   evento;
-   campanha;
-   canal.

## Recursos

-   gerar link;
-   copiar link;
-   gerar QR;
-   organizar links por campanha;
-   comparar canais;
-   medir cliques;
-   relacionar pedidos/conversões;
-   exportar resultados.

------------------------------------------------------------------------

# 15. Central UTM por Evento

Cada UTM deve poder ser relacionada a um evento específico.

A central deve responder:

-   qual campanha gerou o acesso;
-   qual canal originou o clique;
-   qual link converteu;
-   qual evento recebeu a conversão;
-   quantos pedidos/vendas foram atribuídos;
-   receita atribuída.

------------------------------------------------------------------------

# 16. Atribuição de Marketing

O mecanismo de atribuição conecta tráfego e campanhas às conversões.

## Dimensões

-   campanha;
-   canal;
-   source;
-   medium;
-   content;
-   termo;
-   evento;
-   pixel;
-   cupom;
-   link;
-   conversão.

O relatório deve evitar apresentar correlação como causalidade quando a
origem não puder ser tecnicamente confirmada.

------------------------------------------------------------------------

# 17. Pixels e Tracking por Evento

O produtor deve administrar pixels individualmente por evento.

## Regra multi-pixel

Um único evento pode possuir:

-   mais de um Meta Pixel;
-   Google tracking;
-   TikTok Pixel;
-   Spotify tracking/conversões;
-   outras integrações habilitadas.

## Cada integração deve registrar

-   provedor;
-   identificador;
-   evento;
-   status;
-   origem;
-   data de configuração;
-   última atividade;
-   eventos recebidos;
-   saúde;
-   alertas.

------------------------------------------------------------------------

# 18. Adapters de Tracking

A arquitetura contempla adapters/integrações para:

-   Meta;
-   Google;
-   TikTok;
-   Spotify.

Os adapters devem normalizar eventos internos para o formato exigido por
cada plataforma sem espalhar regras específicas pelo restante do
sistema.

------------------------------------------------------------------------

# 19. Health Check de Tracking

Diagnóstico automático das integrações.

## Verificações

-   integração ativa;
-   credencial válida;
-   pixel configurado;
-   eventos recentes;
-   conversões recebidas;
-   falhas;
-   latência;
-   duplicidade;
-   configuração incompleta.

A interface deve mostrar saúde geral e diagnóstico por provedor/evento.

------------------------------------------------------------------------

# 20. Meta Ads / Meta Pixel

Integração de campanhas e tracking Meta deve ser vinculada ao produtor e
ao evento correto.

Funções esperadas:

-   conexão de conta;
-   seleção de ativos;
-   pixel por evento;
-   campanhas;
-   métricas;
-   conversões;
-   diagnóstico;
-   status de integração.

------------------------------------------------------------------------

# 21. TikTok Ads

Integração destinada à operação de mídia e mensuração no TikTok.

## Fluxo

`Conectar conta → Autorizar → Selecionar conta/anunciante → Relacionar evento → Configurar tracking → Campanhas → Conversões → Relatórios`

A integração deve utilizar autenticação real e manter diagnóstico de
credenciais e conexão.

------------------------------------------------------------------------

# 22. Spotify Ads

O projeto contém uma estrutura dedicada ao Spotify Ads.

## Jornada

`Conectar conta → Contas → Campanhas → Públicos → Segmentação → Criativos → Orçamento → Conversões → Relatórios`

## Funções

-   autenticação;
-   contas;
-   campanhas;
-   públicos;
-   segmentação;
-   criativos;
-   orçamento;
-   conversões;
-   relatórios;
-   governança;
-   validação;
-   monitoramento.

------------------------------------------------------------------------

# 23. Analytics e Relatórios de Marketing

Relatórios devem permitir comparar aquisição e retorno.

## Métricas padrão

-   impressões;
-   alcance quando disponível;
-   cliques;
-   CTR;
-   conversões;
-   pedidos;
-   vendas;
-   investimento;
-   CPA;
-   ROAS;
-   receita;
-   ticket médio atribuído;
-   custo por canal;
-   desempenho por campanha.

## Cortes

-   produtor;
-   evento;
-   campanha;
-   canal;
-   período;
-   UTM;
-   cupom;
-   pixel;
-   plataforma.

------------------------------------------------------------------------

# 24. Remarketing

Remarketing deve concentrar as ações destinadas a recuperar
oportunidades e reengajar públicos elegíveis.

Ele não deve ser apenas uma duplicação do Marketing: sua finalidade
principal é atuar sobre pessoas/oportunidades que já demonstraram
intenção ou interação e podem ser legitimamente trabalhadas conforme
consentimento e regras aplicáveis.

------------------------------------------------------------------------

# 25. Dashboard de Remarketing

KPIs sugeridos a partir da estrutura existente:

-   oportunidades elegíveis;
-   carrinhos abandonados;
-   contatos acionados;
-   recuperações;
-   taxa de recuperação;
-   receita recuperada;
-   valor médio recuperado;
-   conversões por canal;
-   automações ativas;
-   falhas de entrega.

------------------------------------------------------------------------

# 26. Carrinho Abandonado

Ferramenta central de recuperação.

## Regra de segurança

O produtor visualiza **somente carrinhos relacionados aos seus próprios
eventos**.

## Dados operacionais

-   evento;
-   sessão/oportunidade;
-   itens;
-   quantidade;
-   valor;
-   momento do abandono;
-   estágio;
-   canal elegível;
-   tentativas;
-   status;
-   recuperação;
-   receita recuperada.

------------------------------------------------------------------------

# 27. Central de Recuperação

Organiza oportunidades por prioridade e estado.

## Estados possíveis

-   novo;
-   elegível;
-   em jornada;
-   contato enviado;
-   aguardando;
-   recuperado;
-   expirado;
-   não elegível;
-   opt-out.

A recuperação deve registrar qual campanha, automação e canal
contribuíram para a conversão.

------------------------------------------------------------------------

# 28. Motor de Recuperação

O projeto possui domínio específico de `recoveryEngine`.

Responsabilidades funcionais:

-   identificar oportunidades;
-   aplicar elegibilidade;
-   priorizar;
-   evitar contato indevido;
-   iniciar jornada;
-   controlar tentativas;
-   encerrar após conversão/expiração;
-   registrar resultado.

------------------------------------------------------------------------

# 29. Jornadas de Remarketing

Exemplo conceitual:

`Abandono → Espera → Verificação de compra → WhatsApp/E-mail → Espera → Nova verificação → Incentivo permitido → Conversão ou encerramento`

As regras devem evitar comunicação após compra já concluída e respeitar
limites de contato.

------------------------------------------------------------------------

# 30. Segmentação

Segmentos podem utilizar atributos operacionais permitidos, como:

-   evento;
-   campanha;
-   origem;
-   comportamento;
-   estágio do funil;
-   abandono;
-   recência;
-   conversão;
-   engajamento;
-   canal disponível.

------------------------------------------------------------------------

# 31. Comunicação Multicanal no Remarketing

A jornada pode coordenar:

-   WhatsApp;
-   e-mail;
-   mídia de remarketing quando integrada;
-   links rastreados;
-   cupons/promos permitidos.

O sistema deve evitar mensagens duplicadas ou conflitantes entre canais.

------------------------------------------------------------------------

# 32. Receita Recuperada

Uma venda recuperada deve manter rastreabilidade.

Registrar:

-   evento;
-   oportunidade;
-   valor original;
-   valor convertido;
-   campanha;
-   automação;
-   canal;
-   cupom;
-   UTM;
-   data;
-   pedido relacionado;
-   regra de atribuição.

------------------------------------------------------------------------

# 33. Integração Marketing × Remarketing

``` text
Aquisição
   ↓
Campanha / Canal / UTM
   ↓
Visita / Interesse
   ↓
Conversão ─────────────→ Venda atribuída
   │
   └→ Abandono
         ↓
     Remarketing
         ↓
   Jornada de Recuperação
         ↓
      Conversão
         ↓
   Receita Recuperada
```

Marketing deve fornecer ao Remarketing a origem da oportunidade.
Remarketing deve devolver ao Analytics o resultado da recuperação.

------------------------------------------------------------------------

# 34. Modelo de dados conceitual

Entidades centrais:

-   Produtor
-   Evento
-   Campanha
-   Canal
-   Conta de mídia
-   Criativo
-   Público
-   Segmento
-   UTM
-   Link
-   QR
-   Cupom
-   Pixel
-   Integração
-   Conversão
-   Automação
-   Jornada
-   Carrinho/Oportunidade
-   Tentativa de recuperação
-   Pedido
-   Receita atribuída
-   Alerta
-   Diagnóstico

------------------------------------------------------------------------

# 35. Permissões

Permissões devem respeitar escopo e responsabilidade.

Exemplos:

-   visualizar marketing;
-   criar campanha;
-   publicar campanha;
-   administrar orçamento;
-   conectar contas;
-   administrar pixels;
-   visualizar analytics;
-   exportar relatórios;
-   operar WhatsApp;
-   operar e-mail;
-   criar automações;
-   visualizar remarketing;
-   executar recuperação;
-   administrar cupons.

Operações críticas devem possuir auditoria.

------------------------------------------------------------------------

# 36. LGPD e governança

O módulo deve manter controles para:

-   consentimento;
-   finalidade;
-   opt-out;
-   origem do contato;
-   minimização de dados;
-   retenção;
-   auditoria;
-   acesso por perfil;
-   registro de integrações;
-   exclusão/bloqueio conforme política aplicável.

Tracking server-side/client-side deve possuir governança consistente.

------------------------------------------------------------------------

# 37. Observabilidade

Registrar:

-   sincronizações;
-   chamadas externas relevantes;
-   erros;
-   webhooks;
-   falhas de autenticação;
-   falhas de campanha;
-   falhas de entrega;
-   eventos de conversão;
-   diagnóstico de pixels;
-   tempo da última sincronização.

------------------------------------------------------------------------

# 38. Critérios de aceite

Marketing e Remarketing estarão funcionalmente consolidados quando:

-   o produtor acessar somente seus eventos;
-   o contexto global permitir selecionar corretamente evento/ID;
-   campanhas multicanais preservarem métricas por canal;
-   WhatsApp e E-mail possuírem dados operacionais úteis;
-   UTMs forem vinculadas a campanhas e eventos;
-   conversões forem rastreáveis;
-   cada evento aceitar múltiplos pixels;
-   Meta, Google, TikTok e Spotify possuírem diagnóstico individual;
-   campanhas mostrarem status real;
-   alertas evidenciarem falhas de integração e tracking;
-   carrinhos abandonados nunca cruzarem produtores;
-   jornadas pararem após conversão ou perda de elegibilidade;
-   receita recuperada for rastreável;
-   dashboards diferenciarem dados reais de projeções/simulações;
-   todas as ações críticas possuírem auditoria;
-   toda interface visível estiver em pt-BR.

------------------------------------------------------------------------

# 39. Rotas encontradas no projeto

-   `/marketing/analytics`
-   `/marketing/campanhas`
-   `/marketing/comunicacao`
-   `/marketing/dashboard`
-   `/marketing/pixels`
-   `/marketing/spotify`
-   `/remarketing`
-   `/remarketing/carrinhos`
-   `/remarketing/dashboard`
-   `/remarketing/email`
-   `/remarketing/fluxos`
-   `/remarketing/pagamentos`
-   `/remarketing/whatsapp`

# 40. Referências técnicas encontradas

-   `src/pages/MarketingPage.tsx`
-   `src/pages/RemarketingPage.tsx`
-   `src/pages/marketing/MarketingHubOSPage.tsx`
-   `src/pages/marketing/MarketingCampaignsPage.tsx`
-   `src/pages/marketing/ReadyCampaignsPage.tsx`
-   `src/pages/marketing/WhatsAppMarketingPage.tsx`
-   `src/pages/marketing/EmailMarketingPage.tsx`
-   `src/pages/marketing/AbandonedCartPage.tsx`
-   `src/pages/marketing/CouponsPromoPage.tsx`
-   `src/pages/marketing/UtmLinksPage.tsx`
-   `src/pages/marketing/EventUtmCentralPage.tsx`
-   `src/pages/marketing/MarketingAttributionPage.tsx`
-   `src/pages/marketing/MarketingReportsPage.tsx`
-   `src/pages/marketing/SpotifyAdsHubPage.tsx`
-   `src/pages/marketing/status-real/CampaignRealStatusPage.tsx`
-   `src/pages/marketing/PixelInheritancePage.tsx`
-   `src/pages/remarketing/RemarketingHub.tsx`
-   `src/pages/remarketing/RemarketingDashboardPage.tsx`
-   `src/pages/remarketing/RecoveryCenterPage.tsx`
-   `src/pages/AutomationCenterPage.tsx`
-   `src/types/marketing.ts`
-   `src/data/marketingData.ts`
-   `src/services/campaignDeliveryService.ts`
-   `src/services/spotifyAdsApi.ts`
-   `src/domain/remarketing/recoveryEngine.ts`
-   `src/domain/marketing/attribution.ts`
-   `src/domain/marketing/integrations.ts`
-   `src/domain/marketing/conversionEngine.ts`
-   `src/domain/marketing/campaignDeliveryMonitoring.ts`
-   `src/domain/marketing/mediaOptimization.ts`
-   `src/domain/marketing/omnichannelDataMart.ts`
-   `src/domain/marketing/spotifyAds.ts`
-   `src/domain/marketing/spotifyGovernance.ts`
-   `src/domain/marketing/spotifyReporting.ts`

------------------------------------------------------------------------

**Documento:** Marketing e Remarketing --- DiskIngressos\
**Escopo:** somente Marketing e Remarketing\
**Base:** backup do projeto fornecido pelo usuário\
**Data da consolidação:** 21/09/2026
