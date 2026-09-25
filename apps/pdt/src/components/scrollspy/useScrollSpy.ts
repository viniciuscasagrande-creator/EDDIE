'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { ScrollSpy, ScrollSpyOptions } from './scrollspy-core';

export interface UseScrollSpyOptions {
  target: string; // CSS selector para o container da navegação (#navbar, .list-group, etc.)
  containerRef?: React.RefObject<HTMLElement | null>;
  offset?: number;
  method?: 'auto' | 'offset' | 'position';
  smoothScroll?: boolean;
  onActiveChange?: (activeId: string) => void;
}

export function useScrollSpy(options: UseScrollSpyOptions) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollSpyRef = useRef<ScrollSpy | null>(null);

  const { target, offset = 10, method = 'auto', smoothScroll = true, onActiveChange } = options;

  useEffect(() => {
    const containerEl = options.containerRef?.current || document.body;

    const instance = ScrollSpy.getOrCreateInstance(containerEl, {
      target,
      offset,
      method,
      smoothScroll,
    });

    scrollSpyRef.current = instance;

    const handleActivate = (e: Event) => {
      const customEvent = e as CustomEvent<{ relatedTarget: string }>;
      const related = customEvent.detail?.relatedTarget;
      if (related && related.startsWith('#')) {
        const id = related.substring(1);
        setActiveId(id);
        if (onActiveChange) {
          onActiveChange(id);
        }
      }
    };

    containerEl.addEventListener('activate.bs.scrollspy', handleActivate);

    // Atualiza estado inicial
    setActiveId(instance.getActiveTargetId());

    return () => {
      containerEl.removeEventListener('activate.bs.scrollspy', handleActivate);
      instance.dispose();
      scrollSpyRef.current = null;
    };
  }, [target, offset, method, smoothScroll, options.containerRef, onActiveChange]);

  const refresh = useCallback(() => {
    if (scrollSpyRef.current) {
      scrollSpyRef.current.refresh();
      setActiveId(scrollSpyRef.current.getActiveTargetId());
    }
  }, []);

  const scrollTo = useCallback(
    (id: string) => {
      const sectionEl = document.getElementById(id);
      if (!sectionEl) return;

      const containerEl = options.containerRef?.current;
      if (!containerEl || containerEl === document.body) {
        const top = sectionEl.getBoundingClientRect().top + window.scrollY - offset + 2;
        window.scrollTo({ top, behavior: 'smooth' });
      } else {
        const rect = sectionEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();
        const top = rect.top - containerRect.top + containerEl.scrollTop - offset + 2;
        containerEl.scrollTo({ top, behavior: 'smooth' });
      }

      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', `#${id}`);
      }
    },
    [offset, options.containerRef],
  );

  return {
    activeId,
    refresh,
    scrollTo,
  };
}
