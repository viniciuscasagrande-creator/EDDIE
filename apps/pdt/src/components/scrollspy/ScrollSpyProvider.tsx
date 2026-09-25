'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initGlobalScrollSpy, scanAndInitDataElements } from './scrollspy-core';

export function ScrollSpyProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Inicializa ScrollSpy globalmente
    initGlobalScrollSpy();

    // 2. Observa mutações dinâmicas no DOM (renderização de páginas e modais no Next.js)
    const observer = new MutationObserver(() => {
      scanAndInitDataElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-bs-spy', 'data-spy'],
    });

    // 3. Listener global de clique em âncoras para rolagem suave com compensação de cabeçalho
    const handleGlobalAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href === '#' || !href.startsWith('#')) return;

      const targetId = href.substring(1);
      const sectionEl = document.getElementById(targetId);
      if (!sectionEl) return;

      // Se o elemento estiver dentro de um container com data-bs-spy, o próprio ScrollSpy cuida
      const spyContainer = sectionEl.closest('[data-bs-spy="scroll"], [data-spy="scroll"]');
      if (spyContainer) return;

      // Se for rolagem da página principal
      e.preventDefault();
      const mainEl = document.querySelector('main');
      const offset = 80; // compensação do header fixo

      if (mainEl && mainEl.scrollHeight > mainEl.clientHeight) {
        const rect = sectionEl.getBoundingClientRect();
        const mainRect = mainEl.getBoundingClientRect();
        const top = rect.top - mainRect.top + mainEl.scrollTop - offset;
        mainEl.scrollTo({ top, behavior: 'smooth' });
      } else {
        const top = sectionEl.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }

      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', href);
      }
    };

    document.addEventListener('click', handleGlobalAnchorClick);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleGlobalAnchorClick);
    };
  }, []);

  // Re-escaneia ao mudar de rota
  useEffect(() => {
    const timer = setTimeout(() => {
      scanAndInitDataElements();
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return <>{children}</>;
}
