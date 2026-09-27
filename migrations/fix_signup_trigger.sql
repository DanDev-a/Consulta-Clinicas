-- =====================================================
-- MIGRACION: Arregla el alta de usuarios (error 500)
-- Fecha: 2026-09-27
-- Error original:
--   500 POST /auth/v1/signup
--   "Database error saving new user"
--   column "id_expediente" is of type integer but
--   expression is of type uuid (SQLSTATE 42804)
--
-- Causa: la handle_new_user() viva en la BD difiere de la
--        documentada: inserta un UUID en expediente.id_expediente (INT).
--
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- IMPORTANTE: PASO 1 + PASO 2 en la misma consulta.
-- =====================================================


-- =====================================================
-- PASO 1: DIAGNOSTICO (solo lectura)
-- =====================================================
-- Guardar la salida. Si algo falla, este es el contexto que hace falta.

SELECT p.proname,
       pg_get_functiondef(p.oid) AS definicion
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'handle_new_user';

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'expediente'
ORDER BY ordinal_position;

SELECT c.relname                              AS tabla,
       t.tgname                               AS trigger,
       pg_get_triggerdef(t.oid)               AS definicion
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE NOT t.tgisinternal
  AND c.oid IN ('auth.users'::regclass,
                'public.usuario'::regclass,
                'public.paciente'::regclass,
                'public.expediente'::regclass)
ORDER BY c.relname, t.tgname;


-- =====================================================
-- PASO 2: FUNCION CORRECTA
-- =====================================================
-- Cambios respecto a la version documentada:
--   1. INSERT INTO expediente (id_paciente)  -> nunca toca id_expediente (INT).
--   2. El ROL NUNCA se toma del cliente: solo un invite
--      valido del admin puede dar rol DOCTOR/RECEPCIONISTA.
--      (antes, /auth/register?rol=ADMIN creaba un ADMIN).
--   3. Datos faltantes (CI, fecha, sexo) usan valores
--      provisionales en vez de abortar el signup con 500.
--   4. Errores inesperados quedan en el log de Postgres
--      con un mensaje identificable: "handle_new_user ...".

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    meta         JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    v_email      TEXT;
    v_full       TEXT;
    v_first      TEXT;
    v_rest       TEXT;
    v_rol        TEXT  := 'PACIENTE';
    v_token      TEXT;
    v_invite_rol TEXT;
    v_nombre     TEXT;
    v_apellido   TEXT;
    v_ci         TEXT;
    v_fecha_nac  DATE;
    v_sexo       CHAR(1);
    v_grupo      TEXT;
