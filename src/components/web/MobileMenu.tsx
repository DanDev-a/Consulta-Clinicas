import { Link } from 'react-router-dom';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: { label: string; href: string }[];
}

export default function MobileMenu({ open, onClose, links }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="md:hidden border-t border-border bg-bg/95 backdrop-blur-lg">
      <ul className="flex flex-col px-4 py-4 gap-1">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={onClose}
              className="block px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface-alt transition-colors duration-200"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 px-4 pb-4 border-t border-border pt-4">
        <a
          href="tel:+59171234567"
          className="px-4 py-2.5 text-sm font-medium text-center rounded-lg border border-border text-text-muted hover:text-text hover:bg-surface-alt transition-colors duration-200"
        >
          Llamar: +591 7 1234567
        </a>
        <Link
          to="/auth/register"
          onClick={onClose}
          className="px-4 py-2.5 text-sm font-medium text-center rounded-lg bg-accent text-text-inverse hover:bg-accent-hover transition-colors duration-200"
        >
          Sacar turno
        </Link>
      </div>
    </div>
  );
}
