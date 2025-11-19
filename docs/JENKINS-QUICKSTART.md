# 🚀 Jenkins Quick Start - CQ Backend

Guía rápida para poner en marcha Jenkins con los tests E2E en **5 minutos**.

## ⚡ Setup Rápido

### 1️⃣ Instalar Jenkins (si no está instalado)

```bash
# Ubuntu/Debian
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update
sudo apt install jenkins

# Iniciar Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Obtener password inicial
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Acceder a: `http://localhost:8080`

### 2️⃣ Instalar Plugins Esenciales

En Jenkins UI:
1. `Manage Jenkins` > `Manage Plugins` > `Available`
2. Buscar e instalar:
   - ☑ Pipeline
   - ☑ Git
   - ☑ NodeJS
   - ☑ Credentials Binding

3. Restart Jenkins

### 3️⃣ Configurar Node.js

`Manage Jenkins` > `Global Tool Configuration` > `NodeJS`:
- Name: `Node 22`
- Install automatically: ☑
- Version: `NodeJS 22.x`
- Global packages: `pnpm@latest`
- **Save**

### 4️⃣ Agregar Credenciales

`Manage Jenkins` > `Manage Credentials` > `(global)` > `Add Credentials`:

```
1. DATABASE_URL
   ID: cq-backend-database-url
   Secret: postgresql://USER:PASS@HOST:5432/postgres

2. JWT_SECRET
   ID: cq-backend-jwt-secret
   Secret: tu-jwt-secret

3. JWT_SECRET_CANDIDATE  
   ID: cq-backend-jwt-secret-candidate
   Secret: tu-jwt-secret-candidate
```

### 5️⃣ Crear Job

1. `New Item` > Name: `CQ-Backend-E2E` > Type: `Pipeline` > OK

2. Configuración:
   ```
   Pipeline Definition: Pipeline script from SCM
   SCM: Git
   Repository URL: https://github.com/SebasXayala/CQ-Backend.git
   Branch: */main
   Script Path: Jenkinsfile
   ```

3. **Save**

### 6️⃣ Ejecutar

Click en `Build Now` 🎉

## ✅ Verificación

El pipeline debe ejecutar **48 tests E2E**:
- ✅ AppController: 1 test
- ✅ ProfileController: 10 tests
- ✅ PositionController: 10 tests
- ✅ CandidateController: 12 tests
- ✅ DocumentController: 15 tests

**Resultado esperado**: `Tests: 48 passed, 48 total` ✅

## 🔧 Variables de Entorno Requeridas

El pipeline automáticamente configura:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_SECRET_CANDIDATE=...
JWT_EXPIRES_IN=1h
JWT_EXPIRES_IN_CANDIDATE=24h
NODE_ENV=test
```

## 📊 Ver Resultados

1. Click en el build number (ej: `#1`)
2. `Console Output` para ver logs completos
3. `Test Reports` para ver resumen
4. `Artifacts` para descargar reportes

## 🐛 Problemas Comunes

### Tests fallan con 401
```bash
# Verificar usuario en BD:
admin@cq.com / admin123
```

### "pnpm not found"
```bash
# Verificar Node.js configuration en Jenkins
Global Tool Configuration > NodeJS > Global packages: pnpm@latest
```

### No puede conectar a BD
```bash
# Verificar credencial DATABASE_URL
# Verificar acceso de red desde Jenkins al RDS
```

## 🔄 Builds Automáticos

### Trigger en cada push:
1. GitHub Repo > Settings > Webhooks
2. Payload URL: `http://JENKINS_URL/github-webhook/`
3. Content type: `application/json`
4. Events: `push`

### Trigger periódico:
Job Configuration > Build Triggers:
- ☑ `Poll SCM`: `H/15 * * * *` (cada 15 min)
- ☑ `Build periodically`: `H 2 * * *` (diario 2 AM)

## 📚 Documentación Completa

Ver [JENKINS-SETUP.md](./JENKINS-SETUP.md) para configuración avanzada.

---

**Tiempo estimado**: 5-10 minutos  
**Nivel**: Principiante  
**Estado**: Tests 48/48 ✅
