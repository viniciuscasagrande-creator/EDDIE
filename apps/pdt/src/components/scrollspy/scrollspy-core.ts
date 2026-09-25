/**
 * EDDIE GLOBAL SCROLLSPY CORE
 * Implementação universal do Scrollspy para o ecossistema DiskIngressos / EDDIE.
 * Compatível com a API padrão do Bootstrap (data-bs-spy="scroll", data-bs-target, etc.),
 * suportando barras de navegação, navegações aninhadas, list-groups e sidebars em React/Next.js.
 */

export interface ScrollSpyOptions {
  target: string | HTMLElement;
  offset?: number;
  method?: 'auto' | 'offset' | 'position';
  smoothScroll?: boolean;
}

export interface ScrollSpyTargetItem {
  id: string;
  element: HTMLElement;
  navLinks: HTMLElement[];
  top: number;
  height: number;
}

const instancesMap = new WeakMap<HTMLElement, ScrollSpy>();

export class ScrollSpy {
  private element: HTMLElement | Window;
  private scrollElement: HTMLElement | Window;
  private options: Required<ScrollSpyOptions>;
  private targets: ScrollSpyTargetItem[] = [];
  private activeTargetId: string | null = null;
  private onScrollHandler: () => void;
  private onClickHandler: (e: MouseEvent) => void;
  private isWindow = false;

  constructor(element: HTMLElement | string, options: ScrollSpyOptions) {
    const el = typeof element === 'string' ? document.querySelector<HTMLElement>(element) : element;
    if (!el) {
      throw new Error(`[ScrollSpy] Elemento ${element} não encontrado no DOM.`);
    }

    this.element = el;
    this.isWindow = el === document.body || el.tagName === 'BODY' || el.tagName === 'HTML';
    this.scrollElement = this.isWindow ? window : el;

    this.options = {
      target: options.target,
      offset: options.offset ?? 10,
      method: options.method ?? 'auto',
      smoothScroll: options.smoothScroll ?? true,
    };

    this.onScrollHandler = this.throttle(() => this.process(), 40);
    this.onClickHandler = (e: MouseEvent) => this.handleAnchorClick(e);

    instancesMap.set(el, this);

    this.refresh();
    this.bindEvents();

    // Primeira verificação imediata
    setTimeout(() => this.process(), 50);
  }

  // =========================================================================
  // Métodos Públicos Estáticos (compatíveis com bootstrap.ScrollSpy)
  // =========================================================================

  static getInstance(element: HTMLElement): ScrollSpy | undefined {
    return instancesMap.get(element);
  }

  static getOrCreateInstance(element: HTMLElement, options?: Partial<ScrollSpyOptions>): ScrollSpy {
    const existing = instancesMap.get(element);
    if (existing) return existing;

    const target =
      options?.target ||
      element.getAttribute('data-bs-target') ||
      element.getAttribute('data-target') ||
      '';

    const offset = Number(
      options?.offset ??
        element.getAttribute('data-bs-offset') ??
        element.getAttribute('data-offset') ??
        10,
    );

    const method = (options?.method ||
      element.getAttribute('data-bs-method') ||
      'auto') as 'auto' | 'offset' | 'position';

    return new ScrollSpy(element, {
      target,
      offset,
      method,
    });
  }

  // =========================================================================
  // Métodos da Instância
  // =========================================================================

  refresh(): void {
    const targetContainer =
      typeof this.options.target === 'string'
        ? document.querySelector<HTMLElement>(this.options.target)
        : this.options.target;

    if (!targetContainer) {
      this.targets = [];
      return;
    }

    // Busca todas as âncoras dentro do componente de navegação ou list-group
    const anchors = Array.from(
      targetContainer.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
    );

    const map = new Map<string, HTMLElement[]>();

    for (const anchor of anchors) {
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || !href.startsWith('#')) continue;
      const targetId = href.substring(1);
      const existing = map.get(targetId) || [];
      existing.push(anchor);
      map.set(targetId, existing);
    }

    this.targets = [];

    for (const [id, navLinks] of map.entries()) {
      const sectionEl = document.getElementById(id);
      if (!sectionEl) continue;

      this.targets.push({
        id,
        element: sectionEl,
        navLinks,
        top: 0,
        height: 0,
      });
    }

