-- =====================================================
-- CLINICA NOVA -- SCRIPT COMPLETO DE SUPABASE
-- =====================================================
-- Este archivo contiene TODO lo necesario para configurar
-- la base de datos en Supabase: tablas, funciones, triggers,
-- RLS policies, storage e instrucciones de setup.
--
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- =====================================================


-- =====================================================
-- PARTE 1: CONFIGURACION INICIAL EN SUPABASE DASHBOARD
-- =====================================================
--
-- ANTES de ejecutar el SQL, hacer esto en el Dashboard:
--
-- 1. AUTHENTICATION > Providers:
--    Email (ya viene habilitado)
--    Google: habilitar y poner Client ID + Client Secret
--       (obtener de Google Cloud Console > APIs & Services > Credentials)
--    Phone: deshabilitado (no se usa)
--
-- 2. AUTHENTICATION > Settings:
--    - Site URL: http://localhost:5173
--    - Redirect URLs: http://localhost:5173/**
--
-- 3. STORAGE:
--    - Crear bucket "documentos-medicos" (privado)
--
-- 4. Variables de entorno (.env en el proyecto):
--    VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
--    VITE_SUPABASE_ANON_KEY=TU-ANON-KEY
-- =====================================================


-- =====================================================
-- PARTE 2: FUNCIONES PLPGSQL
-- =====================================================
-- Se crean ANTES que los triggers porque los triggers
-- necesitan que las funciones existan.
-- =====================================================

-- Funcion auxiliar: actualizar fecha_actualizacion automaticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Funciones de verificacion de rol
-- Cada funcion retorna TRUE si el usuario actual tiene ese rol.
-- Se usan en las RLS policies para controlar acceso.

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT rol FROM usuario WHERE id_usuario = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_doctor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'DOCTOR';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_paciente()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'PACIENTE';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_recepcionista()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'RECEPCIONISTA';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_doctor_id()
RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_paciente_id()
RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Funcion: auto-crear usuario al registrarse
-- Se ejecuta cuando auth.users recibe un INSERT.
-- Crea la fila en usuario + la sub-fila segun el rol.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_rol      TEXT;
    user_nombre   TEXT;
    user_apellido TEXT;
BEGIN
    user_rol      := COALESCE(NEW.raw_user_meta_data ->> 'rol', 'PACIENTE');
    user_nombre   := COALESCE(NEW.raw_user_meta_data ->> 'nombre', '');
    user_apellido := COALESCE(NEW.raw_user_meta_data ->> 'apellido', '');

    IF user_nombre = '' THEN
        user_nombre := SPLIT_PART(NEW.email, '@', 1);
    END IF;

    INSERT INTO usuario (id_usuario, nombre, apellido, email, rol)
    VALUES (NEW.id, user_nombre, user_apellido, NEW.email, user_rol);

    IF user_rol = 'PACIENTE' THEN
        INSERT INTO paciente (id_paciente, ci, fecha_nacimiento, sexo,
                              telefono, direccion, ciudad, grupo_sanguineo)
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data ->> 'ci',
            (NEW.raw_user_meta_data ->> 'fecha_nacimiento')::DATE,
            (NEW.raw_user_meta_data ->> 'sexo')::CHAR,
            NULLIF(NEW.raw_user_meta_data ->> 'telefono', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'direccion', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'ciudad', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'grupo_sanguineo', '')
        );
    END IF;

    IF user_rol = 'DOCTOR' THEN
        INSERT INTO doctor (id_doctor, id_especialidad, numero_licencia, telefono)
        VALUES (
            NEW.id,
            (NEW.raw_user_meta_data ->> 'id_especialidad')::INTEGER,
            NEW.raw_user_meta_data ->> 'numero_licencia',
            NULLIF(NEW.raw_user_meta_data ->> 'telefono', '')
        );
    END IF;

    IF user_rol = 'RECEPCIONISTA' THEN
        INSERT INTO recepcionista (id_recepcionista)
        VALUES (NEW.id);
    END IF;

    -- Marcar invite como usado si vino con token
    IF NEW.raw_user_meta_data ? 'invite_token' THEN
        UPDATE pending_invite
        SET used = TRUE
        WHERE token = (NEW.raw_user_meta_data ->> 'invite_token')::UUID
          AND used = FALSE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Funcion: crear recordatorio al confirmar cita
-- Cuando una cita pasa a estado CONFIRMADA, crea un
-- recordatorio automatico 24 horas antes de la cita.

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
$$ LANGUAGE plpgsql;


-- Funcion: crear recordatorio de seguimiento al atender cita
-- Cuando una cita pasa a estado ATENDIDA, crea un
-- recordatorio de seguimiento 1 hora despues.

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
$$ LANGUAGE plpgsql;


-- =====================================================
-- PARTE 3: TABLAS
-- =====================================================
-- Orden de creacion respetando dependencias (FK).
-- =====================================================


-- =====================================================
-- 8.1 IDENTIDAD Y AUTENTICACION
-- =====================================================

