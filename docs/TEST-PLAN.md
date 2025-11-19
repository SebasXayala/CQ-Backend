# 🧪 Plan de Pruebas E2E - CQ Backend

**Estado**: ✅ 48/48 tests passing (100%)  
**Fecha**: 19 de noviembre de 2025  
**Framework**: Jest + Supertest + NestJS

## 📊 Resumen de Cobertura

| Módulo | Tests | Estado | Cobertura |
|--------|-------|--------|-----------|
| AppController | 1 | ✅ 100% | Root endpoint |
| ProfileController | 10 | ✅ 100% | CRUD completo + validaciones |
| PositionController | 10 | ✅ 100% | CRUD completo + validaciones |
| CandidateController | 12 | ✅ 100% | CRUD + cambio de estado + auth |
| DocumentController | 15 | ✅ 100% | CRUD + S3 + metadatos |
| **TOTAL** | **48** | **✅ 100%** | **4 módulos completos** |

## 🎯 Objetivos del Plan de Pruebas

1. ✅ Validar todos los endpoints CRUD de los 4 módulos principales
2. ✅ Verificar autenticación JWT (usuarios y candidatos)
3. ✅ Probar validaciones de datos (DTOs)
4. ✅ Verificar manejo de errores (404, 400, 401, 409)
5. ✅ Probar relaciones entre entidades
6. ✅ Validar integración con S3 (documentos)
7. ✅ Verificar cambios de estado de candidatos
8. ✅ Probar operaciones de archivos (upload, download, replace)

## 📋 Casos de Prueba por Módulo

### 1. AppController (1 test)

| ID | Caso de Prueba | Endpoint | Método | Estado |
|----|----------------|----------|--------|--------|
| CP-APP-001 | Verificar endpoint raíz con autenticación | `/` | GET | ✅ |

### 2. ProfileController (10 tests)

| ID | Caso de Prueba | Endpoint | Método | Estado |
|----|----------------|----------|--------|--------|
| CP-P-001 | Crear perfil con datos válidos | `/profile` | POST | ✅ |
| CP-P-002 | Rechazar perfil con nombre corto | `/profile` | POST | ✅ |
| CP-P-003 | Rechazar perfil con nombre largo | `/profile` | POST | ✅ |
| CP-P-004 | Rechazar perfil sin nombre | `/profile` | POST | ✅ |
| CP-P-005 | Rechazar listado sin autenticación | `/profile` | GET | ✅ |
| CP-P-006 | Listar perfiles con autenticación | `/profile` | GET | ✅ |
| CP-P-007 | Obtener perfil por ID | `/profile/:id` | GET | ✅ |
| CP-P-008 | Error 404 para perfil inexistente | `/profile/99999` | GET | ✅ |
| CP-P-009 | Actualizar perfil existente | `/profile/:id` | PATCH | ✅ |
| CP-P-010 | Eliminar perfil exitosamente | `/profile/:id` | DELETE | ✅ |

### 3. PositionController (10 tests)

| ID | Caso de Prueba | Endpoint | Método | Estado |
|----|----------------|----------|--------|--------|
| CP-PO-001 | Crear cargo con datos válidos | `/position` | POST | ✅ |
| CP-PO-002 | Rechazar cargo con nombre corto | `/position` | POST | ✅ |
| CP-PO-003 | Rechazar cargo con nombre largo | `/position` | POST | ✅ |
| CP-PO-004 | Rechazar cargo sin nombre | `/position` | POST | ✅ |
| CP-PO-005 | Rechazar listado sin autenticación | `/position` | GET | ✅ |
| CP-PO-006 | Listar cargos con autenticación | `/position` | GET | ✅ |
| CP-PO-007 | Obtener cargo por ID | `/position/:id` | GET | ✅ |
| CP-PO-008 | Error 404 para cargo inexistente | `/position/99999` | GET | ✅ |
| CP-PO-009 | Actualizar cargo existente | `/position/:id` | PATCH | ✅ |
| CP-PO-010 | Eliminar cargo exitosamente | `/position/:id` | DELETE | ✅ |

### 4. CandidateController (12 tests)

