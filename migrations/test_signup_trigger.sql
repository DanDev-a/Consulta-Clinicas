-- =====================================================
-- PRUEBA: verifica handle_new_user() sin dejar datos
-- Fecha: 2026-09-27
-- Ejecutar DESPUES de fix_signup_trigger.sql, en una
-- consulta aparte. Todo se revierte con ROLLBACK.
--
-- Si esta prueba da error por una columna de auth.users
-- que no existe en tu version, ignorate este archivo y
-- prueba el registro desde la UI.
-- =====================================================

BEGIN;

-- 1. Registro completo (igual que Register.tsx)
INSERT INTO auth.users
    (instance_id, id, aud, role, email,
     raw_app_meta_data, raw_user_meta_data,
     email_confirmed_at, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(),
     'authenticated', 'authenticated', 'test.completo@example.com',
     '{"provider":"email","providers":["email"]}',
     '{"rol":"PACIENTE","nombre":"Ana","apellido":"Torres","ci":"6543210",
       "fecha_nacimiento":"1992-05-10","sexo":"F","ciudad":"La Paz"}',
     now(), now(), now());

-- 2. Sin metadata (como Google OAuth): no debe fallar
INSERT INTO auth.users
    (instance_id, id, aud, role, email,
     raw_app_meta_data, raw_user_meta_data,
     email_confirmed_at, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(),
     'authenticated', 'authenticated', 'test.google@example.com',
     '{"provider":"google","providers":["google"]}',
     '{"full_name":"Carlos Mendoza"}',
     now(), now(), now());

-- 3. Intento de fraude: metadata rol=ADMIN debe quedar PACIENTE
INSERT INTO auth.users
    (instance_id, id, aud, role, email,
     raw_app_meta_data, raw_user_meta_data,
     email_confirmed_at, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(),
     'authenticated', 'authenticated', 'test.hack@example.com',
     '{"provider":"email","providers":["email"]}',
     '{"rol":"ADMIN","nombre":"Hack","apellido":"Erow",
       "ci":"1111111","fecha_nacimiento":"1990-01-01","sexo":"M"}',
     now(), now(), now());

-- 4. Invite invalido con rol=DOCTOR debe quedar PACIENTE
INSERT INTO auth.users
    (instance_id, id, aud, role, email,
     raw_app_meta_data, raw_user_meta_data,
     email_confirmed_at, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(),
     'authenticated', 'authenticated', 'test.doctor@example.com',
     '{"provider":"email","providers":["email"]}',
     '{"rol":"DOCTOR","nombre":"Fake","apellido":"Doctor",
       "invite_token":"11111111-1111-1111-1111-111111111111",
       "id_especialidad":"1","numero_licencia":"CMP 000"}',
     now(), now(), now());


-- Resultados esperados:
--   rol = PACIENTE en las 4 filas
--   4 pacientes, 4 expedientes, 0 doctores, 0 recepcionistas
--   test.google@example.com y test.hack@example.com con CI tipo PEND-
SELECT u.email,
       u.rol,
       p.ci,
       p.fecha_nacimiento,
       p.sexo,
       (SELECT count(*) FROM expediente e WHERE e.id_paciente = u.id_usuario) AS tiene_expediente
FROM usuario u
LEFT JOIN paciente p ON p.id_paciente = u.id_usuario
WHERE u.email IN ('test.completo@example.com',
                  'test.google@example.com',
                  'test.hack@example.com',
                  'test.doctor@example.com')
ORDER BY u.email;

SELECT (SELECT count(*) FROM usuario  WHERE email LIKE 'test.%') AS usuarios,
       (SELECT count(*) FROM paciente  WHERE id_paciente IN (SELECT id_usuario FROM usuario WHERE email LIKE 'test.%')) AS pacientes,
       (SELECT count(*) FROM expediente WHERE id_paciente IN (SELECT id_usuario FROM usuario WHERE email LIKE 'test.%')) AS expedientes,
       (SELECT count(*) FROM doctor    WHERE id_doctor  IN (SELECT id_usuario FROM usuario WHERE email LIKE 'test.%')) AS doctores;

ROLLBACK;
