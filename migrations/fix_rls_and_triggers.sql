-- =====================================================
-- MIGRACIÓN: Fix RLS, Triggers y fecha_atencion
-- Fecha: 2026-08-27
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- =====================================================


-- =====================================================
-- 1. TRIGGERS: SECURITY DEFINER
-- =====================================================
-- Los triggers intentan INSERTar en recordatorio, pero RLS
-- bloquea el INSERT si la función no es SECURITY DEFINER.
-- Esto causaba rollback de toda la transacción (UPDATE + INSERT).

CREATE OR REPLACE FUNCTION create_recordatorio_on_confirm()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'CONFIRMADA' AND OLD.estado != 'CONFIRMADA' THEN
        INSERT INTO recordatorio (id_cita, tipo, mensaje, fecha_programada)
        VALUES (
            NEW.id_cita,
            'WHATSAPP',
            'Hola, le recordamos que tiene una cita el '
                || TO_CHAR(NEW.fecha_hora, 'DD/MM/YYYY a las HH24:MI')
                || '. Por favor confirme asistencia.',
            NEW.fecha_hora - INTERVAL '24 hours'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION create_recordatorio_on_atendida()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'ATENDIDA' AND OLD.estado != 'ATENDIDA' THEN
        INSERT INTO recordatorio (id_cita, tipo, mensaje, fecha_programada)
        VALUES (
            NEW.id_cita,
            'WHATSAPP',
            'Hola, le deseamos una pronta recuperacion. Si tiene alguna consulta, no dude en comunicarse con la clinica.',
            NOW() + INTERVAL '1 hour'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 2. RLS: INSERT en recordatorio
-- =====================================================
-- Sin esta policy, los triggers fallan al INSERTar
-- y revierten toda la transacción.

CREATE POLICY "authenticated_insert_recordatorio" ON recordatorio
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- =====================================================
-- 3. RLS: SELECT en usuario
-- =====================================================
-- La recepcionista y el doctor necesitan leer la tabla
-- usuario para ver nombres/emails en los joins anidados
-- (cita → paciente → usuario).

CREATE POLICY "recepcionista_select_usuario" ON usuario
  FOR SELECT USING (is_recepcionista());

CREATE POLICY "doctor_select_usuario" ON usuario
  FOR SELECT USING (
    id_usuario IN (
      SELECT p.id_paciente FROM paciente p
      JOIN cita c ON c.id_paciente = p.id_paciente
      WHERE c.id_doctor = auth.uid()
    )
    OR id_usuario = auth.uid()
  );


-- =====================================================
-- 4. COLUMNA: fecha_atencion
-- =====================================================
-- El frontend envía esta columna al marcar una cita como ATENDIDA.

ALTER TABLE cita ADD COLUMN IF NOT EXISTS fecha_atencion TIMESTAMPTZ;
