'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  priority?: boolean;
};

export function EventContextNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const primary = items.filter((i) => i.priority);
  const secondary = items.filter((i) => !i.priority);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="flex min-w-0 items-center gap-1.5" aria-label="Navegação do Evento">
      {/* Itens Prioritários Visíveis */}
      <div className="flex min-w-0 flex-wrap items-center gap-1">
        {primary.map((item) => {
          const active = pathname === item.href || (item.href.endsWith('/operacao') && pathname.includes('/operacao'));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                active
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2026]'
              }`}
            >
              {Icon && <Icon size={14} className={active ? 'text-sky-400' : 'text-slate-400'} />}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Menu "Mais" para itens secundários sem scroll horizontal */}
      {secondary.length > 0 && (
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
              dropdownOpen || secondary.some((s) => pathname.startsWith(s.href))
                ? 'bg-slate-700/80 text-white border-slate-600'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2026] border-transparent'
            }`}
          >
            <span>Mais</span>
            <ChevronDown size={13} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-50 mt-2 min-w-56 rounded-xl border border-slate-700/80 bg-[#181a20] p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Módulos do Evento
              </div>
              {secondary.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDropdownOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? 'bg-sky-500/15 text-sky-400'
                        : 'text-slate-300 hover:bg-[#252830] hover:text-white'
                    }`}
                  >
                    {Icon && <Icon size={14} className={active ? 'text-sky-400' : 'text-slate-400'} />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
