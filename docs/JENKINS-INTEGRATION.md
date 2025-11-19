# 🚀 Integración Jenkins - CQ Backend

## ✅ Estado Actual

**Tests E2E**: 48/48 passing (100%) ✅  
**Jenkins**: Configuración completa ✅  
**Documentación**: Completa ✅

## 📦 Archivos Creados/Actualizados

### 1. Configuración Jenkins
- ✅ `Jenkinsfile` - Pipeline completo actualizado
- ✅ `verify-jenkins-config.sh` - Script de verificación
- ✅ `docs/JENKINS-SETUP.md` - Guía completa de configuración
- ✅ `docs/JENKINS-QUICKSTART.md` - Setup rápido (5 min)
- ✅ `docs/TEST-PLAN.md` - Plan de pruebas E2E detallado

### 2. Tests E2E
- ✅ `test/e2e/profile.e2e-spec.ts` - 10/10 tests ✅
- ✅ `test/e2e/position.e2e-spec.ts` - 10/10 tests ✅
- ✅ `test/e2e/candidate.e2e-spec.ts` - 12/12 tests ✅
- ✅ `test/e2e/document.e2e-spec.ts` - 15/15 tests ✅
- ✅ `test/app.e2e-spec.ts` - 1/1 test ✅

### 3. Utilidades
- ✅ `test/test-helper.ts` - Helpers de autenticación
- ✅ `test/seed-test-data.sql` - Datos de prueba
- ✅ `test/generate-test-user.js` - Generador de hashes bcrypt

## 🎯 Qué Hace el Pipeline

```mermaid
graph LR
    A[Checkout] --> B[Setup Node.js]
    B --> C[Install Dependencies]
    C --> D[Lint]
    D --> E[Build]
    E --> F[Database Setup]
    F --> G[E2E Tests 48]
    G --> H[Test Reports]
    H --> I[Security Scan]
    I --> J[Docker Build]
    J --> K[Deploy]
```

### Stages del Pipeline:

1. **Checkout**: Clona el repositorio desde GitHub
2. **Setup**: Instala Node.js 22.x y PNPM
3. **Install Dependencies**: `pnpm install --frozen-lockfile`
4. **Lint**: Análisis de código con ESLint
5. **Build**: Compila TypeScript → JavaScript
6. **Database Setup**: Verifica conexión a PostgreSQL
7. **E2E Tests**: 🎯 **Ejecuta 48 tests en 4 módulos**
   - AppController: 1 test
   - ProfileController: 10 tests
   - PositionController: 10 tests
   - CandidateController: 12 tests
   - DocumentController: 15 tests
8. **Test Reports**: Genera reportes y artefactos
9. **Security Scan**: `pnpm audit` para vulnerabilidades
10. **Docker Build**: Construye imagen (solo en `main`)
11. **Deploy**: Despliegue automático (configurable)

## 🔐 Credenciales Requeridas en Jenkins

Configurar en: `Manage Jenkins` > `Manage Credentials` > `(global)` > `Add Credentials`

| ID | Tipo | Descripción | Ejemplo |
|----|------|-------------|---------|
| `cq-backend-database-url` | Secret text | URL de PostgreSQL | `postgresql://user:pass@host:5432/postgres` |
| `cq-backend-jwt-secret` | Secret text | JWT para usuarios | `your-jwt-secret-123` |
| `cq-backend-jwt-secret-candidate` | Secret text | JWT para candidatos | `your-jwt-secret-candidate-456` |
| `cq-backend-aws-access-key` | Secret text | AWS Access Key (S3) | `AKIAIOSFODNN7EXAMPLE` |
| `cq-backend-aws-secret-key` | Secret text | AWS Secret Key (S3) | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `cq-backend-s3-bucket` | Secret text | Nombre del bucket S3 | `cq-documents-bucket` |

## 🚀 Setup Rápido (5 minutos)

### 1. Verificar Pre-requisitos
```bash
./verify-jenkins-config.sh
```

**Resultado esperado**: ✅ 25 verificaciones exitosas, 0 errores

### 2. Configurar Jenkins

```bash
# 1. Instalar plugins
- Pipeline
- Git
- NodeJS
- Credentials Binding

# 2. Configurar Node.js
Manage Jenkins > Global Tool Configuration > NodeJS
- Name: Node 22
- Version: 22.x
- Global packages: pnpm@latest

# 3. Agregar credenciales
Manage Jenkins > Manage Credentials
(Ver tabla arriba)

# 4. Crear Job
New Item > Name: CQ-Backend-E2E > Type: Pipeline
- SCM: Git
- Repository: https://github.com/SebasXayala/CQ-Backend.git
- Branch: */main
- Script Path: Jenkinsfile
```

