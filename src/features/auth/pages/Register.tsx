import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { RiGoogleFill, RiStethoscopeLine, RiUserLine, RiUserHeartLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../../../config/supabaseClient';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ROL_CONFIG = {
  PACIENTE: { label: 'Paciente', icon: RiUserHeartLine },
  DOCTOR: { label: 'Doctor', icon: RiStethoscopeLine },
  RECEPCIONISTA: { label: 'Recepcionista', icon: RiUserLine },
};

const SEXO_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' },
];

const GRUPO_SANGUINEO_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

interface Especialidad {
  id_especialidad: number;
  nombre: string;
}

export default function Register() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const rol = (searchParams.get('rol') || 'PACIENTE').toUpperCase();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [ci, setCi] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [grupoSanguineo, setGrupoSanguineo] = useState('');
  const [idEspecialidad, setIdEspecialidad] = useState('');
  const [numeroLicencia, setNumeroLicencia] = useState('');

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);

  const { loading, error, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const rolConfig = ROL_CONFIG[rol as keyof typeof ROL_CONFIG] || ROL_CONFIG.PACIENTE;
  const RolIcon = rolConfig.icon;

  useEffect(() => {
    if (rol === 'DOCTOR') {
      supabase.from('especialidad').select('id_especialidad, nombre').eq('activa', true).then(({ data }) => {
        if (data) setEspecialidades(data);
      });
    }
  }, [rol]);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim()) {
      toast.error('Nombre y apellido son obligatorios');
      return;
    }

    if (rol === 'PACIENTE') {
      if (!ci.trim()) {
        toast.error('La cédula de identidad es obligatoria');
        return;
      }
      if (!fechaNacimiento) {
        toast.error('La fecha de nacimiento es obligatoria');
        return;
      }
      if (!sexo) {
        toast.error('El sexo es obligatorio');
        return;
      }
    }

    if (rol === 'DOCTOR') {
      if (!idEspecialidad) {
        toast.error('La especialidad es obligatoria');
        return;
      }
      if (!numeroLicencia.trim()) {
        toast.error('El número de licencia es obligatorio');
        return;
      }
    }

    const metadata: Record<string, any> = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      rol,
    };
    if (token) metadata.invite_token = token;

    if (rol === 'PACIENTE') {
      metadata.ci = ci.trim();
      metadata.fecha_nacimiento = fechaNacimiento;
      metadata.sexo = sexo;
      if (telefono.trim()) metadata.telefono = telefono.trim();
      if (direccion.trim()) metadata.direccion = direccion.trim();
      if (ciudad.trim()) metadata.ciudad = ciudad.trim();
      if (grupoSanguineo) metadata.grupo_sanguineo = grupoSanguineo;
    }

    if (rol === 'DOCTOR') {
      metadata.id_especialidad = idEspecialidad;
      metadata.numero_licencia = numeroLicencia.trim();
      if (telefono.trim()) metadata.telefono = telefono.trim();
    }

    const success = await signUpWithEmail(email, password, metadata);
    if (success) {
      toast.success('Cuenta creada. Revisá tu email para confirmar');
      navigate('/auth/login');
    }
  };

  const handleGoogle = async () => {
    const success = await signInWithGoogle();
    if (!success && error) toast.error(error);
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
        {step === 1 ? 'Crear Cuenta' : 'Completá tu registro'}
      </h1>

      {step === 1 && (
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          {rol !== 'PACIENTE'
            ? `Registrarse como ${rolConfig.label}`
            : 'Completá tus datos para crear tu cuenta'}
        </p>
      )}

      {step === 2 && (
        <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-[var(--color-accent-soft)] border border-[var(--color-accent)]">
          <RolIcon className="text-[var(--color-accent)]" />
          <span className="text-sm font-medium text-[var(--color-accent)]">
            Registro como {rolConfig.label}
          </span>
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--color-danger)] mb-4">{error}</p>
      )}

      {/* STEP 1: Email + Password */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="flex flex-col gap-4">
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
            minLength={6}
          />
          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Siguiente
          </button>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-medium hover:bg-[var(--color-surface-alt)] transition-colors flex items-center justify-center gap-2"
          >
            <RiGoogleFill size={20} />
            Registrarse con Google
          </button>
        </form>
      )}

      {/* STEP 2: Profile form by role */}
      {step === 2 && (
        <form onSubmit={handleStep2} className="flex flex-col gap-4">
          {/* Campos comunes */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              placeholder="Juan"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <Input
              label="Apellido"
              placeholder="Pérez"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
          </div>

          {/* PACIENTE */}
          {rol === 'PACIENTE' && (
            <>
              <Input
                label="Cédula de Identidad"
                placeholder="12.345.678"
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Fecha de nacimiento"
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  required
                />
                <Select
                  label="Sexo"
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  options={SEXO_OPTIONS}
                  required
                />
              </div>
              <Input
                label="Teléfono (opcional)"
                placeholder="7-1234567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
              <Input
                label="Dirección (opcional)"
                placeholder="Av. Arce 1234"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ciudad (opcional)"
                  placeholder="La Paz"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                />
                <Select
                  label="Grupo sanguíneo (opcional)"
                  value={grupoSanguineo}
                  onChange={(e) => setGrupoSanguineo(e.target.value)}
                  options={GRUPO_SANGUINEO_OPTIONS}
                />
              </div>
            </>
          )}

          {/* DOCTOR */}
          {rol === 'DOCTOR' && (
            <>
              <Select
                label="Especialidad"
                value={idEspecialidad}
                onChange={(e) => setIdEspecialidad(e.target.value)}
                options={especialidades.map((e) => ({
                  value: String(e.id_especialidad),
                  label: e.nombre,
                }))}
                required
              />
              <Input
                label="Número de licencia"
                placeholder="CMP 12345"
                value={numeroLicencia}
                onChange={(e) => setNumeroLicencia(e.target.value)}
                required
              />
              <Input
                label="Teléfono (opcional)"
                placeholder="7-1234567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </>
          )}

          {/* RECEPCIONISTA */}
          {rol === 'RECEPCIONISTA' && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Solo necesitamos tu nombre y apellido para completar el registro.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-medium hover:bg-[var(--color-surface-alt)] transition-colors"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        ¿Ya tenés cuenta?{' '}
        <Link to="/auth/login" className="text-[var(--color-accent)] hover:underline font-medium">
          Iniciar Sesión
        </Link>
      </p>
    </div>
  );
}
