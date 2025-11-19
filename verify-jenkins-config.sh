#!/bin/bash

# Script para verificar configuración de Jenkins para CQ-Backend
# Uso: ./verify-jenkins-config.sh

echo "🔍 Verificando Configuración de Jenkins para CQ-Backend"
echo "========================================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0
SUCCESS=0

# Función para verificar comando
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 está instalado"
        ((SUCCESS++))
        if [ ! -z "$2" ]; then
            VERSION=$($1 --version 2>&1 | head -n 1)
            echo "  └─ Versión: $VERSION"
        fi
    else
        echo -e "${RED}✗${NC} $1 NO está instalado"
        ((ERRORS++))
    fi
}

# Función para verificar variable de entorno
check_env() {
    if [ ! -z "${!1}" ]; then
        echo -e "${GREEN}✓${NC} Variable $1 está configurada"
        ((SUCCESS++))
        # No mostrar el valor completo por seguridad
        echo "  └─ Longitud: ${#1} caracteres"
    else
        echo -e "${YELLOW}⚠${NC} Variable $1 NO está configurada (se debe configurar en Jenkins)"
        ((WARNINGS++))
    fi
}

# Verificar herramientas del sistema
echo "📦 Verificando herramientas del sistema:"
echo "----------------------------------------"
check_command "node" true
check_command "npm" true
check_command "pnpm" true
check_command "git" true
echo ""

# Verificar versión de Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        echo -e "${GREEN}✓${NC} Node.js versión correcta (v$NODE_VERSION)"
        ((SUCCESS++))
    else
        echo -e "${RED}✗${NC} Node.js versión incorrecta (requiere v20+, actual: v$NODE_VERSION)"
        ((ERRORS++))
    fi
fi
echo ""

# Verificar estructura del proyecto
echo "📁 Verificando estructura del proyecto:"
echo "----------------------------------------"
FILES=(
    "Jenkinsfile"
    "package.json"
    "pnpm-lock.yaml"
    "test/e2e/profile.e2e-spec.ts"
    "test/e2e/position.e2e-spec.ts"
    "test/e2e/candidate.e2e-spec.ts"
    "test/e2e/document.e2e-spec.ts"
    "test/app.e2e-spec.ts"
    "test/test-helper.ts"
    "test/seed-test-data.sql"
)
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file existe"
        ((SUCCESS++))
    else
        echo -e "${RED}✗${NC} $file NO existe"
        ((ERRORS++))
    fi
done
echo ""

# Verificar variables de entorno (simulación - en Jenkins serán credentials)
echo "🔐 Variables de entorno requeridas (configurar en Jenkins):"
echo "-------------------------------------------------------------"
echo -e "${YELLOW}ℹ${NC} Estas variables deben configurarse como 'Credentials' en Jenkins:"
echo ""
echo "  1. cq-backend-database-url"
echo "     └─ DATABASE_URL=postgresql://USER:PASS@HOST:5432/postgres"
echo ""
echo "  2. cq-backend-jwt-secret"
echo "     └─ JWT_SECRET para autenticación de usuarios"
echo ""
echo "  3. cq-backend-jwt-secret-candidate"
echo "     └─ JWT_SECRET_CANDIDATE para autenticación de candidatos"
echo ""
echo "  4. cq-backend-aws-access-key (opcional para S3)"
echo "     └─ AWS_ACCESS_KEY_ID"
echo ""
echo "  5. cq-backend-aws-secret-key (opcional para S3)"
echo "     └─ AWS_SECRET_ACCESS_KEY"
echo ""
echo "  6. cq-backend-s3-bucket (opcional)"
echo "     └─ Nombre del bucket S3"
echo ""

# Verificar conexión a base de datos (si DATABASE_URL está configurado)
echo "🗄️ Verificando conexión a base de datos:"
echo "----------------------------------------"
if [ ! -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL está configurado"
    # Intentar ping (requiere psql)
    if command -v psql &> /dev/null; then
        DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
        echo "Intentando conectar a: $DB_HOST"
        if ping -c 1 $DB_HOST &> /dev/null; then
            echo -e "${GREEN}✓${NC} Host de base de datos es alcanzable"
            ((SUCCESS++))
        else
            echo -e "${YELLOW}⚠${NC} No se puede hacer ping al host (puede ser firewall)"
            ((WARNINGS++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} psql no está instalado, no se puede verificar conexión"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}ℹ${NC} DATABASE_URL no está configurado localmente (se debe configurar en Jenkins)"
fi
echo ""

# Verificar scripts de package.json
echo "📜 Verificando scripts de package.json:"
echo "----------------------------------------"
if [ -f "package.json" ]; then
    SCRIPTS=(
        "test:e2e"
        "build"
        "lint"
    )
    
    for script in "${SCRIPTS[@]}"; do
        if grep -q "\"$script\":" package.json; then
            echo -e "${GREEN}✓${NC} Script '$script' existe en package.json"
            ((SUCCESS++))
        else
            echo -e "${RED}✗${NC} Script '$script' NO existe en package.json"
            ((ERRORS++))
        fi
    done
else
    echo -e "${RED}✗${NC} package.json no encontrado"
    ((ERRORS++))
fi
echo ""

# Verificar que las dependencias estén instaladas
echo "📦 Verificando dependencias:"
echo "----------------------------"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules existe (dependencias instaladas)"
    ((SUCCESS++))
    
    # Contar paquetes
    PKG_COUNT=$(ls -1 node_modules | wc -l)
    echo "  └─ Paquetes instalados: $PKG_COUNT"
else
    echo -e "${YELLOW}⚠${NC} node_modules NO existe (ejecutar: pnpm install)"
    ((WARNINGS++))
fi
echo ""

# Verificar Jenkinsfile
echo "🔧 Verificando Jenkinsfile:"
echo "---------------------------"
if [ -f "Jenkinsfile" ]; then
    # Verificar stages importantes
    STAGES=(
        "Checkout"
        "Setup"
        "Install Dependencies"
        "Build"
        "Database Setup"
        "E2E Tests"
    )
    
    for stage in "${STAGES[@]}"; do
        if grep -q "stage('$stage')" Jenkinsfile; then
            echo -e "${GREEN}✓${NC} Stage '$stage' presente"
            ((SUCCESS++))
        else
            echo -e "${YELLOW}⚠${NC} Stage '$stage' NO encontrado"
            ((WARNINGS++))
        fi
    done
else
    echo -e "${RED}✗${NC} Jenkinsfile no encontrado"
    ((ERRORS++))
fi
echo ""

# Resumen final
echo "================================================"
echo "📊 RESUMEN:"
echo "================================================"
echo -e "${GREEN}✓ Verificaciones exitosas: $SUCCESS${NC}"
echo -e "${YELLOW}⚠ Advertencias: $WARNINGS${NC}"
echo -e "${RED}✗ Errores: $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Configuración lista para Jenkins!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Configurar credenciales en Jenkins (Manage Credentials)"
    echo "2. Crear Pipeline Job apuntando a este repositorio"
    echo "3. Ejecutar Build Now"
    echo ""
    echo "Documentación: docs/JENKINS-SETUP.md"
    exit 0
else
    echo -e "${RED}❌ Hay errores que deben corregirse${NC}"
    echo ""
    echo "Por favor revisar los errores marcados arriba"
    exit 1
fi
