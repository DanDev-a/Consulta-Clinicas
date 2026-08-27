import { useAuthContext } from '../../../contexts/AuthContext';

interface UserRole {
  isAdmin: boolean;
  isDoctor: boolean;
  isRecepcionista: boolean;
  isPaciente: boolean;
}

export function useDashboardRole(): UserRole {
  const { user } = useAuthContext();
  const role = user?.rol ?? '';

  return {
    isAdmin: role === 'ADMIN',
    isDoctor: role === 'DOCTOR',
    isRecepcionista: role === 'RECEPCIONISTA',
    isPaciente: role === 'PACIENTE',
  };
}
