# Arquitetura Mobile, Tablet & PWA (Progressive Web App)

## Experiência Nativa para Dispositivos Móveis e Tablets

---

### 1. Visão Geral

O ecossistema **DiskIngressos PDT** foi otimizado para operar com alta fidelidade e ergonomia nativa tanto em **desktops** quanto em **tablets** e **smartphones** (iOS e Android), sem a necessidade de distribuição prévia em lojas de aplicativos (App Store / Google Play).

---

### 2. Pilares da Experiência Móvel

1. **Menu Gaveta Deslizante (Off-canvas Drawer):**
   - No celular e tablet pequeno (`< 1024px`), a barra lateral fica oculta e desliza suavemente sobre a interface ao tocar no botão de menu hambúrguer no cabeçalho ou na barra inferior.
   - Possui backdrop escurecido (`bg-black/75 backdrop-blur-sm`) que fecha o menu ao tocar fora.
   - Fecha automaticamente após qualquer navegação de rota.

2. **Barra de Navegação Inferior (Bottom Navigation Bar):**
   - Fixada na parte inferior da tela nos dispositivos móveis (`lg:hidden`), acessível diretamente pelo polegar do usuário.
   - Atalhos de alta frequência dinâmicos baseados no escopo de visão ativo:
     - **Início (Dashboard 360º)**
     - **Eventos / Meus Shows**
     - **Operação (DiskIngressos) ou Extrato & Repasses (Produtor)**
     - **Usuários & Permissões / Minha Equipe**
     - **Mais (Abertura do Drawer Completo)**

3. **PWA Standalone (Progressive Web App):**
   - Configuração do manifesto oficial (`apps/pdt/public/manifest.json`).
   - Ícone vetorial em alta resolução (`/icon.svg`) com suporte a safe areas e cantos arredondados.
   - Suporte ao recurso **"Adicionar à Tela de Início"** no Safari (iOS/iPadOS) e Google Chrome (Android).
   - Execução em tela cheia (`display: standalone`) sem barra de URL do navegador.

4. **Viewport & Safe Area Insets:**
   - Meta tag `viewport-fit=cover` para adaptação automática a entalhes (notches e Dynamic Island) de iPhones e iPads.
   - Utilização da classe utilitária `.pb-safe` e padding compensatório (`pb-24 lg:pb-8`) para que o conteúdo nunca fique encoberto pela barra inferior.