    // Atualiza coordenadas relativas
    this.updateCoordinates();
    this.process();
  }

  dispose(): void {
    if (this.scrollElement === window) {
      window.removeEventListener('scroll', this.onScrollHandler);
      window.removeEventListener('resize', this.onScrollHandler);
    } else {
      (this.scrollElement as HTMLElement).removeEventListener('scroll', this.onScrollHandler);
    }

    const targetContainer =
      typeof this.options.target === 'string'
        ? document.querySelector<HTMLElement>(this.options.target)
        : this.options.target;

    if (targetContainer) {
      targetContainer.removeEventListener('click', this.onClickHandler);
    }

    if (this.element instanceof HTMLElement) {
      instancesMap.delete(this.element);
    }
  }

  getActiveTargetId(): string | null {
    return this.activeTargetId;
  }

  // =========================================================================
  // Processamento e Ativação
  // =========================================================================

  private updateCoordinates(): void {
    if (this.isWindow) {
      const scrollY = window.scrollY || window.pageYOffset;
      for (const t of this.targets) {
        const rect = t.element.getBoundingClientRect();
        t.top = rect.top + scrollY;
        t.height = rect.height;
      }
    } else {
      const container = this.element as HTMLElement;
      const containerScrollTop = container.scrollTop;
      const containerRect = container.getBoundingClientRect();

      for (const t of this.targets) {
        const rect = t.element.getBoundingClientRect();
        t.top = rect.top - containerRect.top + containerScrollTop;
        t.height = rect.height;
      }
    }

    // Ordena do topo para o fundo
    this.targets.sort((a, b) => a.top - b.top);
  }

  private process(): void {
    if (this.targets.length === 0) return;

    this.updateCoordinates();

    let scrollTop = 0;
    let scrollHeight = 0;
    let offsetHeight = 0;

    if (this.isWindow) {
      scrollTop = window.scrollY || window.pageYOffset;
      scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      offsetHeight = window.innerHeight;
    } else {
      const container = this.element as HTMLElement;
      scrollTop = container.scrollTop;
      scrollHeight = container.scrollHeight;
      offsetHeight = container.offsetHeight;
    }

    const maxScroll = scrollHeight - offsetHeight;

    // Se chegou no final absoluto da rolagem, ativa o último item
    if (scrollTop >= maxScroll - 5 && maxScroll > 0) {
      const lastTarget = this.targets[this.targets.length - 1];
      if (lastTarget && lastTarget.id !== this.activeTargetId) {
        this.activate(lastTarget.id);
      }
      return;
    }

    const checkPosition = scrollTop + this.options.offset;

    let targetToActivate: ScrollSpyTargetItem | null = null;

    for (let i = 0; i < this.targets.length; i++) {
      const current = this.targets[i]!;
      const next = this.targets[i + 1];

      if (checkPosition >= current.top) {
        if (!next || checkPosition < next.top) {
          targetToActivate = current;
          break;
        }
      }
    }

    // Se a rolagem estiver antes do primeiro item
    if (!targetToActivate && this.targets.length > 0 && checkPosition < this.targets[0]!.top) {
      targetToActivate = this.targets[0]!;
    }

    if (targetToActivate && targetToActivate.id !== this.activeTargetId) {
      this.activate(targetToActivate.id);
    }
  }

  private activate(targetId: string): void {
    this.activeTargetId = targetId;

    // 1. Remove classe active de todos os links do container
    const targetContainer =
      typeof this.options.target === 'string'
        ? document.querySelector<HTMLElement>(this.options.target)
        : this.options.target;

    if (!targetContainer) return;

    const allLinks = Array.from(
      targetContainer.querySelectorAll<HTMLElement>('.nav-link, .list-group-item, .dropdown-item, [data-scrollspy-link]'),
    );

    for (const link of allLinks) {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }

    // Remove active de dropdowns pais
    const dropdownToggles = Array.from(
      targetContainer.querySelectorAll<HTMLElement>('.dropdown-toggle'),
    );
    for (const toggle of dropdownToggles) {
      toggle.classList.remove('active');
    }

    // 2. Adiciona classe active nos links correspondentes ao targetId
    const matchingItem = this.targets.find((t) => t.id === targetId);
    if (matchingItem) {
      for (const link of matchingItem.navLinks) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'true');

        // Se for um dropdown-item, ativa o dropdown pai
        const parentDropdown = link.closest('.dropdown');
        if (parentDropdown) {
          const toggle = parentDropdown.querySelector<HTMLElement>('.dropdown-toggle');
          if (toggle) toggle.classList.add('active');
        }

        // Se for uma navegação aninhada (nested nav)
        const parentNestedNav = link.closest('.nav')?.parentElement?.closest('.nav');
        if (parentNestedNav) {
          const parentNavLinks = Array.from(parentNestedNav.querySelectorAll<HTMLElement>(':scope > .nav-item > .nav-link, :scope > .nav-link'));
          for (const pLink of parentNavLinks) {
            pLink.classList.add('active');
          }
        }
      }
    }

    // 3. Dispara o evento oficial 'activate.bs.scrollspy' no elemento monitorado
    const event = new CustomEvent('activate.bs.scrollspy', {
      bubbles: true,
      cancelable: false,
      detail: {
        relatedTarget: `#${targetId}`,
      },
    });

    if (this.element instanceof HTMLElement) {
      this.element.dispatchEvent(event);
    } else {
      window.dispatchEvent(event);
    }
  }

  private handleAnchorClick(e: MouseEvent): void {
    if (!this.options.smoothScroll) return;

    const target = (e.target as HTMLElement)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!target) return;

    const href = target.getAttribute('href');
    if (!href || href === '#' || !href.startsWith('#')) return;

    const sectionId = href.substring(1);
    const sectionEl = document.getElementById(sectionId);
    if (!sectionEl) return;

    e.preventDefault();

    if (this.isWindow) {
      const top = sectionEl.getBoundingClientRect().top + window.scrollY - this.options.offset + 2;
      window.scrollTo({ top, behavior: 'smooth' });
    } else {
      const container = this.element as HTMLElement;
      const rect = sectionEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const top = rect.top - containerRect.top + container.scrollTop - this.options.offset + 2;
      container.scrollTo({ top, behavior: 'smooth' });
    }

    // Atualiza imediatamente o hash na URL sem scroll jump
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', href);
    }
  }

  private bindEvents(): void {
    if (this.scrollElement === window) {
      window.addEventListener('scroll', this.onScrollHandler, { passive: true });
      window.addEventListener('resize', this.onScrollHandler, { passive: true });
    } else {
      (this.scrollElement as HTMLElement).addEventListener('scroll', this.onScrollHandler, { passive: true });
    }

    const targetContainer =
      typeof this.options.target === 'string'
        ? document.querySelector<HTMLElement>(this.options.target)
        : this.options.target;

    if (targetContainer) {
      targetContainer.addEventListener('click', this.onClickHandler);
    }
  }

  private throttle<T extends (...args: unknown[]) => void>(func: T, limitMs: number): T {
    let inThrottle = false;
    return ((...args: unknown[]) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limitMs);
      }
    }) as T;
  }
}