BEGIN
    -- 1. Email (algunos proveedores OAuth no traen email)
    v_email := COALESCE(NEW.email,
                        NULLIF(meta ->> 'email', ''),
                        NEW.id::text || '@sin-email.local');

    -- 2. Nombre y apellido: formulario de registro o datos del proveedor
    v_full  := NULLIF(COALESCE(meta ->> 'full_name', meta ->> 'name'), '');
    v_first := NULLIF(split_part(COALESCE(v_full, ''), ' ', 1), '');
    v_rest  := NULLIF(btrim(substr(COALESCE(v_full, ''), length(v_first) + 1)), '');

    v_nombre   := COALESCE(NULLIF(meta ->> 'nombre', ''),
                           v_first,
                           split_part(v_email, '@', 1),
                           'usuario');
    v_apellido := COALESCE(NULLIF(meta ->> 'apellido', ''), v_rest, '');

    -- 3. ROL: no se confia en el metadata del cliente.
    --    Solo un invite sin usar, con token valido y email coincidente,
    --    puede otorgar rol de staff.
    v_token := NULLIF(btrim(meta ->> 'invite_token'), '');

    IF v_token IS NOT NULL
       AND v_token ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       AND to_regclass('public.pending_invite') IS NOT NULL
    THEN
        SELECT pi.rol INTO v_invite_rol
        FROM pending_invite pi
        WHERE pi.token = v_token::uuid
          AND pi.used IS NOT TRUE
          AND lower(pi.email) = lower(v_email)
        FOR UPDATE;

        IF v_invite_rol IS NOT NULL THEN
            v_rol := v_invite_rol;
            UPDATE pending_invite SET used = TRUE WHERE token = v_token::uuid;
        ELSE
            RAISE NOTICE 'handle_new_user: invite_token invalido, usado o con otro email para %; se da de alta como PACIENTE', v_email;
        END IF;
    END IF;

    INSERT INTO usuario (id_usuario, nombre, apellido, email, rol)
    VALUES (NEW.id, v_nombre, v_apellido, v_email, v_rol);

    -- 4. PACIENTE + EXPEDIENTE
    IF v_rol = 'PACIENTE' THEN
        v_ci := left(NULLIF(btrim(meta ->> 'ci'), ''), 20);

        IF v_ci IS NOT NULL AND EXISTS (SELECT 1 FROM paciente WHERE ci = v_ci) THEN
            RAISE NOTICE 'handle_new_user: la CI % ya existe; se usa CI provisional para %', v_ci, v_email;
            v_ci := NULL;
        END IF;

        IF v_ci IS NULL THEN
            v_ci := 'PEND-' || substr(replace(NEW.id::text, '-', ''), 1, 15);
            RAISE NOTICE 'handle_new_user: sin CI para %; se usa CI provisional %', v_email, v_ci;
        END IF;

        BEGIN
            v_fecha_nac := NULLIF(meta ->> 'fecha_nacimiento', '')::date;
        EXCEPTION WHEN invalid_datetime_format THEN
            RAISE NOTICE 'handle_new_user: fecha_nacimiento invalida (%) para %; se usa 1900-01-01',
                         meta ->> 'fecha_nacimiento', v_email;
            v_fecha_nac := NULL;
        END;
        v_fecha_nac := COALESCE(v_fecha_nac, DATE '1900-01-01');

        v_sexo := substr(upper(COALESCE(NULLIF(meta ->> 'sexo', ''), 'O')), 1, 1);
        IF v_sexo IS NULL OR btrim(v_sexo) = '' OR v_sexo NOT IN ('M', 'F', 'O') THEN
            v_sexo := 'O';
        END IF;

        v_grupo := NULLIF(upper(btrim(meta ->> 'grupo_sanguineo')), '');
        IF v_grupo IS NOT NULL
           AND v_grupo NOT IN ('A+','A-','B+','B-','AB+','AB-','O+','O-') THEN
            v_grupo := NULL;
        END IF;

        INSERT INTO paciente (id_paciente, ci, fecha_nacimiento, sexo,
                              telefono, direccion, ciudad, grupo_sanguineo)
        VALUES (
            NEW.id,
            v_ci,
            v_fecha_nac,
            v_sexo,
            left(NULLIF(meta ->> 'telefono', ''), 20),
            left(NULLIF(meta ->> 'direccion', ''), 255),
            left(NULLIF(meta ->> 'ciudad', ''), 100),
            v_grupo
        );

        INSERT INTO expediente (id_paciente)
        VALUES (NEW.id);
    END IF;

    -- 5. DOCTOR (solo via invite del admin)
    IF v_rol = 'DOCTOR' THEN
        IF NULLIF(meta ->> 'numero_licencia', '') IS NULL
           OR NULLIF(meta ->> 'id_especialidad', '') IS NULL
           OR NOT (meta ->> 'id_especialidad') ~ '^[0-9]+$'
        THEN
            RAISE EXCEPTION 'handle_new_user: registro DOCTOR incompleto para % (id_especialidad=%, numero_licencia=%)',
                            v_email, meta ->> 'id_especialidad', meta ->> 'numero_licencia';
        END IF;

        INSERT INTO doctor (id_doctor, id_especialidad, numero_licencia, telefono)
        VALUES (NEW.id,
                (meta ->> 'id_especialidad')::integer,
                left(meta ->> 'numero_licencia', 50),
                left(NULLIF(meta ->> 'telefono', ''), 20));
    END IF;

    -- 6. RECEPCIONISTA (solo via invite del admin)
    IF v_rol = 'RECEPCIONISTA' THEN
        INSERT INTO recepcionista (id_recepcionista)
        VALUES (NEW.id);
    END IF;

    RETURN NEW;

EXCEPTION WHEN OTHERS THEN
    -- El 500 de GoTrue no muestra el detalle al cliente,
    -- pero este mensaje si aparece en Supabase > Logs > Postgres.
    RAISE EXCEPTION 'handle_new_user fallo para %: % (SQLSTATE %)',
                    COALESCE(NEW.email, NEW.id::text), SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Garantiza que exista el trigger sobre auth.users.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        WHERE NOT t.tgisinternal
          AND t.tgname = 'on_auth_user_created'
          AND c.oid = 'auth.users'::regclass
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION handle_new_user();
        RAISE NOTICE 'Trigger on_auth_user_created creado';
    END IF;
END $$;


-- Elimina cualquier otra funcion/trigger que meta un UUID en
-- expediente.id_expediente (el bug original). handle_new_user()
-- ya fue reemplazada arriba, por eso se excluye.
DO $$
DECLARE
    fn RECORD;
    tg RECORD;
BEGIN
    FOR fn IN
        SELECT p.oid, p.proname
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.prokind = 'f'
          AND p.proname <> 'handle_new_user'
          AND p.prosrc ~* 'insert\s+into\s+expediente\s*(\(\s*id_expediente|values)'
    LOOP
        FOR tg IN
            SELECT t.tgname, t.tgrelid::regclass::text AS tabla
            FROM pg_trigger t
            WHERE NOT t.tgisinternal
              AND t.tgfoid = fn.oid
        LOOP
            RAISE NOTICE 'Eliminando trigger obsoleto %.% (funcion %)',
                         tg.tabla, tg.tgname, fn.proname;
            EXECUTE format('DROP TRIGGER %I ON %s', tg.tgname, tg.tabla);
        END LOOP;
    END LOOP;
END $$;


-- Verificacion final: la funcion nueva debe contener el INSERT correcto.
SELECT prosrc LIKE '%INSERT INTO expediente (id_paciente)%' AS trigger_correcto
FROM pg_proc
WHERE proname = 'handle_new_user'
  AND pronamespace = 'public'::regnamespace;
