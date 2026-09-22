# EDDIE 9.4 — Design System e UX Enterprise: Padrão Visual Consolidado

## 1. Diretriz Estratégica: Congelamento Visual e Identidade Própria

O ecossistema **EDDIE PDT** possui um Design System institucional próprio, moderno, escuro e de alta densidade informativa, concebido especificamente para operações críticas de bilheteria e finanças. 

> [!IMPORTANT]
> **Regra Fundamental de UX:** É terminantemente proibido importar estilos legados, bibliotecas de CSS paralelas ou estruturas despadronizadas do SafeSaff. O EDDIE adota sua própria identidade visual fundamentada em **Tailwind CSS + shadcn/ui + Lucide Icons**, mantendo consistência e coesão estética absoluta em 100% das telas.

---

## 2. Paleta de Cores e Tokens Semânticos

### 2.1. Superfícies e Fundos (Dark Theme)
- **Fundo Global do PDT:** `#0a0e17` / `#0d1322`
- **Superfície de Cards e Painéis:** `#111827` (slate-900 / gray-900)
- **Modais e Overlays:** `#0d1322` sobre `bg-black/75 backdrop-blur-sm`
- **Bordas Estruturais de Alto Contraste:** `#1e293b` (slate-800)
- **Divisórias e Linhas de Separação:** `#1e293b80` (border-slate-800/80)

### 2.2. Acentos Cromáticos por Domínio
Cada módulo do EDDIE possui um acento cromático característico para orientação cognitiva imediata do operador:

| Domínio Funcional | Cor de Acento | Tailwind Base | Finalidade |
|---|---|---|---|
| **Financeiro & Ledger** | Esmeralda | `emerald-400` / `green-500` | Saldos disponíveis, créditos, baixas liquidadas e partidas dobradas |
| **Contabilidade & DRE** | Púrpura / Índigo | `purple-400` / `indigo-500` | Centros de controle, livros diários, balancetes e competências |
| **SAC Comprador 360°** | Céu / Sky | `sky-400` / `sky-500` | Consulta de comprador, tickets de atendimento e threads de mensagem |
| **Suporte a Eventos** | Âmbar / Laranja | `amber-400` / `orange-500` | Ocorrências de campo, alertas técnicos, catracas e redes |
| **Estorno & Chargeback** | Rosa / Carmim | `rose-400` / `rose-500` | Direito de arrependimento CDC Art. 49, contestações e retenções |
| **Comercial B2B** | Azul Corporativo | `blue-400` / `blue-500` | Funil Kanban, produtoras B2B, comissões e reuniões |
| **Marketing & Pixels** | Violeta / Ciano | `cyan-400` / `violet-500` | Campanhas multicanal, CAPI Meta/TikTok/Google e UTMs |

---

## 3. Padrões Estruturais de Componentes

### 3.1. Navegação Global: Sidebar & Header
- **Sidebar Fixa:** Largura de `w-64`, fundo `#0d1322`, borda direita `#1e293b`, com os 9 bounded contexts organizados de forma unificada e badges funcionais explicativos (`Ledger`, `DRE`, `360°`, `CDC Art. 49`, `CRM`, etc.).
- **Header Global de Contexto:** Apresenta a logo institucional, breadcrumbs do módulo ativo e o **seletor global Produtor × Evento**, mantido pelo `ProducerEventContext`. Toda a interface se adapta instantaneamente quando o produtor ou evento ativo é alterado.

### 3.2. Cards de KPI (Key Performance Indicators)
Todos os cartões de métricas do sistema utilizam o mesmo padrão:
```tsx
<div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
  <div className="flex items-center justify-between text-slate-400 text-xs">
    <span>Rótulo do Indicador</span>
    <Icone size={16} className="text-cor-tema" />
  </div>
  <div className="text-2xl font-bold text-white mt-1">R$ 1.250.000,00</div>
  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
    Subtexto explicativo ou percentual de variação
  </div>
</div>
```

### 3.3. Tabelas de Dados Enterprise
- Cabeçalhos discretos em caixa alta com `text-[10px] uppercase font-bold text-slate-400 bg-slate-950/60`;
- Linhas com efeito zebra suave ou hover destacado (`hover:bg-slate-800/40`);
- Valores monetários alinhados à direita, formatados em BRL (`R$ 0,00`) e com fontes numéricas tabulares monoespaçadas quando aplicável;
- Badges de status com fundos semitransparentes e bordas sutis (`bg-emerald-500/10 text-emerald-400 border border-emerald-500/30`).

### 3.4. Modais Operacionais e Formulários
- Backdrop opaco com desfoque (`bg-black/75 backdrop-blur-sm`);
- Card do modal centralizado com cantos arredondados (`rounded-2xl`), bordas finas `#1e293b` e sombra profunda (`shadow-2xl`);
- Inputs com fundo `#0d1322` ou `bg-slate-950`, borda cinza escura `border-slate-700`, texto branco e foco colorido na cor temática do módulo;
- Botões primários com efeito sutil de sombra e gradiente discreto; botões de cancelamento neutros em `border-slate-700 text-slate-300 hover:bg-slate-800`.

---

## 4. Estados de Interface (UX Resiliente)

1. **Estado de Carregamento (Loading):** Spawns de skeletons proporcionais ou spinners discretos `Loader2` com mensagem contextual ("Carregando posições financeiras...", "Consultando comprador na base...").
2. **Estado Vazio (Empty State):** Ícone temático centralizado em cinza com mensagem amigável e botão de ação primária (ex: "Nenhuma ocorrência registrada para este evento. Clique em 'Registrar Ocorrência' para abrir um chamado.").
3. **Estado de Erro (Error State):** Banners com borda avermelhada e ícone de alerta, explicando a causa da falha e disponibilizando botão de nova tentativa imediata ("Tentar Novamente").
4. **Sem Botões Decorativos:** Cada botão da interface executa uma ação real: ou abre um modal funcional com submissão para API, ou dispara um `fetch` assíncrono com mutação de estado e feedback de sucesso/erro.

---

## 5. Acessibilidade e Internacionalização (pt-BR)
- 100% dos textos, mensagens de erro, cabeçalhos, dicas e botões são redigidos em Português do Brasil de forma clara e profissional;
- Valores monetários usam vírgula como separador decimal (`R$ 1.500,50`) e nunca notação americana em tela;
- Datas e horários no padrão brasileiro (`DD/MM/AAAA HH:mm:ss`).
