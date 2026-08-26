import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: ReactNode;
  placement?: TooltipPlacement;
  delayMs?: number;
  children: ReactNode;
}

const arrowStyles: Record<TooltipPlacement, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--color-surface-elevated)] border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-surface-elevated)] border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--color-surface-elevated)] border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--color-surface-elevated)] border-y-transparent border-l-transparent',
};

export default function Tooltip({ content, placement = 'top', delayMs = 300, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).slice(2, 9)}`);

  const show = () => {
    timerRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (placement) {
          case 'top':
            top = rect.top + window.scrollY - 8;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + window.scrollY + 8;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'left':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.left + window.scrollX - 8;
            break;
          case 'right':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.right + window.scrollX + 8;
            break;
        }

        setCoords({ top, left });
      }
      setVisible(true);
    }, delayMs);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const anchorClass = placement === 'top' || placement === 'bottom'
    ? '-translate-x-1/2'
    : '-translate-y-1/2';

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={visible ? tooltipId.current : undefined}
        className="inline-flex"
      >
        {children}
      </span>
      {visible &&
        createPortal(
          <div
            id={tooltipId.current}
            role="tooltip"
            className={[
              'fixed z-[9999] pointer-events-none',
              'px-3 py-1.5 rounded-lg text-xs font-medium',
              'bg-[var(--color-surface-elevated)] text-[var(--color-text)] shadow-lg',
              'border border-[var(--color-border-light)]',
              'animate-in fade-in zoom-in-95',
              anchorClass,
            ].join(' ')}
            style={{ top: coords.top, left: coords.left }}
          >
            {content}
            <span
              className={`absolute w-0 h-0 border-[5px] ${arrowStyles[placement]}`}
              aria-hidden="true"
            />
          </div>,
          document.body
        )}
    </>
  );
}
