import React, { useState, useRef, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { RiArrowDownSLine } from 'react-icons/ri';
import type { IconType } from 'react-icons';

/* ─── Context ─── */
interface DropdownContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('Dropdown compound components must be used within <Dropdown>');
  return ctx;
}

/* ─── Root ─── */
interface DropdownProps {
  children: ReactNode;
  className?: string;
}

function DropdownRoot({ children, className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  return (
    <DropdownContext.Provider value={{ isOpen, toggle, close }}>
      <div ref={containerRef} className={['relative inline-block', className].join(' ')}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

/* ─── Trigger ─── */
interface TriggerProps {
  children: ReactNode;
  icon?: IconType;
  showArrow?: boolean;
  className?: string;
}

function Trigger({ children, icon: Icon, showArrow = false, className = '' }: TriggerProps) {
  const { isOpen, toggle } = useDropdownContext();

  const child = children as React.ReactElement<Record<string, unknown>>;

  const mergedProps = {
    onClick: (...args: unknown[]) => {
      toggle();
      // Preserve original onClick if exists
      if (typeof child.props.onClick === 'function') {
        child.props.onClick(...args);
      }
    },
    'aria-haspopup': 'menu' as const,
    'aria-expanded': isOpen,
    className: [
      'inline-flex items-center gap-2',
      className,
      (child.props.className as string) || '',
    ].filter(Boolean).join(' '),
  };

  return (
    <>
      {Icon && (
        <span className="inline-flex items-center gap-1.5" aria-hidden="true">
          <Icon size={16} className="text-[var(--color-text-subtle)]" />
        </span>
      )}
      {showArrow
        ? React.cloneElement(child, mergedProps,
            <>
              {child.props.children}
              <RiArrowDownSLine
                size={16}
                className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </>
          )
        : React.cloneElement(child, mergedProps)
      }
    </>
  );
}

/* ─── Menu ─── */
interface MenuProps {
  children: ReactNode;
  align?: 'left' | 'right';
  width?: 'auto' | 'trigger' | number;
  className?: string;
}

function Menu({ children, align = 'left', width = 'auto', className = '' }: MenuProps) {
  const { isOpen } = useDropdownContext();
  const itemsRef = useRef<HTMLDivElement>(null);

  // Focus first item when opened
  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => {
      const firstItem = itemsRef.current?.querySelector('[role="menuitem"]:not([aria-disabled="true"])') as HTMLElement;
      firstItem?.focus();
    });
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!itemsRef.current) return;
    const items = Array.from(itemsRef.current.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')) as HTMLElement[];
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        items[(currentIndex + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
    }
  };

  if (!isOpen) return null;

  const widthStyle = typeof width === 'number' ? { width: `${width}px` } : {};

  return (
    <div
      role="menu"
      aria-orientation="vertical"
      onKeyDown={handleKeyDown}
      className={[
        'absolute z-50 mt-1',
        'rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] shadow-lg',
        'py-1.5 animate-in zoom-in-95 fade-in',
        align === 'right' ? 'right-0' : 'left-0',
        width === 'trigger' ? 'min-w-full' : '',
        className,
      ].join(' ')}
      style={widthStyle}
    >
      <div ref={itemsRef}>
        {children}
      </div>
    </div>
  );
}

/* ─── Item ─── */
interface ItemProps {
  children: ReactNode;
  icon?: IconType;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

function Item({ children, icon: Icon, danger = false, disabled = false, onClick, className = '' }: ItemProps) {
  const { close } = useDropdownContext();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={[
        'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
        'focus:outline-none focus:bg-[var(--color-accent-soft)] focus:text-[var(--color-accent)]',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : danger
            ? 'text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]'
            : 'text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]',
        className,
      ].join(' ')}
    >
      {Icon && <Icon size={16} className="shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
}

/* ─── Separator ─── */
function ItemSeparator() {
  return <div role="separator" className="my-1.5 border-t border-[var(--color-border-light)]" />;
}

/* ─── Label ─── */
function ItemLabel({ children }: { children: ReactNode }) {
  return (
    <span className="block px-3 py-1.5 text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider select-none">
      {children}
    </span>
  );
}

/* ─── Composed ─── */
const Dropdown = Object.assign(DropdownRoot, {
  Trigger,
  Menu,
  Item,
  Separator: ItemSeparator,
  Label: ItemLabel,
});

export default Dropdown;