CREATE TABLE usuario (
    id_usuario          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre              VARCHAR(100)  NOT NULL,
    apellido            VARCHAR(100)  NOT NULL,
    email               VARCHAR(150)  UNIQUE NOT NULL,
    rol                 VARCHAR(20)   NOT NULL CHECK (rol IN ('PACIENTE','DOCTOR','RECEPCIONISTA','ADMIN')),
    activo              BOOLEAN       NOT NULL DEFAULT TRUE,
    fecha_creacion      TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 8.3 ACTORES DE CLINICA (especialidad primero por FK)
-- =====================================================

CREATE TABLE especialidad (
    id_especialidad SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) UNIQUE NOT NULL,
    descripcion     TEXT,
    activa          BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO especialidad (nombre, descripcion) VALUES
    ('Clinica General',         'Medicina general y prevencion'),
    ('Pediatria',               'Salud del nino y adolescente'),
    ('Cardiologia',             'Enfermedades del corazon'),
    ('Dermatologia',            'Enfermedades de la piel'),
    ('Ginecologia',             'Salud de la mujer'),
    ('Traumatologia',           'Huesos, articulaciones y musculos'),
    ('Oftalmologia',            'Salud visual'),
    ('Otorrinolaringologia',    'Oidos, nariz y garganta'),
    ('Odontologia',             'Salud bucal'),
    ('Psicologia',              'Salud mental');


-- =====================================================
-- 8.2 PACIENTES
-- =====================================================

CREATE TABLE paciente (
    id_paciente         UUID PRIMARY KEY REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    ci                  VARCHAR(20)  UNIQUE NOT NULL,
    fecha_nacimiento    DATE         NOT NULL,
    sexo                CHAR(1)      NOT NULL CHECK (sexo IN ('M','F','O')),
    telefono            VARCHAR(20),
    direccion           VARCHAR(255),
    ciudad              VARCHAR(100),
    grupo_sanguineo     VARCHAR(3)   CHECK (grupo_sanguineo IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    fecha_registro      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 8.3 DOCTOR, RECEPCIONISTA Y HORARIOS
-- =====================================================

CREATE TABLE doctor (
    id_doctor           UUID PRIMARY KEY REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_especialidad     INT          NOT NULL REFERENCES especialidad(id_especialidad),
    numero_licencia     VARCHAR(50)  UNIQUE NOT NULL,
    telefono            VARCHAR(20),
    fecha_registro      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recepcionista (
    id_recepcionista    UUID PRIMARY KEY REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    fecha_registro      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE horario_doctor (
    id_horario  SERIAL PRIMARY KEY,
    id_doctor   UUID     NOT NULL REFERENCES doctor(id_doctor) ON DELETE CASCADE,
    dia_semana  SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio TIME     NOT NULL,
    hora_fin    TIME     NOT NULL,
    activo      BOOLEAN  NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_hora_valida CHECK (hora_fin > hora_inicio)
);


-- =====================================================
-- 8.2 SALUD Y ANTECEDENTES DEL PACIENTE
-- =====================================================

CREATE TABLE contacto_emergencia (
    id_contacto SERIAL PRIMARY KEY,
    id_paciente UUID         NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    nombre      VARCHAR(100) NOT NULL,
    telefono    VARCHAR(20),
    relacion    VARCHAR(50),
    es_principal BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX uq_contacto_principal
    ON contacto_emergencia(id_paciente)
    WHERE es_principal = TRUE;

CREATE TABLE alergia (
    id_alergia  SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE paciente_alergia (
    id_paciente     UUID         NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    id_alergia      INT          NOT NULL REFERENCES alergia(id_alergia) ON DELETE CASCADE,
    fecha_registro  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacion     TEXT,
    PRIMARY KEY (id_paciente, id_alergia)
);

CREATE TABLE medicamento (
    id_medicamento   SERIAL PRIMARY KEY,
    nombre           VARCHAR(100) UNIQUE NOT NULL,
    principio_activo VARCHAR(100),
    presentacion     VARCHAR(100)
);

CREATE TABLE paciente_medicamento (
    id_paciente     UUID         NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    id_medicamento  INT          NOT NULL REFERENCES medicamento(id_medicamento) ON DELETE CASCADE,
    fecha_inicio    DATE         NOT NULL,
    fecha_fin       DATE,
    dosis           VARCHAR(100),
    indicacion      TEXT,
    PRIMARY KEY (id_paciente, id_medicamento, fecha_inicio),
    CONSTRAINT chk_fechas_medicamento CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);


-- =====================================================
-- 8.5 EXPEDIENTES (antes de cita porque cita lo referencian)
-- =====================================================

CREATE TABLE expediente (
    id_expediente   SERIAL PRIMARY KEY,
    id_paciente     UUID        NOT NULL UNIQUE REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones   TEXT
);


-- =====================================================
-- 8.4 CITAS
-- =====================================================

CREATE TABLE cita (
    id_cita         SERIAL PRIMARY KEY,
    id_paciente     UUID         NOT NULL REFERENCES paciente(id_paciente),
    id_doctor       UUID         NOT NULL REFERENCES doctor(id_doctor),
    id_expediente   INT          NOT NULL REFERENCES expediente(id_expediente),
    fecha_hora      TIMESTAMPTZ  NOT NULL,
    motivo          TEXT,
    estado          VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE'
                    CHECK (estado IN ('PENDIENTE','CONFIRMADA','CANCELADA','ATENDIDA')),
    fecha_creacion  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_doctor_fecha UNIQUE (id_doctor, fecha_hora)
);


-- =====================================================
-- 8.5 CIE-10 (catalogos internacionales)
-- =====================================================

CREATE TABLE diagnosticos_cie10 (
    id            SERIAL PRIMARY KEY,
    clave         VARCHAR(10)  NOT NULL,
    descripcion   VARCHAR(512) NOT NULL,
    nodo_final    BOOLEAN DEFAULT FALSE,
    manifestacion BOOLEAN DEFAULT FALSE,
    perinatal     BOOLEAN DEFAULT FALSE,
    pediatrico    BOOLEAN DEFAULT FALSE,
    obstetrico    BOOLEAN DEFAULT FALSE,
    adulto        BOOLEAN DEFAULT FALSE,
    mujer         BOOLEAN DEFAULT FALSE,
    hombre        BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_diag_clave ON diagnosticos_cie10(clave);
CREATE INDEX idx_diag_desc  ON diagnosticos_cie10(descripcion);

CREATE TABLE procedimientos_cie10 (
    id          SERIAL PRIMARY KEY,
    clave       VARCHAR(10)  NOT NULL,
    descripcion VARCHAR(512) NOT NULL,
    hombre      BOOLEAN DEFAULT FALSE,
    mujer       BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_proc_clave ON procedimientos_cie10(clave);
CREATE INDEX idx_proc_desc  ON procedimientos_cie10(descripcion);


-- =====================================================
-- 8.5 DIAGNOSTICO CLINICO Y RECETAS
-- =====================================================

CREATE TABLE diagnostico (
    id_diagnostico  SERIAL PRIMARY KEY,
    id_expediente   INT         NOT NULL REFERENCES expediente(id_expediente) ON DELETE CASCADE,
    id_cita         INT         REFERENCES cita(id_cita) ON DELETE SET NULL,
    id_doctor       UUID        NOT NULL REFERENCES doctor(id_doctor),
    id_cie10        INT         REFERENCES diagnosticos_cie10(id),
    descripcion     TEXT        NOT NULL,
    fecha           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE receta (
    id_receta           SERIAL PRIMARY KEY,
    id_diagnostico      INT          NOT NULL REFERENCES diagnostico(id_diagnostico) ON DELETE CASCADE,
    id_doctor           UUID         NOT NULL REFERENCES doctor(id_doctor),
    descripcion         TEXT         NOT NULL,
    fecha_emision       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento   DATE
);

CREATE TABLE receta_detalle (
    id_detalle          SERIAL PRIMARY KEY,
    id_receta           INT          NOT NULL REFERENCES receta(id_receta) ON DELETE CASCADE,
    id_medicamento      INT          REFERENCES medicamento(id_medicamento),
    medicamento_texto   VARCHAR(200),
    dosis               VARCHAR(100) NOT NULL,
    frecuencia          VARCHAR(100) NOT NULL,
    duracion            VARCHAR(100),
    indicaciones        TEXT,
    CONSTRAINT chk_medicamento CHECK (
        id_medicamento IS NOT NULL OR medicamento_texto IS NOT NULL
    )
);


-- =====================================================
-- 8.6 SISTEMA EXPERTO (IA)
-- =====================================================

CREATE TABLE diagnostico_ia (
    id_diagnostico_ia   SERIAL PRIMARY KEY,
    id_expediente       INT          NOT NULL REFERENCES expediente(id_expediente),
    id_diagnostico      INT          REFERENCES diagnostico(id_diagnostico),
    id_cie10_sugerido   INT          REFERENCES diagnosticos_cie10(id),
    analisis_ia         TEXT         NOT NULL,
    probabilidad        NUMERIC(5,2) CHECK (probabilidad BETWEEN 0.00 AND 100.00),
    receta_sugerida     JSONB,
    fecha_generacion    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_validacion   VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (estado_validacion IN ('PENDIENTE','ACEPTADO','RECHAZADO','MODIFICADO')),
    id_doctor_validador UUID         REFERENCES doctor(id_doctor),
    fecha_validacion    TIMESTAMPTZ
);

CREATE TABLE chat_medico (
    id_chat             SERIAL PRIMARY KEY,
    id_doctor           UUID     NOT NULL REFERENCES doctor(id_doctor),
    id_diagnostico_ia   INT      NOT NULL REFERENCES diagnostico_ia(id_diagnostico_ia) ON DELETE CASCADE,
    mensaje             TEXT     NOT NULL,
    respuesta_ia        TEXT     NOT NULL,
    fecha               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 8.7 NOTIFICACIONES Y RECORDATORIOS
-- =====================================================

CREATE TABLE notificacion (
    id_notificacion SERIAL PRIMARY KEY,
    id_paciente     UUID         NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    id_cita         INT          REFERENCES cita(id_cita) ON DELETE SET NULL,
    tipo            VARCHAR(20)  NOT NULL CHECK (tipo IN ('EMAIL','SMS','WHATSAPP','APP')),
    asunto          VARCHAR(200),
    mensaje         TEXT         NOT NULL,
    fecha_envio     TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado          VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE'
                    CHECK (estado IN ('PENDIENTE','ENVIADO','FALLIDO')),
    intentos        SMALLINT     NOT NULL DEFAULT 0
);

CREATE TABLE recordatorio (
    id_recordatorio     SERIAL PRIMARY KEY,
    id_cita             INT          NOT NULL REFERENCES cita(id_cita) ON DELETE CASCADE,
    tipo                VARCHAR(20)  NOT NULL CHECK (tipo IN ('EMAIL','SMS','WHATSAPP','APP')),
    mensaje             TEXT         NOT NULL,
    fecha_programada    TIMESTAMPTZ  NOT NULL,
    estado              VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (estado IN ('PENDIENTE','ENVIADO','FALLIDO')),
    fecha_envio_real    TIMESTAMPTZ,
    intentos            SMALLINT     NOT NULL DEFAULT 0
);


-- =====================================================
-- 8.8 WHATSAPP CRM
-- =====================================================

CREATE TABLE whatsapp_config (
    id                  SERIAL PRIMARY KEY,
    phone_number_id     VARCHAR(50)  NOT NULL,
    token               TEXT         NOT NULL,
    numero_display      VARCHAR(20)  NOT NULL,
    activo              BOOLEAN      DEFAULT true,
    fecha_creacion      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE whatsapp_log (
    id                  SERIAL PRIMARY KEY,
    id_paciente         UUID REFERENCES paciente(id_paciente),
    id_cita             INT REFERENCES cita(id_cita),
    tipo                VARCHAR(20)  NOT NULL CHECK (tipo IN ('CONFIRMACION','RECORDATORIO','SEGUIMIENTO')),
    mensaje             TEXT         NOT NULL,
    phone_number        VARCHAR(20)  NOT NULL,
    wa_message_id       VARCHAR(100),
    estado              VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (estado IN ('PENDIENTE','ENVIADO','ENTREGADO','FALLIDO','NO_WHATSAPP')),
    error_message       TEXT,
    fecha_envio         TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- AUDITORIA
-- =====================================================

CREATE TABLE audit_log (
    id              SERIAL PRIMARY KEY,
    id_usuario      UUID REFERENCES usuario(id_usuario),
    tabla           VARCHAR(50) NOT NULL,
    accion          VARCHAR(10) NOT NULL CHECK (accion IN ('INSERT','UPDATE','DELETE')),
    datos_anteriores JSONB,
    datos_nuevos    JSONB,
    fecha           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address      INET
);


-- =====================================================
-- PARTE 4: TRIGGERS
-- =====================================================

-- Auto-crear usuario al registrarse en auth
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-actualizar fecha_actualizacion
CREATE TRIGGER on_usuario_updated
    BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER on_paciente_updated
    BEFORE UPDATE ON paciente
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER on_doctor_updated
    BEFORE UPDATE ON doctor
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER on_recepcionista_updated
    BEFORE UPDATE ON recepcionista
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Crear recordatorio cuando cita se confirma
CREATE TRIGGER on_cita_confirmed
    AFTER UPDATE ON cita
    FOR EACH ROW EXECUTE FUNCTION create_recordatorio_on_confirm();

-- Crear recordatorio de seguimiento cuando cita se atiende
CREATE TRIGGER on_cita_attended
    AFTER UPDATE ON cita
    FOR EACH ROW EXECUTE FUNCTION create_recordatorio_on_atendida();


-- =====================================================
-- PARTE 5: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuario                ENABLE ROW LEVEL SECURITY;
ALTER TABLE paciente               ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE recepcionista          ENABLE ROW LEVEL SECURITY;
ALTER TABLE especialidad           ENABLE ROW LEVEL SECURITY;
ALTER TABLE horario_doctor         ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacto_emergencia    ENABLE ROW LEVEL SECURITY;
ALTER TABLE alergia                ENABLE ROW LEVEL SECURITY;
ALTER TABLE paciente_alergia       ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicamento            ENABLE ROW LEVEL SECURITY;
ALTER TABLE paciente_medicamento   ENABLE ROW LEVEL SECURITY;
ALTER TABLE expediente             ENABLE ROW LEVEL SECURITY;
ALTER TABLE cita                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos_cie10     ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimientos_cie10   ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostico            ENABLE ROW LEVEL SECURITY;
ALTER TABLE receta                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE receta_detalle         ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostico_ia         ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_medico            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacion           ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordatorio           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_config        ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_log           ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- POLICIES: USUARIO
-- =====================================================

CREATE POLICY "admin_select_usuario" ON usuario FOR SELECT USING (is_admin());
CREATE POLICY "own_select_usuario"   ON usuario FOR SELECT USING (id_usuario = auth.uid());
CREATE POLICY "admin_insert_usuario" ON usuario FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_update_usuario" ON usuario FOR UPDATE USING (is_admin());
CREATE POLICY "admin_delete_usuario" ON usuario FOR DELETE USING (is_admin());


-- =====================================================
-- POLICIES: PACIENTE
-- =====================================================

CREATE POLICY "admin_select_paciente"          ON paciente FOR SELECT USING (is_admin());
CREATE POLICY "doctor_select_paciente"         ON paciente FOR SELECT USING (is_doctor());
CREATE POLICY "recepcionista_select_paciente"  ON paciente FOR SELECT USING (is_recepcionista());
CREATE POLICY "own_select_paciente"            ON paciente FOR SELECT USING (id_paciente = auth.uid());
CREATE POLICY "admin_recepcionista_insert_paciente" ON paciente FOR INSERT WITH CHECK (is_admin() OR is_recepcionista());
CREATE POLICY "admin_doctor_update_paciente"   ON paciente FOR UPDATE USING (is_admin() OR is_doctor());
CREATE POLICY "own_update_paciente"            ON paciente FOR UPDATE USING (id_paciente = auth.uid());
CREATE POLICY "admin_delete_paciente"          ON paciente FOR DELETE USING (is_admin());


-- =====================================================
-- POLICIES: DOCTOR
-- =====================================================

CREATE POLICY "admin_select_doctor"        ON doctor FOR SELECT USING (is_admin());
CREATE POLICY "recepcionista_select_doctor" ON doctor FOR SELECT USING (is_recepcionista());
CREATE POLICY "paciente_select_doctor"     ON doctor FOR SELECT USING (is_paciente());
CREATE POLICY "own_select_doctor"          ON doctor FOR SELECT USING (id_doctor = auth.uid());
CREATE POLICY "admin_insert_doctor"        ON doctor FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_update_doctor"        ON doctor FOR UPDATE USING (is_admin());
CREATE POLICY "own_update_doctor"          ON doctor FOR UPDATE USING (id_doctor = auth.uid());
CREATE POLICY "admin_delete_doctor"        ON doctor FOR DELETE USING (is_admin());


-- =====================================================
-- POLICIES: RECEPCIONISTA
-- =====================================================

CREATE POLICY "admin_select_recepcionista"  ON recepcionista FOR SELECT USING (is_admin());
CREATE POLICY "own_select_recepcionista"    ON recepcionista FOR SELECT USING (id_recepcionista = auth.uid());
CREATE POLICY "admin_insert_recepcionista"  ON recepcionista FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_update_recepcionista"  ON recepcionista FOR UPDATE USING (is_admin());
CREATE POLICY "admin_delete_recepcionista"  ON recepcionista FOR DELETE USING (is_admin());


-- =====================================================
-- POLICIES: ESPECIALIDAD
-- =====================================================

CREATE POLICY "authenticated_select_especialidad" ON especialidad FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_especialidad"           ON especialidad FOR ALL USING (is_admin());


-- =====================================================
-- POLICIES: HORARIO DOCTOR
-- =====================================================

CREATE POLICY "admin_select_horario"         ON horario_doctor FOR SELECT USING (is_admin());
CREATE POLICY "own_select_horario"           ON horario_doctor FOR SELECT USING (id_doctor = auth.uid());
CREATE POLICY "recepcionista_select_horario" ON horario_doctor FOR SELECT USING (is_recepcionista());
CREATE POLICY "admin_doctor_all_horario"     ON horario_doctor FOR ALL USING (is_admin() OR id_doctor = auth.uid());


-- =====================================================
-- POLICIES: CONTACTO EMERGENCIA
-- =====================================================

CREATE POLICY "admin_select_contacto"  ON contacto_emergencia FOR SELECT USING (is_admin());
CREATE POLICY "doctor_select_contacto" ON contacto_emergencia FOR SELECT USING (
    id_paciente IN (SELECT id_paciente FROM cita WHERE id_doctor = auth.uid())
);
CREATE POLICY "own_select_contacto"    ON contacto_emergencia FOR SELECT USING (id_paciente = auth.uid());
CREATE POLICY "own_all_contacto"       ON contacto_emergencia FOR ALL USING (id_paciente = auth.uid() OR is_admin());


-- =====================================================
-- POLICIES: ALERGIA
-- =====================================================

CREATE POLICY "authenticated_select_alergia" ON alergia FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_alergia"           ON alergia FOR ALL USING (is_admin());


-- =====================================================
-- POLICIES: PACIENTE ALERGIA
-- =====================================================

CREATE POLICY "admin_select_paciente_alergia"  ON paciente_alergia FOR SELECT USING (is_admin());
CREATE POLICY "doctor_select_paciente_alergia" ON paciente_alergia FOR SELECT USING (
    id_paciente IN (SELECT id_paciente FROM cita WHERE id_doctor = auth.uid())
);
CREATE POLICY "own_select_paciente_alergia"    ON paciente_alergia FOR SELECT USING (id_paciente = auth.uid());
CREATE POLICY "admin_doctor_all_paciente_alergia" ON paciente_alergia FOR ALL USING (is_admin() OR is_doctor());


-- =====================================================
-- POLICIES: MEDICAMENTO
-- =====================================================

CREATE POLICY "authenticated_select_medicamento" ON medicamento FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_medicamento"           ON medicamento FOR ALL USING (is_admin());


-- =====================================================
-- POLICIES: PACIENTE MEDICAMENTO
-- =====================================================

CREATE POLICY "admin_select_paciente_medicamento"  ON paciente_medicamento FOR SELECT USING (is_admin());
CREATE POLICY "doctor_select_paciente_medicamento" ON paciente_medicamento FOR SELECT USING (
    id_paciente IN (SELECT id_paciente FROM cita WHERE id_doctor = auth.uid())
);
CREATE POLICY "own_select_paciente_medicamento"    ON paciente_medicamento FOR SELECT USING (id_paciente = auth.uid());
CREATE POLICY "admin_doctor_all_paciente_medicamento" ON paciente_medicamento FOR ALL USING (is_admin() OR is_doctor());


-- =====================================================
-- POLICIES: EXPEDIENTE
-- =====================================================

CREATE POLICY "admin_select_expediente"   ON expediente FOR SELECT USING (is_admin());
CREATE POLICY "doctor_select_expediente"  ON expediente FOR SELECT USING (
    id_paciente IN (SELECT id_paciente FROM cita WHERE id_doctor = auth.uid())
);
CREATE POLICY "recepcionista_select_expediente" ON expediente FOR SELECT USING (is_recepcionista());
CREATE POLICY "own_select_expediente"     ON expediente FOR SELECT USING (id_paciente = auth.uid());
CREATE POLICY "admin_doctor_insert_expediente" ON expediente FOR INSERT WITH CHECK (is_admin() OR is_doctor());
CREATE POLICY "admin_doctor_update_expediente" ON expediente FOR UPDATE USING (is_admin() OR is_doctor());
CREATE POLICY "admin_delete_expediente"   ON expediente FOR DELETE USING (is_admin());


-- =====================================================
-- POLICIES: CITA
-- =====================================================

CREATE POLICY "admin_select_cita"         ON cita FOR SELECT USING (is_admin());
CREATE POLICY "doctor_select_cita"        ON cita FOR SELECT USING (id_doctor = auth.uid());
CREATE POLICY "recepcionista_select_cita" ON cita FOR SELECT USING (is_recepcionista());
CREATE POLICY "own_select_cita"           ON cita FOR SELECT USING (id_paciente = auth.uid());
CREATE POLICY "recepcionista_insert_cita" ON cita FOR INSERT WITH CHECK (is_recepcionista());
CREATE POLICY "recepcionista_update_cita" ON cita FOR UPDATE USING (is_recepcionista());
CREATE POLICY "doctor_update_cita"        ON cita FOR UPDATE USING (id_doctor = auth.uid());
CREATE POLICY "paciente_cancel_cita"      ON cita FOR UPDATE USING (
    id_paciente = auth.uid() AND estado = 'PENDIENTE'
);
CREATE POLICY "admin_all_cita"            ON cita FOR ALL USING (is_admin());


-- =====================================================
-- POLICIES: CIE-10
-- =====================================================

CREATE POLICY "authenticated_select_cie10"     ON diagnosticos_cie10 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_select_proc_cie10" ON procedimientos_cie10 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_cie10"               ON diagnosticos_cie10 FOR ALL USING (is_admin());
CREATE POLICY "admin_all_proc_cie10"          ON procedimientos_cie10 FOR ALL USING (is_admin());


-- =====================================================
-- POLICIES: DIAGNOSTICO
-- =====================================================

CREATE POLICY "admin_select_diagnostico"  ON diagnostico FOR SELECT USING (is_admin());
CREATE POLICY "doctor_select_diagnostico" ON diagnostico FOR SELECT USING (
    id_expediente IN (
        SELECT e.id_expediente FROM expediente e
        JOIN cita c ON c.id_paciente = e.id_paciente
        WHERE c.id_doctor = auth.uid()
    )
);
CREATE POLICY "own_select_diagnostico"    ON diagnostico FOR SELECT USING (
    id_expediente IN (SELECT id_expediente FROM expediente WHERE id_paciente = auth.uid())
);
CREATE POLICY "doctor_insert_diagnostico" ON diagnostico FOR INSERT WITH CHECK (is_doctor());
CREATE POLICY "doctor_update_diagnostico" ON diagnostico FOR UPDATE USING (is_doctor());
CREATE POLICY "admin_all_diagnostico"     ON diagnostico FOR ALL USING (is_admin());


-- =====================================================
-- POLICIES: RECETA
-- =====================================================

CREATE POLICY "admin_select_receta"   ON receta FOR SELECT USING (is_admin());
CREATE POLICY "doctor_select_receta"  ON receta FOR SELECT USING (id_doctor = auth.uid());
CREATE POLICY "own_select_receta"     ON receta FOR SELECT USING (
    id_diagnostico IN (
        SELECT id_diagnostico FROM diagnostico
        WHERE id_expediente IN (SELECT id_expediente FROM expediente WHERE id_paciente = auth.uid())
    )
);
CREATE POLICY "doctor_insert_receta"  ON receta FOR INSERT WITH CHECK (is_doctor());
CREATE POLICY "doctor_update_receta"  ON receta FOR UPDATE USING (is_doctor());
CREATE POLICY "admin_all_receta"      ON receta FOR ALL USING (is_admin());


-- =====================================================
-- POLICIES: RECETA DETALLE
-- =====================================================

CREATE POLICY "admin_select_receta_detalle"  ON receta_detalle FOR SELECT USING (is_admin());
CREATE POLICY "doctor_select_receta_detalle" ON receta_detalle FOR SELECT USING (
    id_receta IN (SELECT id_receta FROM receta WHERE id_doctor = auth.uid())
);
CREATE POLICY "own_select_receta_detalle"    ON receta_detalle FOR SELECT USING (
    id_receta IN (
        SELECT r.id_receta FROM receta r
        JOIN diagnostico d ON d.id_diagnostico = r.id_diagnostico
        WHERE d.id_expediente IN (SELECT id_expediente FROM expediente WHERE id_paciente = auth.uid())
    )
);
CREATE POLICY "doctor_all_receta_detalle" ON receta_detalle FOR ALL USING (is_doctor());
CREATE POLICY "admin_all_receta_detalle"  ON receta_detalle FOR ALL USING (is_admin());


-- =====================================================
-- POLICIES: DIAGNOSTICO IA
-- =====================================================

CREATE POLICY "admin_select_diagnostico_ia"  ON diagnostico_ia FOR SELECT USING (is_admin());
CREATE POLICY "doctor_select_diagnostico_ia" ON diagnostico_ia FOR SELECT USING (
    id_expediente IN (
        SELECT e.id_expediente FROM expediente e
        JOIN cita c ON c.id_paciente = e.id_paciente
        WHERE c.id_doctor = auth.uid()
    )
);
CREATE POLICY "doctor_update_diagnostico_ia" ON diagnostico_ia FOR UPDATE USING (is_doctor());
CREATE POLICY "admin_all_diagnostico_ia"     ON diagnostico_ia FOR ALL USING (is_admin());


-- =====================================================
-- POLICIES: CHAT MEDICO
-- =====================================================

CREATE POLICY "admin_select_chat_medico"  ON chat_medico FOR SELECT USING (is_admin());
CREATE POLICY "own_select_chat_medico"    ON chat_medico FOR SELECT USING (id_doctor = auth.uid());
CREATE POLICY "doctor_insert_chat_medico" ON chat_medico FOR INSERT WITH CHECK (is_doctor());
CREATE POLICY "admin_all_chat_medico"     ON chat_medico FOR ALL USING (is_admin());


-- =====================================================
-- POLICIES: NOTIFICACION
-- =====================================================

CREATE POLICY "admin_select_notificacion"  ON notificacion FOR SELECT USING (is_admin());
CREATE POLICY "own_select_notificacion"    ON notificacion FOR SELECT USING (id_paciente = auth.uid());


-- =====================================================
-- POLICIES: RECORDATORIO
-- =====================================================

CREATE POLICY "admin_select_recordatorio" ON recordatorio FOR SELECT USING (is_admin());


-- =====================================================
-- POLICIES: AUDIT LOG
-- =====================================================

CREATE POLICY "admin_select_audit_log" ON audit_log FOR SELECT USING (is_admin());


-- =====================================================
-- POLICIES: WHATSAPP CONFIG
-- =====================================================

CREATE POLICY "admin_select_whatsapp_config" ON whatsapp_config FOR SELECT USING (is_admin());
CREATE POLICY "admin_all_whatsapp_config"    ON whatsapp_config FOR ALL USING (is_admin());


-- =====================================================
-- POLICIES: WHATSAPP LOG
-- =====================================================

CREATE POLICY "admin_select_whatsapp_log" ON whatsapp_log FOR SELECT USING (is_admin());


-- =====================================================
-- PARTE 6: STORAGE (Documentos Medicos)
-- =====================================================
-- Crear bucket en Dashboard > Storage > New bucket:
--   Nombre: documentos-medicos
--   Publico: NO (privado)
--   Tamano maximo: 10MB
--   Tipos permitidos: application/pdf, image/png, image/jpeg, image/webp

CREATE POLICY "paciente_upload_documento" ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documentos-medicos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "paciente_select_documento" ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documentos-medicos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "doctor_select_documento" ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documentos-medicos'
        AND EXISTS (
            SELECT 1 FROM paciente p
            JOIN cita c ON c.id_paciente = p.id_paciente
            WHERE c.id_doctor = auth.uid()
            AND p.id_paciente::text = (storage.foldername(name))[1]
        )
    );

CREATE POLICY "admin_all_documento" ON storage.objects FOR ALL
    USING (
        bucket_id = 'documentos-medicos'
        AND is_admin()
    );


-- =====================================================
-- STORAGE: WhatsApp Auth (credenciales del bot)
-- =====================================================
-- Crear bucket en Dashboard > Storage > New bucket:
--   Nombre: whatsapp-auth
--   Publico: NO (privado)
--   Tamano maximo: 1MB

-- Este bucket almacena las credenciales de sesión de Baileys.
-- Solo el bot (service_role) debe tener acceso.

CREATE POLICY "service_all_whatsapp_auth" ON storage.objects FOR ALL
    USING (
        bucket_id = 'whatsapp-auth'
    );


-- =====================================================
-- PARTE 7: INDICES DE PERFORMANCE
-- =====================================================

CREATE INDEX idx_cita_doctor_fecha       ON cita(id_doctor, fecha_hora);
CREATE INDEX idx_cita_paciente           ON cita(id_paciente);
CREATE INDEX idx_cita_estado             ON cita(estado);
CREATE INDEX idx_expediente_paciente     ON expediente(id_paciente);
CREATE INDEX idx_diagnostico_expediente  ON diagnostico(id_expediente);
CREATE INDEX idx_diagnostico_doctor      ON diagnostico(id_doctor);
CREATE INDEX idx_receta_diagnostico      ON receta(id_diagnostico);
CREATE INDEX idx_notificacion_pendiente  ON notificacion(estado, fecha_envio);
CREATE INDEX idx_recordatorio_pendiente  ON recordatorio(estado, fecha_programada);
CREATE INDEX idx_horario_doctor          ON horario_doctor(id_doctor, dia_semana);
CREATE INDEX idx_diagnostico_ia_expediente ON diagnostico_ia(id_expediente);
CREATE INDEX idx_diagnostico_ia_estado   ON diagnostico_ia(estado_validacion);
CREATE INDEX idx_audit_usuario           ON audit_log(id_usuario);
CREATE INDEX idx_audit_fecha             ON audit_log(fecha);
CREATE INDEX idx_whatsapp_log_paciente   ON whatsapp_log(id_paciente);
CREATE INDEX idx_whatsapp_log_estado     ON whatsapp_log(estado);
CREATE INDEX idx_whatsapp_log_fecha      ON whatsapp_log(fecha_envio);


-- =====================================================
-- PARTE 9: SISTEMA EXPERTO IA (pgvector)
-- =====================================================
-- Requiere: habilitar extensión pgvector en Supabase
-- Dashboard > SQL Editor > ejecutar CREATE EXTENSION
-- =====================================================

-- 9.1 Extension pgvector (búsqueda semántica)
CREATE EXTENSION IF NOT EXISTS vector;

-- 9.2 Tabla de memoria de la IA (embeddings de conversaciones)
CREATE TABLE ai_memory (
    id              SERIAL PRIMARY KEY,
    id_doctor       UUID REFERENCES doctor(id_doctor),
    id_paciente     UUID REFERENCES paciente(id_paciente),
    session_id      TEXT,
    content         TEXT NOT NULL,
    embedding       VECTOR(1536),
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9.3 Tabla de conocimiento médico (CIE-10, protocolos, farmacología)
CREATE TABLE ai_knowledge (
    id              SERIAL PRIMARY KEY,
    source          TEXT NOT NULL,
    source_id       TEXT,
    content         TEXT NOT NULL,
    embedding       VECTOR(1536),
    metadata        JSONB,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9.4 Tabla de sesiones de IA (tracking de uso y costos)
CREATE TABLE ai_session (
    id              SERIAL PRIMARY KEY,
    id_doctor       UUID NOT NULL REFERENCES doctor(id_doctor),
    id_paciente     UUID REFERENCES paciente(id_paciente),
    modelo          TEXT NOT NULL,
    tokens_input    INT,
    tokens_output   INT,
    costo_usd       NUMERIC(8,6),
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ
);

-- 9.5 Habilitar RLS
ALTER TABLE ai_memory    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_session   ENABLE ROW LEVEL SECURITY;

-- 9.6 RLS policies
-- ai_memory
CREATE POLICY "admin_all_ai_memory"      ON ai_memory FOR ALL USING (is_admin());
CREATE POLICY "doctor_select_own_memory" ON ai_memory FOR SELECT USING (id_doctor = auth.uid());
CREATE POLICY "doctor_insert_memory"     ON ai_memory FOR INSERT WITH CHECK (is_doctor());

-- ai_knowledge (lectura para doctores, admin gestiona)
CREATE POLICY "admin_all_ai_knowledge"   ON ai_knowledge FOR ALL USING (is_admin());
CREATE POLICY "doctor_select_knowledge"  ON ai_knowledge FOR SELECT USING (is_doctor());

-- ai_session
CREATE POLICY "admin_all_ai_session"     ON ai_session FOR ALL USING (is_admin());
CREATE POLICY "doctor_select_own_session" ON ai_session FOR SELECT USING (id_doctor = auth.uid());
CREATE POLICY "doctor_insert_session"    ON ai_session FOR INSERT WITH CHECK (is_doctor());
CREATE POLICY "doctor_update_own_session" ON ai_session FOR UPDATE USING (id_doctor = auth.uid());

-- 9.7 Índices de performance
CREATE INDEX idx_ai_memory_doctor       ON ai_memory(id_doctor);
CREATE INDEX idx_ai_memory_paciente     ON ai_memory(id_paciente);
CREATE INDEX idx_ai_memory_session      ON ai_memory(session_id);
CREATE INDEX idx_ai_memory_embedding    ON ai_memory
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_ai_knowledge_source    ON ai_knowledge(source);
CREATE INDEX idx_ai_knowledge_embedding ON ai_knowledge
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_ai_session_doctor      ON ai_session(id_doctor);
CREATE INDEX idx_ai_session_paciente    ON ai_session(id_paciente);


-- =====================================================
-- PARTE 10: PREFERENCIAS DE USUARIO
-- =====================================================
-- Almacena configuraciones personales (tema, notificaciones, etc.)
-- JSONB permite agregar settings sin migraciones futuras.
-- =====================================================

-- 10.1 Agregar columna preferencias a usuario
ALTER TABLE usuario
  ADD COLUMN preferencias JSONB DEFAULT '{}'::jsonb;

-- 10.2 RLS: cada usuario solo lee/escribe sus propias preferencias
CREATE POLICY "own_select_preferencias" ON usuario
  FOR SELECT USING (id_usuario = auth.uid());

CREATE POLICY "own_update_preferencias" ON usuario
  FOR UPDATE USING (id_usuario = auth.uid());

-- 10.3 Funcion para obtener preferencias del usuario actual
CREATE OR REPLACE FUNCTION get_user_preferencias()
RETURNS JSONB AS $$
BEGIN
  RETURN (SELECT preferencias FROM usuario WHERE id_usuario = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10.4 Funcion para actualizar preferencias del usuario actual
CREATE OR REPLACE FUNCTION update_user_preferencias(new_preferencias JSONB)
RETURNS VOID AS $$
BEGIN
  UPDATE usuario
  SET preferencias = new_preferencias,
      fecha_actualizacion = NOW()
  WHERE id_usuario = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- =====================================================
-- PARTE 11: SCRIPTS PARA ASIGNAR ROLES A USUARIOS
-- =====================================================
-- IMPORTANTE: NO usar el formulario "Add user" del dashboard
-- ya que sobreescribe raw_user_meta_data. Usar SQL Editor.
--
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =====================================================

-- 11.1 Ver todos los usuarios con su rol actual
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data ->> 'rol' as rol_metadata,
  u.rol as rol_tabla,
  au.raw_user_meta_data ->> 'nombre' as nombre,
  au.raw_user_meta_data ->> 'apellido' as apellido,
  au.created_at,
  au.confirmed_at
FROM auth.users au
LEFT JOIN usuario u ON u.id_usuario = au.id
ORDER BY au.created_at DESC;

-- 11.2 Asignar rol a un usuario existente
-- IMPORTANTE: Cambiar el email y el rol deseado (ADMIN, DOCTOR, RECEPCIONISTA, PACIENTE)
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"rol": "ADMIN"}'::jsonb
WHERE email = 'usuario@ejemplo.com';

-- También actualizar en la tabla usuario (si ya existe)
UPDATE usuario 
SET rol = 'ADMIN'
WHERE id_usuario = (
  SELECT id FROM auth.users WHERE email = 'usuario@ejemplo.com'
);

-- 11.3 Si el usuario no tiene registro en tabla usuario, crearlo
-- (reemplazá el email y el rol)
INSERT INTO usuario (id_usuario, nombre, apellido, email, rol)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'nombre', SPLIT_PART(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data ->> 'apellido', ''),
  au.email,
  'ADMIN'  -- Cambiar a DOCTOR, RECEPCIONISTA o PACIENTE
FROM auth.users au
WHERE au.email = 'usuario@ejemplo.com'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE id_usuario = au.id);

-- 11.4 Crear sub-registro según rol (doctor, recepcionista o paciente)
-- Solo ejecutar si el usuario NO tiene sub-registro

-- Para DOCTOR (reemplazá el email)
INSERT INTO doctor (id_doctor, id_especialidad, numero_licencia)
SELECT au.id, 1, 'PENDIENTE'
FROM auth.users au
WHERE au.email = 'doctor@ejemplo.com'
  AND NOT EXISTS (SELECT 1 FROM doctor WHERE id_doctor = au.id);

-- Para RECEPCIONISTA (reemplazá el email)
INSERT INTO recepcionista (id_recepcionista)
SELECT au.id
FROM auth.users au
WHERE au.email = 'recepcionista@ejemplo.com'
  AND NOT EXISTS (SELECT 1 FROM recepcionista WHERE id_recepcionista = au.id);

-- Para PACIENTE (reemplazá el email)
INSERT INTO paciente (id_paciente, ci, fecha_nacimiento, sexo)
SELECT au.id, au.id::text, '2000-01-01', 'O'
FROM auth.users au
WHERE au.email = 'paciente@ejemplo.com'
  AND NOT EXISTS (SELECT 1 FROM paciente WHERE id_paciente = au.id);

-- 11.5 Verificar que todo quedó bien
SELECT 
  au.email,
  au.raw_user_meta_data ->> 'rol' as rol_metadata,
  u.rol as rol_tabla,
  CASE 
    WHEN u.rol = 'DOCTOR' THEN (SELECT 1 FROM doctor WHERE id_doctor = au.id)
    WHEN u.rol = 'RECEPCIONISTA' THEN (SELECT 1 FROM recepcionista WHERE id_recepcionista = au.id)
    WHEN u.rol = 'PACIENTE' THEN (SELECT 1 FROM paciente WHERE id_paciente = au.id)
    ELSE NULL
  END as sub_registro_existe
FROM auth.users au
LEFT JOIN usuario u ON u.id_usuario = au.id
ORDER BY au.created_at DESC;


-- ============================================================
-- 12. FUNCION: setup_invite_system()
-- Ejecutar UNA VEZ desde el Dashboard. Crea la tabla pending_invite.
-- ============================================================

CREATE OR REPLACE FUNCTION setup_invite_system()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS pending_invite (
    token       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(150) NOT NULL,
    rol         VARCHAR(20) NOT NULL CHECK (rol IN ('DOCTOR','RECEPCIONISTA')),
    used        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE pending_invite ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "admin_select_invite" ON pending_invite
    FOR SELECT USING (is_admin());

  CREATE POLICY "admin_insert_invite" ON pending_invite
    FOR INSERT WITH CHECK (is_admin());

  CREATE POLICY "admin_update_invite" ON pending_invite
    FOR UPDATE USING (is_admin());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;



