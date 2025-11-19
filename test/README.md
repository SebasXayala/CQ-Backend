# Testing y CI/CD - CQ Backend

## 📚 Contenido

Este proyecto incluye un sistema completo de pruebas automatizadas con integración continua usando Jenkins.

## 🧪 Tipos de Pruebas

### 1. Pruebas Unitarias
Prueban servicios individuales de forma aislada.

```bash
# Ejecutar todas las pruebas unitarias
npm test

# Ejecutar en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:cov
```

### 2. Pruebas E2E (End-to-End)
Prueban los endpoints completos de la API.

```bash
# Ejecutar todas las pruebas E2E
npm run test:e2e

# Ejecutar en modo watch
npm run test:e2e:watch

# Generar reporte de cobertura
npm run test:e2e:cov
```

### 3. Todas las Pruebas
```bash
# Ejecutar unitarias + E2E
npm run test:all

# Para CI (sin watch, con cobertura)
npm run test:ci && npm run test:e2e:ci
```

## 📂 Estructura de Pruebas

```
test/
├── e2e/                           # Pruebas End-to-End
│   ├── candidate.e2e-spec.ts     # 12 casos para Candidatos
│   ├── document.e2e-spec.ts      # 15 casos para Documentos
│   ├── profile.e2e-spec.ts       # 10 casos para Perfiles
│   └── position.e2e-spec.ts      # 10 casos para Cargos
│
├── jest-e2e.json                  # Configuración Jest E2E
├── setup-e2e.ts                   # Setup global E2E
├── test-helper.ts                 # Utilidades de testing
└── app.e2e-spec.ts               # Prueba básica
```

## 🐳 Ambiente de Testing con Docker

### Iniciar Base de Datos de Testing

```bash
# Iniciar PostgreSQL de testing
docker-compose -f docker-compose.test.yml up -d postgres-test

# Verificar que esté corriendo
docker ps | grep postgres-test
```

### Iniciar Jenkins (Opcional)

```bash
# Iniciar Jenkins
docker-compose -f docker-compose.test.yml up -d jenkins

# Obtener password inicial
docker exec cq-backend-jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Acceder a Jenkins
# http://localhost:8080
```

## ⚙️ Configuración de Variables de Entorno

### Para Desarrollo
Usar `.env` (ya existe)

### Para Testing
Crear `.env.test` con:

```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=test_user
DB_PASSWORD=test_password
DB_DATABASE=cq_backend_test
JWT_SECRET=test-secret-key
```

## 🔧 Configurar Jenkins

### Paso 1: Crear Job en Jenkins

1. Acceder a Jenkins (http://localhost:8080)
2. Click en "New Item"
3. Nombre: "CQ-Backend-Tests"
4. Tipo: "Pipeline"
5. Click "OK"

### Paso 2: Configurar Pipeline

1. En "Pipeline" section:
   - Definition: "Pipeline script from SCM"
   - SCM: Git
   - Repository URL: (tu repo)
   - Branch: */main
   - Script Path: Jenkinsfile

2. En "Build Triggers":
   - ✅ Poll SCM: `H/5 * * * *` (cada 5 minutos)
   - ✅ GitHub hook trigger

3. Guardar

### Paso 3: Configurar Credenciales

1. Jenkins → Manage Jenkins → Credentials
2. Agregar:
   - `database-url-test`: URL de BD de testing
   - `jwt-secret-test`: Secret para JWT

## 📊 Casos de Prueba

### Módulo: Candidatos (12 casos)
- ✅ CP-C-001: Crear candidato con datos válidos
- ✅ CP-C-002: Validar nombre corto
- ✅ CP-C-003: Validar email inválido
- ✅ CP-C-004: Validar teléfono inválido
- ✅ CP-C-005: Rechazar sin autenticación
- ✅ CP-C-006: Listar todos los candidatos
- ✅ CP-C-007: Obtener por ID existente
- ✅ CP-C-008: Error con ID inexistente
- ✅ CP-C-009: Actualizar parcialmente
- ✅ CP-C-010: Cambiar estado a contratado
- ✅ CP-C-011: Cambiar estado a revisión
- ✅ CP-C-012: Eliminar candidato

### Módulo: Documentos (15 casos)
- ✅ CP-D-001 a CP-D-015: Ver test/e2e/document.e2e-spec.ts

### Módulo: Perfiles (10 casos)
- ✅ CP-P-001 a CP-P-010: Ver test/e2e/profile.e2e-spec.ts

### Módulo: Cargos (10 casos)
- ✅ CP-PO-001 a CP-PO-010: Ver test/e2e/position.e2e-spec.ts

**Total: 47 casos de prueba automatizados**

## 🚀 Pipeline CI/CD

El Jenkinsfile incluye los siguientes stages:

1. **Checkout** - Clonar repositorio
2. **Setup** - Configurar Node.js y pnpm
3. **Install Dependencies** - Instalar paquetes
4. **Lint** - Análisis estático de código
5. **Build** - Compilar proyecto
6. **Unit Tests** - Pruebas unitarias
7. **E2E Tests** - Pruebas end-to-end
8. **Code Coverage** - Generar reportes
9. **Security Scan** - Escanear vulnerabilidades
10. **Build Docker Image** - Crear imagen (en main)
11. **Deploy** - Desplegar según rama

## 📈 Reportes

### Cobertura de Código
Después de ejecutar pruebas con cobertura:

```bash
# Ver reporte HTML
open coverage/index.html          # unitarias
open coverage-e2e/index.html      # e2e
```

### En Jenkins
- Reportes HTML disponibles en cada build
- Gráficas de tendencia de cobertura
- Histórico de ejecuciones

## 🛠️ Comandos Útiles

```bash
# Instalar dependencias
pnpm install

# Ejecutar solo pruebas de un módulo
npm test -- candidate.service
npm run test:e2e -- candidate.e2e-spec

# Debug de pruebas
npm run test:debug

# Limpiar y reinstalar
rm -rf node_modules coverage coverage-e2e
pnpm install
```

## 🔍 Troubleshooting

### Error: Base de datos no conecta
```bash
# Verificar que PostgreSQL de test esté corriendo
docker ps | grep postgres-test

# Ver logs
docker logs cq-backend-postgres-test

# Reiniciar
docker-compose -f docker-compose.test.yml restart postgres-test
```

### Error: Puerto 5433 en uso
```bash
# Ver qué está usando el puerto
lsof -i :5433

# Cambiar puerto en docker-compose.test.yml y .env.test
```

### Pruebas fallan por timeout
```bash
# Aumentar timeout en jest-e2e.json
"testTimeout": 60000  // 60 segundos
```

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Jenkins Pipeline](https://www.jenkins.io/doc/book/pipeline/)

## ✅ Checklist de Testing

Antes de hacer commit:
- [ ] Todas las pruebas pasan localmente
- [ ] Cobertura > 80%
- [ ] Sin errores de ESLint
- [ ] Build exitoso
- [ ] .env.test configurado

## 🎯 Objetivos de Calidad

- ✅ Cobertura de código ≥ 80%
- ✅ Todas las pruebas pasan
- ✅ Tiempo de ejecución < 5 minutos
- ✅ Sin vulnerabilidades críticas

---

**Mantenido por:** Equipo de Desarrollo CQ Backend  
**Última actualización:** 19 de Noviembre de 2025
