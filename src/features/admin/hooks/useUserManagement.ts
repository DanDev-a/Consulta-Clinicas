import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { useAuthContext } from '../../../contexts/AuthContext';

export interface PendingInvite {
  token: string;
  email: string;
  rol: 'DOCTOR' | 'RECEPCIONISTA';
  used: boolean;
  created_at: string;
}

export interface UsuarioRow {
  id_usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  fecha_creacion: string;
}

export function useUserManagement() {
  const { user } = useAuthContext();
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const loadUsuarios = useCallback(async () => {
    const { data, error } = await supabase
      .from('usuario')
      .select('id_usuario, nombre, apellido, email, rol, fecha_creacion')
      .order('fecha_creacion', { ascending: false });

    if (!error && data) {
      setUsuarios(data);
    }
  }, []);

  const loadInvites = useCallback(async () => {
    const { data, error } = await supabase
      .from('pending_invite')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        setNeedsSetup(true);
      }
      return;
    }
    if (data) {
      setInvites(data);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadUsuarios(), loadInvites()]);
    setLoading(false);
  }, [loadUsuarios, loadInvites]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const setupSystem = async () => {
    const { error } = await supabase.rpc('setup_invite_system');
    if (error) {
      console.error('Error ejecutando setup:', error);
      return false;
    }
    setNeedsSetup(false);
    await loadInvites();
    return true;
  };

  const crearInvite = async (email: string, rol: 'DOCTOR' | 'RECEPCIONISTA') => {
    if (needsSetup) return false;

    const { data, error } = await supabase
      .from('pending_invite')
      .insert({ email, rol })
      .select('token')
      .single();

    if (error) {
      console.error('Error creando invite:', error);
      return null;
    }

    await loadInvites();
    return data.token;
  };

  const generarLink = (token: string, rol: string) => {
    const base = window.location.origin;
    return `${base}/auth/register?token=${token}&rol=${rol}`;
  };

  return {
    usuarios,
    invites,
    loading,
    needsSetup,
    setupSystem,
    crearInvite,
    generarLink,
    recargar: loadAll,
  };
}