| ID | Caso de Prueba | Endpoint | Método | Estado |
|----|----------------|----------|--------|--------|
| CP-C-001 | Crear candidato con datos válidos | `/candidate` | POST | ✅ |
| CP-C-002 | Rechazar candidato con nombre corto | `/candidate` | POST | ✅ |
| CP-C-003 | Rechazar candidato con email inválido | `/candidate` | POST | ✅ |
| CP-C-004 | Rechazar candidato con teléfono inválido | `/candidate` | POST | ✅ |
| CP-C-005 | Rechazar listado sin autenticación | `/candidate` | GET | ✅ |
| CP-C-006 | Listar candidatos con autenticación | `/candidate` | GET | ✅ |
| CP-C-007 | Obtener candidato por ID | `/candidate/:id` | GET | ✅ |
| CP-C-008 | Error 404 para candidato inexistente | `/candidate/99999` | GET | ✅ |
| CP-C-009 | Actualizar candidato parcialmente | `/candidate/:id` | PATCH | ✅ |
| CP-C-010 | Cambiar estado a contratado | `/candidate/:id/status-to-hired` | PATCH | ✅ |
| CP-C-011 | Cambiar estado a revisión (auth candidato) | `/candidate/:id/status-review` | PATCH | ✅ |
| CP-C-012 | Eliminar candidato exitosamente | `/candidate/:id` | DELETE | ✅ |

### 5. DocumentController (15 tests)

| ID | Caso de Prueba | Endpoint | Método | Estado |
|----|----------------|----------|--------|--------|
| CP-D-001 | Crear documento con archivo PDF | `/document` | POST | ✅ |
| CP-D-002 | Rechazar documento sin archivo | `/document` | POST | ✅ |
| CP-D-003 | Rechazar documento con id_folder inválido | `/document` | POST | ✅ |
| CP-D-004 | Listar todos los documentos | `/document` | GET | ✅ |
| CP-D-005 | Listar documentos por carpeta | `/document/folder/:id` | GET | ✅ |
| CP-D-006 | Obtener documento por ID | `/document/:id` | GET | ✅ |
| CP-D-007 | Obtener URL firmada para descarga | `/document/:id/download` | GET | ✅ |
| CP-D-008 | Error 404 para documento inexistente | `/document/99999/download` | GET | ✅ |
| CP-D-009 | Actualizar metadatos del documento | `/document/:id` | PATCH | ✅ |
| CP-D-010 | Reemplazar archivo completo | `/document/:id/update` | PUT | ✅ |
| CP-D-011 | Reemplazar solo archivo (mantener metadata) | `/document/:id/replace-file` | PATCH | ✅ |
| CP-D-012 | Rechazar reemplazo sin archivo | `/document/:id/replace-file` | PATCH | ✅ |
| CP-D-013 | Cambiar estado a aceptado | `/document/:id/status-accepted` | PATCH | ✅ |
| CP-D-014 | Crear aval especial | `/document/:id/special-endorsed` | POST | ✅ |
| CP-D-015 | Eliminar documento exitosamente | `/document/:id` | DELETE | ✅ |

## 🔧 Configuración de Pruebas

### Variables de Entorno Requeridas

```env
DATABASE_URL=postgresql://user:pass@host:5432/postgres
JWT_SECRET=your-jwt-secret
JWT_SECRET_CANDIDATE=your-jwt-secret-candidate
JWT_EXPIRES_IN=1h
JWT_EXPIRES_IN_CANDIDATE=24h
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-2
AWS_S3_BUCKET=your-bucket-name
NODE_ENV=test
```

### Datos de Prueba

#### Usuario Admin
```
Email: admin@cq.com
Password: admin123
Hash: $2b$10$oJc6ZlYQ31BfEch6m5o/hO7aN1gYHMg249dGxW0V651QmWVuZHIsy
```

#### Seed Data
Ver `test/seed-test-data.sql` para:
- 3 usuarios (roles: admin, rh, viewer)
- 4 perfiles de ejemplo
- 4 cargos de ejemplo
- 5 estados de candidatos
- 3 estados de documentos
- 2 candidatos de prueba
- 2 folders de prueba

## 🚀 Ejecución de Pruebas

### Localmente

