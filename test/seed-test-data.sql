-- Script para crear datos de prueba en el ambiente de testing
-- Este script debe ejecutarse DESPUÉS de que las tablas estén creadas
-- Schema: Produccion (usar con SET search_path)

SET search_path TO "Produccion";

-- ============================================
-- 1. ROLES
-- ============================================
INSERT INTO roles (id_role, name, description) 
OVERRIDING SYSTEM VALUE VALUES
(1, 'Admin', 'Administrador del sistema con acceso total'),
(2, 'RH', 'Recursos Humanos - gestión de candidatos'),
(3, 'Viewer', 'Usuario con permisos de solo lectura')
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. USUARIOS PARA TESTING
-- ============================================
-- Contraseña: 'admin123' (hasheada con bcrypt)
-- Hash generado: $2b$10$oJc6ZlYQ31BfEch6m5o/hO7aN1gYHMg249dGxW0V651QmWVuZHIsy
INSERT INTO users (email, password, id_role) VALUES
('admin@cq.com', '$2b$10$oJc6ZlYQ31BfEch6m5o/hO7aN1gYHMg249dGxW0V651QmWVuZHIsy', 1),
('rh@cq.com', '$2b$10$oJc6ZlYQ31BfEch6m5o/hO7aN1gYHMg249dGxW0V651QmWVuZHIsy', 2),
('viewer@cq.com', '$2b$10$oJc6ZlYQ31BfEch6m5o/hO7aN1gYHMg249dGxW0V651QmWVuZHIsy', 3);

-- ============================================
-- 3. PERFILES DE PRUEBA
-- ============================================
INSERT INTO profile (id_profile, name) 
OVERRIDING SYSTEM VALUE VALUES
(1, 'Desarrollador Backend'),
(2, 'Desarrollador Frontend'),
(3, 'QA Tester'),
(4, 'DevOps Engineer')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. CARGOS/POSICIONES DE PRUEBA
-- ============================================
INSERT INTO position (id_position, name) 
OVERRIDING SYSTEM VALUE VALUES
(1, 'Desarrollador Junior'),
(2, 'Desarrollador Senior'),
(3, 'Tech Lead'),
(4, 'Gerente de Proyectos')
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. ESTADOS DE CANDIDATOS
-- ============================================
INSERT INTO candidate_status (id_candidate_status, status, description) 
OVERRIDING SYSTEM VALUE VALUES
(1, 'Pendiente', 'Candidato en espera de revisión'),
(2, 'En Revisión', 'Documentación en proceso de revisión'),
(3, 'Aprobado', 'Candidato aprobado para contratación'),
(4, 'Rechazado', 'Candidato no cumple con requisitos'),
(5, 'Contratado', 'Candidato contratado exitosamente')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. ESTADOS DE DOCUMENTOS
-- ============================================
INSERT INTO document_status (id_document_status, status, description) 
OVERRIDING SYSTEM VALUE VALUES
(1, 'Pendiente', 'Documento pendiente de revisión'),
(2, 'Aprobado', 'Documento aprobado'),
(3, 'Rechazado', 'Documento rechazado o con observaciones')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. PROCESOS DE SELECCIÓN
-- ============================================
INSERT INTO selection_process (id_process, start_date, end_date) 
OVERRIDING SYSTEM VALUE VALUES
(1, CURRENT_DATE, NULL),
(2, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '15 days')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. CANDIDATOS DE PRUEBA (para folders)
-- ============================================
-- Nota: Se crean algunos candidatos base para testing
-- Password for candidate@cq.com is: candidate123
INSERT INTO candidate (name, identifier, identifier_type, email, phone, password, id_profile, id_position, id_candidate_status, id_selection_process) VALUES
('Juan Test Pérez', '1000000001', 'CC', 'juan.test@test.com', '3001234567', '$2b$10$oJc6ZlYQ31BfEch6m5o/hO7aN1gYHMg249dGxW0V651QmWVuZHIsy', 1, 1, 1, 1),
('María Test López', '1000000002', 'CC', 'maria.test@test.com', '3007654321', '$2b$10$oJc6ZlYQ31BfEch6m5o/hO7aN1gYHMg249dGxW0V651QmWVuZHIsy', 2, 2, 1, 2),
('Test Candidate Auth', '1000000003', 'CC', 'candidate@cq.com', '3009999999', '$2b$10$bKqs5G52I5.CteWmpQf.6OHmzRAzZTShOcVufZhuKRuXMtW9pqdtC', 1, 1, 1, 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. FOLDERS DE PRUEBA (para documentos)
-- ============================================
-- Nota: Se crean folders asociados a los candidatos de prueba
INSERT INTO folder (id_candidate, creation_date, modification_date)
SELECT id_candidate, CURRENT_DATE, CURRENT_DATE
FROM candidate
WHERE email IN ('juan.test@test.com', 'maria.test@test.com')
ON CONFLICT DO NOTHING;

-- ============================================
-- RESUMEN
-- ============================================
-- Usuarios creados:
--   - admin@cq.com / admin123 (Administrador)
--   - rh@cq.com / admin123 (RH)
--   - viewer@cq.com / admin123 (Viewer)
-- 
-- Datos de prueba:
--   - 4 Perfiles
--   - 4 Posiciones
--   - 5 Estados de candidatos
--   - 3 Estados de documentos
--   - 2 Procesos de selección
--   - 2 Candidatos de prueba
--   - 2 Folders (para tests de documentos)
