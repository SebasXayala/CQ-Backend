# Configuración de Jenkins para CQ-Backend

Este documento describe cómo configurar Jenkins para ejecutar automáticamente las pruebas E2E del backend de Gestión Humana.

## 📋 Requisitos Previos

### 1. Jenkins Instalado
- Jenkins 2.400 o superior
- Plugins requeridos:
  - Pipeline
  - Git
  - NodeJS
  - Credentials Binding
  - Workspace Cleanup

### 2. Node.js y PNPM
```bash
# Jenkins debe tener acceso a:
- Node.js 22.x
- PNPM (latest)
```

### 3. Acceso a Base de Datos
- PostgreSQL en AWS RDS (gestionhumana.chgqoo4oaal4.us-east-2.rds.amazonaws.com)
- Puerto: 5432
- Base de datos: postgres
- Schema: Produccion

## 🔧 Configuración Paso a Paso

### Paso 1: Instalar Plugins de Jenkins

1. Ir a `Manage Jenkins` > `Manage Plugins`
2. En la pestaña `Available`, buscar e instalar:
   - **Pipeline**: Para ejecutar Jenkinsfiles
   - **Git Plugin**: Para clonar el repositorio
   - **NodeJS Plugin**: Para configurar Node.js
   - **Credentials Binding**: Para manejar credenciales seguras
   - **Workspace Cleanup**: Para limpiar el workspace

### Paso 2: Configurar Node.js Global Tool

1. Ir a `Manage Jenkins` > `Global Tool Configuration`
2. En la sección `NodeJS`:
   - Click en `Add NodeJS`
   - **Name**: `Node 22`
   - **Version**: Seleccionar `NodeJS 22.x` o `Install automatically`
   - **Global npm packages to install**: `pnpm@latest`
   - Guardar

### Paso 3: Configurar Credenciales

Ir a `Manage Jenkins` > `Manage Credentials` > `(global)` > `Add Credentials`

#### 3.1 Database URL
- **Kind**: Secret text
- **Scope**: Global
- **Secret**: `postgresql://C4f3c1t4:PASSWORD@gestionhumana.chgqoo4oaal4.us-east-2.rds.amazonaws.com:5432/postgres`
- **ID**: `cq-backend-database-url`
- **Description**: CQ Backend - Database URL

#### 3.2 JWT Secret (Users)
- **Kind**: Secret text
- **Scope**: Global
- **Secret**: Tu JWT_SECRET para usuarios
- **ID**: `cq-backend-jwt-secret`
- **Description**: CQ Backend - JWT Secret for Users

#### 3.3 JWT Secret (Candidates)
- **Kind**: Secret text
- **Scope**: Global
- **Secret**: Tu JWT_SECRET_CANDIDATE para candidatos
- **ID**: `cq-backend-jwt-secret-candidate`
- **Description**: CQ Backend - JWT Secret for Candidates

#### 3.4 AWS Credentials (si aplica)
- **Kind**: Secret text
- **Scope**: Global
- **Secret**: Tu AWS_ACCESS_KEY_ID
- **ID**: `cq-backend-aws-access-key`

- **Kind**: Secret text
- **Scope**: Global
- **Secret**: Tu AWS_SECRET_ACCESS_KEY
- **ID**: `cq-backend-aws-secret-key`

- **Kind**: Secret text
- **Scope**: Global
- **Secret**: Nombre del bucket S3
- **ID**: `cq-backend-s3-bucket`

### Paso 4: Crear Pipeline Job

1. En el dashboard de Jenkins, click en `New Item`
2. Configurar:
   - **Item name**: `CQ-Backend-E2E-Tests`
   - **Type**: Pipeline
   - Click `OK`

3. En la configuración del job:

#### General
- ☑ **GitHub project**: `https://github.com/SebasXayala/CQ-Backend`

#### Build Triggers
Seleccionar una o más opciones:

- ☑ **GitHub hook trigger for GITScm polling**: Para triggers automáticos desde GitHub
- ☑ **Poll SCM**: `H/5 * * * *` (cada 5 minutos, opcional)
- ☑ **Build periodically**: `H 2 * * *` (diario a las 2 AM, opcional)

#### Pipeline
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: `https://github.com/SebasXayala/CQ-Backend.git`
- **Credentials**: Agregar credenciales de GitHub si el repo es privado
- **Branch Specifier**: `*/main` (o `*/develop` para ambiente de desarrollo)
- **Script Path**: `Jenkinsfile`

4. Click `Save`

### Paso 5: Configurar Webhook en GitHub (Opcional)

Para builds automáticos al hacer push:

1. Ir a tu repositorio en GitHub
2. Settings > Webhooks > Add webhook
3. Configurar:
   - **Payload URL**: `http://TU_JENKINS_URL/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Just the push event
   - **Active**: ☑

## 🧪 Datos de Prueba

### Seed Data Requerido

El pipeline ejecuta tests E2E que requieren datos de prueba en la base de datos. Asegúrate de que existan:

#### Usuarios
```sql
-- Usuario admin (email: admin@cq.com, password: admin123)
INSERT INTO users (email, password, id_role) VALUES
('admin@cq.com', '$2b$10$oJc6ZlYQ31BfEch6m5o/hO7aN1gYHMg249dGxW0V651QmWVuZHIsy', 1);
```

#### Perfiles, Posiciones y Estados
```sql
-- Ver test/seed-test-data.sql para el seed completo
```

### Ejecutar Seed Manualmente (Opcional)

Si tienes acceso directo a la base de datos:

```bash
cd /home/juans/proyectosCQ/CQ-Backend
chmod +x test/setup-test-db.sh
./test/setup-test-db.sh
```

O manualmente:
```bash
PGPASSWORD='YOUR_PASSWORD' psql -h gestionhumana.chgqoo4oaal4.us-east-2.rds.amazonaws.com \
  -U C4f3c1t4 -d postgres -f test/seed-test-data.sql
```

## 🚀 Ejecutar Pipeline

### Manualmente
1. Ir al job `CQ-Backend-E2E-Tests`
2. Click en `Build Now`
3. Ver progreso en `Console Output`

### Automático
El pipeline se ejecutará automáticamente cuando:
- Se haga push a la rama configurada (main/develop)
- Se active el webhook de GitHub
- Se cumpla el schedule configurado

## 📊 Interpretación de Resultados

### Stages del Pipeline

1. **Checkout**: Clona el repositorio
2. **Setup**: Configura Node.js y PNPM
3. **Install Dependencies**: Instala paquetes con `pnpm install`
4. **Lint**: Análisis de código con ESLint
5. **Build**: Compila el proyecto TypeScript
6. **Unit Tests**: Pruebas unitarias (si existen)
7. **Database Setup**: Verifica conexión a BD
8. **E2E Tests**: **48 pruebas E2E** 🎯
   - AppController: 1 test
   - ProfileController: 10 tests
   - PositionController: 10 tests
   - CandidateController: 12 tests
   - DocumentController: 15 tests
9. **Test Reports**: Genera reportes de resultados
10. **Security Scan**: Escaneo de vulnerabilidades
11. **Build Docker Image**: (solo en rama main)
12. **Deploy**: Despliegue automático (configurar según necesidad)

### Estados Posibles

- ✅ **SUCCESS**: Todas las pruebas pasaron
- ❌ **FAILURE**: Una o más pruebas fallaron
- ⚠️ **UNSTABLE**: Pruebas pasaron pero hay warnings
- ⏸️ **ABORTED**: Pipeline cancelado manualmente

### Ver Reportes

1. En la página del build, click en `Test Reports`
2. Ver artefactos generados en `Build Artifacts`
3. Descargar `reports/test-summary.txt` para resumen detallado

## 🔍 Troubleshooting

### Error: "DATABASE_URL not found"
**Solución**: Verificar que la credencial `cq-backend-database-url` esté configurada correctamente en Jenkins.

### Error: "pnpm: command not found"
**Solución**: 
1. Verificar configuración de Node.js en Global Tool Configuration
2. Asegurar que pnpm está en "Global npm packages to install"

### Tests E2E fallan con 401 Unauthorized
**Solución**: Verificar que el usuario admin@cq.com existe en la base de datos con el password correcto.

### Error de conexión a base de datos
**Solución**:
1. Verificar que Jenkins tiene acceso de red al RDS
2. Verificar que la DATABASE_URL es correcta
3. Revisar security groups de AWS RDS

### Tests pasan localmente pero fallan en Jenkins
**Posibles causas**:
1. **Datos de prueba**: Seed data puede estar desactualizado
2. **Variables de entorno**: Verificar que todas las credenciales están configuradas
3. **Versión de Node.js**: Asegurar que Jenkins usa Node 22.x

## 📝 Mantenimiento

### Actualizar Credenciales
1. Ir a `Manage Jenkins` > `Manage Credentials`
2. Seleccionar la credencial a actualizar
3. Click en `Update`
4. Modificar el secret

### Limpiar Workspace
El pipeline limpia automáticamente el workspace después de cada ejecución. Si necesitas limpieza manual:
```bash
# En el servidor Jenkins
rm -rf /var/jenkins_home/workspace/CQ-Backend-E2E-Tests/*
```

### Logs
Los logs se mantienen por:
- Últimos 10 builds
- O 30 días (lo que ocurra primero)

Para cambiar: Job Configuration > Discard old builds

## 🔗 Referencias

- [Jenkinsfile actual](../Jenkinsfile)
- [Tests E2E](../test/e2e/)
- [Seed data](../test/seed-test-data.sql)
- [Helper de tests](../test/test-helper.ts)
- [Documentación de solución 401](../test/SOLUCION-401.md)

## 📞 Soporte

Para problemas o dudas:
1. Revisar logs del build en Jenkins Console Output
2. Verificar configuración de credenciales
3. Consultar documentación en `docs/`
4. Revisar issues en el repositorio

---

**Última actualización**: 19 de noviembre de 2025
**Versión**: 1.0
**Tests E2E**: 48/48 pasando ✅
