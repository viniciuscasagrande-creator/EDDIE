'use client';

import React, { useRef, useEffect } from 'react';
import { ScrollSpy } from './scrollspy-core';

export interface ScrollSpyContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  target: string; // seletor do elemento nav (#navbar, #scrollspy_list_group, etc.)
  offset?: number;
  method?: 'auto' | 'offset' | 'position';
  smoothScroll?: boolean;
  children: React.ReactNode;
}

export function ScrollSpyContainer({
  target,
  offset = 10,
  method = 'auto',
  smoothScroll = true,
  className = '',
  children,
  ...rest
}: ScrollSpyContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new ScrollSpy(containerRef.current, {
      target,
      offset,
      method,
      smoothScroll,
    });

    return () => {
      instance.dispose();
    };
  }, [target, offset, method, smoothScroll]);

  return (
    <div
      ref={containerRef}
      data-bs-spy="scroll"
      data-bs-target={target}
      data-bs-offset={offset}
      tabIndex={0}
      className={`scrollspy-example ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface ScrollSpyNavItem {
  id: string;
  label: string;
  badge?: string;
  children?: { id: string; label: string }[];
}

export interface ScrollSpyNavProps extends React.HTMLAttributes<HTMLElement> {
  id: string;
  items: ScrollSpyNavItem[];
  variant?: 'pills' | 'underline' | 'nested';
  className?: string;
}

export function ScrollSpyNav({
  id,
  items,
  variant = 'pills',
  className = '',
  ...rest
}: ScrollSpyNavProps) {
  return (
    <nav id={id} className={`nav ${variant === 'pills' ? 'nav-pills' : ''} ${className}`} {...rest}>
      <ul className="flex flex-wrap items-center gap-1 list-none p-0 m-0">
        {items.map((item) => {
          if (item.children && item.children.length > 0) {
            return (
              <li key={item.id} className="nav-item dropdown relative group">
                <a
                  href={`#${item.id}`}
                  className="nav-link dropdown-toggle flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                  role="button"
                >
                  {item.label}
                  <span className="text-[10px] opacity-60">▼</span>
                </a>
                <ul className="dropdown-menu absolute left-0 mt-1 hidden min-w-[140px] rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl group-hover:block z-20">
                  {item.children.map((sub) => (
                    <li key={sub.id}>
                      <a
                        href={`#${sub.id}`}
                        className="dropdown-item block rounded-md px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        {sub.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            );
          }

          return (
            <li key={item.id} className="nav-item">
              <a
                href={`#${item.id}`}
                className="nav-link flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                {item.label}
                {item.badge && (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-400">
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export interface ScrollSpyListGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  items: { id: string; label: string; description?: string }[];
  className?: string;
}

export function ScrollSpyListGroup({ id, items, className = '', ...rest }: ScrollSpyListGroupProps) {
  return (
    <div id={id} className={`list-group flex flex-col space-y-1 ${className}`} {...rest}>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="list-group-item list-group-item-action block rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-zinc-300 transition-all hover:bg-zinc-800/80 hover:text-white"
        >
          <div>{item.label}</div>
          {item.description && <div className="text-[11px] text-zinc-500 font-normal">{item.description}</div>}
        </a>
      ))}
    </div>
  );
}