// =========================================================================
// Global Auto-Init & Window Registration
// =========================================================================

export function initGlobalScrollSpy(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Anexa ao namespace window.bootstrap e window.eddieScrollSpy
  const w = window as unknown as Window & {
    bootstrap?: { ScrollSpy?: typeof ScrollSpy };
    eddieScrollSpy?: {
      ScrollSpy: typeof ScrollSpy;
      refreshAll: () => void;
      autoInit: () => void;
    };
  };
  w.bootstrap = w.bootstrap || {};
  w.bootstrap.ScrollSpy = ScrollSpy;
  w.eddieScrollSpy = {
    ScrollSpy,
    refreshAll: () => {
      const elements = document.querySelectorAll<HTMLElement>('[data-bs-spy="scroll"], [data-spy="scroll"]');
      elements.forEach((el) => {
        const instance = ScrollSpy.getInstance(el);
        if (instance) instance.refresh();
      });
    },
    autoInit: scanAndInitDataElements,
  };

  scanAndInitDataElements();
}

export function scanAndInitDataElements(): void {
  if (typeof document === 'undefined') return;

  const elements = document.querySelectorAll<HTMLElement>(
    '[data-bs-spy="scroll"], [data-spy="scroll"]',
  );

  elements.forEach((el) => {
    ScrollSpy.getOrCreateInstance(el);
  });
}
