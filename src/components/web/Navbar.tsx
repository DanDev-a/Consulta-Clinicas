import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import MobileMenu from './MobileMenu';

const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Especialidades', href: '#especialidades' },
  { label: 'Equipo', href: '#equipo' },
  { label: 'Contacto', href: '#contacto' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-bg/80 backdrop-blur-lg border-b border-border">
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 md:px-8">
        <a href="#inicio" className="flex items-center gap-2 text-lg font-bold text-text">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-text-inverse text-sm font-bold">
            N
          </span>
          Clínica Nova
        </a>

        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface-alt transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="tel:+541145678900"
            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors duration-200"
          >
            +54 11 4567-8900
          </a>
          <Link
            to="/auth/register"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-text-inverse hover:bg-accent-hover transition-colors duration-200"
          >
            Sacar turno
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors duration-200"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <RiCloseLine size={22} /> : <RiMenu3Line size={22} />}
        </button>
      </nav>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={navLinks} />
    </header>
  );
}
