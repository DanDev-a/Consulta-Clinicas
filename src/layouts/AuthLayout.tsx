import { Outlet } from 'react-router-dom';
import { RiStethoscopeLine } from 'react-icons/ri';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[var(--color-accent)] flex items-center justify-center mb-4">
            <RiStethoscopeLine size={28} className="text-[var(--color-text-inverse)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Clinica Proyecto</h1>
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl p-8 shadow-sm border border-[var(--color-border-light)]">
          <Outlet />
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-text-subtle)]">
          © {new Date().getFullYear()} Clinica Proyecto. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}