'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Code2,
  Layers,
  List,
  Compass,
  RefreshCw,
  Trash2,
  Search,
  CheckCircle2,
  Terminal,
  Zap,
  BookOpen,
} from 'lucide-react';
import { ScrollSpy } from '../../../components/scrollspy';

export default function ScrollSpyShowcasePage() {
  const [activeEvent, setActiveEvent] = useState<string>('Nenhum (inicie a rolagem)');
  const [activeNavDropdown, setActiveNavDropdown] = useState(false);
  const [jsConsoleLogs, setJsConsoleLogs] = useState<string[]>([
    '[Inicialização] ScrollSpy engine pronto. window.bootstrap.ScrollSpy disponível.',
  ]);

  const jsMonitoredRef = useRef<HTMLDivElement>(null);
  const jsInstanceRef = useRef<ScrollSpy | null>(null);

  // Escuta evento activate.bs.scrollspy disparado globalmente ou localmente
  useEffect(() => {
    const handleScrollSpyActivate = (e: Event) => {
      const customEvent = e as CustomEvent<{ relatedTarget?: string }>;
      const target = customEvent.detail?.relatedTarget || 'desconhecido';
      setActiveEvent(target);
      addLog(`[activate.bs.scrollspy] Novo destino ativo detectado: ${target}`);
    };

    window.addEventListener('activate.bs.scrollspy', handleScrollSpyActivate);
    return () => {
      window.removeEventListener('activate.bs.scrollspy', handleScrollSpyActivate);
    };
  }, []);

  const addLog = (msg: string) => {
    setJsConsoleLogs((prev) => [
      `[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`,
      ...prev.slice(0, 15),
    ]);
  };

  const handleRefreshAll = () => {
    if (typeof window !== 'undefined') {
      const w = window as unknown as { eddieScrollSpy?: { refreshAll: () => void } };
      w.eddieScrollSpy?.refreshAll();
      addLog('Método estático refreshAll() executado em todas as instâncias ativas.');
    }
  };

  // Testes interativos da API JavaScript
  const handleTestNewInstance = () => {
    if (!jsMonitoredRef.current) return;
    try {
      if (jsInstanceRef.current) {
        jsInstanceRef.current.dispose();
      }
      jsInstanceRef.current = new ScrollSpy(jsMonitoredRef.current, {
        target: '#js-test-nav',
        offset: 15,
        method: 'auto',
      });
      addLog('Sucesso: new bootstrap.ScrollSpy(element, { target: "#js-test-nav" }) inicializado.');
    } catch (err: unknown) {
      addLog(`Erro ao criar instância: ${(err as Error).message}`);
    }
  };

  const handleTestGetInstance = () => {
    if (!jsMonitoredRef.current) return;
    const inst = ScrollSpy.getInstance(jsMonitoredRef.current);
    if (inst) {
      addLog(`getInstance: Instância encontrada. Target atual ativo: ${inst.getActiveTargetId() || 'nenhum'}`);
    } else {
      addLog('getInstance: Nenhuma instância associada a este elemento DOM.');
    }
  };

  const handleTestGetOrCreateInstance = () => {
    if (!jsMonitoredRef.current) return;
    const inst = ScrollSpy.getOrCreateInstance(jsMonitoredRef.current, {
      target: '#js-test-nav',
      offset: 15,
    });
    jsInstanceRef.current = inst;
    addLog(`getOrCreateInstance: Instância obtida com sucesso. ID ativo: ${inst.getActiveTargetId() || 'nenhum'}`);
  };

  const handleTestRefreshInstance = () => {
    if (!jsMonitoredRef.current) return;
    const inst = ScrollSpy.getInstance(jsMonitoredRef.current);
    if (inst) {
      inst.refresh();
      addLog('refresh(): Coordenadas das seções recalculadas com sucesso.');
    } else {
      addLog('Aviso: Crie a instância antes de chamar refresh().');
    }
  };

  const handleTestDisposeInstance = () => {
    if (!jsMonitoredRef.current) return;
    const inst = ScrollSpy.getInstance(jsMonitoredRef.current);
    if (inst) {
      inst.dispose();
      jsInstanceRef.current = null;
      addLog('dispose(): Instância destruída e listeners de eventos removidos.');
    } else {
      addLog('Aviso: Nenhuma instância encontrada para destruição.');
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <Compass className="h-4 w-4" />
          Componente Universal DiskIngressos / EDDIE
        </div>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white flex items-center gap-3">
          Scrollspy Component
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-4xl leading-relaxed">
          O <strong>Scrollspy</strong> atualiza automaticamente os componentes de navegação, abas, barras laterais ou grupos de listas com base na posição de rolagem, indicando qual link está ativo na área visível com a classe <code className="text-emerald-400 font-mono">.active</code>.
          Totalmente compatível com a sintaxe de atributos de dados (<code className="text-emerald-400 font-mono">data-bs-spy="scroll"</code>), navegação aninhada e API JavaScript estática (<code className="text-emerald-400 font-mono">new bootstrap.ScrollSpy()</code>).
        </p>

        {/* Live Indicator & Status */}
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-zinc-300">Evento Ativo (activate.bs.scrollspy):</span>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/40">
              {activeEvent}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRefreshAll}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Recalcular Todas as Coordenadas (refresh)
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
            <h2 className="text-lg font-bold text-white">Exemplo 1: Exemplo na barra de navegação</h2>
          </div>
          <span className="rounded bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
            data-bs-target="#navbar-example2"
          </span>
        </div>

        <p className="text-xs text-zinc-400">
          Deslize a tela para baixo na área abaixo da barra de navegação e observe a classe ativa mudar. Os itens do menu suspenso também serão destacados.
        </p>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg space-y-4">
          {/* Navbar */}
          <nav
            id="navbar-example2"
            className="navbar flex items-center justify-between rounded-lg border border-zinc-700/60 bg-zinc-800/90 px-4 py-2.5"
          >
            <a className="navbar-brand text-xs font-bold text-white tracking-wider uppercase" href="#">
              Barra de navegação
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
                  aria-expanded={activeNavDropdown}
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
                    <li>
                      <hr className="dropdown-divider my-1 border-zinc-800" />
                    </li>
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
            data-bs-offset="15"
            className="scrollspy-example border border-zinc-800 bg-zinc-950/70 p-5 rounded-lg text-zinc-300 text-xs space-y-6"
            tabIndex={0}
          >
            <div id="scrollspyHeading1" className="scroll-mt-2">
              <h4 className="text-sm font-bold text-emerald-400">Primeiro título</h4>
              <p className="mt-1 text-zinc-400 leading-relaxed">
                Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
              </p>
            </div>

            <div id="scrollspyHeading2" className="scroll-mt-2">
              <h4 className="text-sm font-bold text-emerald-400">Segundo título</h4>
              <p className="mt-1 text-zinc-400 leading-relaxed">
                Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
              </p>
            </div>

            <div id="scrollspyHeading3" className="scroll-mt-2">
              <h4 className="text-sm font-bold text-emerald-400">Terceiro título</h4>
              <p className="mt-1 text-zinc-400 leading-relaxed">
                Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
              </p>
            </div>

            <div id="scrollspyHeading4" className="scroll-mt-2">
              <h4 className="text-sm font-bold text-emerald-400">Quarto cabeçalho</h4>
              <p className="mt-1 text-zinc-400 leading-relaxed">
                Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
              </p>
            </div>

            <div id="scrollspyHeading5" className="scroll-mt-2">
              <h4 className="text-sm font-bold text-emerald-400">Quinto título</h4>
              <p className="mt-1 text-zinc-400 leading-relaxed">
                Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
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
            <h2 className="text-lg font-bold text-white">Exemplo 2: Exemplo com navegação aninhada</h2>
          </div>
          <span className="rounded bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
            data-bs-target="#scrollspy_nest"
          </span>
        </div>

        <p className="text-xs text-zinc-400">
          O Scrollspy também funciona com elementos aninhados <code>.navs</code>. Se um elemento aninhado <code>.nav</code> for <code>active</code>, seus elementos pais também serão <code>active</code>. Role a área ao lado da barra de navegação e observe a mudança na classe ativa.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg">
          {/* Nested Navigation Menu */}
          <div className="md:col-span-4">
            <nav className="nav nav-pills flex-column space-y-1" id="scrollspy_nest">
              <a className="nav-link block rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors" href="#item-1">
                Item 1
              </a>
              <nav className="nav nav-pills flex-column pl-4 my-1 space-y-1 border-l border-zinc-800">
                <a className="nav-link block rounded px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors" href="#item-1-1">
                  Item 1-1
                </a>
                <a className="nav-link block rounded px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors" href="#item-1-2">
                  Item 1-2
                </a>
              </nav>
              <a className="nav-link block rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors" href="#item-2">
                Item 2
              </a>
              <a className="nav-link block rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors" href="#item-3">
                Item 3
              </a>
              <nav className="nav nav-pills flex-column pl-4 my-1 space-y-1 border-l border-zinc-800">
                <a className="nav-link block rounded px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors" href="#item-3-1">
                  Item 3-1
                </a>
                <a className="nav-link block rounded px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors" href="#item-3-2">
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
              className="scrollspy-example border border-zinc-800 bg-zinc-950/70 p-5 rounded-lg text-zinc-300 text-xs space-y-6"
              tabIndex={0}
            >
              <div id="item-1">
                <h4 className="text-sm font-bold text-white">Item 1</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed mb-3">
                  Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
                </p>
              </div>

              <div id="item-1-1">
                <h5 className="text-xs font-bold text-emerald-400">Item 1-1</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed mb-3">
                  Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
                </p>
              </div>

              <div id="item-1-2">
                <h5 className="text-xs font-bold text-emerald-400">Item 1-2</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed mb-3">
                  Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
                </p>
              </div>

              <div id="item-2">
                <h4 className="text-sm font-bold text-white">Item 2</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed mb-3">
                  Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
                </p>
              </div>

              <div id="item-3">
                <h4 className="text-sm font-bold text-white">Item 3</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed mb-3">
                  Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
                </p>
              </div>

              <div id="item-3-1">
                <h5 className="text-xs font-bold text-emerald-400">Item 3-1</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed mb-3">
                  Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
                </p>
              </div>

              <div id="item-3-2">
                <h5 className="text-xs font-bold text-emerald-400">Item 3-2</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
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
            <h2 className="text-lg font-bold text-white">Exemplo 3: Exemplo com grupo de lista</h2>
          </div>
          <span className="rounded bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
            data-bs-target="#scrollspy_list_group"
          </span>
        </div>

        <p className="text-xs text-zinc-400">
          O Scrollspy também funciona com <code>.list-groups</code>. Deslize a tela para a área ao lado do grupo da lista e observe a classe ativa mudar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg">
          {/* List Group Menu */}
          <div className="md:col-span-4">
            <div id="scrollspy_list_group" className="list-group flex flex-col space-y-1">
              <a
                className="list-group-item list-group-item-action block rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all border border-transparent"
                href="#list-item-1"
              >
                Item 1
              </a>
              <a
                className="list-group-item list-group-item-action block rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all border border-transparent"
                href="#list-item-2"
              >
                Item 2
              </a>
              <a
                className="list-group-item list-group-item-action block rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all border border-transparent"
                href="#list-item-3"
              >
                Item 3
              </a>
              <a
                className="list-group-item list-group-item-action block rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all border border-transparent"
                href="#list-item-4"
              >
                Item 4
              </a>
            </div>
          </div>

          {/* Monitored Content */}
          <div className="md:col-span-8">
            <div
              data-bs-spy="scroll"
              data-bs-target="#scrollspy_list_group"
              data-bs-offset="15"
              className="scrollspy-example border border-zinc-800 bg-zinc-950/70 p-5 rounded-lg text-zinc-300 text-xs space-y-6"
              tabIndex={0}
            >
              <div id="list-item-1">
                <h5 className="text-sm font-bold text-white">Item 1</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed mb-3">
                  Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
                </p>
              </div>

              <div id="list-item-2">
                <h5 className="text-sm font-bold text-white">Item 2</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed mb-3">
                  Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
                </p>
              </div>

              <div id="list-item-3">
                <h5 className="text-sm font-bold text-white">Item 3</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed mb-3">
                  Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
                </p>
              </div>

              <div id="list-item-4">
                <h5 className="text-sm font-bold text-white">Item 4</h5>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Este é um conteúdo de exemplo para a página do Scrollspy. Observe que, ao rolar a página para baixo, o link de navegação correspondente é destacado. Isso se repete ao longo do exemplo do componente. Continuamos adicionando mais textos de exemplo aqui para enfatizar a rolagem e o destaque.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          EXEMPLO 4: BARRA LATERAL FIXA & CONTENT-INNER
          ===================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Exemplo 4: Barra Lateral Fixa (.sidebar-component-right)</h2>
          </div>
          <span className="rounded bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
            data-bs-target=".sidebar-component-right"
          </span>
        </div>

        <p className="text-xs text-zinc-400">
          Utilização por meio de atributos em <code>.content-wrapper</code> e <code>.content-inner</code> com barra lateral ancorada à direita.
        </p>

        <div className="content-wrapper relative rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg">
          <div
            className="content-inner scrollspy-example grid grid-cols-1 md:grid-cols-12 gap-6"
            data-bs-spy="scroll"
            data-bs-target=".sidebar-component-right"
            data-bs-offset="20"
            tabIndex={0}
          >
            {/* Scrollable Content (Col 8) */}
            <div className="md:col-span-8 space-y-6">
              <div id="sidebar-sec-1">
                <h4 className="text-sm font-bold text-emerald-400">1. Resumo do Evento & Lotes</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Configurações principais do lote de ingressos, cotas de meia-entrada e políticas de cortesias emitidas para o produtor.
                </p>
              </div>
              <div id="sidebar-sec-2">
                <h4 className="text-sm font-bold text-emerald-400">2. Split & Liquidação Financeira</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Controle de split das taxas de conveniência, agenda de liquidação PIX e conciliação bancária 6 vias.
                </p>
              </div>
              <div id="sidebar-sec-3">
                <h4 className="text-sm font-bold text-emerald-400">3. Portaria & Controle de Catracas</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Validação instantânea por QR Code assinado assimetricamente com tolerância total a instabilidades de link.
                </p>
              </div>
              <div id="sidebar-sec-4">
                <h4 className="text-sm font-bold text-emerald-400">4. Auditoria de Fechamento</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Dossiê definitivo de prestação de contas com hash SHA-256 e emissão de extrato consolidado.
                </p>
              </div>
            </div>

            {/* Sidebar Sticky Nav (Col 4) */}
            <div className="md:col-span-4">
              <div className="sidebar sidebar-component sidebar-component-right sidebar-sticky sticky top-4 space-y-1 rounded-lg border border-zinc-800 bg-zinc-950/80 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1.5 border-b border-zinc-800">
                  Índice da Página
                </div>
                <div className="sidebar-content nav flex-column space-y-1 pt-1">
                  <a href="#sidebar-sec-1" className="nav-link block rounded px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition">
                    1. Resumo do Evento
                  </a>
                  <a href="#sidebar-sec-2" className="nav-link block rounded px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition">
                    2. Split & Liquidação
                  </a>
                  <a href="#sidebar-sec-3" className="nav-link block rounded px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition">
                    3. Portaria & Catracas
                  </a>
                  <a href="#sidebar-sec-4" className="nav-link block rounded px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition">
                    4. Auditoria de Fechamento
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          EXEMPLO 5: CONSOLE DE TESTES DA API JAVASCRIPT & MÉTODOS
          ===================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Console Interativo: Métodos do Scrollspy via JavaScript</h2>
          </div>
          <span className="rounded bg-emerald-950 px-2.5 py-0.5 text-xs font-mono text-emerald-400 border border-emerald-800/40">
            window.bootstrap.ScrollSpy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg">
          {/* Controls & Nav */}
          <div className="md:col-span-6 space-y-4">
            <div className="text-xs text-zinc-300 font-semibold">
              1. Ações da API JavaScript (4 Métodos Suportados):
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={handleTestNewInstance}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
              >
                <Zap size={14} />
                new ScrollSpy()
              </button>
              <button
                type="button"
                onClick={handleTestGetInstance}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
              >
                <Search size={14} />
                getInstance()
              </button>
              <button
                type="button"
                onClick={handleTestGetOrCreateInstance}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 transition"
              >
                <CheckCircle2 size={14} />
                getOrCreateInstance()
              </button>
              <button
                type="button"
                onClick={handleTestRefreshInstance}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 transition"
              >
                <RefreshCw size={14} />
                refresh()
              </button>
              <button
                type="button"
                onClick={handleTestDisposeInstance}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 transition"
              >
                <Trash2 size={14} />
                dispose()
              </button>
            </div>

            {/* Test Navigation Bar */}
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-zinc-400 mb-1">
                Alvo de Teste (<code>#js-test-nav</code>):
              </div>
              <nav id="js-test-nav" className="nav nav-pills flex gap-2">
                <a href="#jstest-1" className="nav-link px-3 py-1 rounded bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700">
                  Módulo 1
                </a>
                <a href="#jstest-2" className="nav-link px-3 py-1 rounded bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700">
                  Módulo 2
                </a>
                <a href="#jstest-3" className="nav-link px-3 py-1 rounded bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700">
                  Módulo 3
                </a>
              </nav>
            </div>

            {/* Element Monitored via JavaScript */}
            <div
              ref={jsMonitoredRef}
              className="h-44 overflow-y-auto p-4 rounded-lg border border-zinc-800 bg-zinc-950/80 text-xs text-zinc-300 space-y-4 scroll-smooth"
            >
              <div id="jstest-1">
                <div className="font-bold text-emerald-400">Módulo 1: Auditoria Fiscal</div>
                <p className="mt-1 text-zinc-400 text-[11px]">
                  Rastreabilidade imutável de transações contábeis e notas fiscais com partidas dobradas.
                </p>
              </div>
              <div id="jstest-2">
                <div className="font-bold text-emerald-400">Módulo 2: Motor Antifraude</div>
                <p className="mt-1 text-zinc-400 text-[11px]">
                  Score comportamental por inteligência artificial e bloqueio preditivo de estornos de cartões.
                </p>
              </div>
              <div id="jstest-3">
                <div className="font-bold text-emerald-400">Módulo 3: Conciliação Bancária</div>
                <p className="mt-1 text-zinc-400 text-[11px]">
                  Confronto de adquirentes, CNAB 240/400 e extratos PIX do Banco Central em tempo real.
                </p>
              </div>
            </div>
          </div>

          {/* Live Terminal Log */}
          <div className="md:col-span-6 flex flex-col h-full">
            <div className="flex items-center justify-between pb-2 text-xs font-semibold text-zinc-300">
              <div className="flex items-center gap-1.5">
                <Terminal size={14} className="text-emerald-400" />
                <span>Log do Console & Disparador de Eventos</span>
              </div>
              <button
                type="button"
                onClick={() => setJsConsoleLogs([])}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
              >
                Limpar
              </button>
            </div>
            <div className="flex-1 min-h-[220px] rounded-lg border border-zinc-800 bg-black/90 p-3 font-mono text-[11px] text-emerald-400/90 overflow-y-auto space-y-1">
              {jsConsoleLogs.map((log, idx) => (
                <div key={idx} className="leading-tight break-all">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          TABELA DE OPÇÕES E ESPECIFICAÇÃO TÉCNICA
          ===================================================================== */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-400" />
          Opções e Métodos Oficiais do Scrollspy
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                <th className="py-2.5 px-3">Nome (PT / EN)</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Padrão</th>
                <th className="py-2.5 px-3">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              <tr>
                <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">desvio / offset</td>
                <td className="py-2.5 px-3 font-mono text-zinc-400">número</td>
                <td className="py-2.5 px-3 font-mono text-zinc-400">10</td>
                <td className="py-2.5 px-3">Pixels a serem deslocados do topo ao calcular a posição da rolagem.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">método / method</td>
                <td className="py-2.5 px-3 font-mono text-zinc-400">corda</td>
                <td className="py-2.5 px-3 font-mono text-zinc-400">auto</td>
                <td className="py-2.5 px-3">
                  Encontra em qual seção o elemento espionado está: <code>auto</code> escolhe o melhor método, <code>offset</code> usa <code>getBoundingClientRect()</code> e <code>position</code> usa <code>offsetTop / offsetLeft</code>.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">alvo / target</td>
                <td className="py-2.5 px-3 font-mono text-zinc-400">string | DOM</td>
                <td className="py-2.5 px-3 font-mono text-zinc-400">obrigatório</td>
                <td className="py-2.5 px-3">Especifica o seletor ou elemento ao qual o plugin Scrollspy será aplicado.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Technical Requirements Callout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 space-y-2">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              Requisitos de Funcionamento
            </div>
            <ul className="list-disc pl-4 space-y-1 text-zinc-400">
              <li>Deve ser usado em um componente de navegação ou grupo de listas.</li>
              <li>Requer <code>position: relative;</code> no elemento monitorado (ou no body).</li>
              <li>Em elementos que não sejam o body, requer <code>height</code> definido e <code>overflow-y: scroll / auto;</code>.</li>
              <li>Âncoras (<code>&lt;a&gt;</code>) devem apontar para um elemento com respectivo <code>id</code>.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 space-y-2">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Code2 size={15} />
              Disparador de Eventos
            </div>
            <p className="text-zinc-400 leading-relaxed">
              O evento <code>activate.bs.scrollspy</code> é acionado no elemento de rolagem sempre que um novo item é ativado:
            </p>
            <pre className="rounded bg-zinc-900 p-2 font-mono text-[10px] text-zinc-300 overflow-x-auto">
{`const firstScrollSpyEl = document.querySelector('[data-bs-spy="scroll"]');
firstScrollSpyEl.addEventListener('activate.bs.scrollspy', function (e) {
  console.log('Novo alvo ativo:', e.detail.relatedTarget);
});`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
