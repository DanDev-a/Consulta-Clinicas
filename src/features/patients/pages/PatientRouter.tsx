import { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';
import Patient from './Patient';
import PatientDetailPage from './PatientDetailPage';
import { useParams } from 'react-router-dom';
import Spinner from '../../../components/ui/Spinner';

export default function PatientRouter() {
  const { id } = useParams<{ id: string }>();
  const [userId, setUserId] = useState<string | undefined>();
  const [userRole, setUserRole] = useState<string | undefined>();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserRole(session.user.user_metadata?.rol ?? 'PACIENTE');
      }
      setAuthChecked(true);
    };
    loadUser();
  }, []);

  if (!authChecked) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  if (id) return <PatientDetailPage userRole={userRole} userId={userId} />;
  return <Patient userRole={userRole} userId={userId} />;
}
