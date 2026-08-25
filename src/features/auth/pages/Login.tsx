import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiGoogleFill } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Input from '../../../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signInWithEmail(email, password);
    if (success) {
      toast.success('Bienvenido');
      navigate('/app');
    }
  };

  const handleGoogle = async () => {
    const success = await signInWithGoogle();
    if (!success && error) toast.error(error);
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
        Iniciar Sesión
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex justify-end">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {error && (
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-medium hover:bg-[var(--color-surface-alt)] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          <RiGoogleFill size={20} />
          Continuar con Google
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        ¿No tenés cuenta?{' '}
        <Link to="/auth/register" className="text-[var(--color-accent)] hover:underline font-medium">
          Registrate
        </Link>
      </p>
    </div>
  );
}