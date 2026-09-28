import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScrollSpy, initGlobalScrollSpy } from './scrollspy-core';

// Mock DOM leve para ambiente Node puro no vitest
class MockClassList {
  private classes = new Set<string>();
  constructor(initial: string[] = []) {
    initial.forEach((c) => this.classes.add(c));
  }
  add(...tokens: string[]) {
    tokens.forEach((t) => this.classes.add(t));
  }
  remove(...tokens: string[]) {
    tokens.forEach((t) => this.classes.delete(t));
  }
  contains(token: string) {
    return this.classes.has(token);
  }
}

const allElementsById: Record<string, MockElement> = {};

class MockElement {
  public tagName: string;
  private _id: string = '';
  public get id(): string {
    return this._id;
  }
  public set id(val: string) {
    this._id = val;
    if (val) allElementsById[val] = this;
  }
  public classList: MockClassList;
  public attributes: Record<string, string> = {};
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public previousElementSibling: MockElement | null = null;
  public scrollTop: number = 0;
  public scrollHeight: number = 500;
  public offsetHeight: number = 300;
  private eventListeners: Record<string, ((e: unknown) => void)[]> = {};

  constructor(tagName: string, classes: string[] = []) {
    this.tagName = tagName.toUpperCase();
    this.classList = new MockClassList(classes);
  }

  getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  setAttribute(name: string, val: string): void {
    this.attributes[name] = val;
  }

  removeAttribute(name: string): void {
    delete this.attributes[name];
  }

  addEventListener(event: string, handler: (e: unknown) => void): void {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event]!.push(handler);
  }

  removeEventListener(event: string, handler: (e: unknown) => void): void {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event]!.filter((h) => h !== handler);
  }

  dispatchEvent(event: unknown): boolean {
    const ev = event as { type: string };
    const handlers = this.eventListeners[ev.type] || [];
    handlers.forEach((h) => h(event));
    return true;
  }

  public customTop: number = 0;

  getBoundingClientRect() {
    return { top: this.customTop, bottom: this.customTop + 200, height: 200, left: 0, right: 100, width: 100, x: 0, y: 0 };
  }

  scrollTo() {}

  closest(selector: string): MockElement | null {
    if (selector.startsWith('.')) {
      const cls = selector.substring(1);
      let curr: MockElement | null = this;
      while (curr) {
        if (curr.classList.contains(cls)) return curr;
        curr = curr.parentElement;
      }
    }
    return null;
  }

  querySelectorAll(selector: string): MockElement[] {
    const results: MockElement[] = [];
    const traverse = (el: MockElement) => {
      for (const child of el.children) {
        if (selector === 'a[href^="#"]') {
          if (child.tagName === 'A' && child.getAttribute('href')?.startsWith('#')) {
            results.push(child);
          }
        } else if (selector.includes('.nav-link') && child.classList.contains('nav-link')) {
          results.push(child);
        } else if (selector.includes('.dropdown-toggle') && child.classList.contains('dropdown-toggle')) {
          results.push(child);
        } else if (selector.includes('.list-group-item') && child.classList.contains('list-group-item')) {
          results.push(child);
        } else if (selector.includes('.dropdown-item') && child.classList.contains('dropdown-item')) {
          results.push(child);
        }
        traverse(child);
      }
    };
    traverse(this);
    return results;
  }

  querySelector(selector: string): MockElement | null {
    if (selector.includes('.dropdown-toggle')) {
      return this.querySelectorAll('.dropdown-toggle')[0] || null;
    }
    if (selector.includes('.nav-link')) {
      return this.querySelectorAll('.nav-link')[0] || null;
    }
    const list = this.querySelectorAll(selector);
    return list[0] || null;
  }

  appendChild(child: MockElement): void {
    child.parentElement = this;
    if (this.children.length > 0) {
      child.previousElementSibling = this.children[this.children.length - 1]!;
    }
    this.children.push(child);
  }
}

