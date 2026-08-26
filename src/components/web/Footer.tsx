import { RiMailLine, RiMapPin2Line, RiPhoneLine, RiTimerLine } from 'react-icons/ri';

const footerLinks = {
  Especialidades: [
    { label: 'Clínica General', href: '#especialidades' },
    { label: 'Pediatría', href: '#especialidades' },
    { label: 'Cardiología', href: '#especialidades' },
    { label: 'Dermatología', href: '#especialidades' },
  ],
  Clínica: [
    { label: 'Sobre nosotros', href: '#inicio' },
    { label: 'Equipo médico', href: '#equipo' },
    { label: 'Turnos online', href: '#contacto' },
    { label: 'Obras sociales', href: '#' },
  ],
  Legal: [
    { label: 'Privacidad', href: '#' },
    { label: 'Términos', href: '#' },
    { label: 'Defensa del paciente', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <a href="#inicio" className="flex items-center gap-2 text-lg font-bold text-text">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-text-inverse text-sm font-bold">
                N
              </span>
              Clinica Proyecto
            </a>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              Centro médico multidisciplinario en el corazón de La Paz. Cuidamos tu salud desde 2010.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-text-muted">
              <span className="flex items-center gap-2">
                <RiMapPin2Line className="text-accent shrink-0" />
                Av. Arce 1234, Piso 3, La Paz
              </span>
              <span className="flex items-center gap-2">
                <RiPhoneLine className="text-accent shrink-0" />
                +591 7 1234567
              </span>
              <span className="flex items-center gap-2">
                <RiMailLine className="text-accent shrink-0" />
                consultas@clinicanova.com.ar
              </span>
              <span className="flex items-center gap-2">
                <RiTimerLine className="text-accent shrink-0" />
                Lun-Vie 8:00-20:00 · Sáb 8:00-14:00
              </span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-text uppercase tracking-wider">{title}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-muted hover:text-accent transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col items-center justify-between gap-4 text-sm text-text-muted md:flex-row">
          <p>&copy; {new Date().getFullYear()} Clinica Proyecto. Todos los derechos reservados.</p>
          <p className="text-text-subtle">Matrícula Nacional CMP-12345 · Dirección Departamental de Salud</p>
        </div>
      </div>
    </footer>
  );
}
