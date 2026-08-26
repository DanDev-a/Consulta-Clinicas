import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../../config/supabaseClient';
import { useAuthContext, type UserRole } from '../../../contexts/AuthContext';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';

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

export default function Profile() {
  const { user } = useAuthContext();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [grupoSanguineo, setGrupoSanguineo] = useState('');
  const [sexo, setSexo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [licencia, setLicencia] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const role = user?.rol ?? 'PACIENTE';
  const isPaciente = role === 'PACIENTE';
  const isDoctor = role === 'DOCTOR';

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data: usuario } = await supabase
        .from('usuario')
        .select('nombre, apellido, email')
        .eq('id_usuario', user.id)
        .single();

      if (usuario) {
        setNombre(usuario.nombre ?? '');
        setApellido(usuario.apellido ?? '');
      }

      if (isPaciente) {
        const { data: paciente } = await supabase
          .from('paciente')
          .select('telefono, direccion, ciudad, grupo_sanguineo, sexo, fecha_nacimiento')
          .eq('id_paciente', user.id)
          .single();

        if (paciente) {
          setTelefono(paciente.telefono ?? '');
          setDireccion(paciente.direccion ?? '');
          setCiudad(paciente.ciudad ?? '');
          setGrupoSanguineo(paciente.grupo_sanguineo ?? '');
          setSexo(paciente.sexo ?? '');
          setFechaNacimiento(paciente.fecha_nacimiento ?? '');
        }
      }

      if (isDoctor) {
        const { data: doctor } = await supabase
          .from('doctor')
          .select('telefono, numero_licencia, especialidad(nombre)')
          .eq('id_doctor', user.id)
          .single();

        if (doctor) {
          setTelefono(doctor.telefono ?? '');
          setLicencia(doctor.numero_licencia ?? '');
          const esp = doctor.especialidad as Record<string, any> | null;
          setEspecialidad(esp?.nombre ?? '');
        }
      }

      setLoading(false);
    };
    loadProfile();
  }, [user, isPaciente, isDoctor]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error: usuarioError } = await supabase
      .from('usuario')
      .update({ nombre, apellido })
      .eq('id_usuario', user.id);

    if (usuarioError) {
      toast.error('Error al guardar nombre');
      console.error(usuarioError);
      setSaving(false);
      return;
    }

    if (isPaciente) {
      const { error: pacienteError } = await supabase
        .from('paciente')
        .update({
          telefono,
          direccion,
          ciudad,
          grupo_sanguineo: grupoSanguineo || null,
          sexo: sexo || 'O',
          fecha_nacimiento: fechaNacimiento || '2000-01-01',
        })
        .eq('id_paciente', user.id);

      if (pacienteError) {
        toast.error('Error al guardar datos de paciente');
        console.error(pacienteError);
        setSaving(false);
        return;
      }
    }

    if (isDoctor) {
      const { error: doctorError } = await supabase
        .from('doctor')
        .update({ telefono })
        .eq('id_doctor', user.id);

      if (doctorError) {
        toast.error('Error al guardar datos de doctor');
        console.error(doctorError);
        setSaving(false);
        return;
      }
    }

    toast.success('Perfil actualizado');
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Cargando perfil">
        <Spinner size="lg" />
        <span className="sr-only">Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Mi Perfil" subtitle="Gestiona tu informacion personal" />

      <Card>
        <Card.Header>Informacion personal</Card.Header>
        <Card.Body>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={`${nombre} ${apellido}`} size="lg" />
              <div>
                <p className="font-medium text-text">{nombre} {apellido}</p>
                <p className="text-sm text-text-muted">{user?.email}</p>
                <Badge variant={ROLE_VARIANTS[role]} size="sm">
                  {ROLE_LABELS[role]}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required
              />
              <Input
                label="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Tu apellido"
                required
              />
            </div>

            {(isPaciente || isDoctor) && (
              <Input
                label="Telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+54 11 1234-5678"
                type="tel"
              />
            )}

            {isDoctor && (
              <>
                <Input
                  label="Especialidad"
                  value={especialidad}
                  disabled
                  readOnly
                />
                <Input
                  label="Numero de licencia"
                  value={licencia}
                  disabled
                  readOnly
                />
              </>
            )}

            {isPaciente && (
              <>
                <Input
                  label="Direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle 123"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Ciudad"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    placeholder="Buenos Aires"
                  />
                  <Select
                    label="Grupo sanguineo"
                    value={grupoSanguineo}
                    onChange={(e) => setGrupoSanguineo(e.target.value)}
                    options={[
                      { value: '', label: 'No especificado' },
                      { value: 'A+', label: 'A+' },
                      { value: 'A-', label: 'A-' },
                      { value: 'B+', label: 'B+' },
                      { value: 'B-', label: 'B-' },
                      { value: 'AB+', label: 'AB+' },
                      { value: 'AB-', label: 'AB-' },
                      { value: 'O+', label: 'O+' },
                      { value: 'O-', label: 'O-' },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Sexo"
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value)}
                    options={[
                      { value: '', label: 'No especificado' },
                      { value: 'M', label: 'Masculino' },
                      { value: 'F', label: 'Femenino' },
                      { value: 'O', label: 'Otro' },
                    ]}
                  />
                  <Input
                    label="Fecha de nacimiento"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    type="date"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
}
