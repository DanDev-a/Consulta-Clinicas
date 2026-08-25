import { NavLink } from 'react-router-dom';
import {
  RiDashboardLine,
  RiUserHeartLine,
  RiCalendarEventLine,
  RiRobot2Line,
  RiSettingsLine,
  RiFileList3Line,
  RiUserLine,
  RiGroupLine,
  RiWhatsappLine,
} from 'react-icons/ri';
import type { IconType } from 'react-icons';
import { useAuthContext, type UserRole } from '../../contexts/AuthContext';

interface SidebarItem {
  path: string;
  label: string;
  icon: IconType;
  end?: boolean;
  roles: UserRole[];
}

const MENU_ITEMS: SidebarItem[] = [
  { path: '/app', label: 'Dashboard', icon: RiDashboardLine, end: true, roles: ['ADMIN', 'DOCTOR', 'RECEPCIONISTA', 'PACIENTE'] },
  { path: '/app/patient', label: 'Pacientes', icon: RiUserHeartLine, roles: ['ADMIN', 'DOCTOR', 'RECEPCIONISTA'] },
  { path: '/app/appointment', label: 'Citas', icon: RiCalendarEventLine, roles: ['ADMIN', 'DOCTOR', 'RECEPCIONISTA'] },
  { path: '/app/appointment', label: 'Mis Citas', icon: RiCalendarEventLine, roles: ['PACIENTE'] },
  { path: '/app/ai-system', label: 'Sistema IA', icon: RiRobot2Line, roles: ['ADMIN', 'DOCTOR'] },
  { path: '/app/audit-logs', label: 'Auditoria', icon: RiFileList3Line, roles: ['ADMIN'] },
  { path: '/app/admin/users', label: 'Usuarios', icon: RiGroupLine, roles: ['ADMIN'] },
  { path: '/app/whatsapp', label: 'WhatsApp', icon: RiWhatsappLine, roles: ['ADMIN'] },
  { path: '/app/profile', label: 'Mi Perfil', icon: RiUserLine, roles: ['PACIENTE'] },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user } = useAuthContext();
  const role = user?.rol ?? 'PACIENTE';

  const visibleItems = MENU_ITEMS.filter((item) => item.roles.includes(role));

  const baseLinkClass =
    'flex items-center p-3 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)]';

  return (
    <aside
      className={`fixed bottom-0 left-0 w-full h-16 md:h-screen md:w-64 bg-surface text-text p-2 md:p-6 border-t md:border-t-0 md:border-r border-border flex md:flex-col justify-between z-50 ${className ?? ''}`}
      role="navigation"
      aria-label="Menu principal"
    >
      <section className="w-full md:w-auto flex md:flex-col md:grow">
        <h3 className="hidden md:block text-text-muted uppercase text-xs font-bold mb-8 tracking-widest border-b border-border pb-2">
          Gestion Clinica
        </h3>

        <ul className="flex row w-full justify-around md:justify-start md:flex-col space-x-2 md:space-x-0 md:space-y-4" role="list">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={`${item.path}-${item.label}`}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  aria-label={item.label}
                  className={({ isActive }) =>
                    `${baseLinkClass} ${
                      isActive
                        ? 'bg-accent-soft text-accent'
                        : 'hover:bg-surface-alt hover:text-accent'
                    }`
                  }
                >
                  <Icon className="md:mr-3 text-text-subtle group-hover:text-accent group-active:text-accent-hover text-xl md:text-base" aria-hidden="true" />
                  <span className="hidden md:inline">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="hidden md:block mt-auto">
        <NavLink
          to="/app/setting"
          aria-label="Configuracion"
          className={({ isActive }) =>
            `${baseLinkClass} ${isActive ? 'bg-accent-soft text-accent' : 'hover:bg-surface-alt hover:text-accent'}`
          }
        >
          <RiSettingsLine className="mr-3 text-text-subtle group-hover:text-accent group-active:text-accent-hover" aria-hidden="true" />
          <span>Configuracion</span>
        </NavLink>
      </div>
    </aside>
  );
}