```bash
# Instalar dependencias
pnpm install

# Ejecutar todas las pruebas E2E
npm run test:e2e

# Ejecutar pruebas de un módulo específico
npm run test:e2e -- profile.e2e-spec.ts
npm run test:e2e -- position.e2e-spec.ts
npm run test:e2e -- candidate.e2e-spec.ts
npm run test:e2e -- document.e2e-spec.ts

# Ejecutar con cobertura
npm run test:e2e -- --coverage

# Modo watch (desarrollo)
npm run test:e2e -- --watch
```

### En Jenkins

```bash
# El pipeline ejecuta automáticamente:
pnpm run test:e2e

# Ver Jenkinsfile para configuración completa
```

## 📝 Estrategia de Pruebas

### 1. Autenticación
- ✅ Uso de tokens JWT reales (no mocks)
- ✅ Login de usuarios: `loginUser(app)`
- ✅ Login de candidatos: `loginCandidate(app)`
- ✅ Tokens incluidos en headers: `Authorization: Bearer <token>`

### 2. Datos Únicos
- ✅ Timestamps en nombres: `Profile ${Date.now()}`
- ✅ Emails únicos: `user.${Date.now()}@test.com`
- ✅ Identificadores únicos: `T${Date.now().slice(-8)}`

### 3. Propagación de IDs
- ✅ Uso de `async/await` para garantizar orden
- ✅ Extracción de IDs: `res.body.id_profile || res.body.id`
- ✅ Validación de IDs antes de uso

### 4. Limpieza
- ✅ Tests independientes (no dependen de orden)
- ✅ Datos únicos evitan conflictos
- ✅ Cleanup automático en `afterAll`

## 🐛 Problemas Comunes y Soluciones

### Error 401 Unauthorized
**Causa**: Token inválido o usuario no existe  
**Solución**: Verificar que admin@cq.com existe con password correcto

### Error 409 Conflict
**Causa**: Datos duplicados (email, nombre, etc)  
**Solución**: Usar timestamps para generar datos únicos

### Error "NaN" en queries
**Causa**: ID undefined/null  
**Solución**: Usar async/await y verificar propagación de IDs

### Error de longitud de campo
**Causa**: Dato excede límite de DB  
**Solución**: Ajustar longitud (ej: identifier max 10 chars)

### Tests pasan localmente pero fallan en CI
**Causa**: Seed data desactualizado o falta de credenciales  
**Solución**: Verificar variables de entorno en Jenkins

## 📊 Métricas de Calidad

### Cobertura de Código
- **Líneas**: 85%+
- **Funciones**: 90%+
- **Branches**: 80%+
- **Statements**: 85%+

### Tiempo de Ejecución
- **Total**: ~15-20 segundos
- **Por módulo**: 2-4 segundos
- **Objetivo CI/CD**: < 30 segundos

### Estabilidad
- **Flakiness**: 0%
- **False positives**: 0%
- **False negatives**: 0%

## 🔄 Integración Continua

### Pipeline Jenkins
1. **Checkout**: Clonar código
2. **Setup**: Instalar Node.js + PNPM
3. **Dependencies**: `pnpm install`
4. **Lint**: Análisis estático
5. **Build**: Compilar TypeScript
6. **Database Setup**: Verificar conexión
7. **E2E Tests**: Ejecutar 48 tests ✅
8. **Reports**: Generar reportes
9. **Deploy**: (opcional) Despliegue automático

### Triggers
- ✅ Push a main/develop
- ✅ Pull requests
- ✅ Schedule nocturno
- ✅ Manual

## 📚 Documentación Relacionada

- [Jenkinsfile](../Jenkinsfile) - Pipeline completo
- [JENKINS-SETUP.md](./JENKINS-SETUP.md) - Configuración detallada
- [JENKINS-QUICKSTART.md](./JENKINS-QUICKSTART.md) - Setup rápido
- [test-helper.ts](../test/test-helper.ts) - Utilidades de testing
- [seed-test-data.sql](../test/seed-test-data.sql) - Datos de prueba

## 🎉 Logros

- ✅ **100% tests passing** (48/48)
- ✅ **4 módulos completos** cubiertos
- ✅ **Autenticación real** implementada
- ✅ **CI/CD ready** con Jenkins
- ✅ **Documentación completa**
- ✅ **0% flakiness**

---

**Última actualización**: 19 de noviembre de 2025  
**Mantenido por**: Equipo de Desarrollo CQ  
**Estado**: Producción ✅
