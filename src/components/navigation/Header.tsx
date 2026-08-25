import type { ReactNode } from 'react';
import UserDropdown from './UserDropdown';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  title?: string;
  children?: ReactNode;
  className?: string;
}

export default function Header({ title, className }: HeaderProps) {
  return (
    <header
      className={`w-full h-16 bg-surface text-text px-6 flex items-center justify-between ${className ?? ''}`}
      role="banner"
    >
      <h3 className="text-base font-semibold tracking-wide" id="page-title">
        {title}
      </h3>
      <nav className="flex items-center space-x-2" aria-label="Acciones del usuario">
        <NotificationBell />
        <UserDropdown />
      </nav>
    </header>
  );
}
