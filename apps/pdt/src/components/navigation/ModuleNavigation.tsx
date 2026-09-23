'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import './module-navigation.css';

export type ModuleNavigationItem = {
  id: string;
  label: string;
  to?: string;
  href?: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
};

type Props = {
  items: ModuleNavigationItem[];
  activeItem?: string;
  onSelect?: (id: string) => void;
  ariaLabel?: string;
  className?: string;
  maxRows?: number;
};

export function ModuleNavigation({
  items,
  activeItem,
  onSelect,
  ariaLabel = 'Navegação do módulo',
  className = '',
}: Props) {
  const pathname = usePathname();

  return (
    <nav className={`eddie-module-nav ${className}`} aria-label={ariaLabel}>
      <div className="eddie-module-nav__grid">
        {items.map((item) => {
          const targetUrl = item.to || item.href;
          const isActive =
            activeItem !== undefined
              ? activeItem === item.id
              : targetUrl
              ? pathname === targetUrl || (targetUrl !== '/' && pathname.startsWith(targetUrl))
              : false;

          const itemClass = [
            'eddie-module-nav__item',
            isActive ? 'is-active' : '',
            item.disabled ? 'is-disabled' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const content = (
            <>
              {item.icon && <span className="eddie-module-nav__icon">{item.icon}</span>}
              <span className="eddie-module-nav__label">{item.label}</span>
              {item.badge !== undefined && (
                <span className="eddie-module-nav__badge">{item.badge}</span>
              )}
            </>
          );

          if (onSelect) {
            return (
              <button
                key={item.id}
                type="button"
                aria-disabled={item.disabled || undefined}
                tabIndex={item.disabled ? -1 : undefined}
                className={itemClass}
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault();
                    return;
                  }
                  onSelect(item.id);
                }}
              >
                {content}
              </button>
            );
          }

          if (targetUrl) {
            return (
              <Link
                key={item.id}
                href={item.disabled ? '#' : targetUrl}
                aria-disabled={item.disabled || undefined}
                tabIndex={item.disabled ? -1 : undefined}
                className={itemClass}
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault();
                  }
                }}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              className={itemClass}
              disabled={item.disabled}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
