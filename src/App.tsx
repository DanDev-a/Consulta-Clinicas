import { RouterProvider } from 'react-router-dom';
import router from './router/routes';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--color-surface-elevated)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: 'var(--color-accent)',
                  secondary: 'var(--color-surface)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--color-error)',
                  secondary: 'var(--color-surface)',
                },
              },
            }}
          />
          <RouterProvider router={router} />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
