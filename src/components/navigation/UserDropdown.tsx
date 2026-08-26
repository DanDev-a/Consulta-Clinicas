import { useNavigate } from 'react-router-dom';
import { RiLogoutBoxLine, RiSettingsLine, RiUserLine } from 'react-icons/ri';
import Dropdown from '../ui/Dropdown';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { useAuthContext, type UserRole } from '../../contexts/AuthContext';

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  DOCTOR: 'Doctor',
  RECEPCIONISTA: 'Recepcionista',
  PACIENTE: 'Paciente',
};

const ROLE_VARIANTS: Record<UserRole, 'danger' | 'info' | 'success' | 'warning' | 'neutral'> = {
  ADMIN: 'danger',
  DOCTOR: 'info',
  RECEPCIONISTA: 'warning',
  PACIENTE: 'neutral',
};

export default function UserDropdown() {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <button
          type="button"
          className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-alt transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          aria-label="Menu de usuario"
        >
          <Avatar name={user.nombre} src={user.avatar_url ?? undefined} size="sm" />
          <span className="hidden md:inline text-sm font-medium text-text max-w-[120px] truncate">
            {user.nombre}
          </span>
        </button>
      </Dropdown.Trigger>

      <Dropdown.Menu align="right" width="trigger">
        <Dropdown.Label>MI CUENTA</Dropdown.Label>

        <div className="px-3 py-2 flex items-center gap-3">
          <Avatar name={user.nombre} src={user.avatar_url ?? undefined} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">{user.nombre}</p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
            <Badge variant={ROLE_VARIANTS[user.rol]} size="sm">
              {ROLE_LABELS[user.rol]}
            </Badge>
          </div>
        </div>

        <Dropdown.Separator />

        <Dropdown.Item icon={RiUserLine} onClick={() => navigate('/app/profile')}>
          Mi Perfil
        </Dropdown.Item>
        <Dropdown.Item icon={RiSettingsLine} onClick={() => navigate('/app/setting')}>
          Configuracion
        </Dropdown.Item>

        <Dropdown.Separator />

        <Dropdown.Item icon={RiLogoutBoxLine} danger onClick={handleSignOut}>
          Cerrar sesion
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
