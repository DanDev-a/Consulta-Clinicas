import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Spinner from './ui/Spinner';

interface ProtectedRouteProps {
  requiredRole?: string[];
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Cargando">
        <Spinner size="lg" />
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(user.rol)) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
