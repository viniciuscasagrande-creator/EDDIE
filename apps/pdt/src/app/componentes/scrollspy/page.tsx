'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Code2,
  CheckCircle2,
  Layers,
  List,
  Compass,
  ArrowRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useScrollSpy } from '../../../components/scrollspy';

export default function ScrollSpyShowcasePage() {
  const [activeEvent, setActiveEvent] = useState<string>('Nenhum (inicie a rolagem)');
  const [activeNavDropdown, setActiveNavDropdown] = useState(false);

  useEffect(() => {
    const handleScrollSpyActivate = (e: Event) => {
      const customEvent = e as CustomEvent<{ relatedTarget?: string }>;
      if (customEvent.detail?.relatedTarget) {
        setActiveEvent(customEvent.detail.relatedTarget);
      }
    };

    window.addEventListener('activate.bs.scrollspy', handleScrollSpyActivate);
    return () => {
      window.removeEventListener('activate.bs.scrollspy', handleScrollSpyActivate);
    };
  }, []);

  const handleRefreshAll = () => {
    if (typeof window !== 'undefined') {
      const w = window as unknown as { eddieScrollSpy?: { refreshAll: () => void } };
      w.eddieScrollSpy?.refreshAll();
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <Compass className="h-4 w-4" />
          Componentes Globais EDDIE
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
          Scrollspy Global
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-3xl">
          Atualização automática de componentes de navegação, abas, menus de ancoragem e list-groups com base na posição da rolagem.
          Compatível tanto com a sintaxe padrão de atributos (<code className="text-emerald-400">data-bs-spy="scroll"</code>) quanto via React Hook (<code className="text-emerald-400">useScrollSpy</code>).
        </p>

        {/* Live Indicator */}
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-zinc-300">Evento ativo (activate.bs.scrollspy):</span>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              {activeEvent}
            </span>
          </div>
          <button
            onClick={handleRefreshAll}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Recalcular Coordenadas (refresh)
          </button>
        </div>
      </div>

      {/* =====================================================================
          EXEMPLO 1: BARRA DE NAVEGAÇÃO COM DROPDOWN
          ===================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100">Exemplo 1: Barra de Navegação (Navbar & Dropdown)</h2>
          </div>
          <span className="rounded bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
            data-bs-target="#navbar-example2"
          </span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg space-y-4">
          {/* Navbar Bar */}
          <nav
            id="navbar-example2"
            className="flex items-center justify-between rounded-lg border border-zinc-700/60 bg-zinc-800/80 px-4 py-2.5"
          >
            <a className="text-xs font-bold text-zinc-100 uppercase tracking-wider" href="#">
              Navbar EDDIE
            </a>
            <ul className="nav nav-pills flex items-center gap-1 list-none p-0 m-0">
              <li className="nav-item">
                <a
                  className="nav-link rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                  href="#scrollspyHeading1"
                >
                  Primeiro
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                  href="#scrollspyHeading2"
                >
                  Segundo
                </a>
              </li>
              <li className="nav-item dropdown relative">
                <button
                  onClick={() => setActiveNavDropdown(!activeNavDropdown)}
                  className="nav-link dropdown-toggle flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                  type="button"
                >
                  Suspenso <span className="text-[10px]">▼</span>
                </button>
                {activeNavDropdown && (
                  <ul className="dropdown-menu absolute right-0 mt-1 min-w-[140px] rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-2xl z-30">
                    <li>
                      <a
                        className="dropdown-item block rounded-md px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        href="#scrollspyHeading3"
                        onClick={() => setActiveNavDropdown(false)}
                      >
                        Terceiro
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item block rounded-md px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        href="#scrollspyHeading4"
                        onClick={() => setActiveNavDropdown(false)}
                      >
                        Quarto
                      </a>
                    </li>
                    <li className="my-1 border-t border-zinc-800"></li>
                    <li>
                      <a
                        className="dropdown-item block rounded-md px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        href="#scrollspyHeading5"
                        onClick={() => setActiveNavDropdown(false)}
                      >
                        Quinto
                      </a>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </nav>

          {/* Scrollspy Monitored Content */}
          <div
            data-bs-spy="scroll"
            data-bs-target="#navbar-example2"
            data-bs-offset="20"
            className="scrollspy-example border border-zinc-800/80 bg-zinc-950/60 p-5 rounded-lg text-zinc-300 text-xs space-y-6"
            tabIndex={0}
          >
            <div id="scrollspyHeading1" className="scroll-mt-4">
              <h4 className="text-sm font-bold text-emerald-400">Primeiro título</h4>
              <p className="mt-1 text-zinc-400 leading-relaxed">
                Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo,
                o link de navegação correspondente é destacado automaticamente com classe <code className="text-emerald-300">.active</code>.
                Continuamos adicionando textos operacionais para enfatizar a detecção da rolagem e o realce da barra superior.
              </p>
            </div>

            <div id="scrollspyHeading2" className="scroll-mt-4">
              <h4 className="text-sm font-bold text-emerald-400">Segundo título</h4>
              <p className="mt-1 text-zinc-400 leading-relaxed">
                Nesta seção, o segundo item torna-se ativo enquanto o primeiro perde a classe ativa. O motor de cálculo
                avalia com precisão a distância até o topo do container, assegurando transições instantâneas e sem atrasos.
              </p>
            </div>

            <div id="scrollspyHeading3" className="scroll-mt-4">
              <h4 className="text-sm font-bold text-emerald-400">Terceiro título</h4>
              <p className="mt-1 text-zinc-400 leading-relaxed">
                Ao ativar este item, o botão do menu suspenso ("Suspenso") na barra superior também recebe a classe
                <code className="text-emerald-300">.active</code>, indicando visualmente que um item subordinado está em exibição.
              </p>
            </div>

            <div id="scrollspyHeading4" className="scroll-mt-4">
              <h4 className="text-sm font-bold text-emerald-400">Quarto cabeçalho</h4>
              <p className="mt-1 text-zinc-400 leading-relaxed">
                Demonstração da robustez contínua da ancoragem. Ao clicar no link correspondente, a rolagem suave desliza
                exatamente para este ponto sem deslocamento indevido.
              </p>
            </div>

            <div id="scrollspyHeading5" className="scroll-mt-4">
              <h4 className="text-sm font-bold text-emerald-400">Quinto título</h4>
              <p className="mt-1 text-zinc-400 leading-relaxed">
                Última seção do exemplo de barra de navegação. Mesmo no fim do scroll, o algoritmo ativa o último item
                de forma garantida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          EXEMPLO 2: NAVEGAÇÃO ANINHADA (NESTED NAVS)
          ===================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100">Exemplo 2: Navegação Aninhada (Nested Navs)</h2>
          </div>
          <span className="rounded bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
            data-bs-target="#scrollspy_nest"
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg">
          {/* Nested Sidebar Nav */}
          <div className="md:col-span-4">
            <nav id="scrollspy_nest" className="nav flex-column space-y-1">
              <a className="nav-link block rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white" href="#item-1">
                Item 1
              </a>
              <nav className="nav flex-column pl-4 space-y-1 border-l border-zinc-800">
                <a className="nav-link block rounded px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-200" href="#item-1-1">
                  Item 1-1
                </a>
                <a className="nav-link block rounded px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-200" href="#item-1-2">
                  Item 1-2
                </a>
              </nav>
              <a className="nav-link block rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white" href="#item-2">
                Item 2
              </a>
              <a className="nav-link block rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white" href="#item-3">
                Item 3
              </a>
              <nav className="nav flex-column pl-4 space-y-1 border-l border-zinc-800">
                <a className="nav-link block rounded px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-200" href="#item-3-1">
                  Item 3-1
                </a>
                <a className="nav-link block rounded px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-200" href="#item-3-2">
                  Item 3-2
                </a>
              </nav>
            </nav>
          </div>

          {/* Monitored Content */}
          <div className="md:col-span-8">
            <div
              data-bs-spy="scroll"
              data-bs-target="#scrollspy_nest"
              data-bs-offset="15"
              className="scrollspy-example border border-zinc-800/80 bg-zinc-950/60 p-5 rounded-lg text-zinc-300 text-xs space-y-6"
              tabIndex={0}
            >
              <div id="item-1">
                <h4 className="text-sm font-bold text-zinc-100">Item 1</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Conteúdo do Item principal 1. Quando este item ou seus sub-itens estiverem visíveis, a hierarquia correspondente é destacada.
                </p>
              </div>

              <div id="item-1-1">
                <h5 className="text-xs font-bold text-emerald-400">Item 1-1</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Sub-item 1-1. O elemento pai (Item 1) permanece ativado em conjunto com o sub-item selecionado.
                </p>
              </div>

              <div id="item-1-2">
                <h5 className="text-xs font-bold text-emerald-400">Item 1-2</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Sub-item 1-2 com detalhes operacionais e parâmetros de auditoria do sistema.
                </p>
              </div>

              <div id="item-2">
                <h4 className="text-sm font-bold text-zinc-100">Item 2</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Item 2 individual sem subordinações. Transição imediata de destaque na barra lateral.
                </p>
              </div>

              <div id="item-3">
                <h4 className="text-sm font-bold text-zinc-100">Item 3</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Item 3 com estrutura de dois novos sub-itens.
                </p>
              </div>

              <div id="item-3-1">
                <h5 className="text-xs font-bold text-emerald-400">Item 3-1</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Conteúdo analítico de Item 3-1.
                </p>
              </div>

              <div id="item-3-2">
                <h5 className="text-xs font-bold text-emerald-400">Item 3-2</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Conteúdo final de Item 3-2 demonstrando alinhamento estrito.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          EXEMPLO 3: GRUPO DE LISTA (.LIST-GROUP)
          ===================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100">Exemplo 3: Grupo de Listas (.list-group)</h2>
          </div>
          <span className="rounded bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
            data-bs-target="#scrollspy_list_group"
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg">
          {/* List Group Menu */}
          <div className="md:col-span-4">
            <div id="scrollspy_list_group" className="list-group flex flex-col space-y-1">
              <a
                className="list-group-item list-group-item-action block rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-all border border-transparent"
                href="#list-item-1"
              >
                Item 1 (Configuração Básica)
              </a>
              <a
                className="list-group-item list-group-item-action block rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-all border border-transparent"
                href="#list-item-2"
              >
                Item 2 (Preços e Lotes)
              </a>
              <a
                className="list-group-item list-group-item-action block rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-all border border-transparent"
                href="#list-item-3"
              >
                Item 3 (Check-in e Catracas)
              </a>
              <a
                className="list-group-item list-group-item-action block rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-all border border-transparent"
                href="#list-item-4"
              >
                Item 4 (Financeiro e Liquidação)
              </a>
            </div>
          </div>

          {/* Monitored Content */}
          <div className="md:col-span-8">
            <div
              data-bs-spy="scroll"
              data-bs-target="#scrollspy_list_group"
              data-bs-offset="15"
              className="scrollspy-example border border-zinc-800/80 bg-zinc-950/60 p-5 rounded-lg text-zinc-300 text-xs space-y-6"
              tabIndex={0}
            >
              <div id="list-item-1">
                <h5 className="text-sm font-bold text-zinc-100">Item 1 (Configuração Básica)</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Definições gerais do evento, datas de abertura e fechamento das vendas, classificação etária e mapa de assentos.
                </p>
              </div>

              <div id="list-item-2">
                <h5 className="text-sm font-bold text-zinc-100">Item 2 (Preços e Lotes)</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Matriz de precificação por setor, lotes promocionais, taxas de conveniência individuais e regras de meia-entrada.
                </p>
              </div>

              <div id="list-item-3">
                <h5 className="text-sm font-bold text-zinc-100">Item 3 (Check-in e Catracas)</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Configuração dos pontos de acesso físico, sincronização offline com catracas eletrônicas e tolerância a quedas de link.
                </p>
              </div>

              <div id="list-item-4">
                <h5 className="text-sm font-bold text-zinc-100">Item 4 (Financeiro e Liquidação)</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Escrituração no Ledger de partidas dobradas, agenda de repasses Pix, split automático e conciliação 6 vias.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          GUIA DE USO RÁPIDO DO DESENVOLVEDOR
          ===================================================================== */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-emerald-400" />
          Como Usar o Scrollspy em Qualquer Página do EDDIE
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 space-y-2">
            <div className="font-semibold text-emerald-400">1. Por Atributos HTML / JSX (Sem Código Extra):</div>
            <pre className="rounded bg-zinc-900 p-2 font-mono text-[11px] text-zinc-300 overflow-x-auto">
{`<nav id="meu-nav" className="nav nav-pills">
  <a className="nav-link" href="#secao1">Seção 1</a>
  <a className="nav-link" href="#secao2">Seção 2</a>
</nav>

<div
  data-bs-spy="scroll"
  data-bs-target="#meu-nav"
  data-bs-offset="10"
  className="scrollspy-example"
>
  <h4 id="secao1">Seção 1</h4>
  <p>Conteúdo...</p>
  <h4 id="secao2">Seção 2</h4>
  <p>Conteúdo...</p>
</div>`}
            </pre>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 space-y-2">
            <div className="font-semibold text-emerald-400">2. Por React Hook (Controle de Estado):</div>
            <pre className="rounded bg-zinc-900 p-2 font-mono text-[11px] text-zinc-300 overflow-x-auto">
{`import { useScrollSpy } from '@/components/scrollspy';

function MinhaPagina() {
  const { activeId, scrollTo } = useScrollSpy({
    target: '#meu-nav',
    offset: 80,
    onActiveChange: (id) => console.log('Ativo:', id)
  });

  return (
    <div>
      <p>Seção atual: {activeId}</p>
      <button onClick={() => scrollTo('secao2')}>
        Pular para Seção 2
      </button>
    </div>
  );
}`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