### 3. Ejecutar
```bash
# En Jenkins UI
Build Now → Ver Console Output
```

**Resultado esperado**:
```
Tests: 48 passed, 48 total ✅
Time: ~15-20 seconds
```

## 📊 Resultados Esperados

### Build Exitoso
```
✅ Checkout - Código clonado
✅ Setup - Node.js 22 + PNPM instalado
✅ Install Dependencies - 450+ paquetes instalados
✅ Lint - Sin errores de código
✅ Build - Compilación exitosa
✅ Database Setup - Conexión verificada
✅ E2E Tests - 48/48 tests pasando
✅ Test Reports - Reportes generados
✅ Security Scan - Sin vulnerabilidades críticas
```

### Tiempo de Ejecución
- **Checkout**: ~5 segundos
- **Setup**: ~10 segundos
- **Install Dependencies**: ~30 segundos
- **Lint**: ~5 segundos
- **Build**: ~15 segundos
- **E2E Tests**: ~20 segundos
- **Total**: **~2-3 minutos**

## 🔧 Configuración Avanzada

### Triggers Automáticos

#### 1. Webhook de GitHub
```bash
# En GitHub Repository
Settings > Webhooks > Add webhook
- Payload URL: http://JENKINS_URL/github-webhook/
- Content type: application/json
- Events: Push events
```

#### 2. Schedule (Cron)
```groovy
// En Jenkinsfile o Job Configuration
triggers {
    cron('H 2 * * *')  // Diario a las 2 AM
}
```

#### 3. Poll SCM
```groovy
triggers {
    pollSCM('H/15 * * * *')  // Cada 15 minutos
}
```

### Notificaciones

#### Slack (Opcional)
```groovy
post {
    success {
        slackSend(
            color: 'good',
            message: "✅ Build #${env.BUILD_NUMBER} - Tests: 48/48 passed"
        )
    }
    failure {
        slackSend(
            color: 'danger',
            message: "❌ Build #${env.BUILD_NUMBER} failed"
        )
    }
}
```

#### Email (Opcional)
```groovy
post {
    failure {
        emailext(
            subject: "❌ CQ-Backend Build Failed",
            body: "Build #${env.BUILD_NUMBER} failed. Check console output.",
            to: "team@company.com"
        )
    }
}
```

## 🐛 Troubleshooting

### Error: "pnpm not found"
```bash
# Verificar Node.js configuration
Global Tool Configuration > NodeJS > Global packages: pnpm@latest
```

### Error: "DATABASE_URL not found"
```bash
# Verificar credencial
Manage Credentials > verificar ID: cq-backend-database-url
```

### Tests fallan con 401
```bash
# Verificar usuario admin existe en BD
psql> SELECT email FROM users WHERE email = 'admin@cq.com';
```

### Build muy lento
```bash
# Optimizar:
1. Usar pnpm cache
2. Paralelizar stages
3. Reducir frecuencia de polls
```

## 📚 Documentación Completa

1. **[JENKINS-SETUP.md](./docs/JENKINS-SETUP.md)** - Configuración detallada paso a paso
2. **[JENKINS-QUICKSTART.md](./docs/JENKINS-QUICKSTART.md)** - Setup rápido en 5 minutos
3. **[TEST-PLAN.md](./docs/TEST-PLAN.md)** - Plan de pruebas E2E completo
4. **[Jenkinsfile](./Jenkinsfile)** - Pipeline completo comentado

## ✅ Checklist de Verificación

- [ ] Node.js 22.x instalado en Jenkins
- [ ] PNPM instalado globalmente
- [ ] Plugins de Jenkins instalados
- [ ] 6 credenciales configuradas
- [ ] Pipeline Job creado
- [ ] Repository URL configurada
- [ ] Webhook de GitHub configurado (opcional)
- [ ] Seed data ejecutado en BD
- [ ] Primera ejecución exitosa

## 🎉 Próximos Pasos

1. ✅ **Tests funcionando** - 48/48 passing
2. ✅ **Jenkins configurado** - Pipeline listo
3. 🔄 **Ejecutar primer build** - Verificar funcionamiento
4. 📊 **Monitorear resultados** - Revisar reportes
5. 🚀 **Automatizar despliegues** - Configurar deploy stage
6. 📧 **Configurar notificaciones** - Slack/Email
7. 📈 **Métricas y dashboards** - Jenkins + Grafana

## 🆘 Soporte

- **Documentación**: Ver `/docs`
- **Logs**: Jenkins Console Output
- **Verificación**: `./verify-jenkins-config.sh`
- **Tests**: `npm run test:e2e`

---

**✅ Todo listo para producción**  
**Fecha**: 19 de noviembre de 2025  
**Estado**: Tests 48/48 passing | Jenkins Ready  
**Mantenido por**: Equipo CQ Backend
