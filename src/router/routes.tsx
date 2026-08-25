import { createBrowserRouter, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Spinner from '../components/ui/Spinner';

// Layouts
const AppLayout = React.lazy(() => import('../layouts/AppLayout'));
const AuthLayout = React.lazy(() => import('../layouts/AuthLayout'));
const WebLayout = React.lazy(() => import('../layouts/WebLayout'));

// Auth
const Login = React.lazy(() => import('../features/auth/pages/Login'));
const Register = React.lazy(() => import('../features/auth/pages/Register'));
const ForgotPassword = React.lazy(() => import('../features/auth/pages/ForgotPassword'));

// App pages
const Dashboard = React.lazy(() => import('../features/dashboard/pages/Dashboard'));
const PatientRouter = React.lazy(() => import('../features/patients/pages/PatientRouter'));
const AppointmentRouter = React.lazy(() => import('../features/appointment/pages/AppointmentRouter'));
const AiSystemRouter = React.lazy(() => import('../features/ai/pages/AiSystemRouter'));
const Setting = React.lazy(() => import('../features/setting/pages/Setting'));
const Profile = React.lazy(() => import('../features/profile/pages/Profile'));
const AuditLogs = React.lazy(() => import('../features/logs/pages/AuditLogs'));
const UserManagement = React.lazy(() => import('../features/admin/pages/UserManagement'));
const WhatsAppRouter = React.lazy(() => import('../features/whatsapp/pages/WhatsAppRouter'));
const Showcase = React.lazy(() => import('../features/showcase/pages/Showcase'));

// Web
const Home = React.lazy(() => import('../features/web/pages/Home'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Cargando pagina">
      <Spinner size="lg" />
      <span className="sr-only">Cargando...</span>
    </div>
  );
}

function SuspenseWrapper() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AppLayout />
    </Suspense>
  );
}

const router = createBrowserRouter([
  // AUTH
  {
    path: '/auth',
    Component: AuthLayout,
    children: [
      { path: 'login', element: <Suspense fallback={<PageLoader />}><Login /></Suspense> },
      { path: 'register', element: <Suspense fallback={<PageLoader />}><Register /></Suspense> },
      { path: 'forgot-password', element: <Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense> },
    ],
  },

  // WEB
  {
    path: '',
    element: <Suspense fallback={<PageLoader />}><WebLayout /></Suspense>,
    children: [
      { path: '', element: <Suspense fallback={<PageLoader />}><Home /></Suspense> },
    ],
  },

  // APP (protegido)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/app',
        element: <SuspenseWrapper />,
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><Dashboard /></Suspense> },
          { path: 'patient', element: <Suspense fallback={<PageLoader />}><PatientRouter /></Suspense> },
          { path: 'patient/:id', element: <Suspense fallback={<PageLoader />}><PatientRouter /></Suspense> },
          { path: 'appointment', element: <Suspense fallback={<PageLoader />}><AppointmentRouter /></Suspense> },
          { path: 'ai-system', element: <Suspense fallback={<PageLoader />}><AiSystemRouter /></Suspense> },
          { path: 'setting', element: <Suspense fallback={<PageLoader />}><Setting /></Suspense> },
          { path: 'profile', element: <Suspense fallback={<PageLoader />}><Profile /></Suspense> },
          { path: 'audit-logs', element: <Suspense fallback={<PageLoader />}><AuditLogs /></Suspense> },
          { path: 'admin/users', element: <Suspense fallback={<PageLoader />}><UserManagement /></Suspense> },
          { path: 'whatsapp', element: <Suspense fallback={<PageLoader />}><WhatsAppRouter /></Suspense> },
          { path: 'showcase', element: <Suspense fallback={<PageLoader />}><Showcase /></Suspense> },
        ],
      },
    ],
  },

  // CATCH ALL
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