describe('EDDIE Global ScrollSpy Engine', () => {
  let mockContainer: MockElement;
  let mockNav: MockElement;
  let mockSec1: MockElement;
  let mockSec2: MockElement;
  let originalDocument: unknown;
  let originalWindow: unknown;

  beforeEach(() => {
    originalDocument = globalThis.document;
    originalWindow = globalThis.window;

    mockNav = new MockElement('nav', ['nav', 'nav-pills']);
    mockNav.id = 'navbar-example';

    const link1 = new MockElement('a', ['nav-link']);
    link1.setAttribute('href', '#sec-1');
    mockNav.appendChild(link1);

    const link2 = new MockElement('a', ['nav-link']);
    link2.setAttribute('href', '#sec-2');
    mockNav.appendChild(link2);

    mockSec1 = new MockElement('div');
    mockSec1.id = 'sec-1';
    mockSec1.customTop = 0;
    mockSec2 = new MockElement('div');
    mockSec2.id = 'sec-2';
    mockSec2.customTop = 250;

    mockContainer = new MockElement('div', ['scrollspy-example']);
    mockContainer.id = 'container-example';
    mockContainer.customTop = 0;
    mockContainer.setAttribute('data-bs-spy', 'scroll');
    mockContainer.setAttribute('data-bs-target', '#navbar-example');
    mockContainer.appendChild(mockSec1);
    mockContainer.appendChild(mockSec2);

    // Mock document
    const elementsById: Record<string, MockElement> = {
      'navbar-example': mockNav,
      'sec-1': mockSec1,
      'sec-2': mockSec2,
      'container-example': mockContainer,
    };

    (globalThis as unknown as { document: unknown }).document = {
      body: new MockElement('body'),
      documentElement: new MockElement('html'),
      getElementById: (id: string) => allElementsById[id] || null,
      querySelector: (sel: string) => {
        if (sel === '#navbar-example') return mockNav;
        if (sel === '#container-example') return mockContainer;
        return null;
      },
      querySelectorAll: () => [],
    };

    if (typeof (globalThis as unknown as { CustomEvent?: unknown }).CustomEvent === 'undefined') {
      (globalThis as unknown as { CustomEvent: unknown }).CustomEvent = class MockCustomEvent {
        public type: string;
        public detail: unknown;
        constructor(type: string, init?: { detail?: unknown }) {
          this.type = type;
          this.detail = init?.detail;
        }
      };
    }

    (globalThis as unknown as { window: unknown }).window = {
      scrollY: 0,
      innerHeight: 600,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      history: { pushState: vi.fn() },
    };
  });

  afterEach(() => {
    (globalThis as unknown as { document: unknown }).document = originalDocument;
    (globalThis as unknown as { window: unknown }).window = originalWindow;
  });

  it('deve instanciar ScrollSpy e registrar no getInstance', () => {
    const spy = new ScrollSpy(mockContainer as unknown as HTMLElement, {
      target: '#navbar-example',
      offset: 10,
    });

    expect(spy).toBeDefined();
    expect(ScrollSpy.getInstance(mockContainer as unknown as HTMLElement)).toBe(spy);
  });

  it('deve suportar getOrCreateInstance reutilizando instância existente', () => {
    const spy1 = ScrollSpy.getOrCreateInstance(mockContainer as unknown as HTMLElement, {
      target: '#navbar-example',
    });
    const spy2 = ScrollSpy.getOrCreateInstance(mockContainer as unknown as HTMLElement);

    expect(spy1).toBe(spy2);
  });

  it('deve suportar opções em Português (alvo, desvio, metodo)', () => {
    const spy = new ScrollSpy(mockContainer as unknown as HTMLElement, {
      alvo: '#navbar-example',
      desvio: 25,
      metodo: 'position',
    });

    expect(spy).toBeDefined();
    spy.dispose();
  });

  it('deve ativar o primeiro link correspondente adicionando classe active', () => {
    const spy = new ScrollSpy(mockContainer as unknown as HTMLElement, {
      target: '#navbar-example',
      offset: 10,
    });

    const link1 = mockNav.children[0]!;
    expect(link1.classList.contains('active')).toBe(true);
    expect(link1.getAttribute('aria-current')).toBe('true');
  });

  it('deve disparar evento customizado activate.bs.scrollspy no elemento', () => {
    const eventHandler = vi.fn();
    mockContainer.addEventListener('activate.bs.scrollspy', eventHandler);

    new ScrollSpy(mockContainer as unknown as HTMLElement, {
      target: '#navbar-example',
      offset: 10,
    });

    expect(eventHandler).toHaveBeenCalled();
  });

  it('deve registrar bootstrap.ScrollSpy e window.eddieScrollSpy em initGlobalScrollSpy', () => {
    initGlobalScrollSpy();

    const w = globalThis.window as unknown as {
      bootstrap: { ScrollSpy: typeof ScrollSpy };
      eddieScrollSpy: { refreshAll: () => void };
    };

    expect(w.bootstrap.ScrollSpy).toBe(ScrollSpy);
    expect(w.eddieScrollSpy).toBeDefined();
  });

  it('deve limpar instâncias ao chamar dispose()', () => {
    const spy = new ScrollSpy(mockContainer as unknown as HTMLElement, {
      target: '#navbar-example',
    });

    expect(ScrollSpy.getInstance(mockContainer as unknown as HTMLElement)).toBe(spy);
    spy.dispose();
    expect(ScrollSpy.getInstance(mockContainer as unknown as HTMLElement)).toBeUndefined();
  });

  it('deve ativar o toggle do dropdown quando o item filho for selecionado', () => {
    const dropdownNav = new MockElement('nav', ['nav']);
    dropdownNav.id = 'dropdown-nav';

    const dropdown = new MockElement('div', ['dropdown']);
    const toggle = new MockElement('button', ['dropdown-toggle']);
    dropdown.appendChild(toggle);

    const dropItem = new MockElement('a', ['dropdown-item']);
    dropItem.setAttribute('href', '#sec-drop');
    dropdown.appendChild(dropItem);
    dropdownNav.appendChild(dropdown);

    const secDrop = new MockElement('div');
    secDrop.id = 'sec-drop';
    secDrop.customTop = 0;

    const dropContainer = new MockElement('div', ['scrollspy-example']);
    dropContainer.appendChild(secDrop);

    const spy = new ScrollSpy(dropContainer as unknown as HTMLElement, {
      target: dropdownNav as unknown as HTMLElement,
    });

    expect(dropItem.classList.contains('active')).toBe(true);
    expect(toggle.classList.contains('active')).toBe(true);
    spy.dispose();
  });

  it('deve ativar o nav-link pai em navegações aninhadas (nested navs)', () => {
    const nestedNav = new MockElement('nav', ['nav', 'nav-pills']);
    nestedNav.id = 'nested-nav';

    const parentLink = new MockElement('a', ['nav-link']);
    parentLink.setAttribute('href', '#parent-item');
    nestedNav.appendChild(parentLink);

    const innerNav = new MockElement('nav', ['nav', 'nav-pills']);
    const childLink = new MockElement('a', ['nav-link']);
    childLink.setAttribute('href', '#child-item');
    innerNav.appendChild(childLink);
    nestedNav.appendChild(innerNav);

    const secChild = new MockElement('div');
    secChild.id = 'child-item';
    secChild.customTop = 0;

    const nestContainer = new MockElement('div', ['scrollspy-example']);
    nestContainer.appendChild(secChild);

    const spy = new ScrollSpy(nestContainer as unknown as HTMLElement, {
      target: nestedNav as unknown as HTMLElement,
    });

    expect(childLink.classList.contains('active')).toBe(true);
    expect(parentLink.classList.contains('active')).toBe(true);
    spy.dispose();
  });
});
