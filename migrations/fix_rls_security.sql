-- =====================================================
-- MIGRACION: Seguridad RLS + edicion de pacientes
-- Fecha: 2026-09-27
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =====================================================


-- =====================================================
-- 1. ESCALADA DE PRIVILEGIOS (bloqueante)
-- =====================================================
-- Las policies de RLS restringen FILAS, no columnas.
-- Con "own_update_preferencias" cualquier usuario autenticado
-- podia ejecutar:
--     update usuario set rol = 'ADMIN' where id_usuario = auth.uid()
-- y volverse administrador. Ademas ambas policies son
-- redundantes: la app lee/escribe preferencias via RPC
-- (get_user_preferencias / update_user_preferencias, SECURITY
-- DEFINER) y el SELECT propio ya lo cubre own_select_usuario.

DROP POLICY IF EXISTS "own_update_preferencias" ON usuario;
DROP POLICY IF EXISTS "own_select_preferencias" ON usuario;


-- =====================================================
-- 2. EDITAR EL PROPIO PERFIL
-- =====================================================
-- Profile.tsx actualiza nombre/apellido de su propia fila.
-- Antes dependia de la policy que acabamos de eliminar.

DROP POLICY IF EXISTS "own_update_usuario" ON usuario;
CREATE POLICY "own_update_usuario" ON usuario
  FOR UPDATE USING (id_usuario = auth.uid());


-- =====================================================
-- 3. DOCTOR EDITA PACIENTES
-- =====================================================
-- PatientDetailPage define canEdit = isAdmin || isDoctor y
-- updatePatient() toca la tabla usuario, pero solo existia
-- admin_update_usuario: el doctor recibia 42501 al guardar.

DROP POLICY IF EXISTS "doctor_update_usuario" ON usuario;
CREATE POLICY "doctor_update_usuario" ON usuario
  FOR UPDATE USING (
    is_doctor()
    AND id_usuario IN (SELECT id_paciente FROM paciente)
  );


-- =====================================================
-- 4. COLUMNAS EDITABLES VIA API
-- =====================================================
-- Con las policies anteriores, el siguiente grant limita que
-- cualquier rol edite unicamente nombre/apellido/preferencias.
-- rol, activo y email quedan fuera del alcance de PostgREST.
--   - rol/activo: solo se asignan con SQL (Supabase.md parte 11).
--   - email: espejo de auth.users; cambiarlo solo desde la API
--     generaria inconsistencia con el login.

REVOKE UPDATE ON public.usuario FROM authenticated;
GRANT UPDATE (nombre, apellido) ON public.usuario TO authenticated;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'usuario'
          AND column_name  = 'preferencias'
    ) THEN
        GRANT UPDATE (preferencias) ON public.usuario TO authenticated;
    END IF;
END $$;


-- =====================================================
-- VERIFICACION
-- =====================================================
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'usuario'
ORDER BY cmd, policyname;

SELECT grantee, privilege_type, column_name
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND table_name = 'usuario'
  AND privilege_type = 'UPDATE'
ORDER BY grantee, column_name;
