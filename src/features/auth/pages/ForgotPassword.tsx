import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Input from '../../../components/ui/Input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { loading, error, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await resetPassword(email);
    if (success) {
      setSent(true);
      toast.success('Email de recuperación enviado');
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">
          Email Enviado
        </h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          Revisá tu casilla de email y seguí las instrucciones para restablecer tu contraseña.
        </p>
        <Link
          to="/auth/login"
          className="text-[var(--color-accent)] hover:underline font-medium"
        >
          Volver al Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
        Recuperar Contraseña
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        Ingresá tu email y te enviaremos las instrucciones para restablecer tu contraseña.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Enviando...' : 'Enviar Instrucciones'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        ¿Recordaste tu contraseña?{' '}
        <Link to="/auth/login" className="text-[var(--color-accent)] hover:underline font-medium">
          Iniciar Sesión
        </Link>
      </p>
    </div>
  );
}