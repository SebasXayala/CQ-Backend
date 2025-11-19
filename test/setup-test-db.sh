#!/bin/bash
# Script para configurar la base de datos de testing

echo "🔧 Configurando base de datos de testing..."
echo ""

# Variables (ajusta según tu configuración)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-cq_backend_test}"
DB_USER="${DB_USER:-postgres}"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Información de conexión:${NC}"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Paso 1: Generar hash de contraseña si no existe
if command -v node &> /dev/null; then
    echo -e "${BLUE}🔐 Paso 1: Generando hash de contraseña de prueba...${NC}"
    node test/generate-test-user.js
    echo ""
else
    echo -e "${YELLOW}⚠️  Node.js no encontrado, saltando generación de hash${NC}"
    echo "   Usa el hash predeterminado en seed-test-data.sql"
    echo ""
fi

# Paso 2: Ejecutar seed de datos
echo -e "${BLUE}📦 Paso 2: Insertando datos de prueba...${NC}"

if command -v psql &> /dev/null; then
    PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f test/seed-test-data.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Datos de prueba insertados correctamente${NC}"
    else
        echo -e "${RED}❌ Error al insertar datos de prueba${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  psql no encontrado${NC}"
    echo "   Ejecuta manualmente: psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f test/seed-test-data.sql"
    echo ""
fi

echo ""
echo -e "${GREEN}🎉 ¡Base de datos de testing configurada!${NC}"
echo ""
echo -e "${BLUE}📝 Credenciales de prueba:${NC}"
echo "   Usuario Admin:"
echo "     Email: admin@cq.com"
echo "     Password: admin123"
echo ""
echo "   Usuario RH:"
echo "     Email: rh@cq.com"
echo "     Password: admin123"
echo ""
echo -e "${YELLOW}💡 Siguiente paso:${NC}"
echo "   npm run test:e2e"
echo ""
