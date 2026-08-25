import { useAuth } from '../../auth/hooks/useAuth';

interface UserRole {
  isAdmin: boolean;
  isDoctor: boolean;
  isRecepcionista: boolean;
  isPaciente: boolean;
}

export function useDashboardRole(): UserRole {
  const { } = useAuth();
  
  const storedUser = localStorage.getItem('supabase.auth.token');
  let role = '';
  
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      role = parsed?.user?.user_metadata?.rol ?? parsed?.currentSession?.user?.user_metadata?.rol ?? '';
    } catch {
      role = '';
    }
  }

  return {
    isAdmin: role === 'ADMIN',
    isDoctor: role === 'DOCTOR',
    isRecepcionista: role === 'RECEPCIONISTA',
    isPaciente: role === 'PACIENTE',
  };
}
