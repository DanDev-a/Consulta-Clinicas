import { type HTMLAttributes, type ReactNode } from 'react';

/* ─── Root ─── */
interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

function CardRoot({ children, className = '', ...props }: CardProps) {
  return (
    <article
      className={[
        'rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </article>
  );
}

/* ─── Header ─── */
interface CardHeaderProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <header
      className={[
        'px-6 py-4 border-b border-[var(--color-border-light)]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </header>
  );
}

/* ─── Body ─── */
interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardBody({ children, className = '', ...props }: CardBodyProps) {
  return (
    <div className="px-6 py-4" {...props}>
      {children}
    </div>
  );
}

/* ─── Footer ─── */
interface CardFooterProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <footer
      className={[
        'px-6 py-4 border-t border-[var(--color-border-light)]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </footer>
  );
}

/* ─── Composed ─── */
const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

export default Card;
